import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';

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

  // Statistiques
  todayDeliveries = 0;
  pendingDeliveries = 0;
  completedDeliveries = 0;
  todayEarnings = 0;

  private userSubscription?: Subscription;
  private myOrdersSubscription?: Subscription;
  private availableOrdersSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
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
      this.myOrdersSubscription = this.deliveryOrdersService.orders$.subscribe(orders => {
        this.myOrders = orders;
        this.calculateStats(orders);
      });

      // Charger les commandes disponibles
      await this.deliveryOrdersService.loadAvailableOrders(this.currentDriver.restaurantId);
      
      // S'abonner aux changements des commandes disponibles
      this.availableOrdersSubscription = this.deliveryOrdersService.orders$.subscribe(orders => {
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
        newStatus = 'livree';
        confirmMessage = 'Marquer cette commande comme livrée ?';
        break;
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
}
