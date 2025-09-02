import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FranceOrdersService, FranceOrder, OrderAction } from '../../../core/services/france-orders.service';
import { AuthFranceService } from '../auth-france/services/auth-france.service';

@Component({
  selector: 'app-orders-france',
  templateUrl: './orders-france.page.html',
  styleUrls: ['./orders-france.page.scss'],
  standalone: false
})
export class OrdersFrancePage implements OnInit, OnDestroy {
  orders: FranceOrder[] = [];
  selectedFilter: string = 'all';
  isLoading: boolean = false;
  private ordersSubscription?: Subscription;

  // Restaurant ID fixe pour l'instant (à récupérer depuis l'auth plus tard)
  private restaurantId = 1;

  constructor(
    private franceOrdersService: FranceOrdersService,
    public authService: AuthFranceService
  ) { }

  ngOnInit() {
    this.initializeOrders();
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  private async initializeOrders() {
    this.isLoading = true;
    
    // S'abonner aux changements de commandes
    this.ordersSubscription = this.franceOrdersService.orders$.subscribe(orders => {
      this.orders = orders;
      this.isLoading = false;
    });

    try {
      // Charger les commandes initiales
      await this.franceOrdersService.loadOrders(this.restaurantId);
    } catch (error) {
      console.error('Erreur initialisation commandes:', error);
      this.isLoading = false;
    }
  }

  async manualRefresh(event?: any) {
    await this.franceOrdersService.loadOrders(this.restaurantId);
    if (event) {
      event.target.complete();
    }
  }

  getFilteredOrders(): FranceOrder[] {
    if (this.selectedFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedFilter);
  }

  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.status === status).length;
  }

  async onActionButtonClick(order: FranceOrder, action: OrderAction) {
    const success = await this.franceOrdersService.updateOrderStatus(order.id, action.nextStatus);
    
    if (success) {
      // Recharger les commandes pour voir les changements
      await this.franceOrdersService.loadOrders(this.restaurantId);
    } else {
      // Gérer l'erreur (toast, alert, etc.)
      console.error('Erreur mise à jour statut commande');
    }
  }

  getStatusColor(status: string): string {
    return this.franceOrdersService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.franceOrdersService.getStatusText(status);
  }

  formatPrice(amount: number): string {
    return this.franceOrdersService.formatPrice(amount);
  }

  formatTime(dateString: string): string {
    return this.franceOrdersService.formatTime(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.franceOrdersService.formatDateTime(dateString);
  }

  getDeliveryModeText(mode: string): string {
    const modes: { [key: string]: string } = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    return modes[mode] || mode;
  }

  getPaymentModeText(mode: string): string {
    const modes: { [key: string]: string } = {
      'maintenant': 'Mobile Money',
      'fin_repas': 'Cash sur place',
      'recuperation': 'Cash à emporter',
      'livraison': 'Cash livraison'
    };
    return modes[mode] || mode;
  }

  openDrivingDirections(latitude: number, longitude: number, address: string) {
    if (latitude && longitude) {
      // Ouvrir Google Maps avec l'itinéraire
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  }
}