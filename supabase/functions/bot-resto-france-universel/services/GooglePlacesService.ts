/**
 * Service Google Places API pour validation et recherche d'adresses
 * SOLID - Single Responsibility : Gestion uniquement des adresses Google Places
 * Import adapté depuis l'ancien bot pour l'architecture universelle
 */

export interface GooglePlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  types?: string[];
  address_components?: any[];
}

export interface GooglePlacesSearchResponse {
  status: string;
  results?: GooglePlaceResult[];
  candidates?: GooglePlaceResult[];
  error_message?: string;
}

export interface GooglePlaceDetailsResponse {
  status: string;
  result: GooglePlaceResult;
  error_message?: string;
}

export interface AddressValidationResponse {
  isValid: boolean;
  suggestions: GooglePlaceResult[];
  selectedAddress?: GooglePlaceResult;
  error?: string;
}

export interface DistanceCalculationResult {
  distance: number;
  duration: number;
  status: string;
}

export interface GooglePlacesConfig {
  apiKey: string;
  baseUrl: string;
  region: string;
  language: string;
}

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
      console.log(`📊 [GooglePlaces] Status API: ${data.status}`);

      if (data.status === 'OK') {
        const results = (data as any).results || data.candidates || [];
        console.log(`✅ [GooglePlaces] ${results.length} adresses trouvées`);
        return results;
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
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Formater une adresse pour l'affichage WhatsApp
   */
  formatAddressForWhatsApp(place: GooglePlaceResult): string {
    let address = place.formatted_address;
    
    // Enlever ", France" si présent
    address = address.replace(/, France$/, '');
    
    // Limiter à 60 caractères max pour WhatsApp
    if (address.length > 60) {
      address = address.substring(0, 57) + '...';
    }
    
    return address;
  }

  /**
   * Formater le message de sélection d'adresses suggérées
   * FORMAT UNIVERSEL - Même structure pour tous les restaurants
   */
  formatAddressSuggestionsMessage(suggestions: GooglePlaceResult[]): string {
    let message = `📍 *Adresses trouvées :*\n\n`;
    
    suggestions.slice(0, 3).forEach((suggestion, index) => {
      const formattedAddress = this.formatAddressForWhatsApp(suggestion);
      message += `*${index + 1}.* ${formattedAddress}\n`;
    });
    
    message += `\n*Tapez le numéro de votre choix (1-${Math.min(suggestions.length, 3)})*`;
    message += `\n📝 *Ou envoyez une adresse plus précise*`;
    
    return message;
  }
}