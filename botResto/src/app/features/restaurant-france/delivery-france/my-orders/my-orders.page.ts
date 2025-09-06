import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';
import { DeliveryValidationOtpService } from '../../../../core/services/delivery-validation-otp.service';
import { SupabaseFranceService } from '../../../../core/services/supabase-france.service';
import { LoadingController } from '@ionic/angular';
import { FranceOrdersService } from '../../../../core/services/france-orders.service';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { DriverOnlineStatusService } from '../../../../core/services/driver-online-status.service';
import { DeliveryCountersService, DeliveryCounters } from '../../../../core/services/delivery-counters.service';
import { DeliveryOrderItemsService } from '../../../../core/services/delivery-order-items.service';
import { UniversalOrderDisplayService, FormattedItem } from '../../../../core/services/universal-order-display.service';
import { AddressWhatsAppService } from '../../../../core/services/address-whatsapp.service';

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
  
  // Compteurs partagés pour les badges
  currentCounters: DeliveryCounters = {
    myOrdersCount: 0,
    availableOrdersCount: 0,
    historyOrdersCount: 0
  };

  // Statut en ligne/hors ligne
  isOnline = false;
  isToggling = false;

  // OTP inline moderne - MÊME LOGIQUE QUE DASHBOARD
  showOTPInput: { [orderId: number]: boolean } = {};
  otpDigits: { [orderId: number]: string[] } = {};

  private userSubscription?: Subscription;
  private myOrdersSubscription?: Subscription;
  private onlineStatusSubscription?: Subscription;
  private countersSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private deliveryValidationOtpService: DeliveryValidationOtpService,
    private supabaseFranceService: SupabaseFranceService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private whatsappNotificationFranceService: WhatsAppNotificationFranceService,
    private franceOrdersService: FranceOrdersService,
    private driverOnlineStatusService: DriverOnlineStatusService,
    private deliveryCountersService: DeliveryCountersService,
    private deliveryOrderItemsService: DeliveryOrderItemsService,
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private addressWhatsAppService: AddressWhatsAppService
  ) {}

  ngOnInit() {
    console.log(`🚀 [MyOrders] Initialisation de la page MyOrders`);
    this.initializeData();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.myOrdersSubscription?.unsubscribe();
    this.onlineStatusSubscription?.unsubscribe();
    this.countersSubscription?.unsubscribe();
  }

  /**
   * Initialiser les données
   */
  private async initializeData() {
    // S'abonner aux compteurs partagés pour les badges
    this.countersSubscription = this.deliveryCountersService.counters$.subscribe(counters => {
      this.currentCounters = counters;
      console.log(`🔢 [MyOrders] Compteurs reçus:`, counters);
    });
    
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
          console.log(`📦 [MyOrders] ${orders.length} commandes reçues:`);
          orders.forEach(order => {
            console.log(`  🏷️ Commande ${order.order_number} (ID: ${order.id})`);
            console.log(`     - Status: ${order.status}`);
            console.log(`     - Actions disponibles:`, order.availableActions);
            console.log(`     - OTP: ${order.delivery_validation_code ? 'OUI (' + order.delivery_validation_code + ')' : 'NON'}`);
          });
          
          this.myOrders = orders;
          this.isLoading = false;
          
          // Mettre à jour le compteur dans le service partagé
          this.deliveryCountersService.updateMyOrdersCount(orders.length);
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
    console.log(`🔄 [MyOrders] ======================================================`);
    console.log(`🔄 [MyOrders] ============ FONCTION updateOrderStatus APPELÉE ============`);
    console.log(`🔄 [MyOrders] ======================================================`);
    console.log(`🔄 [MyOrders] Order ID: ${order.id}`);
    console.log(`🔄 [MyOrders] Order Number: ${order.order_number}`);
    console.log(`🔄 [MyOrders] Status actuel: ${order.status}`);
    console.log(`🔄 [MyOrders] Nouveau status demandé: ${newStatus}`);
    console.log(`🔄 [MyOrders] Actions disponibles pour cette commande:`, order.availableActions);
    
    // Vérifier si on a un OTP existant
    if (order.delivery_validation_code) {
      console.log(`🔐 [MyOrders] OTP EXISTANT TROUVÉ: ${order.delivery_validation_code}`);
    } else {
      console.log(`❌ [MyOrders] AUCUN OTP pour cette commande`);
    }
    
    if (newStatus === 'delivered') {
      console.log(`🔒 [MyOrders] *** DÉCLENCHEMENT INTERFACE OTP POUR COMMANDE ${order.id} ***`);
      console.log(`🔒 [MyOrders] Activation showOTPInput[${order.id}] = true`);
      
      // Marquer comme livré nécessite une validation OTP
      this.showOTPInput[order.id] = true;
      this.otpDigits[order.id] = ['', '', '', ''];
      
      console.log(`🔒 [MyOrders] État showOTPInput après activation:`, this.showOTPInput);
      
      // Vérifier le DOM après un délai pour que Angular ait le temps de mettre à jour
      setTimeout(() => {
        const otpContainer = document.querySelector('.otp-inline-container');
        const otpDigits = document.querySelectorAll('.otp-digit');
        
        console.log(`🔍 [MyOrders] Vérification DOM OTP:`);
        console.log(`   - Container OTP trouvé: ${otpContainer ? 'OUI' : 'NON'}`);
        console.log(`   - Nombre de champs OTP: ${otpDigits.length}`);
        
        if (otpContainer) {
          console.log(`   - Container visible: ${otpContainer.clientHeight > 0 ? 'OUI' : 'NON'}`);
          console.log(`   - Classes du container:`, otpContainer.classList.toString());
        }
        
        // Focus sur le premier champ après un délai
        const firstInput = document.querySelector('.otp-digit') as HTMLInputElement;
        if (firstInput) {
          console.log(`🔒 [MyOrders] Focus appliqué sur le premier champ OTP`);
          firstInput.focus();
        } else {
          console.log(`❌ [MyOrders] AUCUN CHAMP OTP TROUVÉ DANS LE DOM`);
        }
      }, 500);
      
      console.log(`🔒 [MyOrders] RETURN - Interface OTP activée, arrêt de la fonction`);
      return;
    }

    // CORRECTION: Gérer le cas 'start_delivery' pour passer à 'en_livraison'
    if (newStatus === 'start_delivery') {
      console.log(`🚚 [MyOrders] CORRECTION: start_delivery -> en_livraison`);
      newStatus = 'en_livraison';
    }

    const loading = await this.loadingController.create({
      message: 'Mise à jour...'
    });
    await loading.present();

    try {
      console.log(`📤 [MyOrders] Traitement du nouveau status: ${newStatus}`);
      let success = false;

      if (newStatus === 'en_livraison') {
        console.log(`🚚 [MyOrders] PASSAGE EN LIVRAISON - Notification WhatsApp au client`);
        console.log(`🚚 [MyOrders] Téléphone client: ${order.phone_number}`);
        console.log(`🚚 [MyOrders] Code de validation: ${order.delivery_validation_code}`);
        
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
          console.log(`✅ [MyOrders] Notification WhatsApp envoyée`);
        } else {
          console.log(`❌ [MyOrders] Pas de numéro de téléphone client`);
        }
      }

      console.log(`💾 [MyOrders] Mise à jour BDD - Status: ${newStatus}`);
      success = await this.deliveryOrdersService.updateDeliveryStatus(order.id, newStatus);
      console.log(`💾 [MyOrders] Résultat mise à jour BDD: ${success}`);

      if (success) {
        console.log(`✅ [MyOrders] Mise à jour réussie - Rechargement des données`);
        this.loadMyOrders();
        const statusText = newStatus === 'en_livraison' ? 'En livraison' : this.getOrderStatusText(newStatus);
        this.presentToast(`Statut mis à jour : ${statusText}`);
        console.log(`🎉 [MyOrders] Toast affiché: Statut mis à jour : ${statusText}`);
      } else {
        console.log(`❌ [MyOrders] Échec de la mise à jour`);
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
        
        // Code correct, marquer comme livré ET mettre à jour la date de validation
        const success = await this.deliveryOrdersService.updateDeliveryStatus(order.id, 'livree');
        
        // IMPORTANT: Mettre à jour la date de validation OTP et updated_at
        if (success) {
          const { error: validationError } = await this.supabaseFranceService.client
            .from('france_orders')
            .update({
              date_validation_code: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (validationError) {
            console.error('❌ [MyOrders] Erreur mise à jour date_validation_code:', validationError);
          } else {
            console.log('✅ [MyOrders] Date de validation OTP mise à jour pour commande:', order.id);
          }

          // NOUVEAU: Envoyer le message de remerciement au client
          try {
            const restaurantName = order.france_restaurants?.name || 'Restaurant';
            const messageSent = await this.whatsappNotificationFranceService.sendOrderCompletionMessage(
              order.phone_number,
              order.order_number,
              restaurantName
            );
            
            if (messageSent) {
              console.log(`✅ [MyOrders] Message de remerciement envoyé pour commande ${order.order_number}`);
            } else {
              console.log(`⚠️ [MyOrders] Échec envoi message de remerciement pour commande ${order.order_number}`);
            }
          } catch (messageError) {
            console.error('❌ [MyOrders] Erreur envoi message remerciement:', messageError);
          }

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
    return this.deliveryOrderItemsService.getOrderItems(order).length;
  }

  getDeliveryZone(address?: string): string {
    return address || 'Adresse non spécifiée';
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
    console.log('🔄 [MyOrders] Toggle détails pour commande:', order.order_number);
    console.log('📊 [MyOrders] Données complètes de la commande:', order);
    console.log('📦 [MyOrders] Items bruts (order.items):', order.items);
    console.log('📦 [MyOrders] Type des items:', typeof order.items);
    
    if (this.expandedOrders.has(order.id)) {
      console.log('➖ [MyOrders] Fermeture des détails pour commande:', order.order_number);
      this.expandedOrders.delete(order.id);
    } else {
      console.log('➕ [MyOrders] Ouverture des détails pour commande:', order.order_number);
      this.expandedOrders.add(order.id);
      
      // Analyser les items lors de l'expansion
      if (order.items) {
        console.log('🔍 [MyOrders] Analyse détaillée des items:');
        const items = this.getOrderItems(order);
        items.forEach((item, index) => {
          console.log(`  📌 Item ${index + 1}:`, item);
          console.log(`     - Nom: ${item.name}`);
          console.log(`     - Prix: ${item.price}`);
          console.log(`     - Prix total: ${item.total_price}`);
          console.log(`     - Quantité: ${item.quantity}`);
          console.log(`     - Toutes les propriétés:`, Object.keys(item));
        });
      }
    }
  }

  isOrderExpanded(order: DeliveryOrder): boolean {
    return this.expandedOrders.has(order.id);
  }

  // Fonctions détails articles
  hasOrderItems(order: DeliveryOrder): boolean {
    return this.deliveryOrderItemsService.hasOrderItems(order);
  }

  getOrderItems(order: DeliveryOrder): any[] {
    return this.deliveryOrderItemsService.getOrderItems(order);
  }

  /**
   * NOUVEAU - Formater les items avec le service universel (même format que restaurant)
   */
  getFormattedItems(order: DeliveryOrder): FormattedItem[] {
    const items = this.deliveryOrderItemsService.getOrderItems(order);
    return this.universalOrderDisplayService.formatOrderItems(items || []);
  }

  hasSelectedOptions(selectedOptions: any): boolean {
    return this.deliveryOrderItemsService.hasSelectedOptions(selectedOptions);
  }

  getSelectedOptionsGroups(selectedOptions: any): any[] {
    return this.deliveryOrderItemsService.getSelectedOptionsGroups(selectedOptions);
  }

  formatOptionGroupName(groupName: string): string {
    return this.deliveryOrderItemsService.formatOptionGroupName(groupName);
  }

  shouldShowUpdateTime(order: DeliveryOrder): boolean {
    return this.deliveryOrderItemsService.shouldShowUpdateTime(order);
  }

  getUpdateTimeText(order: DeliveryOrder): string {
    return this.deliveryOrderItemsService.getUpdateTimeText(order);
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

  /**
   * Rafraîchir les données lors du clic sur le tab
   */
  refreshMyOrders() {
    console.log('🔄 [MyOrders] Rafraîchissement des données...');
    if (this.currentDriver) {
      this.loadMyOrders();
    }
  }

  /**
   * Pull to refresh - Rafraîchir les données en tirant vers le bas
   */
  async doRefresh(event: any) {
    console.log('🔄 [MyOrders] Pull to refresh déclenché');
    
    try {
      if (this.currentDriver) {
        await this.deliveryOrdersService.loadDriverOrders(this.currentDriver.id);
      }
    } catch (error) {
      console.error('❌ [MyOrders] Erreur lors du rafraîchissement:', error);
    } finally {
      // Terminer l'animation de refresh après un court délai
      setTimeout(() => {
        event.target.complete();
      }, 500);
    }
  }
}