import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';
import { LoadingController } from '@ionic/angular';
import { DriverOnlineStatusService } from '../../../../core/services/driver-online-status.service';

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
  myOrdersCount = 0;

  // Statut en ligne/hors ligne
  isOnline = false;
  isToggling = false;

  private userSubscription?: Subscription;
  private availableOrdersSubscription?: Subscription;
  private onlineStatusSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private driverOnlineStatusService: DriverOnlineStatusService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.availableOrdersSubscription?.unsubscribe();
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
}
