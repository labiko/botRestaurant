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

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private supabase: SupabaseService) { }

  async getRevenueStats(restaurantId: number): Promise<RevenueStats> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Revenus aujourd'hui
    const { data: todayRevenue } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', today);

    // Revenus hier
    const { data: yesterdayRevenue } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', yesterday)
      .lt('created_at', today);

    // Calculs de croissance et autres stats
    const todayTotal = todayRevenue?.reduce((sum, order) => sum + (order.total_ttc || 0), 0) || 0;
    const yesterdayTotal = yesterdayRevenue?.reduce((sum, order) => sum + (order.total_ttc || 0), 0) || 0;

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

  async getDailyRevenue(restaurantId: number, days: number): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Grouper par jour
    const dailyData = this.groupByDay(data || []);
    return this.formatChartData(dailyData, 'daily');
  }

  async getMonthlyRevenue(restaurantId: number, months: number): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Grouper par mois
    const monthlyData = this.groupByMonth(data || []);
    return this.formatChartData(monthlyData, 'monthly');
  }

  async getHourlyRevenue(restaurantId: number): Promise<ChartDataPoint[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    // Grouper par heure
    const hourlyData = this.groupByHour(data || []);
    return this.formatChartData(hourlyData, 'hourly');
  }

  private async getWeekRevenue(restaurantId: number): Promise<number> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startOfWeek.toISOString());

    return data?.reduce((sum, order) => sum + (order.total_ttc || 0), 0) || 0;
  }

  private async getMonthRevenue(restaurantId: number): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startOfMonth.toISOString());

    return data?.reduce((sum, order) => sum + (order.total_ttc || 0), 0) || 0;
  }

  private async getLastMonthRevenue(restaurantId: number): Promise<number> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    return data?.reduce((sum, order) => sum + (order.total_ttc || 0), 0) || 0;
  }

  private async getWeeklyGrowth(restaurantId: number): Promise<number> {
    const thisWeek = await this.getWeekRevenue(restaurantId);
    
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay() - 1);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString());

    const lastWeek = data?.reduce((sum, order) => sum + (order.total_ttc || 0), 0) || 0;
    return lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  }

  private async getMonthlyGrowth(restaurantId: number): Promise<number> {
    const thisMonth = await this.getMonthRevenue(restaurantId);
    const lastMonth = await this.getLastMonthRevenue(restaurantId);
    return lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  }

  private groupByDay(data: any[]): Map<string, number> {
    return data.reduce((acc, order) => {
      const date = order.created_at.split('T')[0];
      acc.set(date, (acc.get(date) || 0) + (order.total_ttc || 0));
      return acc;
    }, new Map());
  }

  private groupByMonth(data: any[]): Map<string, number> {
    return data.reduce((acc, order) => {
      const month = order.created_at.substring(0, 7); // YYYY-MM
      acc.set(month, (acc.get(month) || 0) + (order.total_ttc || 0));
      return acc;
    }, new Map());
  }

  private groupByHour(data: any[]): Map<number, number> {
    return data.reduce((acc, order) => {
      const hour = new Date(order.created_at).getHours();
      acc.set(hour, (acc.get(hour) || 0) + (order.total_ttc || 0));
      return acc;
    }, new Map());
  }

  private formatChartData(dataMap: Map<any, number>, type: string): ChartDataPoint[] {
    return Array.from(dataMap.entries()).map(([key, value]) => ({
      label: this.formatLabel(key, type),
      value: value,
      date: key.toString()
    }));
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
}