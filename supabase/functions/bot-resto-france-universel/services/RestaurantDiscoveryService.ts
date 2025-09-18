/**
 * Service de découverte des restaurants
 * SOLID - Single Responsibility : Gestion uniquement de la découverte restaurants
 * Utilise les services existants sans les modifier
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { LocationService, ICoordinates } from '../../_shared/application/services/LocationService.ts';
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';

export interface Restaurant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;  
  delivery_zone_km: number;
  is_open: boolean;
}

export interface RestaurantWithDistance extends Restaurant {
  distance: number; // Calculée dynamiquement
}

export class RestaurantDiscoveryService {
  private supabase: SupabaseClient;
  
  constructor(
    private supabaseUrl: string,
    private supabaseKey: string
  ) {
    this.initSupabase();
  }

  /**
   * Initialiser le client Supabase
   */
  private async initSupabase() {
    console.log('🔍 [RESTAURANT_DISCOVERY_DEBUG] ==========================================');
    console.log('🔍 [RESTAURANT_DISCOVERY_DEBUG] INITIALISATION CLIENT SUPABASE:');
    console.log('🔍 [RESTAURANT_DISCOVERY_DEBUG] URL:', this.supabaseUrl);
    console.log('🔍 [RESTAURANT_DISCOVERY_DEBUG] KEY (20 premiers chars):', this.supabaseKey.substring(0, 20) + '...');
    if (this.supabaseUrl.includes('lphvdoyhwaelmwdfkfuh')) {
      console.log('✅ [RESTAURANT_DISCOVERY_DEBUG] ENVIRONNEMENT: DEV');
    } else if (this.supabaseUrl.includes('vywbhlnzvfqtiurwmrac')) {
      console.log('⚠️ [RESTAURANT_DISCOVERY_DEBUG] ENVIRONNEMENT: PROD');
    }
    console.log('🔍 [RESTAURANT_DISCOVERY_DEBUG] ==========================================');

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Récupérer tous les restaurants actifs
   */
  async getAvailableRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] ==========================================');
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] REQUÊTE: SELECT * FROM france_restaurants');
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] WHERE is_active = true AND is_exceptionally_closed = false');

      const { data, error } = await QueryPerformanceMonitor.measureQuery(
        'RESTAURANTS_WITH_GEOLOCATION',
        this.supabase
          .from('france_restaurants')
          .select('id, name, latitude, longitude, delivery_zone_km, is_active, is_exceptionally_closed, business_hours')
          .eq('is_active', true)
          .eq('is_exceptionally_closed', false)
          .order('name')
      );

      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] RÉSULTAT REQUÊTE:');
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] - error:', error);
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] - data:', data);
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] - Nombre de restaurants:', data?.length || 0);

      if (data && data.length > 0) {
        console.log('🔍 [RESTAURANTS_QUERY_DEBUG] - Premier restaurant:', data[0]);
      }

      if (error) {
        console.error('❌ [RESTAURANTS_QUERY_DEBUG] ERREUR Supabase:', error);
        console.error('❌ [RESTAURANTS_QUERY_DEBUG] Message:', error.message);
        console.error('❌ [RESTAURANTS_QUERY_DEBUG] Details:', error.details);
        console.log('🔍 [RESTAURANTS_QUERY_DEBUG] ==========================================');
        return [];
      }

      console.log(`✅ [RESTAURANTS_QUERY_DEBUG] ${data?.length || 0} restaurants trouvés`);
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] ==========================================');
      return data || [];

    } catch (error) {
      console.error('❌ [RESTAURANTS_QUERY_DEBUG] EXCEPTION:');
      console.error('❌ [RESTAURANTS_QUERY_DEBUG] Message:', error.message);
      console.error('❌ [RESTAURANTS_QUERY_DEBUG] Stack:', error.stack);
      console.log('🔍 [RESTAURANTS_QUERY_DEBUG] ==========================================');
      return [];
    }
  }
  
  /**
   * Calculer restaurants par distance avec rayon spécifique par restaurant
   */
  async getNearbyRestaurants(userLat: number, userLng: number): Promise<RestaurantWithDistance[]> {
    try {
      console.log(`📍 [RestaurantDiscovery] Recherche restaurants près de: ${userLat}, ${userLng}`);
      
      const allRestaurants = await this.getAvailableRestaurants();
      
      const nearbyRestaurants = allRestaurants
        .map(restaurant => ({
          ...restaurant,
          distance: LocationService.calculateDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: restaurant.latitude, longitude: restaurant.longitude }
          )
        }))
        .filter(r => r.distance <= r.delivery_zone_km) // Rayon par restaurant
        .sort((a, b) => a.distance - b.distance);
        
      console.log(`✅ [RestaurantDiscovery] ${nearbyRestaurants.length} restaurants dans les zones de livraison`);
      return nearbyRestaurants;
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur calcul restaurants proches:', error);
      return [];
    }
  }
  
  /**
   * Formater message liste complète des restaurants
   */
  formatRestaurantList(restaurants: Restaurant[]): string {
    if (restaurants.length === 0) {
      return `❌ **AUCUN RESTAURANT DISPONIBLE**

🕒 Tous nos restaurants sont actuellement fermés.

💡 Réessayez plus tard ou contactez le support.`;
    }
    
    let message = `🏪 **RESTAURANTS DISPONIBLES**

`;
    restaurants.forEach((resto, index) => {
      message += `**${index + 1}** - 🍽️ ${resto.name}
`;
    });
    message += `
💡 Tapez le **numéro** du restaurant choisi.`;
    return message;
  }
  
  /**
   * Formater message restaurants proches avec distances
   */
  formatNearbyRestaurantList(restaurants: RestaurantWithDistance[]): string {
    if (restaurants.length === 0) {
      return `❌ **AUCUN RESTAURANT DANS VOTRE ZONE**

📍 Aucun restaurant ne livre dans un rayon raisonnable de votre position.

💡 Tapez **resto** pour voir tous les restaurants disponibles.`;
    }
    
    let message = `📍 **RESTAURANTS PRÈS DE VOUS**

`;
    restaurants.forEach((resto, index) => {
      message += `**${index + 1}** - 🍽️ ${resto.name}
📏 ${resto.distance} km (zone: ${resto.delivery_zone_km} km)

`;
    });
    message += `💡 Tapez le **numéro** du restaurant choisi.`;
    return message;
  }
  
  /**
   * Formater message demande de géolocalisation
   */
  formatLocationRequest(): string {
    return `📍 **PARTAGER VOTRE POSITION**

🎯 Pour voir les restaurants qui livrent chez vous :

1️⃣ Appuyez sur le bouton **📎** (trombone)
2️⃣ Sélectionnez **📍 Position** 
3️⃣ Choisissez **📍 Position actuelle**

💡 Ou tapez **1** pour voir tous les restaurants.`;
  }
}