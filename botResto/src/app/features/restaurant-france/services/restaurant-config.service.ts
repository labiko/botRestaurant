import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';

export interface RestaurantConfig {
  id: number;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  whatsapp_number: string;
  delivery_zone_km: number;
  min_order_amount: number;
  delivery_fee: number;
  is_active: boolean;
  business_hours: any;
  timezone: string;
  country_code: string;
  password_hash: string;
  hide_delivery_info?: boolean;
}

export interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    opening?: string;
    closing?: string;
  };
}

export interface RestaurantBotConfig {
  id: number;
  restaurant_id: number;
  config_name: string;
  brand_name: string;
  welcome_message: string;
  available_workflows: string[];
  features: RestaurantFeatures;
  is_active: boolean;
}

export interface RestaurantFeatures {
  cartEnabled?: boolean;
  deliveryEnabled?: boolean;
  paymentDeferred?: boolean;
  locationDetection?: boolean;
  multiLanguage?: boolean;
  loyaltyProgram?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantConfigService {
  private supabase: SupabaseClient;

  constructor(private supabaseFranceService: SupabaseFranceService) {
    this.supabase = this.supabaseFranceService.client;
  }

  /**
   * Récupère la configuration d'un restaurant
   */
  getRestaurantConfig(restaurantId: number): Observable<RestaurantConfig> {
    return from(
      this.supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as RestaurantConfig;
      })
    );
  }

  /**
   * Récupère la configuration bot d'un restaurant
   */
  getBotConfig(restaurantId: number): Observable<RestaurantBotConfig> {
    return from(
      this.supabase
        .from('restaurant_bot_configs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as RestaurantBotConfig;
      })
    );
  }

  /**
   * Met à jour les horaires d'ouverture
   */
  updateBusinessHours(restaurantId: number, businessHours: BusinessHours): Observable<void> {
    return from(
      this.supabase
        .from('france_restaurants')
        .update({ business_hours: businessHours })
        .eq('id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le statut d'activité du restaurant
   */
  updateRestaurantStatus(restaurantId: number, isActive: boolean): Observable<void> {
    return from(
      this.supabase
        .from('france_restaurants')
        .update({ is_active: isActive })
        .eq('id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour les features du bot
   */
  updateBotFeatures(restaurantId: number, features: RestaurantFeatures): Observable<void> {
    return from(
      this.supabase
        .from('restaurant_bot_configs')
        .update({ features })
        .eq('restaurant_id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le message de bienvenue
   */
  updateWelcomeMessage(restaurantId: number, welcomeMessage: string): Observable<void> {
    return from(
      this.supabase
        .from('restaurant_bot_configs')
        .update({ welcome_message: welcomeMessage })
        .eq('restaurant_id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour les workflows disponibles
   */
  updateAvailableWorkflows(restaurantId: number, workflows: string[]): Observable<void> {
    return from(
      this.supabase
        .from('restaurant_bot_configs')
        .update({ available_workflows: workflows })
        .eq('restaurant_id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour la configuration de livraison
   */
  updateDeliveryConfig(restaurantId: number, config: {
    delivery_zone_km: number;
    delivery_fee: number;
    min_order_amount: number;
  }): Observable<void> {
    return from(
      this.supabase
        .from('france_restaurants')
        .update({
          delivery_zone_km: config.delivery_zone_km,
          delivery_fee: config.delivery_fee,
          min_order_amount: config.min_order_amount
        })
        .eq('id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Vérification si le restaurant est actuellement ouvert
   */
  isRestaurantCurrentlyOpen(restaurantId: number): Observable<boolean> {
    return this.getRestaurantConfig(restaurantId).pipe(
      map(config => {
        if (!config.is_active) return false;

        const now = new Date();
        const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toTimeString().substring(0, 5);
        
        const businessHours = config.business_hours as BusinessHours;
        const dayHours = businessHours[currentDay];
        
        return !!(dayHours?.isOpen && 
               dayHours.opening && 
               dayHours.closing &&
               currentTime >= dayHours.opening && 
               currentTime <= dayHours.closing);
      })
    );
  }
}