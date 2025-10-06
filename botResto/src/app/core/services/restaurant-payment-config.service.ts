import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { FRANCE_CONFIG } from '../../config/environment-config';

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
  api_url?: string;  // Ajout pour LengoPay
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

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private fuseauHoraireService: FuseauHoraireService
  ) {}

  /**
   * Récupère la configuration de paiement d'un restaurant
   */
  async getConfig(restaurantId: number): Promise<PaymentConfig | null> {
    console.log('🔍 [Service] getConfig() - restaurant_id:', restaurantId);

    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('restaurant_payment_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .single();

      console.log('🔍 [Service] Supabase response - data:', data, 'error:', error);

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune config trouvée
          console.warn('🔍 [Service] PGRST116 - Aucune config trouvée');
          return null;
        }
        console.error('🔍 [Service] Erreur Supabase:', error);
        throw error;
      }

      if (data) {
        // Mapping pour TOUS les providers
        const mappedConfig: PaymentConfig = {
          ...data
        };

        // Mapping spécifique UNIQUEMENT pour LengoPay (ne pas casser Stripe)
        if (data.provider === 'lengopay') {
          // Pour LengoPay UNIQUEMENT : extraire depuis config JSON
          mappedConfig.license_key = data.config?.license_key || data.api_key_secret;
          mappedConfig.website_id = data.config?.website_id || data.merchant_id;
          mappedConfig.telephone_marchand = data.config?.telephone_marchand || '';
          mappedConfig.api_url = data.config?.api_url || 'https://sandbox.lengopay.com/api/v1/payments';
        }

        console.log('🔍 [Service] Config mappée:', mappedConfig);
        return mappedConfig;
      }

      console.log('🔍 [Service] Config trouvée:', data);
      return data;
    } catch (error) {
      console.error('🔍 [Service] Exception getConfig:', error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration de paiement
   */
  async saveConfig(restaurantId: number, config: Partial<PaymentConfig>): Promise<void> {
    try {
      // Filtrer uniquement les champs valides de la table
      const validFields: any = {
        provider: config.provider,
        api_key_public: config.api_key_public,
        api_key_secret: config.api_key_secret,
        merchant_id: config.merchant_id,
        config: config.config,
        webhook_url: config.webhook_url,
        success_url: config.success_url,
        cancel_url: config.cancel_url,
        is_active: config.is_active,
        auto_send_on_order: config.auto_send_on_order,
        send_on_delivery: config.send_on_delivery
      };

      // Auto-générer les URLs de callback si non fournies (tous providers)
      if (!validFields.success_url || validFields.success_url.trim() === '') {
        validFields.success_url = FRANCE_CONFIG.payment.successUrl;
      }
      if (!validFields.cancel_url || validFields.cancel_url.trim() === '') {
        validFields.cancel_url = FRANCE_CONFIG.payment.cancelUrl;
      }
      if (!validFields.webhook_url || validFields.webhook_url.trim() === '') {
        validFields.webhook_url = FRANCE_CONFIG.payment.webhookUrl;
      }

      // Supprimer les champs undefined, null et chaînes vides
      Object.keys(validFields).forEach(key => {
        if (validFields[key] === undefined || validFields[key] === null || validFields[key] === '') {
          delete validFields[key];
        }
      });

      // Vérifier si une config existe déjà (sans filtrer par is_active)
      const { data: existing, error: checkError } = await this.supabaseFranceService.client
        .from('restaurant_payment_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single();

      if (existing && !checkError) {
        // UPDATE - Une config existe déjà
        console.log('🔄 [PaymentConfig] Mise à jour config existante ID:', existing.id);
        const { error } = await this.supabaseFranceService.client
          .from('restaurant_payment_configs')
          .update({
            ...validFields,
            updated_at: await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // INSERT - Aucune config n'existe
        console.log('➕ [PaymentConfig] Création nouvelle config pour restaurant:', restaurantId);
        const { error } = await this.supabaseFranceService.client
          .from('restaurant_payment_configs')
          .insert({
            restaurant_id: restaurantId,
            ...validFields,
            created_at: await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant(),
            updated_at: await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant()
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
      const { error } = await this.supabaseFranceService.client
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

      const { data, error } = await this.supabaseFranceService.client
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

  /**
   * Générer un lien de paiement test (sans créer de commande)
   */
  async generateTestPaymentLink(restaurantId: number): Promise<{
    success: boolean;
    paymentUrl?: string;
    error?: string;
  }> {
    try {
      // Récupérer la config du restaurant
      const config = await this.getConfig(restaurantId);

      if (!config || config.provider !== 'stripe') {
        throw new Error('Configuration Stripe non trouvée');
      }

      if (!config.api_key_secret) {
        throw new Error('Clé secrète Stripe manquante');
      }

      // Créer une session Stripe directement
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key_secret}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'line_items[0][price_data][currency]': config.config?.currency || 'eur',
          'line_items[0][price_data][product_data][name]': 'Test Configuration Stripe',
          'line_items[0][price_data][unit_amount]': '100', // 1€ en centimes
          'line_items[0][quantity]': '1',
          'success_url': config.success_url || FRANCE_CONFIG.payment.successUrl,
          'cancel_url': config.cancel_url || FRANCE_CONFIG.payment.cancelUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur Stripe');
      }

      const session = await response.json();

      return {
        success: true,
        paymentUrl: session.url
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}