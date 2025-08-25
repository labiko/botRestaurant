import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth.service';
import { AnalyticsService, RevenueStats, ChartDataPoint } from '../../../core/services/analytics.service';
import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  restaurant: User | null = null;
  currentStatus: any;
  private subscription = new Subscription();
  Math = Math; // Expose Math to template
  
  // Statistiques temps réel
  stats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    todayRevenue: 0
  };

  // Analytics financières
  revenueStats: RevenueStats = {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  };

  // Données pour les graphiques
  chartData = {
    daily: [] as ChartDataPoint[], // 30 derniers jours
    monthly: [] as ChartDataPoint[], // 12 derniers mois
    hourly: [] as ChartDataPoint[] // Répartition par heure aujourd'hui
  };

  selectedPeriod: 'day' | 'week' | 'month' = 'day';
  isLoading = true;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private scheduleService: ScheduleService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.restaurant = this.authService.getCurrentUser();
    
    if (!this.restaurant || this.restaurant.type !== 'restaurant') {
      this.router.navigate(['/home']);
      return;
    }

    await this.loadDashboardData();
    
    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(() => this.loadDashboardData(), 300000);
    this.subscription.add(() => clearInterval(interval));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadDashboardData() {
    if (!this.restaurant?.restaurantId) return;

    try {
      await Promise.all([
        this.updateRestaurantStatus(),
        this.loadOrderStats(),
        this.loadRevenueAnalytics(),
        this.loadChartData()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadRevenueAnalytics() {
    if (!this.restaurant?.restaurantId) return;
    
    this.revenueStats = await this.analyticsService.getRevenueStats(this.restaurant.restaurantId);
    this.stats.todayRevenue = this.revenueStats.today;
  }

  async loadChartData() {
    if (!this.restaurant?.restaurantId) return;

    switch (this.selectedPeriod) {
      case 'day':
        this.chartData.daily = await this.analyticsService.getDailyRevenue(this.restaurant.restaurantId, 30);
        break;
      case 'week':
        // TODO: Implement weekly revenue
        this.chartData.daily = await this.analyticsService.getDailyRevenue(this.restaurant.restaurantId, 7);
        break;
      case 'month':
        this.chartData.monthly = await this.analyticsService.getMonthlyRevenue(this.restaurant.restaurantId, 12);
        break;
    }
    this.chartData.hourly = await this.analyticsService.getHourlyRevenue(this.restaurant.restaurantId);
  }

  async onPeriodChange(period: any) {
    if (period && ['day', 'week', 'month'].includes(period)) {
      this.selectedPeriod = period as 'day' | 'week' | 'month';
      await this.loadChartData();
    }
  }

  async updateRestaurantStatus() {
    if (!this.restaurant?.restaurantId) return;

    const schedule = await this.scheduleService.getRestaurantSchedule(this.restaurant.restaurantId);
    this.currentStatus = this.scheduleService.isRestaurantOpen(schedule, 'ouvert'); // TODO: Get actual status
  }

  async loadOrderStats() {
    if (!this.restaurant?.restaurantId) return;
    
    // TODO: Implement order statistics loading
    // For now, using mock data
    this.stats = {
      pending: 5,
      inProgress: 3,
      completed: 24,
      todayRevenue: this.revenueStats.today
    };
  }

  navigateToSettings() {
    this.router.navigate(['/restaurant/settings']);
  }

  navigateToOrders() {
    this.router.navigate(['/restaurant/orders']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/restaurant/analytics']);
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'ouvert': return 'checkmark-circle';
      case 'temporairement_ferme': return 'time';
      case 'ferme': return 'close-circle';
      default: return 'help-circle';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'ouvert': return 'Ouvert';
      case 'temporairement_ferme': return 'Fermé temporairement';
      case 'ferme': return 'Fermé';
      default: return 'Inconnu';
    }
  }

  getBarHeight(value: number, data: ChartDataPoint[]): number {
    if (data.length === 0) return 0;
    const max = Math.max(...data.map(item => item.value));
    return max > 0 ? (value / max) * 100 : 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(value);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/home']);
  }
}