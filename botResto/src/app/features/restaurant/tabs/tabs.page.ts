import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantOrdersService } from '../../../core/services/restaurant-orders.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  activeOrdersCount = 0;
  pendingPaymentsCount = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private ordersService: RestaurantOrdersService,
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

    // Subscribe to orders updates for badges
    const ordersSubscription = this.ordersService.getCurrentOrders().subscribe(
      orders => {
        // Count active orders (non-closed)
        this.activeOrdersCount = orders.filter(order => 
          !['livree', 'terminee', 'annulee'].includes(order.statut)
        ).length;

        // Count pending cash payments
        this.pendingPaymentsCount = orders.filter(order =>
          ['fin_repas', 'recuperation', 'livraison'].includes(order.paiement_mode) &&
          order.paiement_statut === 'en_attente'
        ).length;
      }
    );
    this.subscriptions.push(ordersSubscription);

    // Load initial data
    await this.ordersService.loadRestaurantOrders(user.restaurantId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}