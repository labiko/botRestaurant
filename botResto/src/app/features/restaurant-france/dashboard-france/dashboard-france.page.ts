import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

import { AuthFranceService, FranceUser } from '../auth-france/services/auth-france.service';
import { FranceOrdersService, FranceOrder } from '../../../core/services/france-orders.service';
import { DriversFranceService } from '../../../core/services/drivers-france.service';

@Component({
  selector: 'app-dashboard-france',
  templateUrl: './dashboard-france.page.html',
  styleUrls: ['./dashboard-france.page.scss'],
  standalone: false
})
export class DashboardFrancePage implements OnInit, OnDestroy {
  currentUser: FranceUser | null = null;
  recentOrders: FranceOrder[] = [];
  isLoading = false;

  // Statistiques
  todayOrders = 0;
  pendingOrders = 0;
  activeDrivers = 0;
  todayRevenue = 0;

  private userSubscription?: Subscription;
  private ordersSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private franceOrdersService: FranceOrdersService,
    private driversFranceService: DriversFranceService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) { }

  ngOnInit() {
    // Bloquer complètement la navigation arrière
    this.preventBackNavigation();
    this.initializeDashboard();
  }

  /**
   * Empêcher la navigation arrière
   */
  private preventBackNavigation() {
    // Ajouter une entrée dans l'historique
    history.pushState(null, '', window.location.href);
    
    // Écouter l'événement popstate (navigation arrière/avant)
    window.addEventListener('popstate', this.onPopState);
  }

  /**
   * Gestionnaire pour l'événement popstate
   */
  private onPopState = (event: PopStateEvent) => {
    // Remettre l'utilisateur sur la page actuelle
    history.pushState(null, '', window.location.href);
  }

  ngOnDestroy() {
    // Nettoyer l'écouteur d'événement
    window.removeEventListener('popstate', this.onPopState);
    
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  /**
   * Initialisation du dashboard
   */
  private initializeDashboard() {
    // S'abonner aux changements d'utilisateur
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentUser = user;
        if (user && user.type === 'restaurant') {
          this.loadDashboardData();
        }
      }
    });

    // S'abonner aux changements de commandes
    this.ordersSubscription = this.franceOrdersService.orders$.subscribe(orders => {
      this.recentOrders = orders.slice(0, 5); // 5 commandes les plus récentes
      this.calculateStats(orders);
    });
  }

  /**
   * Charger les données du dashboard
   */
  private async loadDashboardData() {
    if (!this.currentUser) return;

    this.isLoading = true;
    
    try {
      // Charger les commandes
      await this.franceOrdersService.loadOrders(this.currentUser.restaurantId);
      
      // TODO: Charger les statistiques livreurs
      this.activeDrivers = await this.loadActiveDriversCount();
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Calculer les statistiques
   */
  private calculateStats(orders: FranceOrder[]) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const todayOrdersList = orders.filter(order => 
      order.created_at.startsWith(todayString)
    );

    this.todayOrders = todayOrdersList.length;
    this.pendingOrders = orders.filter(order => 
      ['pending', 'confirmee'].includes(order.status)
    ).length;

    // Statuts finalisés = 'prete' (anciennes) + nouveaux statuts terminés
    const finalizedStatuses = ['prete', 'livree', 'servie', 'recuperee'];
    
    this.todayRevenue = Math.round(
      todayOrdersList
        .filter(order => finalizedStatuses.includes(order.status))
        .reduce((sum, order) => sum + order.total_amount, 0) * 100
    ) / 100;
  }

  /**
   * Charger le nombre de livreurs actifs
   */
  private async loadActiveDriversCount(): Promise<number> {
    if (!this.currentUser) return 0;
    return await this.driversFranceService.getActiveDriversCount(this.currentUser.restaurantId);
  }

  /**
   * Navigation vers les commandes
   */
  goToOrders() {
    this.router.navigate(['/restaurant-france/orders-france']);
  }

  /**
   * Navigation vers les livreurs
   */
  goToDrivers() {
    this.router.navigate(['/restaurant-france/drivers-france']);
  }

  /**
   * Navigation vers le suivi des livraisons
   */
  goToDeliveryTracking() {
    this.router.navigate(['/restaurant-france/delivery-france/tracking']);
  }

  /**
   * Afficher les statistiques
   */
  viewStats() {
    // TODO: Implémenter la page de statistiques
    console.log('Affichage statistiques - À implémenter');
  }

  /**
   * Navigation vers la configuration restaurant
   */
  goToSettings() {
    this.router.navigate(['/restaurant-france/settings']);
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
   * Formatage helpers
   */
  formatTime(dateString: string): string {
    return this.franceOrdersService.formatTime(dateString);
  }

  formatPrice(amount: number): string {
    return this.franceOrdersService.formatPrice(amount);
  }

  getStatusColor(status: string): string {
    return this.franceOrdersService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.franceOrdersService.getStatusText(status);
  }

  getDeliveryModeText(mode: string): string {
    const modes: { [key: string]: string } = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    return modes[mode] || mode;
  }
}