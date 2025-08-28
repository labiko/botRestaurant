import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth.service';
import { AnalyticsService, RevenueStats, ChartDataPoint, OrderStats } from '../../../core/services/analytics.service';
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
  restaurantCurrency = 'GNF'; // Devise par défaut

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

    // Charger la devise du restaurant depuis la base de données
    await this.loadRestaurantCurrency();

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
        // Pour l'onglet JOUR, on affiche seulement les revenus d'aujourd'hui (répartition par heure)
        this.chartData.daily = await this.analyticsService.getHourlyRevenue(this.restaurant.restaurantId);
        break;
      case 'week':
        // Pour l'onglet SEMAINE, afficher les 7 derniers jours
        this.chartData.daily = await this.analyticsService.getDailyRevenue(this.restaurant.restaurantId, 7);
        break;
      case 'month':
        // Pour l'onglet MOIS, afficher les 12 derniers mois
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
    
    const orderStats = await this.analyticsService.getOrderStats(this.restaurant.restaurantId);
    this.stats = orderStats;
    
    console.log('📊 Statistiques réelles chargées:', this.stats);
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

  async loadRestaurantCurrency() {
    if (!this.restaurant?.restaurantId) return;

    try {
      const supabase = (this.scheduleService as any).supabase.client;
      const { data, error } = await supabase
        .from('restaurants')
        .select('currency')
        .eq('id', this.restaurant.restaurantId)
        .single();

      if (data && !error && data.currency) {
        this.restaurantCurrency = data.currency;
        console.log('✅ Devise restaurant chargée:', data.currency);
      }
    } catch (error) {
      console.error('❌ Erreur chargement devise restaurant:', error);
      // Garder la devise par défaut GNF en cas d'erreur
    }
  }

  formatCurrency(value: number): string {
    // Adapter la locale selon la devise
    const locale = this.restaurantCurrency === 'EUR' ? 'fr-FR' : 'fr-GN';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.restaurantCurrency,
      minimumFractionDigits: 0
    }).format(value);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/home']);
  }
}