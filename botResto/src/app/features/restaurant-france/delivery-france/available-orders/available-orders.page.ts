import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';
import { LoadingController } from '@ionic/angular';
import { DriverOnlineStatusService } from '../../../../core/services/driver-online-status.service';
import { DeliveryCountersService, DeliveryCounters } from '../../../../core/services/delivery-counters.service';
import { DeliveryOrderItemsService } from '../../../../core/services/delivery-order-items.service';
import { DeliveryRefusalService } from '../../../../core/services/delivery-refusal.service';
import { DeliveryTokenService } from '../../../../core/services/delivery-token.service';
import { DriverSessionMonitorService } from '../../../../core/services/driver-session-monitor.service';
import { UniversalOrderDisplayService, FormattedItem } from '../../../../core/services/universal-order-display.service';
import { AddressWhatsAppService } from '../../../../core/services/address-whatsapp.service';

@Component({
  selector: 'app-available-orders',
  templateUrl: './available-orders.page.html',
  styleUrls: ['./available-orders.page.scss'],
  standalone: false
})
export class AvailableOrdersPage implements OnInit, OnDestroy {
  currentDriver: FranceUser | null = null;
  availableOrders: DeliveryOrder[] = [];
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

  // Token d'acceptation depuis URL
  acceptanceToken: string | null = null;
  tokenOrder: DeliveryOrder | null = null;

  // Variables calculées pour éviter les recalculs constants
  public orderItemsCounts: { [orderId: number]: number } = {};
  public orderHasItems: { [orderId: number]: boolean } = {};
  public orderFormattedItems: { [orderId: number]: any[] } = {};

  private userSubscription?: Subscription;
  private availableOrdersSubscription?: Subscription;
  private onlineStatusSubscription?: Subscription;
  private countersSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private driverOnlineStatusService: DriverOnlineStatusService,
    private deliveryCountersService: DeliveryCountersService,
    private deliveryOrderItemsService: DeliveryOrderItemsService,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private deliveryRefusalService: DeliveryRefusalService,
    private deliveryTokenService: DeliveryTokenService,
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private addressWhatsAppService: AddressWhatsAppService
  ) {}

  ngOnInit() {
    // Détecter le token d'acceptation dans l'URL
    this.checkForAcceptanceToken();
    
    this.initializeData();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.availableOrdersSubscription?.unsubscribe();
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
    });
    
    // S'abonner aux données utilisateur
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentDriver = user;
        if (user && user.type === 'driver') {
          if (this.acceptanceToken) {
            // ✅ Mode token : Charger toutes les données PUIS filtrer
            console.log(`🔑 [TOKEN_DEBUG] Token: ${this.acceptanceToken.substring(0, 8)}...`);
            this.loadAvailableOrders(true); // ✅ Passer true pour inclure les commandes assignées
          } else {
            // ✅ Mode normal : Afficher toutes les commandes disponibles
            this.loadAvailableOrders(false); // ✅ Passer false pour mode normal
          }
          this.initializeOnlineStatus();
        }
      }
    });
  }

  /**
   * Afficher uniquement la commande spécifique du token
   */
  private displayTokenOrder() {
    if (!this.tokenOrder) {
      return;
    }
    
    console.log(`🔍 [TOKEN_DEBUG] Token Order récupéré:`, {
      id: this.tokenOrder.id,
      order_number: this.tokenOrder.order_number,
      status: this.tokenOrder.status,
      driver_id: this.tokenOrder.driver_id,
      total_amount: this.tokenOrder.total_amount
    });
    
    // Afficher UNIQUEMENT la commande du token
    this.availableOrders = [this.tokenOrder];
    this.isLoading = false;
    
    
    // Recalculer les données pour cette commande unique
    this.computeOrderData();
    
    // Mettre à jour le compteur (1 seule commande)
    this.deliveryCountersService.updateAvailableOrdersCount(1);
    
  }

  /**
   * Charger les commandes disponibles
   * @param includeAssigned - Inclure les commandes assignées (mode token)
   */
  private async loadAvailableOrders(includeAssigned: boolean = false) {
    if (!this.currentDriver) return;

    this.isLoading = true;
    try {
      // Charger les commandes disponibles (avec ou sans assignées selon le mode)
      await this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId, includeAssigned);
      
      // S'abonner aux changements des commandes disponibles
      this.availableOrdersSubscription = this.deliveryOrdersService.availableOrders$.subscribe(orders => {
        if (this.acceptanceToken && this.tokenOrder) {
          // Mode token : Chercher la commande du token dans les données chargées
          
          const tokenOrderEnriched = orders.find(order => order.id === this.tokenOrder!.id);
          
          if (tokenOrderEnriched) {
            this.availableOrders = [tokenOrderEnriched];
          } else {
            this.availableOrders = [this.tokenOrder];
          }
          
        } else {
          // Mode normal : Garder toutes les commandes
          this.availableOrders = orders;
        }
        
        this.isLoading = false;
        
        // Recalculer les données des commandes
        this.computeOrderData();
        
        // Mettre à jour le compteur dans le service partagé
        this.deliveryCountersService.updateAvailableOrdersCount(this.availableOrders.length);
      });
    } catch (error) {
      console.error('Erreur chargement commandes disponibles:', error);
      this.isLoading = false;
    }
  }

  /**
   * Vérifier s'il y a un token d'acceptation dans l'URL
   */
  private async checkForAcceptanceToken() {
    this.acceptanceToken = this.route.snapshot.queryParams['token'];
    
    if (this.acceptanceToken) {
      console.log(`🔍 [AvailableOrders] Token d'acceptation détecté: ${this.acceptanceToken.substring(0, 8)}...`);
      
      // Valider le token
      try {
        const validation = await this.deliveryTokenService.validateToken(this.acceptanceToken);
        
        if (validation.valid && validation.orderData) {
          this.tokenOrder = validation.orderData;
          console.log(`🔍 [TOKEN_DEBUG] Validation result:`, {
            valid: validation.valid,
            order_id: validation.orderData.id,
            order_number: validation.orderData.order_number,
            status: validation.orderData.status,
            driver_id: validation.orderData.driver_id
          });
          
          // ✅ NOUVEAU : Vérifier si commande déjà acceptée
          if (validation.orderData.status === 'assignee' || validation.orderData.status === 'en_livraison') {
            this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
            return;
          }
          
          // Si utilisateur déjà connecté, afficher directement la commande du token
          if (this.currentDriver) {
            console.log(`🚀 [TOKEN_DEBUG] Appel displayTokenOrder() immédiat`);
            this.displayTokenOrder(); // RÉACTIVÉ - Nécessaire pour le serveur
          } else {
            console.log(`⏳ [TOKEN_DEBUG] Attente connexion utilisateur pour displayTokenOrder()`);
          }
          
          // L'utilisateur est déjà authentifié par le DeliveryTokenGuard
          // Pas besoin d'afficher la popup - il peut voir les commandes directement
        } else {
          await this.showToast(validation.reason || 'Lien expiré ou invalide', 'danger');
        }
      } catch (error) {
        console.error('❌ [AvailableOrders] Erreur validation token:', error);
        await this.showToast('Erreur lors de la validation du lien', 'danger');
      }
    }
  }

  /**
   * Afficher la modal d'acceptation pour un token
   */
  private async showTokenAcceptanceModal(order: DeliveryOrder) {
    const alert = await this.alertController.create({
      header: '🔗 Acceptation via lien',
      message: `Vous avez cliqué sur un lien WhatsApp pour accepter la commande:<br><br><strong>#${order.order_number}</strong><br>Total: ${order.total_amount}€<br><br>Voulez-vous l'accepter maintenant ?`,
      cssClass: 'custom-alert-white',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Accepter',
          handler: async () => {
            await this.acceptOrderWithToken();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Accepter une commande via token
   */
  private async acceptOrderWithToken() {
    if (!this.acceptanceToken || !this.tokenOrder) {
      await this.showToast('Token manquant', 'danger');
      return;
    }

    // 🕐 LOGS TIMEZONE DEBUG
    const now = new Date();
    console.log('🕐 [TIMEZONE_DEBUG] ==========================================');
    console.log('🕐 [TIMEZONE_DEBUG] CLIC ACCEPTER COMMANDE');
    console.log('🕐 [TIMEZONE_DEBUG] Heure JavaScript locale:', now.toString());
    console.log('🕐 [TIMEZONE_DEBUG] Heure UTC:', now.toUTCString());
    console.log('🕐 [TIMEZONE_DEBUG] Heure ISO:', now.toISOString());
    console.log('🕐 [TIMEZONE_DEBUG] Timezone navigateur:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('🕐 [TIMEZONE_DEBUG] Offset timezone (minutes):', now.getTimezoneOffset());
    console.log('🕐 [TIMEZONE_DEBUG] ==========================================');

    const loading = await this.loadingController.create({
      message: 'Acceptation en cours...'
    });
    await loading.present();

    try {
      
      const result = await this.deliveryTokenService.acceptOrderByToken(this.acceptanceToken);
      
      await loading.dismiss();
      
      if (result.success) {
        await this.showToast('Commande acceptée avec succès !', 'success');
        
        // Recharger les données et rediriger vers mes commandes
        await this.loadAvailableOrders();
        this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
        
      } else {
        console.error('❌ [AvailableOrders] Échec acceptation via token:', result.message);
        await this.showToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ [AvailableOrders] Erreur acceptation via token:', error);
      await loading.dismiss();
      await this.showToast('Erreur lors de l\'acceptation', 'danger');
    }
  }

  /**
   * Accepter une commande - LOGIQUE IDENTIQUE AU DASHBOARD
   */
  async acceptOrder(order: DeliveryOrder) {
    if (!this.currentDriver) return;

    // 🕐 LOGS TIMEZONE DEBUG
    const now = new Date();
    console.log('🕐 [TIMEZONE_DEBUG] ==========================================');
    console.log('🕐 [TIMEZONE_DEBUG] CLIC ACCEPTER COMMANDE DIRECTE');
    console.log('🕐 [TIMEZONE_DEBUG] Commande:', order.order_number);
    console.log('🕐 [TIMEZONE_DEBUG] Heure JavaScript locale:', now.toString());
    console.log('🕐 [TIMEZONE_DEBUG] Heure UTC:', now.toUTCString());
    console.log('🕐 [TIMEZONE_DEBUG] Heure ISO:', now.toISOString());
    console.log('🕐 [TIMEZONE_DEBUG] Timezone navigateur:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('🕐 [TIMEZONE_DEBUG] Offset timezone (minutes):', now.getTimezoneOffset());
    console.log('🕐 [TIMEZONE_DEBUG] ==========================================');

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
            const loading = await this.loadingController.create({
              message: 'Acceptation en cours...'
            });
            await loading.present();

            try {
              // MODIFICATION: Réutiliser le token existant au lieu d'en générer un nouveau
              // Récupérer les tokens existants pour cette commande
              const existingTokens = await this.deliveryTokenService.getTokensForOrder(order.id);
              
              // MODIFICATION: Utiliser n'importe quel token disponible (pas de contrôle livreur)
              const availableToken = existingTokens.length > 0 ? existingTokens[0] : null;
              
              if (availableToken) {
                // Utiliser le token existant (avec logs détaillés [ACCEPT_DETAILED])
                const acceptResult = await this.deliveryTokenService.acceptOrderByToken(availableToken.token);
                
                if (acceptResult.success) {
                  this.loadAvailableOrders(); // Recharger les données
                  this.presentToast('Commande acceptée avec succès');
                  // Naviguer vers mes commandes après acceptation
                  this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
                } else {
                  this.presentToast(acceptResult.message || 'Erreur lors de l\'acceptation');
                }
              } else {
                // Fallback: Générer un token si aucun n'existe pour ce livreur
                const tokenResult = await this.deliveryTokenService.generateTokensForOrder(order.id);
                
                if (tokenResult.success && tokenResult.tokens.length > 0) {
                  // Utiliser n'importe quel token généré (pas de contrôle livreur)
                  const newToken = tokenResult.tokens[0];
                  
                  if (newToken) {
                    const acceptResult = await this.deliveryTokenService.acceptOrderByToken(newToken.token);
                    
                    if (acceptResult.success) {
                      this.loadAvailableOrders(); // Recharger les données
                      this.presentToast('Commande acceptée avec succès');
                      this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
                    } else {
                      this.presentToast(acceptResult.message || 'Erreur lors de l\'acceptation');
                    }
                  } else {
                    this.presentToast('Token non trouvé pour ce livreur');
                  }
                } else {
                  // Fallback final vers l'ancienne méthode
                  const success = await this.deliveryOrdersService.acceptOrder(order.id, this.currentDriver!.id);
                  if (success) {
                    this.loadAvailableOrders(); // Recharger les données
                    this.presentToast('Commande acceptée avec succès');
                    this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
                  } else {
                    this.presentToast('Erreur lors de l\'acceptation');
                  }
                }
              }
            } catch (error) {
              console.error('Erreur acceptation commande:', error);
              this.presentToast('Erreur lors de l\'acceptation');
            }
            
            await loading.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }


  /* ===== FONCTIONNALITÉ REFUS DÉSACTIVÉE =====
   * Bouton "Refuser" retiré de l'interface pour simplifier l'UX
   * Logique : Pas intéressé = Ne fait rien (ignore la notification)
   * Code conservé ci-dessous pour réactivation future si nécessaire
   */

  /**
   * NOUVEAU - Refuser une commande avec sélection de raison
   */
  /*
  async refuseOrder(order: DeliveryOrder) {
    if (!this.currentDriver) return;

    const actionSheet = await this.actionSheetController.create({
      header: 'Pourquoi ne pouvez-vous pas accepter cette commande ?',
      buttons: [
        ...this.deliveryRefusalService.getRefusalReasons().map(reason => ({
          text: reason.label,
          icon: reason.icon,
          handler: () => this.handleRefusalReason(order, reason.code)
        })),
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Traiter la raison de refus sélectionnée
   */
  /*
  private async handleRefusalReason(order: DeliveryOrder, reasonCode: string) {
    if (!this.currentDriver) return;

    // Si c'est "autre raison", demander une raison personnalisée
    if (reasonCode === 'other') {
      await this.showCustomReasonPrompt(order);
      return;
    }

    // Sinon, refuser directement avec la raison sélectionnée
    await this.processOrderRefusal(order, reasonCode);
  }

  /**
   * Demander une raison personnalisée
   */
  /*
  private async showCustomReasonPrompt(order: DeliveryOrder) {
    const alert = await this.alertController.create({
      header: 'Précisez votre raison',
      inputs: [
        {
          name: 'customReason',
          type: 'textarea',
          placeholder: 'Expliquez pourquoi vous ne pouvez pas accepter...'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Refuser la commande',
          handler: async (data) => {
            if (data.customReason?.trim()) {
              await this.processOrderRefusal(order, 'other', data.customReason);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Traiter le refus de la commande via le service
   */
  /*
  private async processOrderRefusal(order: DeliveryOrder, reason: string, customReason?: string) {
    if (!this.currentDriver) return;

    const loading = await this.loadingController.create({
      message: 'Traitement du refus...'
    });
    await loading.present();

    try {
      const result = await this.deliveryRefusalService.refuseOrder({
        orderId: order.id,
        driverId: this.currentDriver.id,
        reason,
        customReason
      });

      if (result.success) {
        this.presentToast(result.message);
        // Recharger les commandes disponibles
        this.loadAvailableOrders();
      } else {
        this.presentToast(result.message);
      }
    } catch (error) {
      console.error('Erreur refus commande:', error);
      this.presentToast('Erreur lors du refus de la commande');
    } finally {
      await loading.dismiss();
    }
  }
  */

  /**
   * Recalculer les données des commandes pour éviter les recalculs constants
   */
  private computeOrderData(): void {
    this.availableOrders.forEach(order => {
      const formattedItems = this.getFormattedItems(order);
      this.orderItemsCounts[order.id] = formattedItems.reduce((total, item) => total + (item.quantity || 1), 0);
      this.orderHasItems[order.id] = formattedItems.length > 0;
      this.orderFormattedItems[order.id] = formattedItems;
    });
  }

  /**
   * FONCTIONS UTILITAIRES - IDENTIQUES AU DASHBOARD ET MY-ORDERS
   */

  getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'en_attente_assignation': 'warning',
      'assignee': 'primary',
      'en_livraison': 'secondary', 
      'livree': 'success',
      'annulee': 'danger'
    };
    return colors[status] || 'medium';
  }

  getOrderStatusText(status: string): string {
    const texts: Record<string, string> = {
      'en_attente_assignation': 'Disponible',
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
    
    const result = this.deliveryOrderItemsService.hasOrderItems(order);
    return result;
  }

  getOrderItems(order: DeliveryOrder): any[] {
    return this.deliveryOrderItemsService.getOrderItems(order);
  }

  /**
   * NOUVEAU - Formater les items avec le service universel (même format que restaurant)
   */
  getFormattedItems(order: DeliveryOrder): FormattedItem[] {
    console.log('🍕 [DEBUG] Livreur order.items:', order.items);
    console.log('🍕 [DEBUG] Livreur order.items type:', typeof order.items);

    // CORRECTION : Convertir l'objet {0: {...}, 1: {...}} en array [{...}, {...}]
    let itemsArray: any[] = [];
    if (order.items && typeof order.items === 'object') {
      if (Array.isArray(order.items)) {
        itemsArray = order.items;
      } else {
        // Convertir objet en array
        itemsArray = Object.values(order.items);
      }
    }

    console.log('🍕 [DEBUG] Livreur itemsArray converti:', itemsArray);

    const formattedItems = this.universalOrderDisplayService.formatOrderItems(itemsArray);
    console.log('🍕 [DEBUG] Livreur formattedItems result:', formattedItems);

    return formattedItems;
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
        
        // Si hors ligne, vider les commandes disponibles
        if (!isOnline) {
          this.availableOrders = [];
        }
      });

    } catch (error) {
      console.error('❌ [AvailableOrders] Erreur initialisation statut en ligne:', error);
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
        
        // Si on vient de se mettre en ligne, recharger les commandes disponibles
        if (result.newStatus) {
          this.loadAvailableOrders();
        } else {
          // Si hors ligne, vider les commandes disponibles
          this.availableOrders = [];
        }
      } else {
        this.presentToast(result.message);
      }
    } catch (error) {
      console.error('❌ [AvailableOrders] Erreur toggle statut:', error);
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
  refreshAvailableOrders() {
    if (this.currentDriver) {
      this.loadAvailableOrders();
    }
  }

  /**
   * Pull to refresh - Rafraîchir les données en tirant vers le bas
   */
  async doRefresh(event: any) {
    
    try {
      if (this.currentDriver && this.currentDriver.restaurantId) {
        await this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId);
        this.computeOrderData();
      }
    } catch (error) {
      console.error('❌ [AvailableOrders] Erreur lors du rafraîchissement:', error);
    } finally {
      // Terminer l'animation de refresh après un court délai
      setTimeout(() => {
        event.target.complete();
      }, 500);
    }
  }

  /**
   * Afficher un toast
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
