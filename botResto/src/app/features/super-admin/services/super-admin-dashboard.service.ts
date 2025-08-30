import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';

export interface DashboardStats {
  // Restaurants
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  suspendedRestaurants: number;
  restaurantsGrowth: GrowthData;

  // Commandes
  activeOrders: number;
  totalOrdersToday: number;
  ordersGrowth: GrowthData;

  // Finances
  dailyRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: GrowthData;

  // Livreurs
  activeDrivers: number;
  totalDrivers: number;
  driversGrowth: GrowthData;

  // Alertes
  recentAlerts: Alert[];
}

export interface GrowthData {
  value: number; // Pourcentage de croissance
  trend: 'up' | 'down' | 'stable';
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminDashboardService {

  constructor(private supabase: SupabaseService) {}

  /**
   * Récupère toutes les statistiques du dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        restaurantStats,
        orderStats,
        revenueStats,
        driverStats,
        alerts
      ] = await Promise.all([
        this.getRestaurantStats(),
        this.getOrderStats(),
        this.getRevenueStats(),
        this.getDriverStats(),
        this.getRecentAlerts()
      ]);

      return {
        // Restaurants
        totalRestaurants: restaurantStats.total,
        activeRestaurants: restaurantStats.active,
        pendingRestaurants: restaurantStats.pending,
        suspendedRestaurants: restaurantStats.suspended,
        restaurantsGrowth: restaurantStats.growth,

        // Commandes
        activeOrders: orderStats.active,
        totalOrdersToday: orderStats.today,
        ordersGrowth: orderStats.growth,

        // Finances
        dailyRevenue: revenueStats.daily,
        monthlyRevenue: revenueStats.monthly,
        revenueGrowth: revenueStats.growth,

        // Livreurs
        activeDrivers: driverStats.active,
        totalDrivers: driverStats.total,
        driversGrowth: driverStats.growth,

        // Alertes
        recentAlerts: alerts
      };
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Statistiques des restaurants
   */
  private async getRestaurantStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    growth: GrowthData;
  }> {
    try {
      // Compter les restaurants par statut
      const { data: restaurants, error } = await this.supabase
        .from('restaurants')
        .select('id, status, created_at');

      if (error) throw error;

      const total = restaurants?.length || 0;
      const active = restaurants?.filter(r => r.status === 'active').length || 0;
      const pending = restaurants?.filter(r => r.status === 'pending').length || 0;
      const suspended = restaurants?.filter(r => r.status === 'suspended').length || 0;

      // Calculer la croissance (simplifié)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const newThisMonth = restaurants?.filter(r => 
        new Date(r.created_at) > lastMonth
      ).length || 0;
      
      const growthPercentage = total > 0 ? (newThisMonth / total) * 100 : 0;

      return {
        total,
        active,
        pending,
        suspended,
        growth: {
          value: growthPercentage,
          trend: growthPercentage > 10 ? 'up' : growthPercentage < -5 ? 'down' : 'stable'
        }
      };
    } catch (error) {
      console.error('Erreur stats restaurants:', error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        growth: { value: 0, trend: 'stable' }
      };
    }
  }

  /**
   * Statistiques des commandes
   */
  private async getOrderStats(): Promise<{
    active: number;
    today: number;
    growth: GrowthData;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: orders, error } = await this.supabase
        .from('commandes')
        .select('id, statut, created_at');

      if (error) throw error;

      const active = orders?.filter(o => 
        !['livree', 'terminee', 'annulee'].includes(o.statut)
      ).length || 0;

      const todayOrders = orders?.filter(o => 
        new Date(o.created_at) >= today
      ).length || 0;

      // Croissance basée sur hier vs aujourd'hui
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayOrders = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= yesterday && orderDate < today;
      }).length || 0;

      const growthPercentage = yesterdayOrders > 0 
        ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 
        : 0;

      return {
        active,
        today: todayOrders,
        growth: {
          value: Math.abs(growthPercentage),
          trend: growthPercentage > 5 ? 'up' : growthPercentage < -5 ? 'down' : 'stable'
        }
      };
    } catch (error) {
      console.error('Erreur stats commandes:', error);
      return {
        active: 0,
        today: 0,
        growth: { value: 0, trend: 'stable' }
      };
    }
  }

  /**
   * Statistiques des revenus
   */
  private async getRevenueStats(): Promise<{
    daily: number;
    monthly: number;
    growth: GrowthData;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const { data: orders, error } = await this.supabase
        .from('commandes')
        .select('total, created_at')
        .in('statut', ['livree', 'terminee']);

      if (error) throw error;

      const dailyRevenue = orders?.filter(o => 
        new Date(o.created_at) >= today
      ).reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      const monthlyRevenue = orders?.filter(o => 
        new Date(o.created_at) >= thisMonth
      ).reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Croissance mensuelle (simplifié)
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const lastMonthRevenue = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= lastMonth && orderDate < thisMonth;
      }).reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      const growthPercentage = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      return {
        daily: dailyRevenue,
        monthly: monthlyRevenue,
        growth: {
          value: Math.abs(growthPercentage),
          trend: growthPercentage > 10 ? 'up' : growthPercentage < -10 ? 'down' : 'stable'
        }
      };
    } catch (error) {
      console.error('Erreur stats revenus:', error);
      return {
        daily: 0,
        monthly: 0,
        growth: { value: 0, trend: 'stable' }
      };
    }
  }

  /**
   * Statistiques des livreurs
   */
  private async getDriverStats(): Promise<{
    active: number;
    total: number;
    growth: GrowthData;
  }> {
    try {
      const { data: drivers, error } = await this.supabase
        .from('delivery_users')
        .select('id, is_online, created_at');

      if (error) throw error;

      const total = drivers?.length || 0;
      const active = drivers?.filter(d => d.is_online).length || 0;

      // Croissance basée sur les nouveaux livreurs ce mois
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const newThisMonth = drivers?.filter(d => 
        new Date(d.created_at) > thisMonth
      ).length || 0;

      const growthPercentage = total > 0 ? (newThisMonth / total) * 100 : 0;

      return {
        active,
        total,
        growth: {
          value: growthPercentage,
          trend: growthPercentage > 15 ? 'up' : growthPercentage < 5 ? 'down' : 'stable'
        }
      };
    } catch (error) {
      console.error('Erreur stats livreurs:', error);
      return {
        active: 0,
        total: 0,
        growth: { value: 0, trend: 'stable' }
      };
    }
  }

  /**
   * Alertes récentes
   */
  private async getRecentAlerts(): Promise<Alert[]> {
    try {
      // Pour l'instant, retourner des alertes simulées
      // En production, ces données viendraient d'un système de monitoring
      return [
        {
          id: '1',
          type: 'warning',
          title: 'Temps de livraison élevé',
          message: 'Zone Kaloum: temps moyen > 45min',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Nouveau restaurant inscrit',
          message: 'Restaurant "Chez Mama" validé',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
          resolved: true
        }
      ];
    } catch (error) {
      console.error('Erreur alertes:', error);
      return [];
    }
  }

  /**
   * Statistiques par défaut en cas d'erreur
   */
  private getDefaultStats(): DashboardStats {
    return {
      totalRestaurants: 0,
      activeRestaurants: 0,
      pendingRestaurants: 0,
      suspendedRestaurants: 0,
      restaurantsGrowth: { value: 0, trend: 'stable' },
      
      activeOrders: 0,
      totalOrdersToday: 0,
      ordersGrowth: { value: 0, trend: 'stable' },
      
      dailyRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: { value: 0, trend: 'stable' },
      
      activeDrivers: 0,
      totalDrivers: 0,
      driversGrowth: { value: 0, trend: 'stable' },
      
      recentAlerts: []
    };
  }
}