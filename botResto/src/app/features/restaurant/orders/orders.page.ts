import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantOrdersService, Order, DeliveryUser, Restaurant } from '../../../core/services/restaurant-orders.service';
import { AutoRefreshService } from '../../../core/services/auto-refresh.service';
import { REFRESH_CONFIG } from '../../../core/config/refresh.config';
import { DeliveryAssignmentModalComponent } from './components/delivery-assignment-modal/delivery-assignment-modal.component';
import { WhatsAppNotificationService } from '../../../core/services/whatsapp-notification.service';
import { RestaurantPaymentService } from '../../../core/services/restaurant-payment.service';

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
  
  // AJOUT: Cache des paiements
  private paymentStatusCache = new Map<string, any>();
  
  // AJOUT: État de configuration de paiement
  hasPaymentConfig: boolean = false;
  private paymentTimers = new Map<string, any>();

  constructor(
    private authService: AuthService,
    private ordersService: RestaurantOrdersService,
    private autoRefreshService: AutoRefreshService,
    private router: Router,
    private modalController: ModalController,
    private whatsappService: WhatsAppNotificationService,
    private paymentService: RestaurantPaymentService,  // AJOUT
    private loadingController: LoadingController,      // AJOUT
    private toastController: ToastController           // AJOUT
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
      this.ordersService.loadAvailableDeliveryUsers(user.restaurantId),
      this.checkPaymentConfiguration(user.restaurantId)
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
    
    // AJOUT: Charger statuts paiement
    this.loadPaymentStatuses();
  }

  ngOnDestroy() {
    // Stop auto-refresh for this component
    this.autoRefreshService.stopAutoRefresh('restaurant-orders');
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // AJOUT: Clear timers
    this.paymentTimers.forEach(timer => clearInterval(timer));
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

  getPaymentModeText(paymentMode: string): string {
    switch (paymentMode) {
      case 'fin_repas': return 'Paiement fin repas';
      case 'recuperation': return 'Paiement récupération';
      case 'livraison': return 'Paiement livraison';
      case 'maintenant': return 'Paiement immédiat';
      default: return paymentMode;
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

  // Open change delivery modal
  async openChangeDeliveryModal(order: Order) {
    const modal = await this.modalController.create({
      component: DeliveryAssignmentModalComponent,
      componentProps: {
        orderDetails: order,
        availableDeliveryUsers: this.availableDeliveryUsers,
        isReassignment: true, // Flag pour indiquer qu'il s'agit d'un changement
        currentDriver: order.livreur_nom
      },
      backdropDismiss: false
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.assigned) {
      await this.reassignDeliveryPerson(order.id, data.deliveryUser.id);
    }
  }

  // Reassign delivery person
  async reassignDeliveryPerson(orderId: string, newDeliveryUserId: number) {
    const success = await this.ordersService.reassignDeliveryDriver(orderId, newDeliveryUserId);
    if (success) {
      console.log('✅ Livreur changé avec succès');
      // La mise à jour de l'interface se fait automatiquement via le BehaviorSubject
    } else {
      // TODO: Show error toast
      console.error('❌ Échec du changement de livreur');
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
    
    // Ajouter le bouton Annuler pour tous les statuts actifs (sauf les états finaux)
    const finalStatuses = ['terminee', 'livree', 'annulee'];
    if (!finalStatuses.includes(order.statut)) {
      actions.push({ label: 'Annuler', status: 'annulee', color: 'danger' });
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
  openDrivingDirections(clientLatitude?: number, clientLongitude?: number, adresse_livraison?: string) {
    if (!this.restaurant) {
      console.error('Coordonnées restaurant non disponibles');
      return;
    }

    const restaurantLat = this.restaurant.latitude;
    const restaurantLng = this.restaurant.longitude;
    
    let finalClientLat = clientLatitude;
    let finalClientLng = clientLongitude;

    // Si pas de coordonnées directes, essayer d'extraire depuis adresse_livraison
    if ((!finalClientLat || !finalClientLng) && adresse_livraison && adresse_livraison.startsWith('GPS: ')) {
      const coordsText = adresse_livraison.replace('GPS: ', '').trim();
      const [lat, lng] = coordsText.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        finalClientLat = lat;
        finalClientLng = lng;
      }
    }
    
    if (finalClientLat && finalClientLng) {
      // URL Google Maps simplifiée avec itinéraire en mode conduite
      const url = `https://www.google.com/maps/dir/${restaurantLat},${restaurantLng}/${finalClientLat},${finalClientLng}`;
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
  
  // AJOUT: Nouvelles méthodes pour paiement
  async loadPaymentStatuses() {
    for (const order of this.orders) {
      // Charger pour toutes les commandes non "maintenant" (pour afficher le mode de paiement)
      if (order.paiement_mode !== 'maintenant') {
        const payment = await this.paymentService.getLastPaymentStatus(order.id);
        if (payment) {
          this.paymentStatusCache.set(order.id, payment);
          // Démarrer timer seulement si PENDING et pas encore payé
          if (payment.status === 'PENDING' && order.paiement_statut !== 'paye') {
            this.startPaymentTimer(order.id, payment.created_at);
          }
        }
      }
    }
  }
  
  startPaymentTimer(orderId: string, createdAt: string) {
    if (this.paymentTimers.has(orderId)) {
      clearInterval(this.paymentTimers.get(orderId));
    }
    
    const timer = setInterval(() => {
      if (this.paymentService.isPaymentExpired(createdAt)) {
        clearInterval(timer);
        this.paymentTimers.delete(orderId);
        this.paymentStatusCache.delete(orderId);
      }
    }, 1000);
    
    this.paymentTimers.set(orderId, timer);
  }
  
  shouldShowPaymentSection(order: Order): boolean {
    // Afficher la section paiement pour les statuts PRETE et EN_LIVRAISON même avec paiement_mode 'maintenant'
    if ((order.statut === 'prete' || order.statut === 'en_livraison') && 
        order.paiement_statut !== 'paye') {
      return true;
    }
    
    // Logique existante pour les autres cas
    return order.paiement_mode !== 'maintenant' && 
           order.paiement_statut !== 'paye' &&
           order.statut !== 'annulee' &&
           order.statut !== 'livree';
  }
  
  canTriggerPayment(order: Order): boolean {
    const payment = this.paymentStatusCache.get(order.id);
    
    // Afficher le bouton tant que le statut n'est pas SUCCESS
    if (!payment) return true;
    if (payment.status === 'SUCCESS') return false;
    
    // Pour tous les autres statuts (PENDING, FAILED, etc.), afficher le bouton
    return true;
  }
  
  isPaymentActive(order: Order): boolean {
    const payment = this.paymentStatusCache.get(order.id);
    return payment && 
           payment.status === 'PENDING' && 
           !this.paymentService.isPaymentExpired(payment.created_at);
  }
  
  async triggerPayment(order: Order) {
    const loading = await this.loadingController.create({
      message: 'Création du paiement...'
    });
    await loading.present();
    
    try {
      // Utiliser le restaurantId de la session
      const user = this.authService.getCurrentUser();
      const restaurantId = user?.restaurantId;
      
      if (!restaurantId) {
        throw new Error('Restaurant ID non trouvé');
      }
      
      const result: any = await this.paymentService.triggerPayment(
        restaurantId,
        order.id
      );
      
      if (result.success) {
        await this.loadPaymentStatuses();
        
        const toast = await this.toastController.create({
          message: 'Demande de paiement envoyée au client',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      } else {
        const toast = await this.toastController.create({
          message: result.message || 'Erreur lors de la création du paiement',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error: any) {
      console.error('Erreur paiement:', error);
      
      // Message d'erreur plus détaillé
      let errorMessage = 'Erreur de connexion';
      
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 0) {
        errorMessage = 'Impossible de contacter le serveur';
      } else if (error?.status === 404) {
        errorMessage = 'Service de paiement non trouvé';
      } else if (error?.status === 500) {
        errorMessage = 'Erreur serveur';
      }
      
      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 4000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
  
  getTimeRemaining(order: Order): string {
    const payment = this.paymentStatusCache.get(order.id);
    if (!payment) return '';
    return this.paymentService.getTimeRemaining(payment.created_at);
  }
  
  async refreshPaymentStatus(order: Order) {
    const payment = await this.paymentService.getLastPaymentStatus(order.id);
    if (payment) {
      this.paymentStatusCache.set(order.id, payment);
      if (payment.status === 'SUCCESS') {
        await this.refreshOrders();
      }
    }
  }
  
  // AJOUT: Vérifier l'existence de la configuration de paiement
  async checkPaymentConfiguration(restaurantId: string): Promise<void> {
    try {
      console.log('🔍 Vérification config paiement pour restaurant ID:', restaurantId);
      // Créer une méthode dans le service de paiement pour cette vérification
      const hasConfig = await this.paymentService.hasPaymentConfiguration(restaurantId);
      console.log('✅ Résultat hasPaymentConfiguration:', hasConfig);
      this.hasPaymentConfig = hasConfig;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la config paiement:', error);
      this.hasPaymentConfig = false;
    }
  }

  // AJOUT: Récupérer l'heure de paiement SUCCESS
  getPaymentSuccessTime(order: Order): string | null {
    const payment = this.paymentStatusCache.get(order.id);
    if (payment && payment.status === 'SUCCESS' && payment.processed_at) {
      return payment.processed_at;
    }
    return null;
  }
}