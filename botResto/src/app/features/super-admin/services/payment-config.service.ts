import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';

export interface PaymentConfig {
  id: string;
  restaurant_id: string;
  provider_name: 'lengopay' | 'orange_money' | 'wave' | 'mtn_money';
  is_active: boolean;
  api_url: string;
  license_key: string;
  website_id: string;
  callback_url: string;
  green_api_instance_id?: string;
  green_api_token?: string;
  green_api_base_url?: string;
  telephone_marchand: string;
  created_at: string;
  updated_at: string;
  
  // Champs calculés
  restaurant_name?: string;
}

export interface CreatePaymentConfigRequest {
  restaurant_id: string;
  provider_name: 'lengopay' | 'orange_money' | 'wave' | 'mtn_money';
  is_active: boolean;
  api_url: string;
  license_key: string;
  website_id: string;
  callback_url: string;
  green_api_instance_id?: string;
  green_api_token?: string;
  green_api_base_url?: string;
  telephone_marchand: string;
}

export interface UpdatePaymentConfigRequest {
  provider_name?: 'lengopay' | 'orange_money' | 'wave' | 'mtn_money';
  is_active?: boolean;
  api_url?: string;
  license_key?: string;
  website_id?: string;
  callback_url?: string;
  green_api_instance_id?: string;
  green_api_token?: string;
  green_api_base_url?: string;
  telephone_marchand?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentConfigService {

  constructor(private supabase: SupabaseService) {}

  /**
   * Récupère toutes les configurations de paiement
   */
  async getAllPaymentConfigs(): Promise<PaymentConfig[]> {
    try {
      const { data: configs, error } = await this.supabase
        .from('restaurant_payment_config')
        .select(`
          id,
          restaurant_id,
          provider_name,
          is_active,
          api_url,
          license_key,
          website_id,
          callback_url,
          green_api_instance_id,
          green_api_token,
          green_api_base_url,
          telephone_marchand,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!configs || configs.length === 0) {
        return [];
      }

      // Récupérer les noms des restaurants
      const restaurantIds = [...new Set(configs.map(c => c.restaurant_id))];
      const { data: restaurants } = await this.supabase
        .from('restaurants')
        .select('id, nom')
        .in('id', restaurantIds);

      const restaurantMap = new Map(restaurants?.map(r => [r.id, r.nom]) || []);

      return configs.map(config => ({
        ...config,
        restaurant_name: restaurantMap.get(config.restaurant_id) || 'Restaurant inconnu'
      }));

    } catch (error) {
      console.error('Erreur lors de la récupération des configurations de paiement:', error);
      return [];
    }
  }

  /**
   * Récupère les configurations de paiement d'un restaurant spécifique
   */
  async getPaymentConfigsByRestaurant(restaurantId: string): Promise<PaymentConfig[]> {
    try {
      const { data: configs, error } = await this.supabase
        .from('restaurant_payment_config')
        .select(`
          id,
          restaurant_id,
          provider_name,
          is_active,
          api_url,
          license_key,
          website_id,
          callback_url,
          green_api_instance_id,
          green_api_token,
          green_api_base_url,
          telephone_marchand,
          created_at,
          updated_at
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer le nom du restaurant
      const { data: restaurant } = await this.supabase
        .from('restaurants')
        .select('nom')
        .eq('id', restaurantId)
        .single();

      return configs?.map(config => ({
        ...config,
        restaurant_name: restaurant?.nom || 'Restaurant inconnu'
      })) || [];

    } catch (error) {
      console.error('Erreur lors de la récupération des configurations de paiement du restaurant:', error);
      return [];
    }
  }

  /**
   * Récupère une configuration de paiement par ID
   */
  async getPaymentConfigById(configId: string): Promise<PaymentConfig | null> {
    try {
      const { data: config, error } = await this.supabase
        .from('restaurant_payment_config')
        .select(`
          id,
          restaurant_id,
          provider_name,
          is_active,
          api_url,
          license_key,
          website_id,
          callback_url,
          green_api_instance_id,
          green_api_token,
          green_api_base_url,
          telephone_marchand,
          created_at,
          updated_at
        `)
        .eq('id', configId)
        .single();

      if (error) throw error;

      if (!config) return null;

      // Récupérer le nom du restaurant
      const { data: restaurant } = await this.supabase
        .from('restaurants')
        .select('nom')
        .eq('id', config.restaurant_id)
        .single();

      return {
        ...config,
        restaurant_name: restaurant?.nom || 'Restaurant inconnu'
      };

    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration de paiement:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle configuration de paiement
   */
  async createPaymentConfig(configData: CreatePaymentConfigRequest): Promise<PaymentConfig> {
    try {
      // Vérifier si le restaurant existe
      const { data: restaurant, error: restaurantError } = await this.supabase
        .from('restaurants')
        .select('id, nom')
        .eq('id', configData.restaurant_id)
        .single();

      if (restaurantError || !restaurant) {
        throw new Error('Restaurant introuvable');
      }

      // Vérifier si une configuration existe déjà pour ce restaurant et ce provider
      const { data: existing } = await this.supabase
        .from('restaurant_payment_config')
        .select('id')
        .eq('restaurant_id', configData.restaurant_id)
        .eq('provider_name', configData.provider_name)
        .single();

      if (existing) {
        throw new Error(`Une configuration ${configData.provider_name} existe déjà pour ce restaurant`);
      }

      // Créer la configuration
      const { data: config, error } = await this.supabase
        .from('restaurant_payment_config')
        .insert({
          ...configData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...config,
        restaurant_name: restaurant.nom
      };

    } catch (error: any) {
      console.error('Erreur lors de la création de la configuration de paiement:', error);
      throw error;
    }
  }

  /**
   * Met à jour une configuration de paiement
   */
  async updatePaymentConfig(configId: string, updates: UpdatePaymentConfigRequest): Promise<PaymentConfig> {
    try {
      const { data: config, error } = await this.supabase
        .from('restaurant_payment_config')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;

      // Récupérer le nom du restaurant
      const { data: restaurant } = await this.supabase
        .from('restaurants')
        .select('nom')
        .eq('id', config.restaurant_id)
        .single();

      return {
        ...config,
        restaurant_name: restaurant?.nom || 'Restaurant inconnu'
      };

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la configuration de paiement:', error);
      throw error;
    }
  }

  /**
   * Supprime une configuration de paiement
   */
  async deletePaymentConfig(configId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('restaurant_payment_config')
        .delete()
        .eq('id', configId);

      if (error) throw error;

    } catch (error: any) {
      console.error('Erreur lors de la suppression de la configuration de paiement:', error);
      throw error;
    }
  }

  /**
   * Active/désactive une configuration de paiement
   */
  async togglePaymentConfigStatus(configId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('restaurant_payment_config')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId);

      if (error) throw error;

    } catch (error: any) {
      console.error('Erreur lors du changement de statut de la configuration:', error);
      throw error;
    }
  }

  /**
   * Récupère les restaurants sans configuration de paiement
   */
  async getRestaurantsWithoutPaymentConfig(): Promise<Array<{id: string, nom: string}>> {
    try {
      // Récupérer tous les restaurants
      const { data: allRestaurants, error: restaurantsError } = await this.supabase
        .from('restaurants')
        .select('id, nom')
        .eq('status', 'active');

      if (restaurantsError) throw restaurantsError;

      // Récupérer les IDs des restaurants qui ont déjà une config
      const { data: configuredRestaurants, error: configError } = await this.supabase
        .from('restaurant_payment_config')
        .select('restaurant_id');

      if (configError) throw configError;

      const configuredIds = new Set(configuredRestaurants?.map(c => c.restaurant_id) || []);

      // Filtrer les restaurants sans config
      return allRestaurants?.filter(restaurant => !configuredIds.has(restaurant.id)) || [];

    } catch (error) {
      console.error('Erreur lors de la récupération des restaurants sans config de paiement:', error);
      return [];
    }
  }

  /**
   * Teste une configuration de paiement
   */
  async testPaymentConfig(configId: string): Promise<{success: boolean, message: string}> {
    try {
      const config = await this.getPaymentConfigById(configId);
      if (!config) {
        return { success: false, message: 'Configuration introuvable' };
      }

      // Simulation d'un test de connexion API
      // En production, ceci ferait un vrai appel à l'API du provider
      console.log(`Test de connexion à ${config.provider_name} pour ${config.restaurant_name}`);
      console.log(`URL: ${config.api_url}`);
      console.log(`Website ID: ${config.website_id}`);

      // Simuler un délai de test
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulation: 90% de chances de succès
      const success = Math.random() > 0.1;

      if (success) {
        return { 
          success: true, 
          message: `Connexion à ${config.provider_name} réussie` 
        };
      } else {
        return { 
          success: false, 
          message: `Échec de la connexion à ${config.provider_name}. Vérifiez vos paramètres.` 
        };
      }

    } catch (error) {
      console.error('Erreur lors du test de la configuration:', error);
      return { 
        success: false, 
        message: 'Erreur lors du test de connexion' 
      };
    }
  }

  /**
   * Récupère les providers de paiement disponibles
   */
  getAvailableProviders(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'lengopay',
        label: 'LengoPay',
        description: 'Solution de paiement mobile LengoPay'
      },
      {
        value: 'orange_money',
        label: 'Orange Money',
        description: 'Paiement mobile Orange Money'
      },
      {
        value: 'wave',
        label: 'Wave',
        description: 'Portefeuille mobile Wave'
      },
      {
        value: 'mtn_money',
        label: 'MTN Mobile Money',
        description: 'Solution de paiement MTN Mobile Money'
      }
    ];
  }
}