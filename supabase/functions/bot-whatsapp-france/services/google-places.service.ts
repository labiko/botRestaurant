/**
 * Service Google Places API pour validation et recherche d'adresses
 * Utilisé pour valider les adresses de livraison saisies par les clients
 */

import type { 
  GooglePlaceResult, 
  GooglePlacesSearchResponse, 
  GooglePlaceDetailsResponse,
  AddressValidationResponse,
  DistanceCalculationResult,
  GooglePlacesConfig
} from '../types/address.types.ts';

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl: string;
  private region: string;
  private language: string;

  constructor(config?: Partial<GooglePlacesConfig>) {
    this.apiKey = config?.apiKey || Deno.env.get('GOOGLE_PLACES_API_KEY') || '';
    this.baseUrl = config?.baseUrl || 'https://maps.googleapis.com/maps/api/place';
    this.region = config?.region || 'FR';
    this.language = config?.language || 'fr';

    if (!this.apiKey) {
      console.error('❌ Google Places API key manquante. Définir GOOGLE_PLACES_API_KEY');
    }
  }

  /**
   * Recherche d'adresses avec l'API Text Search
   * @param query Adresse saisie par l'utilisateur
   * @returns Liste des adresses trouvées
   */
  async searchAddress(query: string): Promise<GooglePlaceResult[]> {
    try {
      console.log(`🔍 [GooglePlaces] Recherche adresse: "${query}"`);
      
      const url = `${this.baseUrl}/textsearch/json?` + new URLSearchParams({
        query: query,
        key: this.apiKey,
        region: this.region,
        language: this.language,
        fields: 'place_id,formatted_address,geometry,name,types'
      });

      console.log(`🌐 [GooglePlaces] URL appelée: ${url}`);
      
      const response = await fetch(url);
      console.log(`📡 [GooglePlaces] Status HTTP: ${response.status}`);
      
      const data: GooglePlacesSearchResponse = await response.json();
      console.log(`📊 [GooglePlaces] Réponse complète:`, JSON.stringify(data, null, 2));
      console.log(`📊 [GooglePlaces] Status API: ${data.status}`);
      console.log(`📊 [GooglePlaces] data.candidates:`, data.candidates);
      console.log(`📊 [GooglePlaces] data.results:`, (data as any).results);

      if (data.status === 'OK') {
        console.log(`✅ [GooglePlaces] ${data.candidates?.length || 'undefined'} adresses trouvées (candidates)`);
        console.log(`✅ [GooglePlaces] ${(data as any).results?.length || 'undefined'} adresses trouvées (results)`);
        // Correction: Google Places Text Search retourne 'results', pas 'candidates'
        return (data as any).results || data.candidates || [];
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ [GooglePlaces] Aucune adresse trouvée');
        return [];
      } else {
        console.error(`❌ [GooglePlaces] Erreur API: ${data.status}`, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('❌ [GooglePlaces] Erreur recherche:', error);
      return [];
    }
  }

  /**
   * Obtenir les détails complets d'un lieu via son Place ID
   * @param placeId Identifiant unique du lieu Google
   * @returns Détails complets du lieu
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    try {
      console.log(`🔍 [GooglePlaces] Détails place_id: ${placeId}`);
      
      const url = `${this.baseUrl}/details/json?` + new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: this.language,
        fields: 'place_id,formatted_address,geometry,name,types,address_components'
      });

      const response = await fetch(url);
      const data: GooglePlaceDetailsResponse = await response.json();

      if (data.status === 'OK') {
        console.log('✅ [GooglePlaces] Détails récupérés avec succès');
        return data.result;
      } else {
        console.error(`❌ [GooglePlaces] Erreur détails: ${data.status}`, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('❌ [GooglePlaces] Erreur détails:', error);
      return null;
    }
  }

  /**
   * Valider une adresse et proposer des suggestions
   * @param address Adresse saisie par l'utilisateur
   * @returns Validation avec suggestions
   */
  async validateAddress(address: string): Promise<AddressValidationResponse> {
    try {
      if (!address.trim()) {
        return {
          isValid: false,
          suggestions: [],
          error: 'Adresse vide'
        };
      }

      const suggestions = await this.searchAddress(address);
      
      if (suggestions.length === 0) {
        return {
          isValid: false,
          suggestions: [],
          error: 'Aucune adresse trouvée'
        };
      }

      // La première suggestion est considérée comme la meilleure correspondance
      const bestMatch = suggestions[0];
      
      return {
        isValid: true,
        suggestions: suggestions,
        selectedAddress: bestMatch
      };
    } catch (error) {
      console.error('❌ [GooglePlaces] Erreur validation:', error);
      return {
        isValid: false,
        suggestions: [],
        error: 'Erreur de validation'
      };
    }
  }

  /**
   * Calculer la distance entre deux adresses
   * @param origin Adresse de départ (restaurant)
   * @param destination Adresse de destination (client)
   * @returns Distance et durée
   */
  async calculateDistance(origin: string, destination: string): Promise<DistanceCalculationResult> {
    try {
      console.log(`📏 [GooglePlaces] Calcul distance: ${origin} → ${destination}`);
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` + new URLSearchParams({
        origins: origin,
        destinations: destination,
        key: this.apiKey,
        language: this.language,
        units: 'metric',
        mode: 'driving'
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]) {
        const element = data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          const distanceKm = element.distance.value / 1000;
          const durationMin = Math.ceil(element.duration.value / 60);
          
          console.log(`✅ [GooglePlaces] Distance: ${distanceKm}km, Durée: ${durationMin}min`);
          
          return {
            distance: distanceKm,
            duration: durationMin,
            status: 'OK'
          };
        }
      }

      console.error('❌ [GooglePlaces] Erreur calcul distance:', data);
      return {
        distance: 0,
        duration: 0,
        status: data.status || 'UNKNOWN_ERROR'
      };
    } catch (error) {
      console.error('❌ [GooglePlaces] Erreur calcul distance:', error);
      return {
        distance: 0,
        duration: 0,
        status: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Géocodage inverse - convertir coordonnées en adresse
   * @param lat Latitude
   * @param lng Longitude
   * @returns Adresse formatée
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      console.log(`🌐 [GooglePlaces] Géocodage inverse: ${lat}, ${lng}`);
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?` + new URLSearchParams({
        latlng: `${lat},${lng}`,
        key: this.apiKey,
        language: this.language
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.[0]) {
        const address = data.results[0].formatted_address;
        console.log(`✅ [GooglePlaces] Adresse trouvée: ${address}`);
        return address;
      }

      console.error('❌ [GooglePlaces] Erreur géocodage inverse:', data);
      return null;
    } catch (error) {
      console.error('❌ [GooglePlaces] Erreur géocodage inverse:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'API Key est configurée
   * @returns true si l'API Key est disponible
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Formater une adresse pour l'affichage WhatsApp
   * @param place Résultat Google Places
   * @returns Adresse formatée pour mobile
   */
  formatAddressForWhatsApp(place: GooglePlaceResult): string {
    // Raccourcir l'adresse pour l'affichage mobile
    let address = place.formatted_address;
    
    // Enlever ", France" si présent
    address = address.replace(/, France$/, '');
    
    // Limiter à 60 caractères max pour WhatsApp
    if (address.length > 60) {
      address = address.substring(0, 57) + '...';
    }
    
    return address;
  }
}