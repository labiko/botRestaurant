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

@Component({
  selector: 'app-dashboard-delivery',
  templateUrl: './dashboard-delivery.page.html',
  styleUrls: ['./dashboard-delivery.page.scss'],
  standalone: false
})
export class DashboardDeliveryPage implements OnInit, OnDestroy {
  currentDriver: FranceUser | null = null;
  myOrders: DeliveryOrder[] = [];
  availableOrders: DeliveryOrder[] = [];
  isLoading = false;
  activeTab = 'my-orders';
  isOnline = false;

  // Statistiques
  todayDeliveries = 0;
  pendingDeliveries = 0;
  completedDeliveries = 0;
  todayEarnings = 0;

  // OTP inline moderne
  showOTPInput: { [orderId: number]: boolean } = {};
  otpDigits: { [orderId: number]: string[] } = {};

  private userSubscription?: Subscription;
  private myOrdersSubscription?: Subscription;
  private availableOrdersSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private deliveryValidationOtpService: DeliveryValidationOtpService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private whatsappNotificationFranceService: WhatsAppNotificationFranceService,
    private franceOrdersService: FranceOrdersService
  ) { }

  ngOnInit() {
    this.initializeDashboard();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.myOrdersSubscription) {
      this.myOrdersSubscription.unsubscribe();
    }
    if (this.availableOrdersSubscription) {
      this.availableOrdersSubscription.unsubscribe();
    }
  }

  /**
   * Initialisation du dashboard livreur
   */
  private initializeDashboard() {
    this.userSubscription = this.authFranceService.currentUser$.subscribe(driver => {
      this.currentDriver = driver;
      if (driver && driver.type === 'driver') {
        this.loadDashboardData();
      }
    });
  }

  /**
   * Charger les données du dashboard
   */
  private async loadDashboardData() {
    if (!this.currentDriver) return;

    this.isLoading = true;
    
    try {
      // Charger mes commandes
      await this.deliveryOrdersService.loadDriverOrders(this.currentDriver.id);
      
      // S'abonner aux changements de mes commandes
      this.myOrdersSubscription = this.deliveryOrdersService.driverOrders$.subscribe(orders => {
        this.myOrders = orders;
        this.calculateStats(orders);
      });

      // Charger les commandes disponibles
      await this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId);
      
      // S'abonner aux changements des commandes disponibles
      this.availableOrdersSubscription = this.deliveryOrdersService.availableOrders$.subscribe(orders => {
        this.availableOrders = orders;
      });
      
    } catch (error) {
      console.error('Erreur chargement dashboard livreur:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Calculer les statistiques
   */
  private calculateStats(orders: DeliveryOrder[]) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const todayOrdersList = orders.filter(order => 
      order.created_at.startsWith(todayString)
    );

    this.todayDeliveries = todayOrdersList.length;
    this.pendingDeliveries = orders.filter(order => 
      order.status === 'en_livraison'
    ).length;
    this.completedDeliveries = orders.filter(order => 
      order.status === 'livree'
    ).length;

    // Calcul des gains (exemple: 2€ par livraison)
    this.todayEarnings = todayOrdersList.filter(order => 
      order.status === 'livree'
    ).length * 2;
  }

  /**
   * Changer d'onglet
   */
  switchTab(tab: string | number | undefined) {
    if (!tab) return;
    const tabValue = tab.toString();
    this.activeTab = tabValue;
    
    if (tabValue === 'available' && this.currentDriver) {
      this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId);
    }
  }

  /**
   * Accepter une commande
   */
  async acceptOrder(order: DeliveryOrder) {
    if (!this.currentDriver) return;

    const alert = await this.alertController.create({
      header: 'Accepter la commande',
      message: `Voulez-vous accepter la commande #${order.order_number} ?`,
      cssClass: 'custom-alert-white',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Accepter',
          handler: async () => {
            const success = await this.deliveryOrdersService.acceptOrder(order.id, this.currentDriver!.id);
            if (success) {
              this.loadDashboardData(); // Recharger les données
              this.activeTab = 'my-orders'; // Basculer automatiquement vers "Mes commandes"
              this.presentToast('Commande acceptée avec succès');
            } else {
              this.presentToast('Erreur lors de l\'acceptation');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(order: DeliveryOrder, action: string) {
    let newStatus = '';
    let confirmMessage = '';

    switch (action) {
      case 'start_delivery':
        newStatus = 'en_livraison';
        confirmMessage = 'Commencer la livraison ?';
        break;
      case 'delivered':
        // NOUVEAU : Afficher l'interface OTP moderne inline
        this.showOTPInput[order.id] = true;
        this.otpDigits[order.id] = ['', '', '', ''];
        return;
      default:
        return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer l\'action',
      message: confirmMessage,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: async () => {
            const success = await this.deliveryOrdersService.updateDeliveryStatus(order.id, newStatus);
            if (success) {
              // NOUVEAU : Notification WhatsApp pour début de livraison
              if (action === 'start_delivery' && this.currentDriver) {
                await this.sendDeliveryStartNotification(order, this.currentDriver);
              }
              
              this.loadDashboardData();
              this.presentToast('Statut mis à jour avec succès');
            } else {
              this.presentToast('Erreur lors de la mise à jour');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Afficher un toast
   */
  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top'
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
   * Helpers de formatage
   */
  formatTime(dateString: string): string {
    return this.deliveryOrdersService.formatTime(dateString);
  }

  formatPrice(amount: number): string {
    return this.deliveryOrdersService.formatPrice(amount);
  }

  getStatusColor(status: string): string {
    return this.deliveryOrdersService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.deliveryOrdersService.getStatusText(status);
  }

  getDeliveryModeText(mode: string): string {
    return this.deliveryOrdersService.getDeliveryModeText(mode);
  }

  /**
   * Basculer le statut en ligne/hors ligne du livreur
   */
  async toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
    
    if (this.isOnline) {
      this.presentToast('✅ Vous êtes maintenant en ligne');
      this.loadDashboardData();
    } else {
      this.presentToast('⏸️ Vous êtes maintenant hors ligne');
      this.availableOrders = [];
    }
  }

  /**
   * NOUVEAU : Gérer la validation de livraison avec OTP
   */
  async handleDeliveryWithOTP(order: DeliveryOrder) {
    try {
      // Vérifier qu'un code existe pour cette commande
      const loading = await this.loadingController.create({
        message: 'Vérification du code...',
      });
      await loading.present();

      const otpCheck = await this.deliveryValidationOtpService.checkExistingOTP(order);
      await loading.dismiss();

      if (!otpCheck.success) {
        this.presentToast(`❌ ${otpCheck.message}`);
        return;
      }

      // Ouvrir la popup de saisie OTP
      await this.showOTPValidationDialog(order);

    } catch (error) {
      this.presentToast('❌ Erreur lors de la validation');
    }
  }

  private async showOTPValidationDialog(order: DeliveryOrder) {
    const alert = await this.alertController.create({
      header: '🔐 Code de validation livraison',
      message: `
        <strong>Commande:</strong> ${order.order_number}<br>
        <strong>Client:</strong> ${order.phone_number}<br><br>
        <strong>Le client a reçu un code lors de sa commande.</strong><br>
        <strong>Demandez-lui ce code de 4 chiffres :</strong>
      `,
      inputs: [
        {
          name: 'otpCode',
          type: 'tel',
          placeholder: '0000',
          attributes: {
            maxlength: 4,
            inputmode: 'numeric'
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Valider',
          handler: async (data) => {
            if (!data.otpCode || data.otpCode.length !== 4) {
              this.presentToast('❌ Code invalide (4 chiffres requis)');
              return false;
            }

            const loading = await this.loadingController.create({
              message: 'Validation du code...',
            });
            await loading.present();

            const validationResult = await this.deliveryValidationOtpService.validateDeliveryOTP(order.id, data.otpCode);
            await loading.dismiss();

            if (validationResult.isValid) {
              await this.finalizeDeliveryWithOTP(order);
              return true;
            } else {
              this.presentToast(`❌ ${validationResult.message}`);
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async finalizeDeliveryWithOTP(order: DeliveryOrder) {
    try {
      const loading = await this.loadingController.create({
        message: 'Finalisation de la livraison...',
      });
      await loading.present();

      const success = await this.deliveryOrdersService.updateDeliveryStatus(order.id, 'livree');
      
      if (success) {
        await this.deliveryValidationOtpService.clearDeliveryOTP(order.id);
        this.presentToast('🎉 Livraison validée et terminée !');
        this.loadDashboardData();
      } else {
        this.presentToast('❌ Erreur lors de la finalisation');
      }

      await loading.dismiss();

    } catch (error) {
      this.presentToast('❌ Erreur lors de la finalisation');
    }
  }

  // Utility methods required by template
  private expandedOrders = new Set<number>();

  getCustomerName(order: DeliveryOrder): string {
    return order.phone_number || 'Client';
  }

  getItemsCount(order: DeliveryOrder): number {
    if (!order.items) return 0;
    
    if (Array.isArray(order.items)) {
      return order.items.reduce((total: number, item: any) => total + (item.quantity || 1), 0);
    }
    
    if (typeof order.items === 'object') {
      const itemsArray = Object.values(order.items);
      return itemsArray.reduce((total: number, item: any) => {
        // La quantité est dans item.quantity, pas dans item.item.quantity
        return total + (item.quantity || 1);
      }, 0);
    }
    
    return 0;
  }

  getDeliveryZone(address: string | undefined): string {
    if (!address) return 'Zone non spécifiée';
    return address.length > 30 ? address.substring(0, 30) + '...' : address;
  }

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

  callCustomer(phoneNumber: string) {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_system');
    }
  }

  openDirections(address: string) {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_system');
    }
  }

  hasOrderItems(order: DeliveryOrder): boolean {
    if (!order.items) return false;
    
    if (Array.isArray(order.items)) {
      return order.items.length > 0;
    }
    
    if (typeof order.items === 'object') {
      return Object.keys(order.items).length > 0;
    }
    
    return false;
  }

  getOrderItems(order: DeliveryOrder): any[] {
    if (!order.items) return [];
    
    if (Array.isArray(order.items)) {
      return order.items;
    }
    
    if (typeof order.items === 'object') {
      const itemsArray = Object.values(order.items);
      
      // CORRECTION : Transformer la structure pour que le template fonctionne
      return itemsArray.map((item: any) => {
        if (item.item) {
          // Structure: { item: {...}, quantity: 1 }
          // On flatten pour que le template trouve les propriétés
          const transformedItem = {
            ...item.item,                    // Toutes les propriétés de item.item
            quantity: item.quantity || 1,    // Ajouter la quantité
            selected_options: item.item.selected_options || null,
            // CORRECTION: Assurer que price et total_price sont disponibles
            price: item.item.final_price || item.item.price_on_site_base || item.item.base_price || 0,
            total_price: (item.item.final_price || item.item.price_on_site_base || item.item.base_price || 0) * (item.quantity || 1)
          };
          
          
          return transformedItem;
        }
        // Si c'est déjà dans le bon format
        return item;
      });
    }
    
    return [];
  }

  hasSelectedOptions(selectedOptions: any): boolean {
    if (!selectedOptions || typeof selectedOptions !== 'object') {
      return false;
    }
    return Object.keys(selectedOptions).length > 0;
  }

  getSelectedOptionsGroups(selectedOptions: any): any[] {
    if (!selectedOptions || typeof selectedOptions !== 'object') {
      return [];
    }

    const groups: any[] = [];
    
    for (const [groupName, options] of Object.entries(selectedOptions)) {
      if (options) {
        let formattedOptions: any[] = [];
        
        if (Array.isArray(options)) {
          // Groupe avec plusieurs options (ex: sauces)
          formattedOptions = options;
        } else if (typeof options === 'object') {
          // Groupe avec une seule option (ex: viande)
          formattedOptions = [options];
        }
        
        if (formattedOptions.length > 0) {
          groups.push({
            groupName: groupName,
            options: formattedOptions
          });
        }
      }
    }
    
    return groups;
  }

  formatOptionGroupName(groupName: string): string {
    // Formatage simple dynamique : première lettre en majuscule
    if (!groupName) return '';
    return groupName.charAt(0).toUpperCase() + groupName.slice(1);
  }

  shouldShowUpdateTime(order: DeliveryOrder): boolean {
    if (!order.updated_at || order.updated_at === order.created_at) return false;
    
    const updateTime = new Date(order.updated_at);
    const now = new Date();
    const diffHours = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
    
    return diffHours < 2; // Show update time only if updated within last 2 hours
  }

  getUpdateTimeText(order: DeliveryOrder): string {
    if (!order.updated_at) return '';
    
    const updateTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `Il y a ${diffHours}h${diffMinutes % 60 > 0 ? ` ${diffMinutes % 60}min` : ''}`;
    }
  }

  /**
   * NOUVEAU : Envoie une notification WhatsApp au client pour début de livraison
   */
  private async sendDeliveryStartNotification(order: DeliveryOrder, driver: FranceUser): Promise<void> {
    try {
      console.log('🚚 [WhatsApp] Envoi notification début livraison pour commande:', order.order_number);
      
      const orderData = {
        orderNumber: order.order_number,
        restaurantName: 'Pizza Yolo', // TODO: Récupérer dynamiquement
        driverName: driver.name || 'Votre livreur',
        driverPhone: driver.phoneNumber || '',
        estimatedTime: '15-20 min',
        total: this.formatPrice(order.total_amount),
        deliveryAddress: order.delivery_address,
        validationCode: order.delivery_validation_code?.toString()
      };

      await this.whatsappNotificationFranceService.sendOrderStatusNotification(
        order.phone_number,
        'en_livraison',
        orderData
      );
      
      console.log('✅ [WhatsApp] Notification envoyée avec succès');
    } catch (error) {
      console.error('❌ [WhatsApp] Erreur notification:', error);
      // Ne pas bloquer le processus si la notification échoue
    }
  }

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
      
      // Passage automatique au champ suivant avec animation
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
      
      // Si le champ est vide, revenir au précédent
      if (!this.otpDigits[orderId][position] && prevInput) {
        this.otpDigits[orderId][position - 1] = '';
        prevInput.value = '';
        prevInput.focus();
      } else {
        this.otpDigits[orderId][position] = '';
      }
    } else if (event.key === 'ArrowLeft' && prevInput) {
      prevInput.focus();
    } else if (event.key === 'ArrowRight' && nextInput) {
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
          this.loadDashboardData();
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
}
