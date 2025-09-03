import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';
import { DeliveryValidationOtpService } from '../../../../core/services/delivery-validation-otp.service';
import { LoadingController } from '@ionic/angular';
import { FranceOrdersService } from '../../../../core/services/france-orders.service';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { DriverOnlineStatusService } from '../../../../core/services/driver-online-status.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
  standalone: false
})
export class MyOrdersPage implements OnInit, OnDestroy {
  currentDriver: FranceUser | null = null;
  myOrders: DeliveryOrder[] = [];
  isLoading = false;
  availableOrdersCount = 0;

  // Statut en ligne/hors ligne
  isOnline = false;
  isToggling = false;

  // OTP inline moderne - MÊME LOGIQUE QUE DASHBOARD
  showOTPInput: { [orderId: number]: boolean } = {};
  otpDigits: { [orderId: number]: string[] } = {};

  private userSubscription?: Subscription;
  private myOrdersSubscription?: Subscription;
  private onlineStatusSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private deliveryValidationOtpService: DeliveryValidationOtpService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private whatsappNotificationFranceService: WhatsAppNotificationFranceService,
    private franceOrdersService: FranceOrdersService,
    private driverOnlineStatusService: DriverOnlineStatusService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.myOrdersSubscription?.unsubscribe();
    this.onlineStatusSubscription?.unsubscribe();
  }

  /**
   * Initialiser les données
   */
  private async initializeData() {
    // S'abonner aux données utilisateur
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentDriver = user;
        if (user && user.type === 'driver') {
          this.loadMyOrders();
          this.initializeOnlineStatus();
        }
      }
    });
  }

  /**
   * Charger mes commandes
   */
  private async loadMyOrders() {
    if (!this.currentDriver) return;

    this.isLoading = true;
    try {
      // Charger les commandes du livreur
      await this.deliveryOrdersService.loadDriverOrders(this.currentDriver.id);
      
      // S'abonner aux changements des commandes
      this.myOrdersSubscription = this.deliveryOrdersService.driverOrders$.subscribe({
        next: (orders: DeliveryOrder[]) => {
          this.myOrders = orders;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Erreur chargement mes commandes:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      this.isLoading = false;
    }
  }

  /**
   * FONCTIONS MÉTIER - IDENTIQUES À DASHBOARD
   */

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(order: DeliveryOrder, newStatus: string) {
    if (newStatus === 'delivered') {
      // Marquer comme livré nécessite une validation OTP
      this.showOTPInput[order.id] = true;
      this.otpDigits[order.id] = ['', '', '', ''];
      
      // Focus sur le premier champ après un délai
      setTimeout(() => {
        const firstInput = document.querySelector('.otp-digit') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 200);
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Mise à jour...'
    });
    await loading.present();

    try {
      let success = false;

      if (newStatus === 'en_livraison') {
        // Notification WhatsApp au client
        if (order.phone_number) {
          await this.whatsappNotificationFranceService.sendOrderStatusNotification(
            order.phone_number,
            'en_livraison',
            {
              orderNumber: order.order_number,
              restaurantName: this.currentDriver?.restaurantName || 'Restaurant',
              estimatedTime: '10-15 min',
              validationCode: order.delivery_validation_code || ''
            }
          );
        }
      }

      success = await this.deliveryOrdersService.updateDeliveryStatus(order.id, newStatus);

      if (success) {
        this.loadMyOrders();
        const statusText = newStatus === 'en_livraison' ? 'En livraison' : this.getOrderStatusText(newStatus);
        this.presentToast(`Statut mis à jour : ${statusText}`);
      } else {
        this.presentToast('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      this.presentToast('Erreur lors de la mise à jour');
    }

    await loading.dismiss();
  }

  /**
   * GESTION OTP MODERNE - IDENTIQUE À DASHBOARD
   */

  /**
   * NOUVEAU : Gestion de la saisie d'un chiffre OTP avec passage automatique
   */
  onOTPDigitInput(event: any, position: number, orderId: number, nextInput?: HTMLInputElement) {
    const value = event.target.value;
    
    if (value && /^\d$/.test(value)) {
      // Sauvegarder le chiffre
      if (!this.otpDigits[orderId]) {
        this.otpDigits[orderId] = ['', '', '', ''];
      }
      this.otpDigits[orderId][position] = value;
      
      // Passer au champ suivant
      if (nextInput) {
        setTimeout(() => {
          nextInput.focus();
          nextInput.classList.add('otp-focus');
        }, 100);
      }
      
      // Auto-validation si les 4 chiffres sont saisis
      if (this.isOTPComplete(orderId)) {
        setTimeout(() => {
          this.validateInlineOTP({ id: orderId } as DeliveryOrder);
        }, 200);
      }
    } else {
      // Supprimer les caractères non numériques
      event.target.value = '';
    }
  }

  /**
   * NOUVEAU : Gestion des touches spéciales (Backspace, etc.)
   */
  onOTPKeyDown(event: KeyboardEvent, position: number, orderId: number, prevInput?: HTMLInputElement, nextInput?: HTMLInputElement) {
    if (event.key === 'Backspace') {
      if (!this.otpDigits[orderId]) {
        this.otpDigits[orderId] = ['', '', '', ''];
      }
      
      // Effacer le chiffre courant
      this.otpDigits[orderId][position] = '';
      (event.target as HTMLInputElement).value = '';
      
      // Passer au champ précédent si vide
      if (prevInput) {
        setTimeout(() => {
          prevInput.focus();
        }, 100);
      }
    }
    
    if (event.key === 'ArrowLeft' && prevInput) {
      prevInput.focus();
    }
    
    if (event.key === 'ArrowRight' && nextInput) {
      nextInput.focus();
    }
  }

  /**
   * NOUVEAU : Vérifier si l'OTP est complet
   */
  isOTPComplete(orderId: number): boolean {
    if (!this.otpDigits[orderId]) return false;
    return this.otpDigits[orderId].every(digit => digit !== '');
  }

  /**
   * NOUVEAU : Valider l'OTP saisi dans les 4 champs
   */
  async validateInlineOTP(order: DeliveryOrder) {
    const enteredCode = this.otpDigits[order.id]?.join('') || '';
    
    if (enteredCode.length !== 4) {
      this.presentToast('Veuillez saisir les 4 chiffres');
      return;
    }

    try {
      const validationResult = await this.deliveryValidationOtpService.validateDeliveryOTP(order.id, enteredCode);
      
      if (validationResult.isValid) {
        // Animation de succès
        const otpContainer = document.querySelector('.otp-digits');
        otpContainer?.classList.add('otp-success');
        
        // Code correct, marquer comme livré
        const success = await this.deliveryOrdersService.updateDeliveryStatus(order.id, 'livree');
        if (success) {
          this.showOTPInput[order.id] = false;
          this.otpDigits[order.id] = ['', '', '', ''];
          this.loadMyOrders();
          this.presentToast('✅ Livraison confirmée !');
        }
      } else {
        // Animation d'erreur
        const otpContainer = document.querySelector('.otp-digits');
        otpContainer?.classList.add('otp-error');
        setTimeout(() => otpContainer?.classList.remove('otp-error'), 500);
        
        // Vider les champs automatiquement et remettre le focus sur le premier
        setTimeout(() => {
          this.clearAndFocusFirstOTPField(order.id);
        }, 600);
        
        this.presentToast('❌ Code incorrect');
      }
    } catch (error) {
      console.error('Erreur validation OTP:', error);
      
      // Vider les champs en cas d'erreur technique aussi
      setTimeout(() => {
        this.clearAndFocusFirstOTPField(order.id);
      }, 200);
      
      this.presentToast('Erreur lors de la validation');
    }
  }

  /**
   * NOUVEAU : Vider les champs OTP et remettre le focus sur le premier champ
   */
  private clearAndFocusFirstOTPField(orderId: number) {
    // Vider le tableau des chiffres
    this.otpDigits[orderId] = ['', '', '', ''];
    
    // Vider tous les champs visuellement et remettre focus sur le premier
    const otpInputs = document.querySelectorAll('.otp-digit') as NodeListOf<HTMLInputElement>;
    otpInputs.forEach((input, index) => {
      input.value = '';
      if (index === 0) {
        setTimeout(() => {
          input.focus();
        }, 100);
      }
    });
  }

  /**
   * NOUVEAU : Annuler la saisie OTP
   */
  cancelOTPInput(order: DeliveryOrder) {
    this.showOTPInput[order.id] = false;
    this.otpDigits[order.id] = ['', '', '', ''];
  }

  /**
   * FONCTIONS UTILITAIRES - IDENTIQUES À DASHBOARD
   */

  getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'assignee': 'warning',
      'en_livraison': 'primary', 
      'livree': 'success',
      'annulee': 'danger'
    };
    return colors[status] || 'medium';
  }

  getOrderStatusText(status: string): string {
    const texts: Record<string, string> = {
      'assignee': 'Assignée',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return texts[status] || status;
  }

  getCustomerName(order: DeliveryOrder): string {
    return order.customer_name || 'Client';
  }

  getItemsCount(order: DeliveryOrder): number {
    return order.items?.length || 0;
  }

  getDeliveryZone(address?: string): string {
    return address ? address.substring(0, 30) + '...' : 'Adresse non spécifiée';
  }

  formatPrice(amount: number): string {
    return `${amount.toFixed(2)}€`;
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Gestion accordéon détails
  private expandedOrders = new Set<number>();

  toggleOrderDetail(order: DeliveryOrder) {
    if (this.expandedOrders.has(order.id)) {
      this.expandedOrders.delete(order.id);
    } else {
      this.expandedOrders.add(order.id);
    }
  }

  isOrderExpanded(order: DeliveryOrder): boolean {
    return this.expandedOrders.has(order.id);
  }

  // Fonctions détails articles
  hasOrderItems(order: DeliveryOrder): boolean {
    return order.items && order.items.length > 0;
  }

  getOrderItems(order: DeliveryOrder): any[] {
    return order.items || [];
  }

  hasSelectedOptions(selectedOptions: any): boolean {
    if (!selectedOptions) return false;
    if (typeof selectedOptions === 'string') {
      try {
        selectedOptions = JSON.parse(selectedOptions);
      } catch {
        return false;
      }
    }
    return selectedOptions && Object.keys(selectedOptions).length > 0;
  }

  getSelectedOptionsGroups(selectedOptions: any): any[] {
    if (!this.hasSelectedOptions(selectedOptions)) return [];
    
    if (typeof selectedOptions === 'string') {
      try {
        selectedOptions = JSON.parse(selectedOptions);
      } catch {
        return [];
      }
    }

    return Object.entries(selectedOptions).map(([groupName, options]) => ({
      groupName,
      options: Array.isArray(options) ? options : [options]
    }));
  }

  formatOptionGroupName(groupName: string): string {
    const mapping: Record<string, string> = {
      'sauces': 'Sauces',
      'viandes': 'Viandes',
      'legumes': 'Légumes',
      'fromages': 'Fromages',
      'boissons': 'Boissons'
    };
    return mapping[groupName] || groupName;
  }

  shouldShowUpdateTime(order: DeliveryOrder): boolean {
    if (!order.updated_at) return false;
    const updatedTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - updatedTime.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  getUpdateTimeText(order: DeliveryOrder): string {
    if (!order.updated_at) return '';
    const updatedTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - updatedTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes === 1) return 'Il y a 1 minute';
    return `Il y a ${diffMinutes} minutes`;
  }

  // Actions
  callCustomer(phoneNumber: string) {
    window.open(`tel:${phoneNumber}`);
  }

  openDirections(address: string) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps?q=${encodedAddress}`, '_blank');
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Déconnexion
   */
  async logout() {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Se déconnecter',
          handler: async () => {
            await this.authFranceService.logout();
            this.router.navigate(['/restaurant-france/auth-france/login-france']);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * SYSTÈME DE STATUT EN LIGNE/HORS LIGNE
   */

  /**
   * Initialiser le statut en ligne du livreur
   */
  private async initializeOnlineStatus() {
    if (!this.currentDriver) return;

    try {
      // Charger le statut initial depuis la base de données
      await this.driverOnlineStatusService.loadInitialStatus(this.currentDriver.id);

      // S'abonner aux changements de statut
      this.onlineStatusSubscription = this.driverOnlineStatusService.onlineStatus$.subscribe(isOnline => {
        this.isOnline = isOnline;
        console.log(`📱 [MyOrders] Statut mis à jour: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
      });

    } catch (error) {
      console.error('❌ [MyOrders] Erreur initialisation statut en ligne:', error);
    }
  }

  /**
   * Basculer le statut en ligne/hors ligne
   */
  async toggleOnlineStatus() {
    if (!this.currentDriver || this.isToggling) return;

    this.isToggling = true;

    try {
      const result = await this.driverOnlineStatusService.toggleOnlineStatus(this.currentDriver.id);
      
      if (result.success) {
        this.presentToast(result.message);
        
        // Si on vient de se mettre en ligne, recharger les données disponibles
        if (result.newStatus) {
          // Recharger les commandes disponibles (sera géré par le service)
          console.log('✅ [MyOrders] Livreur en ligne - données actualisées');
        } else {
          console.log('⏸️ [MyOrders] Livreur hors ligne');
        }
      } else {
        this.presentToast(result.message);
      }
    } catch (error) {
      console.error('❌ [MyOrders] Erreur toggle statut:', error);
      this.presentToast('Erreur lors de la mise à jour du statut');
    } finally {
      this.isToggling = false;
    }
  }

  /**
   * Obtenir le texte de statut pour l'affichage
   */
  getStatusText(): string {
    return this.driverOnlineStatusService.getStatusText();
  }

  /**
   * Obtenir la couleur de statut pour l'affichage  
   */
  getStatusColor(): string {
    return this.driverOnlineStatusService.getStatusColor();
  }

  /**
   * Obtenir l'icône de statut pour l'affichage
   */
  getStatusIcon(): string {
    return this.driverOnlineStatusService.getStatusIcon();
  }
}