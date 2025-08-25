import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantOrdersService, Order, DeliveryUser, Restaurant } from '../../../core/services/restaurant-orders.service';
import { AutoRefreshService } from '../../../core/services/auto-refresh.service';
import { REFRESH_CONFIG } from '../../../core/config/refresh.config';
import { DeliveryAssignmentModalComponent } from './components/delivery-assignment-modal/delivery-assignment-modal.component';
import { WhatsAppNotificationService } from '../../../core/services/whatsapp-notification.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false,
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  availableDeliveryUsers: DeliveryUser[] = [];
  selectedFilter: string = 'all';
  isLoading = true;
  restaurant: Restaurant | null = null;
  
  // Cache for distance calculations to avoid repeated calls
  private distanceCache = new Map<string, string>();
  
  // Pre-computed order data to avoid template function calls
  ordersWithComputedData: (Order & { 
    distanceDisplay?: string;
    availableActions?: { label: string, status: Order['statut'], color: string }[];
  })[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private ordersService: RestaurantOrdersService,
    private autoRefreshService: AutoRefreshService,
    private router: Router,
    private modalController: ModalController,
    private whatsappService: WhatsAppNotificationService
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user || user.type !== 'restaurant') {
      this.router.navigate(['/auth/login'], { queryParams: { userType: 'restaurant' } });
      return;
    }
    
    // Test WhatsApp connection on init
    this.testWhatsAppConnection();

    if (!user.restaurantId) {
      console.error('Restaurant ID not found');
      return;
    }

    // Set restaurant info from session
    if (user.restaurant) {
      this.restaurant = {
        id: user.restaurant.id,
        nom: user.restaurant.nom,
        latitude: user.restaurant.latitude,
        longitude: user.restaurant.longitude
      };
      console.log('Restaurant info loaded from session:', this.restaurant);
    } else {
      console.log('No restaurant info in session, user:', user);
    }

    // Subscribe to orders updates
    const ordersSubscription = this.ordersService.getCurrentOrders().subscribe(
      orders => {
        console.log('Orders received in component:', orders);
        this.orders = orders;
        this.isLoading = false;
        // Clear distance cache when orders are updated
        this.clearDistanceCache();
        // Pre-compute order data
        this.computeOrdersData();
      }
    );
    this.subscriptions.push(ordersSubscription);

    // Subscribe to delivery users updates
    const deliverySubscription = this.ordersService.getAvailableDeliveryUsers().subscribe(
      users => this.availableDeliveryUsers = users
    );
    this.subscriptions.push(deliverySubscription);

    // Load initial data
    await Promise.all([
      this.ordersService.loadRestaurantOrders(user.restaurantId),
      this.ordersService.loadAvailableDeliveryUsers(user.restaurantId)
    ]);

    // Start auto-refresh using centralized config
    const autoRefreshSubscription = this.autoRefreshService
      .startAutoRefresh('restaurant-orders', REFRESH_CONFIG.COMPONENTS.RESTAURANT_ORDERS)
      .subscribe(shouldRefresh => {
        if (shouldRefresh) {
          this.refreshOrders();
        }
      });
    this.subscriptions.push(autoRefreshSubscription);
  }

  ngOnDestroy() {
    // Stop auto-refresh for this component
    this.autoRefreshService.stopAutoRefresh('restaurant-orders');
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  // Filter orders by status (using pre-computed data)
  getFilteredOrders(): (Order & { 
    distanceDisplay?: string;
    availableActions?: { label: string, status: Order['statut'], color: string }[];
  })[] {
    if (this.selectedFilter === 'all') {
      return this.ordersWithComputedData;
    }
    return this.ordersWithComputedData.filter(order => order.statut === this.selectedFilter);
  }

  // Get status badge color
  getStatusColor(status: string): string {
    switch (status) {
      case 'en_attente': return 'warning';
      case 'confirmee': return 'primary';
      case 'preparation': return 'secondary';
      case 'prete': return 'success';
      case 'en_livraison': return 'tertiary';
      case 'livree': return 'success';
      case 'annulee': return 'danger';
      default: return 'medium';
    }
  }

  // Get status display text
  getStatusText(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'preparation': return 'En préparation';
      case 'prete': return 'Prête';
      case 'en_livraison': return 'En livraison';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  }

  // Get next tab filter based on status
  getNextTabForStatus(status: Order['statut']): string {
    switch (status) {
      case 'confirmee':
        return 'confirmee';
      case 'preparation':
        return 'preparation';
      case 'prete':
        return 'prete';
      case 'en_livraison':
        return 'en_livraison';
      case 'livree':
        return 'all'; // Show all after delivery
      case 'annulee':
        return 'all'; // Show all after cancellation
      default:
        return this.selectedFilter; // Keep current filter
    }
  }

  // Handle action button click
  onActionButtonClick(order: Order, action: { label: string, status: Order['statut'], color: string }) {
    console.log(`🖱️ Button "${action.label}" clicked for order ${order.numero_commande}`);
    this.updateOrderStatus(order.id, action.status);
  }

  // Update order status with WhatsApp notification
  async updateOrderStatus(orderId: string, newStatus: Order['statut']) {
    console.log(`🔄 Updating order ${orderId} to status ${newStatus}`);
    
    // Get restaurant name from session
    const restaurantName = this.restaurant?.nom || 'Restaurant';
    
    try {
      const success = await this.ordersService.updateOrderStatusWithNotification(
        orderId, 
        newStatus, 
        restaurantName
      );
      
      if (success) {
        // Switch to the appropriate tab after successful status update
        const nextTab = this.getNextTabForStatus(newStatus);
        this.selectedFilter = nextTab;
        console.log(`✅ Status updated to ${newStatus} with notification, switched to tab: ${nextTab}`);
      } else {
        console.error('❌ Failed to update order status');
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
    }
  }

  // Open delivery assignment modal
  async openDeliveryAssignmentModal(order: Order) {
    const modal = await this.modalController.create({
      component: DeliveryAssignmentModalComponent,
      componentProps: {
        orderDetails: order,
        availableDeliveryUsers: this.availableDeliveryUsers
      },
      backdropDismiss: false
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.assigned) {
      await this.assignDeliveryPerson(order.id, data.deliveryUser.id);
    }
  }

  // Assign delivery person
  async assignDeliveryPerson(orderId: string, deliveryUserId: number) {
    const success = await this.ordersService.assignDeliveryPerson(orderId, deliveryUserId);
    if (!success) {
      // TODO: Show error toast
      console.error('Failed to assign delivery person');
    }
  }

  // Format order total
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'GNF',
      minimumFractionDigits: 0 
    }).format(amount);
  }

  // Format order time
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Get available actions for order status
  getAvailableActions(order: Order): { label: string, status: Order['statut'], color: string }[] {
    const actions: { label: string, status: Order['statut'], color: string }[] = [];
    
    switch (order.statut) {
      case 'en_attente':
        actions.push({ label: 'Confirmer', status: 'confirmee', color: 'primary' });
        actions.push({ label: 'Annuler', status: 'annulee', color: 'danger' });
        break;
      case 'confirmee':
        actions.push({ label: 'En préparation', status: 'preparation', color: 'secondary' });
        break;
      case 'preparation':
        actions.push({ label: 'Prête', status: 'prete', color: 'success' });
        break;
      case 'prete':
        if (order.mode === 'livraison') {
          // Pour livraison: soit affecter livreur, soit marquer en livraison si déjà affecté
          if (order.livreur_nom) {
            actions.push({ label: 'En livraison', status: 'en_livraison', color: 'tertiary' });
          }
          // Action d'affectation livreur sera gérée séparément par le bouton dédié
        } else {
          // Pour sur place et à emporter: marquer comme terminée
          const label = order.mode === 'sur_place' ? 'Servie' : 'Récupérée';
          actions.push({ label: label, status: 'terminee', color: 'success' });
        }
        break;
      case 'en_livraison':
        // Bouton "Livrée" masqué - la livraison sera confirmée par le livreur avec OTP
        break;
    }
    
    return actions;
  }

  // Get order count by status
  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.statut === status).length;
  }

  // Open driving directions from restaurant to client
  openDrivingDirections(clientLatitude?: number, clientLongitude?: number) {
    if (!this.restaurant) {
      console.error('Coordonnées restaurant non disponibles');
      return;
    }

    const restaurantLat = this.restaurant.latitude;
    const restaurantLng = this.restaurant.longitude;
    
    if (clientLatitude && clientLongitude) {
      // URL Google Maps avec itinéraire en mode conduite
      const url = `https://www.google.com/maps/dir/${restaurantLat},${restaurantLng}/${clientLatitude},${clientLongitude}/@${clientLatitude},${clientLongitude},15z/data=!3m1!4b1!4m2!4m1!3e0`;
      window.open(url, '_blank');
    } else {
      // Si pas de coordonnées client, ouvrir Google Maps sur la position du restaurant
      const url = `https://www.google.com/maps/@${restaurantLat},${restaurantLng},15z`;
      window.open(url, '_blank');
      console.log('Coordonnées client non disponibles, ouverture de la position restaurant');
    }
  }


  // Get estimated time based on distance
  getEstimatedTime(distanceKm?: number): string {
    if (!distanceKm) return '0 mins';
    
    // Estimation: 30 km/h en moyenne en ville avec trafic
    const timeInHours = distanceKm / 30;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    return timeInMinutes > 60 ? 
      `${Math.round(timeInMinutes / 60)}h ${timeInMinutes % 60}mins` : 
      `${timeInMinutes} mins`;
  }

  // Format distance and time display with caching
  getDistanceTimeDisplay(distanceKm?: number): string {
    // Use caching to avoid repeated calculations
    const cacheKey = `${distanceKm || 'undefined'}`;
    
    if (this.distanceCache.has(cacheKey)) {
      return this.distanceCache.get(cacheKey)!;
    }
    
    const distance = distanceKm ? `${distanceKm} km` : 'Non calculée';
    const time = this.getEstimatedTime(distanceKm);
    const result = `${distance} et ${time}`;
    
    // Cache the result
    this.distanceCache.set(cacheKey, result);
    
    return result;
  }

  // Clear distance cache when orders are updated
  private clearDistanceCache(): void {
    this.distanceCache.clear();
  }

  // Pre-compute order data to avoid template function calls
  private computeOrdersData(): void {
    this.ordersWithComputedData = this.orders.map(order => ({
      ...order,
      distanceDisplay: this.getDistanceTimeDisplay(order.distance_km),
      availableActions: this.getAvailableActions(order)
    }));
  }

  // Get status date based on current order status
  getStatusDate(order: Order): string | null {
    switch (order.statut) {
      case 'confirmee':
        return order.confirmed_at || null;
      case 'preparation':
        return order.prepared_at || null;
      case 'prete':
        return order.prepared_at || null; // Use prepared_at for prete status
      case 'en_livraison':
      case 'livree':
        return order.delivered_at || null;
      case 'annulee':
        return order.cancelled_at || null;
      default:
        return null;
    }
  }

  // Get status date label
  getStatusDateLabel(order: Order): string {
    switch (order.statut) {
      case 'confirmee':
        return 'Confirmée le';
      case 'preparation':
        return 'Mise en préparation le';
      case 'prete':
        return 'Prête le';
      case 'en_livraison':
        return 'Prise en charge le';
      case 'livree':
        return 'Livrée le';
      case 'annulee':
        return 'Annulée le';
      default:
        return '';
    }
  }

  // Format date and time
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Refresh orders
  async refreshOrders(showLoader: boolean = false) {
    const user = this.authService.getCurrentUser();
    if (user?.restaurantId) {
      try {
        // Only show loading indicator if explicitly requested (manual refresh)
        if (showLoader) {
          this.isLoading = true;
        }
        
        // Refresh both orders and delivery users in parallel
        await Promise.all([
          this.ordersService.loadRestaurantOrders(user.restaurantId),
          this.ordersService.loadAvailableDeliveryUsers(user.restaurantId)
        ]);
        
        console.log('🔄 Orders refreshed automatically');
      } catch (error) {
        console.error('❌ Error refreshing orders:', error);
      } finally {
        if (showLoader) {
          this.isLoading = false;
        }
      }
    }
  }

  // Manual refresh (triggered by user action)
  async manualRefresh() {
    await this.refreshOrders(true);
    
    // Force immediate auto-refresh trigger
    this.autoRefreshService.forceRefresh('restaurant-orders');
  }

  // Test WhatsApp connection
  async testWhatsAppConnection() {
    console.log('🔗 Testing WhatsApp Green API connection...');
    const isConnected = await this.whatsappService.testConnection();
    if (isConnected) {
      console.log('✅ WhatsApp API is connected and ready');
    } else {
      console.error('❌ WhatsApp API connection failed - messages will not be sent');
    }
  }

  // Send test WhatsApp message (for debugging)
  async sendTestMessage() {
    const testPhone = '33620951645'; // Numéro français de test
    const testMessage = `🧪 *Test Green API*\n\nCeci est un message de test depuis Bot Resto.\n\nTimestamp: ${new Date().toLocaleString('fr-FR')}`;
    
    console.log('📤 Sending test WhatsApp message...');
    const success = await this.whatsappService.sendCustomMessage(testPhone, testMessage, 'TEST-001');
    
    if (success) {
      console.log('✅ Test message sent successfully');
    } else {
      console.error('❌ Test message failed');
    }
  }
}