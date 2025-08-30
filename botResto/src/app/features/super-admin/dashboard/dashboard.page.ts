import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SuperAdminAuthService } from '../services/super-admin-auth.service';
import { SuperAdminDashboardService, DashboardStats } from '../services/super-admin-dashboard.service';

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SuperAdminDashboardPage implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  
  // Données pour les graphiques (simplifié)
  chartData = {
    dailyOrders: [12, 19, 8, 15, 22, 18, 25],
    weeklyRevenue: [15000, 22000, 18000, 25000, 20000, 28000, 32000],
    restaurantsByStatus: {
      active: 0,
      suspended: 0,
      pending: 0
    }
  };

  constructor(
    private router: Router,
    private authService: SuperAdminAuthService,
    private dashboardService: SuperAdminDashboardService
  ) {}

  async ngOnInit() {
    // Vérifier l'authentification
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/super-admin/auth/login']);
      return;
    }

    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      this.loading = true;
      
      // Charger les statistiques
      this.stats = await this.dashboardService.getDashboardStats();
      
      // Charger les données des graphiques
      await this.loadChartData();
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadChartData() {
    try {
      // Simuler des données de graphiques
      this.chartData.restaurantsByStatus = {
        active: this.stats?.activeRestaurants || 0,
        suspended: this.stats?.suspendedRestaurants || 0,
        pending: this.stats?.pendingRestaurants || 0
      };
    } catch (error) {
      console.error('Erreur chargement graphiques:', error);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([`/super-admin/${route}`]);
  }

  async refresh() {
    await this.loadDashboardData();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/super-admin/auth/login']);
  }

  // Utilitaires pour l'affichage
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0
    }).format(amount) + ' GNF';
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getStatusColor(status: 'up' | 'down' | 'stable'): string {
    switch (status) {
      case 'up': return 'success';
      case 'down': return 'danger';
      case 'stable': return 'warning';
      default: return 'medium';
    }
  }

  getStatusIcon(status: 'up' | 'down' | 'stable'): string {
    switch (status) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'help';
    }
  }
}