/**
 * Service de découverte des restaurants
 * SOLID - Single Responsibility : Gestion uniquement de la découverte restaurants
 * Utilise les services existants sans les modifier
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { LocationService, ICoordinates } from '../../_shared/application/services/LocationService.ts';

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
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Récupérer tous les restaurants actifs
   */
  async getAvailableRestaurants(): Promise<Restaurant[]> {
    try {
      console.log(`🔍 [RestaurantDiscovery] Récupération restaurants disponibles`);
      
      const { data, error } = await this.supabase
        .from('france_restaurants')
        .select('id, name, latitude, longitude, delivery_zone_km, is_active, is_exceptionally_closed, business_hours')
        .eq('is_active', true)
        .eq('is_exceptionally_closed', false)
        .order('name');
        
      if (error) {
        console.error('❌ [RestaurantDiscovery] Erreur récupération restaurants:', error);
        return [];
      }
      
      console.log(`✅ [RestaurantDiscovery] ${data.length} restaurants trouvés`);
      return data || [];
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Exception:', error);
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