import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface RevenueStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  lastMonth: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date: string;
}

export interface OrderStats {
  pending: number;
  inProgress: number;
  completed: number;
  todayRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(public supabase: SupabaseService) { }

  async getRevenueStats(restaurantId: string): Promise<RevenueStats> {
    console.log(`📊 Calcul des statistiques de revenus pour restaurant ${restaurantId}`);
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Revenus aujourd'hui
    const { data: todayRevenue, error: todayError } = await this.supabase
      .from('commandes')
      .select('total')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])
      .gte('created_at', today);

    // Revenus hier
    const { data: yesterdayRevenue, error: yesterdayError } = await this.supabase
      .from('commandes')
      .select('total')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])
      .gte('created_at', yesterday)
      .lt('created_at', today);

    if (todayError) console.error('❌ Erreur revenus aujourd\'hui:', todayError);
    if (yesterdayError) console.error('❌ Erreur revenus hier:', yesterdayError);

    console.log(`📊 Commandes livrées aujourd'hui: ${todayRevenue?.length || 0}`);
    console.log(`📊 Commandes livrées hier: ${yesterdayRevenue?.length || 0}`);

    // Calculs de croissance et autres stats
    const todayTotal = todayRevenue?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const yesterdayTotal = yesterdayRevenue?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    
    console.log(`📊 Total aujourd'hui: ${todayTotal} FG`);
    console.log(`📊 Total hier: ${yesterdayTotal} FG`);

    return {
      today: todayTotal,
      yesterday: yesterdayTotal,
      thisWeek: await this.getWeekRevenue(restaurantId),
      thisMonth: await this.getMonthRevenue(restaurantId),
      lastMonth: await this.getLastMonthRevenue(restaurantId),
      growth: {
        daily: yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0,
        weekly: await this.getWeeklyGrowth(restaurantId),
        monthly: await this.getMonthlyGrowth(restaurantId)
      }
    };
  }

  async getDailyRevenue(restaurantId: string, days: number): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    console.log(`📊 Recherche des revenus quotidiens pour restaurant ${restaurantId} entre ${startDate.toISOString()} et ${endDate.toISOString()}`);

    // D'abord, vérifier tous les statuts existants
    const { data: allStatuses } = await this.supabase
      .from('commandes')
      .select('statut')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate.toISOString());

    console.log('📊 Statuts trouvés:', [...new Set(allStatuses?.map(c => c.statut))]);

    const { data, error } = await this.supabase
      .from('commandes')
      .select('total, created_at, statut')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])  // Inclure plusieurs statuts possibles
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des revenus quotidiens:', error);
      return [];
    }

    console.log(`📊 ${data?.length || 0} commandes terminées trouvées pour les revenus quotidiens`);

    // Grouper par jour
    const dailyData = this.groupByDay(data || []);
    return this.formatChartData(dailyData, 'daily');
  }

  async getMonthlyRevenue(restaurantId: string, months: number): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1);

    console.log(`📊 Recherche des revenus mensuels entre ${startDate.toISOString()} et ${endDate.toISOString()}`);

    const { data, error } = await this.supabase
      .from('commandes')
      .select('total, created_at, statut')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])  // Inclure plusieurs statuts possibles
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des revenus mensuels:', error);
      return [];
    }

    console.log(`📊 ${data?.length || 0} commandes terminées trouvées pour les revenus mensuels`);

    // Grouper par mois
    const monthlyData = this.groupByMonth(data || []);
    return this.formatChartData(monthlyData, 'monthly');
  }

  async getHourlyRevenue(restaurantId: string): Promise<ChartDataPoint[]> {
    const today = new Date().toISOString().split('T')[0];

    console.log(`📊 Recherche des revenus horaires pour aujourd'hui: ${today}`);

    const { data, error } = await this.supabase
      .from('commandes')
      .select('total, created_at, statut')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])  // Inclure plusieurs statuts possibles
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des revenus horaires:', error);
      return [];
    }

    console.log(`📊 ${data?.length || 0} commandes terminées trouvées pour aujourd'hui`);

    // Grouper par heure
    const hourlyData = this.groupByHour(data || []);
    return this.formatChartData(hourlyData, 'hourly');
  }

  private async getWeekRevenue(restaurantId: string): Promise<number> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data } = await this.supabase
      .from('commandes')
      .select('total')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])
      .gte('created_at', startOfWeek.toISOString());

    return data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  }

  private async getMonthRevenue(restaurantId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await this.supabase
      .from('commandes')
      .select('total')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])
      .gte('created_at', startOfMonth.toISOString());

    return data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  }

  private async getLastMonthRevenue(restaurantId: string): Promise<number> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);

    const { data } = await this.supabase
      .from('commandes')
      .select('total')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    return data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  }

  private async getWeeklyGrowth(restaurantId: string): Promise<number> {
    const thisWeek = await this.getWeekRevenue(restaurantId);
    
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay() - 1);

    const { data } = await this.supabase
      .from('commandes')
      .select('total')
      .eq('restaurant_id', restaurantId)
      .in('statut', ['livree', 'terminee', 'complete'])
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString());

    const lastWeek = data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    return lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  }

  private async getMonthlyGrowth(restaurantId: string): Promise<number> {
    const thisMonth = await this.getMonthRevenue(restaurantId);
    const lastMonth = await this.getLastMonthRevenue(restaurantId);
    return lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  }

  private groupByDay(data: any[]): Map<string, number> {
    return data.reduce((acc, order) => {
      const date = order.created_at.split('T')[0];
      acc.set(date, (acc.get(date) || 0) + (order.total || 0));
      return acc;
    }, new Map());
  }

  private groupByMonth(data: any[]): Map<string, number> {
    return data.reduce((acc, order) => {
      const month = order.created_at.substring(0, 7); // YYYY-MM
      acc.set(month, (acc.get(month) || 0) + (order.total || 0));
      return acc;
    }, new Map());
  }

  private groupByHour(data: any[]): Map<number, number> {
    return data.reduce((acc, order) => {
      const hour = new Date(order.created_at).getHours();
      acc.set(hour, (acc.get(hour) || 0) + (order.total || 0));
      return acc;
    }, new Map());
  }

  private formatChartData(dataMap: Map<any, number>, type: string): ChartDataPoint[] {
    const chartPoints = Array.from(dataMap.entries()).map(([key, value]) => ({
      label: this.formatLabel(key, type),
      value: value,
      date: key.toString()
    }));
    
    // Si aucune donnée, retourner un tableau vide pour éviter les graphiques avec des valeurs fantômes
    if (chartPoints.length === 0 || chartPoints.every(point => point.value === 0)) {
      console.log(`📊 Aucune donnée de revenus trouvée pour le type: ${type}`);
      return [];
    }
    
    return chartPoints;
  }

  private formatLabel(key: any, type: string): string {
    switch (type) {
      case 'daily':
        return new Date(key).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      case 'monthly':
        return new Date(key + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      case 'hourly':
        return `${key}h`;
      default:
        return key.toString();
    }
  }

  async getOrderStats(restaurantId: string): Promise<OrderStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Récupérer les statistiques de revenus pour aujourd'hui
      const revenueStats = await this.getRevenueStats(restaurantId);
      
      // Compter les commandes par statut pour aujourd'hui
      const [pendingResult, inProgressResult, completedResult] = await Promise.all([
        // Commandes en attente (confirmées + en préparation)
        this.supabase
          .from('commandes')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .in('statut', ['confirmee', 'en_preparation'])
          .gte('created_at', today),
        
        // Commandes en cours de livraison
        this.supabase
          .from('commandes')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .eq('statut', 'en_livraison')
          .gte('created_at', today),
          
        // Commandes complétées aujourd'hui
        this.supabase
          .from('commandes')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .in('statut', ['livree', 'terminee', 'complete'])
          .gte('created_at', today)
      ]);

      return {
        pending: pendingResult.count || 0,
        inProgress: inProgressResult.count || 0,
        completed: completedResult.count || 0,
        todayRevenue: revenueStats.today
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques de commandes:', error);
      return {
        pending: 0,
        inProgress: 0,
        completed: 0,
        todayRevenue: 0
      };
    }
  }
}