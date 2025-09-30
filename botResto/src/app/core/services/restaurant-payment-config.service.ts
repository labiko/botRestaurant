import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface PaymentConfig {
  id: number;
  restaurant_id: number;
  provider: 'stripe' | 'lengopay' | 'wave' | 'orange_money' | 'custom';
  api_key_public?: string;
  api_key_secret?: string;
  merchant_id?: string;
  license_key?: string;
  website_id?: string;
  telephone_marchand?: string;
  config: any;
  success_url?: string;
  cancel_url?: string;
  webhook_url?: string;
  is_active: boolean;
  auto_send_on_order: boolean;
  send_on_delivery: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentStats {
  links_sent: number;
  payments_succeeded: number;
  total_amount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantPaymentConfigService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseFranceUrl,
      environment.supabaseFranceAnonKey
    );
  }

  /**
   * Récupère la configuration de paiement d'un restaurant
   */
  async getConfig(restaurantId: number): Promise<PaymentConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('restaurant_payment_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune config trouvée
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur getConfig:', error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration de paiement
   */
  async saveConfig(restaurantId: number, config: Partial<PaymentConfig>): Promise<void> {
    try {
      // Vérifier si une config existe déjà
      const existing = await this.getConfig(restaurantId);

      if (existing) {
        // UPDATE
        const { error } = await this.supabase
          .from('restaurant_payment_configs')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await this.supabase
          .from('restaurant_payment_configs')
          .insert({
            restaurant_id: restaurantId,
            ...config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erreur saveConfig:', error);
      throw error;
    }
  }

  /**
   * Désactive la configuration de paiement
   */
  async deleteConfig(restaurantId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('restaurant_payment_configs')
        .update({ is_active: false })
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur deleteConfig:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de paiement (7 derniers jours)
   */
  async getStats(restaurantId: number, days: number = 7): Promise<PaymentStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('payment_links')
        .select('status, amount, currency')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats: PaymentStats = {
        links_sent: data?.length || 0,
        payments_succeeded: data?.filter(p => p.status === 'paid').length || 0,
        total_amount: data
          ?.filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0) || 0,
        currency: 'EUR'
      };

      return stats;
    } catch (error) {
      console.error('Erreur getStats:', error);
      return {
        links_sent: 0,
        payments_succeeded: 0,
        total_amount: 0,
        currency: 'EUR'
      };
    }
  }

  /**
   * Retourne les providers disponibles
   */
  getAvailableProviders() {
    return [
      { value: 'stripe', label: 'Stripe', icon: 'card' },
      { value: 'lengopay', label: 'Lengopay', icon: 'phone-portrait' },
      { value: 'wave', label: 'Wave', icon: 'water' },
      { value: 'orange_money', label: 'Orange Money', icon: 'logo-bitcoin' }
    ];
  }
}