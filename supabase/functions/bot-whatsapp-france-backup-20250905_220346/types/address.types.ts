/**
 * Types TypeScript pour le système de gestion des adresses de livraison
 * Utilisé par les services Google Places API et Address Management
 */

// ========================================
// TYPES BASE DE DONNÉES
// ========================================

export interface CustomerAddress {
  id: number;
  phone_number: string;
  address_label: string;
  full_address: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerAddressRequest {
  phone_number: string;
  address_label: string;
  full_address: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

// ========================================
// TYPES GOOGLE PLACES API
// ========================================

export interface GooglePlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
  viewport?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface GooglePlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: GooglePlaceGeometry;
  name?: string;
  types?: string[];
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

export interface GooglePlacesSearchResponse {
  candidates: GooglePlaceResult[];
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
  error_message?: string;
}

export interface GooglePlaceDetailsResponse {
  result: GooglePlaceResult;
  status: 'OK' | 'NOT_FOUND' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
  error_message?: string;
}

// ========================================
// TYPES VALIDATION ET RESPONSES
// ========================================

export interface AddressValidationResponse {
  isValid: boolean;
  suggestions: GooglePlaceResult[];
  selectedAddress?: GooglePlaceResult;
  error?: string;
}

export interface AddressSelectionMessage {
  hasAddresses: boolean;
  message: string;
  addresses: CustomerAddress[];
}

export interface DistanceCalculationResult {
  distance: number; // en kilomètres
  duration: number; // en minutes
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
}

// ========================================
// TYPES ÉTATS DU BOT
// ========================================

export type AddressSessionState = 
  | 'CHOOSING_DELIVERY_ADDRESS'    // Sélection parmi adresses existantes
  | 'REQUESTING_NEW_ADDRESS'       // Saisie nouvelle adresse
  | 'VALIDATING_ADDRESS'          // Validation Google Places
  | 'CONFIRMING_ADDRESS'          // Confirmation adresse suggérée
  | 'REQUESTING_ADDRESS_LABEL';   // Demande du nom de l'adresse

export interface AddressSessionContext {
  addresses?: CustomerAddress[];
  pendingAddress?: GooglePlaceResult;
  addressSuggestions?: GooglePlaceResult[];
  selectedAddressIndex?: number;
  awaitingLabel?: boolean;
}

// ========================================
// TYPES CONFIGURATION
// ========================================

export interface GooglePlacesConfig {
  apiKey: string;
  baseUrl: string;
  region: string;
  language: string;
}

export interface AddressManagementConfig {
  maxAddressesPerCustomer: number;
  defaultDeliveryRadiusKm: number;
  requireAddressValidation: boolean;
}