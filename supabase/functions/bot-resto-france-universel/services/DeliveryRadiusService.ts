/**
 * Service de validation du rayon de livraison
 * SOLID - Single Responsibility : Validation des distances de livraison uniquement
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface DeliveryConfig {
  delivery_zone_km: number;
  restaurant_latitude: number;
  restaurant_longitude: number;
}

export interface RadiusValidationResult {
  isInRadius: boolean;
  distanceKm: number;
  maxRadiusKm: number;
  message: string;
}

export class DeliveryRadiusService {
  private supabase: SupabaseClient;
  private configCache: Map<number, DeliveryConfig> = new Map();

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
   * Récupérer la configuration de livraison du restaurant
   */
  async getRestaurantDeliveryConfig(restaurantId: number): Promise<DeliveryConfig | null> {
    try {
      console.log(`🔍 [DeliveryRadius] === DÉBUT RÉCUPÉRATION CONFIG ===`);
      console.log(`🔍 [DeliveryRadius] Restaurant ID: ${restaurantId}`);
      console.log(`🔍 [DeliveryRadius] Cache size: ${this.configCache.size}`);
      
      // Vérifier le cache
      if (this.configCache.has(restaurantId)) {
        console.log(`💾 [DeliveryRadius] Configuration trouvée dans le cache`);
        const cachedConfig = this.configCache.get(restaurantId)!;
        console.log(`💾 [DeliveryRadius] Config cachée:`, JSON.stringify(cachedConfig, null, 2));
        return cachedConfig;
      }

      console.log(`🏪 [DeliveryRadius] Récupération config restaurant depuis DB: ${restaurantId}`);

      const { data, error } = await this.supabase
        .from('france_restaurants')
        .select('delivery_zone_km, latitude, longitude')
        .eq('id', restaurantId)
        .single();

      console.log(`🗃️ [DeliveryRadius] Résultat requête DB:`, JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error('❌ [DeliveryRadius] Erreur récupération config:', error);
        console.error('❌ [DeliveryRadius] Code erreur:', error.code);
        console.error('❌ [DeliveryRadius] Message erreur:', error.message);
        return null;
      }

      console.log(`🗃️ [DeliveryRadius] Données restaurant:`, JSON.stringify(data, null, 2));

      if (!data.latitude || !data.longitude) {
        console.error('❌ [DeliveryRadius] Coordonnées restaurant manquantes');
        console.error(`❌ [DeliveryRadius] Latitude: ${data.latitude}, Longitude: ${data.longitude}`);
        return null;
      }

      const config: DeliveryConfig = {
        delivery_zone_km: data.delivery_zone_km || 5, // Valeur par défaut
        restaurant_latitude: data.latitude,
        restaurant_longitude: data.longitude
      };

      console.log(`🏗️ [DeliveryRadius] Configuration construite:`, JSON.stringify(config, null, 2));
      console.log(`🏗️ [DeliveryRadius] Utilisation valeur par défaut rayon: ${!data.delivery_zone_km ? 'OUI (5km)' : 'NON'}`);

      // Mettre en cache
      this.configCache.set(restaurantId, config);
      console.log(`💾 [DeliveryRadius] Configuration mise en cache`);
      
      console.log(`✅ [DeliveryRadius] Config récupérée: ${config.delivery_zone_km}km`);
      console.log(`✅ [DeliveryRadius] === FIN RÉCUPÉRATION CONFIG ===`);
      return config;

    } catch (error) {
      console.error('❌ [DeliveryRadius] Exception récupération config:', error);
      return null;
    }
  }

  /**
   * Valider si l'adresse est dans la zone de livraison
   */
  async validateAddressInRadius(
    restaurantId: number, 
    addressLatitude: number, 
    addressLongitude: number
  ): Promise<RadiusValidationResult> {
    try {
      console.log(`📏 [DeliveryRadius] === DÉBUT VALIDATION RAYON ===`);
      console.log(`📏 [DeliveryRadius] Restaurant ID: ${restaurantId}`);
      console.log(`📏 [DeliveryRadius] Coordonnées adresse: ${addressLatitude}, ${addressLongitude}`);
      console.log(`📏 [DeliveryRadius] Type coordonnées adresse: lat=${typeof addressLatitude}, lng=${typeof addressLongitude}`);

      // Vérification des coordonnées d'entrée
      if (!addressLatitude || !addressLongitude || isNaN(addressLatitude) || isNaN(addressLongitude)) {
        console.error('❌ [DeliveryRadius] Coordonnées adresse invalides');
        console.error(`❌ [DeliveryRadius] Latitude: ${addressLatitude} (${typeof addressLatitude})`);
        console.error(`❌ [DeliveryRadius] Longitude: ${addressLongitude} (${typeof addressLongitude})`);
        return {
          isInRadius: true, // Autoriser en cas d'erreur
          distanceKm: 0,
          maxRadiusKm: 5,
          message: 'Coordonnées invalides - commande autorisée'
        };
      }

      // Récupérer la configuration du restaurant
      console.log(`📏 [DeliveryRadius] Récupération config restaurant...`);
      const config = await this.getRestaurantDeliveryConfig(restaurantId);
      
      if (!config) {
        console.warn('⚠️ [DeliveryRadius] Config indisponible - Autoriser par défaut');
        console.warn('⚠️ [DeliveryRadius] Restaurant peut être inexistant ou sans coordonnées');
        return {
          isInRadius: true,
          distanceKm: 0,
          maxRadiusKm: 5,
          message: 'Configuration indisponible - commande autorisée'
        };
      }

      console.log(`📏 [DeliveryRadius] Config restaurant récupérée:`, JSON.stringify(config, null, 2));

      // Calculer la distance
      console.log(`📏 [DeliveryRadius] Calcul distance Haversine...`);
      console.log(`📏 [DeliveryRadius] De restaurant (${config.restaurant_latitude}, ${config.restaurant_longitude})`);
      console.log(`📏 [DeliveryRadius] Vers adresse (${addressLatitude}, ${addressLongitude})`);
      
      const distanceKm = this.calculateHaversineDistance(
        config.restaurant_latitude,
        config.restaurant_longitude,
        addressLatitude,
        addressLongitude
      );

      const isInRadius = distanceKm <= config.delivery_zone_km;
      
      console.log(`📏 [DeliveryRadius] Distance calculée: ${distanceKm.toFixed(2)}km`);
      console.log(`📏 [DeliveryRadius] Zone maximum: ${config.delivery_zone_km}km`);
      console.log(`📏 [DeliveryRadius] Dans la zone: ${isInRadius ? 'OUI ✅' : 'NON ❌'}`);
      console.log(`📏 [DeliveryRadius] Écart: ${(distanceKm - config.delivery_zone_km).toFixed(2)}km`);

      let message = '';
      if (isInRadius) {
        message = `✅ Adresse validée ! Distance: ${distanceKm.toFixed(1)}km`;
        // Avertissement si proche de la limite
        if (distanceKm > config.delivery_zone_km * 0.8) {
          message += ` (proche limite: ${config.delivery_zone_km}km)`;
        }
      } else {
        message = `❌ Adresse hors zone de livraison (${distanceKm.toFixed(1)}km/${config.delivery_zone_km}km)`;
      }

      return {
        isInRadius,
        distanceKm: Math.round(distanceKm * 10) / 10, // Arrondir à 1 décimale
        maxRadiusKm: config.delivery_zone_km,
        message
      };

    } catch (error) {
      console.error('❌ [DeliveryRadius] Exception validation:', error);
      
      // En cas d'erreur, autoriser la livraison (non-bloquant)
      return {
        isInRadius: true,
        distanceKm: 0,
        maxRadiusKm: 5,
        message: 'Erreur de validation - commande autorisée'
      };
    }
  }

  /**
   * Calculer la distance entre deux points avec la formule Haversine
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    console.log(`🧮 [DeliveryRadius] === CALCUL HAVERSINE ===`);
    console.log(`🧮 [DeliveryRadius] Point 1 (Restaurant): ${lat1}, ${lon1}`);
    console.log(`🧮 [DeliveryRadius] Point 2 (Adresse): ${lat2}, ${lon2}`);
    
    const R = 6371; // Rayon de la Terre en kilomètres
    console.log(`🧮 [DeliveryRadius] Rayon Terre: ${R}km`);
    
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    console.log(`🧮 [DeliveryRadius] Delta Lat: ${lat2 - lat1}° → ${dLat} radians`);
    console.log(`🧮 [DeliveryRadius] Delta Lon: ${lon2 - lon1}° → ${dLon} radians`);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    console.log(`🧮 [DeliveryRadius] Paramètre a: ${a}`);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    console.log(`🧮 [DeliveryRadius] Paramètre c: ${c}`);
    
    const distance = R * c;
    console.log(`🧮 [DeliveryRadius] Distance finale: ${distance}km`);
    console.log(`🧮 [DeliveryRadius] === FIN CALCUL HAVERSINE ===`);
    
    return distance;
  }

  /**
   * Convertir degrés en radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Vider le cache (utile pour les tests ou reset)
   */
  clearCache(): void {
    this.configCache.clear();
    console.log('🗑️ [DeliveryRadius] Cache vidé');
  }
}