import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { DeliveryService, DeliveryOrder } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false,
})
export class OrdersPage implements OnInit, OnDestroy {
  allOrders: DeliveryOrder[] = [];
  filteredOrders: DeliveryOrder[] = [];
  selectedFilter: string = 'active';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private deliveryService: DeliveryService
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.type !== 'delivery') {
      this.router.navigate(['/login'], { queryParams: { userType: 'delivery' } });
      return;
    }

    await this.loadOrders();
    this.subscribeToUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadOrders() {
    try {
      const user = this.authService.getCurrentUser();
      console.log('👤 Current user for orders page:', user);
      
      if (user && user.deliveryPhone) {
        console.log(`📞 Loading orders for delivery phone: ${user.deliveryPhone}`);
        await this.deliveryService.loadDeliveryOrders(user.deliveryPhone);
      } else {
        console.error('❌ No delivery phone found for current user:', { user });
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
    }
  }

  private subscribeToUpdates() {
    this.subscriptions.push(
      this.deliveryService.orders$.subscribe(orders => {
        console.log('📦 Orders page received orders:', orders);
        this.allOrders = orders;
        this.applyFilter();
        console.log(`📋 Orders page after filter (${this.filteredOrders.length}):`, this.filteredOrders);
      })
    );
  }

  onFilterChange() {
    this.applyFilter();
  }

  private applyFilter() {
    if (this.selectedFilter === 'active') {
      // Commandes en cours : assigned, picked_up, in_transit
      this.filteredOrders = this.allOrders.filter(order => 
        order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit'
      );
    } else if (this.selectedFilter === 'history') {
      // Historique : commandes livrées
      this.filteredOrders = this.allOrders.filter(order => order.status === 'delivered');
    } else {
      this.filteredOrders = this.allOrders;
    }
  }

  async acceptOrder(orderId: number) {
    try {
      console.log(`✅ Accepting order ${orderId}`);
      await this.deliveryService.acceptOrder(orderId);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  }

  async updateOrderStatus(orderId: number, status: DeliveryOrder['status']) {
    try {
      await this.deliveryService.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  async startNavigation(latitude: number | null, longitude: number | null) {
    await this.deliveryService.startNavigation(latitude, longitude);
  }

  viewClientInfo(clientId: string) {
    console.log(`Voir informations client: ${clientId}`);
    // TODO: Implémenter la vue détaillée du client
  }

  async callCustomer(phone: string) {
    await this.deliveryService.callCustomer(phone);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0
    }).format(amount) + ' GNF';
  }

  getPaymentStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en_attente': 'En attente',
      'paye': 'Payé',
      'echoue': 'Échec',
      'rembourse': 'Remboursé'
    };
    return statusMap[status] || status;
  }

  getPaymentMethodLabel(method: string): string {
    const methodMap: { [key: string]: string } = {
      'orange_money': 'Orange Money',
      'wave': 'Wave',
      'cash': 'Espèces',
      'carte': 'Carte bancaire'
    };
    return methodMap[method] || method;
  }

  goBack() {
    this.router.navigate(['/delivery/dashboard']);
  }
}
