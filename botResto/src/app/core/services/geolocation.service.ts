import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private supabase: SupabaseService) {}

  async updateDeliveryPersonCoordinates(deliveryPhone: string): Promise<boolean> {
    try {
      if (!navigator.geolocation) {
        console.warn('Géolocalisation non supportée par ce navigateur');
        return false;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // 1 minute de cache maximum
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      console.log(`📍 Position actuelle du livreur: ${latitude}, ${longitude} (précision: ${accuracy}m)`);

      // Mettre à jour les coordonnées dans la base de données
      const { error } = await this.supabase
        .from('delivery_users')
        .update({ 
          latitude: latitude,
          longitude: longitude,
          accuracy: accuracy,
          coordinates_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('telephone', deliveryPhone);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour des coordonnées:', error);
        return false;
      }

      console.log(`✅ Coordonnées mises à jour avec succès pour le livreur ${deliveryPhone}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention de la géolocalisation:', error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<GeolocationCoordinates | null> {
    try {
      if (!navigator.geolocation) {
        console.warn('Géolocalisation non supportée par ce navigateur');
        return null;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      return position.coords;
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention de la position:', error);
      return null;
    }
  }
}