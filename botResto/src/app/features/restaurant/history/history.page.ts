import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantHistoryService, Order } from '../../../core/services/restaurant-history.service';
import { RestaurantPaymentService } from '../../../core/services/restaurant-payment.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false,
})
export class HistoryPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  selectedFilter: string = 'all';
  isLoading = true;
  
  // Cache pour les statuts de paiement
  private paymentStatusCache = new Map<string, any>();
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private historyService: RestaurantHistoryService,
    private paymentService: RestaurantPaymentService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user || user.type !== 'restaurant') {
      this.router.navigate(['/auth/login'], { queryParams: { userType: 'restaurant' } });
      return;
    }

    if (!user.restaurantId) {
      console.error('Restaurant ID not found');
      return;
    }

    // Subscribe to history updates
    const historySubscription = this.historyService.getHistoryOrders().subscribe(
      async orders => {
        this.orders = orders;
        this.isLoading = false;
        
        // Charger les statuts de paiement pour toutes les commandes
        await this.loadPaymentStatuses();
      }
    );
    this.subscriptions.push(historySubscription);

    // Load initial data
    await this.historyService.loadRestaurantHistory(user.restaurantId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Filter orders by status
  getFilteredOrders(): Order[] {
    if (this.selectedFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.statut === this.selectedFilter);
  }

  // Get status badge color
  getStatusColor(status: string): string {
    switch (status) {
      case 'livree': return 'success';
      case 'terminee': return 'success';
      case 'annulee': return 'danger';
      default: return 'medium';
    }
  }

  // Get status display text
  getStatusText(status: string): string {
    switch (status) {
      case 'livree': return 'Livrée';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  }

  // Get payment mode text
  getPaymentModeText(mode: string): string {
    switch (mode) {
      case 'maintenant': return 'Immédiat';
      case 'fin_repas': return 'Fin de repas';
      case 'recuperation': return 'À la récupération';
      case 'livraison': return 'À la livraison';
      default: return mode;
    }
  }

  // Get payment status color
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paye': return 'success';
      case 'en_attente': return 'warning';
      case 'echoue': return 'danger';
      case 'rembourse': return 'medium';
      default: return 'medium';
    }
  }

  // Get payment status text
  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'paye': return 'Payé';
      case 'en_attente': return 'En attente';
      case 'echoue': return 'Échec';
      case 'rembourse': return 'Remboursé';
      default: return status;
    }
  }

  // Format price
  formatPrice(amount: number | string | null | undefined): string {
    // Convert to number and handle edge cases
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount == null) {
      console.warn('Invalid amount for formatting:', amount);
      return '0 GNF';
    }
    
    // Use simple formatting without currency symbol issues
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount) + ' GNF';
  }

  // Format time
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  // Get order count by status
  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.statut === status).length;
  }

  // Load payment statuses for all orders
  private async loadPaymentStatuses(): Promise<void> {
    if (this.orders.length === 0) return;

    try {
      // Get all order IDs that don't have cached payment status
      const orderIdsToLoad = this.orders
        .filter(order => !this.paymentStatusCache.has(order.id))
        .map(order => order.id);

      if (orderIdsToLoad.length === 0) return;

      console.log(`Loading payment statuses for ${orderIdsToLoad.length} orders`);

      // Load payment statuses in parallel
      const paymentStatusPromises = orderIdsToLoad.map(async (orderId) => {
        try {
          const status = await this.paymentService.getLastPaymentStatus(orderId);
          this.paymentStatusCache.set(orderId, status);
          return { orderId, status };
        } catch (error) {
          console.error(`Error loading payment status for order ${orderId}:`, error);
          this.paymentStatusCache.set(orderId, null);
          return { orderId, status: null };
        }
      });

      await Promise.all(paymentStatusPromises);
      console.log(`Loaded payment statuses for ${orderIdsToLoad.length} orders`);

    } catch (error) {
      console.error('Error loading payment statuses:', error);
    }
  }

  // Get payment status from cache
  getPaymentStatus(orderId: string): any {
    return this.paymentStatusCache.get(orderId);
  }

  // Get actual payment mode based on payment status
  getActualPaymentMode(order: Order): string {
    const paymentStatus = this.paymentStatusCache.get(order.id);
    
    // Si on a un statut de paiement SUCCESS, c'est un paiement mobile
    if (paymentStatus && paymentStatus.status === 'SUCCESS') {
      return 'Mobile Money';
    }
    
    // Si pas de statut de paiement ou pas SUCCESS, c'est cash
    if (!paymentStatus || paymentStatus.status !== 'SUCCESS') {
      return 'Cash';
    }
    
    // Fallback sur le mode de paiement original
    return this.getPaymentModeText(order.paiement_mode);
  }

  // Refresh history
  async refreshHistory() {
    const user = this.authService.getCurrentUser();
    if (user?.restaurantId) {
      this.isLoading = true;
      // Clear payment status cache on refresh
      this.paymentStatusCache.clear();
      await this.historyService.loadRestaurantHistory(user.restaurantId);
    }
  }
}