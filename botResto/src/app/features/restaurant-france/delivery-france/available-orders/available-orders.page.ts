import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';
import { LoadingController } from '@ionic/angular';
import { DriverOnlineStatusService } from '../../../../core/services/driver-online-status.service';
import { DeliveryCountersService, DeliveryCounters } from '../../../../core/services/delivery-counters.service';
import { DeliveryOrderItemsService } from '../../../../core/services/delivery-order-items.service';
import { DeliveryRefusalService } from '../../../../core/services/delivery-refusal.service';

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
    private actionSheetController: ActionSheetController,
    private deliveryRefusalService: DeliveryRefusalService
  ) {}

  ngOnInit() {
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
      console.log(`🔢 [AvailableOrders] Compteurs reçus:`, counters);
    });
    
    // S'abonner aux données utilisateur
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentDriver = user;
        if (user && user.type === 'driver') {
          this.loadAvailableOrders();
          this.initializeOnlineStatus();
        }
      }
    });
  }

  /**
   * Charger les commandes disponibles
   */
  private async loadAvailableOrders() {
    if (!this.currentDriver) return;

    this.isLoading = true;
    try {
      // Charger les commandes disponibles
      await this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId);
      
      // S'abonner aux changements des commandes disponibles
      this.availableOrdersSubscription = this.deliveryOrdersService.availableOrders$.subscribe(orders => {
        this.availableOrders = orders;
        this.isLoading = false;
        
        // Mettre à jour le compteur dans le service partagé
        this.deliveryCountersService.updateAvailableOrdersCount(orders.length);
      });
    } catch (error) {
      console.error('Erreur chargement commandes disponibles:', error);
      this.isLoading = false;
    }
  }

  /**
   * Accepter une commande - LOGIQUE IDENTIQUE AU DASHBOARD
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
            const loading = await this.loadingController.create({
              message: 'Acceptation en cours...'
            });
            await loading.present();

            try {
              const success = await this.deliveryOrdersService.acceptOrder(order.id, this.currentDriver!.id);
              if (success) {
                this.loadAvailableOrders(); // Recharger les données
                this.presentToast('Commande acceptée avec succès');
                // Naviguer vers mes commandes après acceptation
                this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
              } else {
                this.presentToast('Erreur lors de l\'acceptation');
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

  /**
   * NOUVEAU - Refuser une commande avec sélection de raison
   */
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
    return this.deliveryOrderItemsService.hasOrderItems(order);
  }

  getOrderItems(order: DeliveryOrder): any[] {
    return this.deliveryOrderItemsService.getOrderItems(order);
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
        console.log(`📱 [AvailableOrders] Statut mis à jour: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
        
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
          console.log('✅ [AvailableOrders] Livreur en ligne - rechargement des commandes');
        } else {
          // Si hors ligne, vider les commandes disponibles
          this.availableOrders = [];
          console.log('⏸️ [AvailableOrders] Livreur hors ligne - commandes vidées');
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
    console.log('🔄 [AvailableOrders] Rafraîchissement des données...');
    if (this.currentDriver) {
      this.loadAvailableOrders();
    }
  }

  /**
   * Pull to refresh - Rafraîchir les données en tirant vers le bas
   */
  async doRefresh(event: any) {
    console.log('🔄 [AvailableOrders] Pull to refresh déclenché');
    
    try {
      if (this.currentDriver && this.currentDriver.restaurantId) {
        await this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId);
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
}
