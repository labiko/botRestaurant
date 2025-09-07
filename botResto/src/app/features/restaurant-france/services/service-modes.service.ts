import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';

export interface ServiceMode {
  id: number;
  restaurant_id: number;
  service_mode: 'sur_place' | 'a_emporter' | 'livraison';
  is_enabled: boolean;
  display_name: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceModeConfig {
  service_mode: 'sur_place' | 'a_emporter' | 'livraison';
  is_enabled: boolean;
  display_name: string;
  display_order: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceModesService {
  private supabase: SupabaseClient;

  constructor(private supabaseFranceService: SupabaseFranceService) {
    this.supabase = this.supabaseFranceService.client;
  }

  /**
   * Récupère tous les modes de service d'un restaurant
   */
  getServiceModes(restaurantId: number): Observable<ServiceMode[]> {
    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ServiceMode[];
      })
    );
  }

  /**
   * Met à jour le statut d'activation d'un mode de service
   */
  updateServiceModeStatus(restaurantId: number, serviceMode: string, isEnabled: boolean): Observable<void> {
    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .update({ is_enabled: isEnabled })
        .eq('restaurant_id', restaurantId)
        .eq('service_mode', serviceMode)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour l'ordre d'affichage d'un mode de service
   */
  updateServiceModeOrder(restaurantId: number, serviceMode: string, displayOrder: number): Observable<void> {
    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .update({ display_order: displayOrder })
        .eq('restaurant_id', restaurantId)
        .eq('service_mode', serviceMode)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le nom d'affichage d'un mode de service
   */
  updateServiceModeDisplayName(restaurantId: number, serviceMode: string, displayName: string): Observable<void> {
    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .update({ display_name: displayName })
        .eq('restaurant_id', restaurantId)
        .eq('service_mode', serviceMode)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Initialise les modes de service par défaut pour un restaurant
   */
  initializeDefaultServiceModes(restaurantId: number): Observable<void> {
    const defaultModes: ServiceModeConfig[] = [
      {
        service_mode: 'sur_place',
        is_enabled: true,
        display_name: 'Sur place',
        display_order: 1
      },
      {
        service_mode: 'a_emporter',
        is_enabled: true,
        display_name: 'À emporter',
        display_order: 2
      },
      {
        service_mode: 'livraison',
        is_enabled: true,
        display_name: 'Livraison',
        display_order: 3
      }
    ];

    const modesWithRestaurantId = defaultModes.map(mode => ({
      ...mode,
      restaurant_id: restaurantId
    }));

    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .insert(modesWithRestaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Vérifie si un restaurant a des modes de service configurés
   */
  hasServiceModes(restaurantId: number): Observable<boolean> {
    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .limit(1)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data && data.length > 0);
      })
    );
  }

  /**
   * Récupère les modes de service activés d'un restaurant
   */
  getEnabledServiceModes(restaurantId: number): Observable<ServiceMode[]> {
    return from(
      this.supabase
        .from('france_restaurant_service_modes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_enabled', true)
        .order('display_order', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ServiceMode[];
      })
    );
  }
}