import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface DeliveryConfig {
  deliveryType: 'fixed' | 'distance_based';
  fixedAmount?: number;
  pricePerKm?: number;
  roundUpDistance?: boolean;
  freeDeliveryThreshold: number;
  maxDeliveryRadius: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryConfigService {
  
  constructor(private supabase: SupabaseService) {}

  /**
   * Récupère la devise du restaurant
   * @param restaurantId ID du restaurant
   * @returns Devise du restaurant (ex: 'GNF', 'XOF', etc.)
   */
  async getRestaurantCurrency(restaurantId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('restaurants')
        .select('currency')
        .eq('id', restaurantId)
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération de la devise:', error);
        return 'GNF'; // Valeur par défaut
      }
      
      return data?.currency || 'GNF';
    } catch (error) {
      console.error('Erreur service getRestaurantCurrency:', error);
      return 'GNF'; // Valeur par défaut
    }
  }

  /**
   * Récupère la configuration de livraison d'un restaurant
   * @param restaurantId ID du restaurant
   * @returns Configuration ou null si aucune configuration trouvée
   */
  async getRestaurantConfig(restaurantId: string): Promise<DeliveryConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('restaurant_delivery_config')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération de la config:', error);
        return null;
      }
      
      return data ? this.mapToDeliveryConfig(data) : null;
    } catch (error) {
      console.error('Erreur service getRestaurantConfig:', error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration de livraison d'un restaurant
   * @param restaurantId ID du restaurant
   * @param config Configuration à sauvegarder
   * @returns true si succès, false sinon
   */
  async saveRestaurantConfig(restaurantId: string, config: DeliveryConfig): Promise<boolean> {
    try {
      const configData = {
        delivery_type: config.deliveryType,
        fixed_amount: config.fixedAmount || null,
        price_per_km: config.pricePerKm || null,
        round_up_distance: config.roundUpDistance !== undefined ? config.roundUpDistance : true,
        free_delivery_threshold: config.freeDeliveryThreshold || 0,
        max_delivery_radius_km: config.maxDeliveryRadius || 25.00,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      // D'abord vérifier si une config existe déjà
      const { data: existingConfig } = await this.supabase
        .from('restaurant_delivery_config')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .single();

      let error;

      if (existingConfig) {
        // Mettre à jour la configuration existante
        const result = await this.supabase
          .from('restaurant_delivery_config')
          .update(configData)
          .eq('restaurant_id', restaurantId);
        error = result.error;
      } else {
        // Créer une nouvelle configuration
        const result = await this.supabase
          .from('restaurant_delivery_config')
          .insert({
            restaurant_id: restaurantId,
            ...configData
          });
        error = result.error;
      }

      if (error) {
        console.error('Erreur lors de la sauvegarde de la config:', error);
        return false;
      }

      console.log('✅ Configuration de livraison sauvegardée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur service saveRestaurantConfig:', error);
      return false;
    }
  }

  /**
   * Simule le calcul des frais de livraison
   * @param config Configuration à utiliser
   * @param distance Distance en km
   * @param subtotal Sous-total de la commande
   * @returns Frais de livraison calculés
   */
  simulateDeliveryFee(config: DeliveryConfig, distance: number, subtotal: number): number {
    // Vérifier si la commande est éligible à la livraison gratuite
    if (subtotal >= config.freeDeliveryThreshold) {
      return 0;
    }

    // Vérifier si la distance est dans la zone de livraison
    if (distance > config.maxDeliveryRadius) {
      return -1; // Indiquer que la livraison n'est pas possible
    }

    // Calculer les frais selon le type de configuration
    if (config.deliveryType === 'fixed') {
      return config.fixedAmount || 0;
    } else if (config.deliveryType === 'distance_based') {
      const distanceToUse = config.roundUpDistance ? Math.ceil(distance) : distance;
      return distanceToUse * (config.pricePerKm || 0);
    }

    return 0;
  }

  /**
   * Vérifie si un restaurant utilise le nouveau système de configuration
   * @param restaurantId ID du restaurant
   * @returns true si le restaurant a une configuration active
   */
  async hasCustomConfig(restaurantId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('restaurant_delivery_config')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .single();
      
      return !!data && !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Désactive la configuration personnalisée pour revenir au système par défaut
   * @param restaurantId ID du restaurant
   * @returns true si succès
   */
  async disableCustomConfig(restaurantId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('restaurant_delivery_config')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('restaurant_id', restaurantId);

      return !error;
    } catch (error) {
      console.error('Erreur lors de la désactivation de la config:', error);
      return false;
    }
  }

  /**
   * Mappe les données de la base vers l'interface DeliveryConfig
   */
  private mapToDeliveryConfig(data: any): DeliveryConfig {
    return {
      deliveryType: data.delivery_type as 'fixed' | 'distance_based',
      fixedAmount: data.fixed_amount,
      pricePerKm: data.price_per_km,
      roundUpDistance: data.round_up_distance,
      freeDeliveryThreshold: data.free_delivery_threshold || 0,
      maxDeliveryRadius: parseFloat(data.max_delivery_radius_km) || 25
    };
  }

  /**
   * Obtient une configuration par défaut basée sur les anciennes données du restaurant
   * @param restaurantId ID du restaurant
   * @returns Configuration par défaut basée sur les anciennes données
   */
  async getDefaultConfigFromRestaurant(restaurantId: string): Promise<DeliveryConfig | null> {
    try {
      const { data: restaurant } = await this.supabase
        .from('restaurants')
        .select('tarif_km, seuil_gratuite, rayon_livraison_km')
        .eq('id', restaurantId)
        .single();

      if (!restaurant) return null;

      return {
        deliveryType: 'distance_based',
        pricePerKm: restaurant.tarif_km || 3000,
        roundUpDistance: true,
        freeDeliveryThreshold: restaurant.seuil_gratuite || 0,
        maxDeliveryRadius: restaurant.rayon_livraison_km || 25
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données restaurant:', error);
      return null;
    }
  }
}