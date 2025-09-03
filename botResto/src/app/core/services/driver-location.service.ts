import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { SupabaseFranceService } from './supabase-france.service';

export interface DriverLocation {
  driver_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface LocationUpdate {
  driver_id: number;
  current_latitude: number;
  current_longitude: number;
  last_location_update: string;
}

export interface DriverDistance {
  driver_id: number;
  driver_name: string;
  distance_km: number;
  location_freshness: 'recent' | 'stale' | 'offline';
}

@Injectable({
  providedIn: 'root'
})
export class DriverLocationService {
  private currentLocationSubject = new BehaviorSubject<DriverLocation | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  private onlineStatusSubject = new BehaviorSubject<boolean>(false);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  private trackingSubscription?: Subscription;
  private currentDriverId: number | null = null;

  // Configuration de tracking
  private readonly LOCATION_UPDATE_INTERVAL_MS = 30000; // 30 secondes
  private readonly HIGH_ACCURACY_TIMEOUT = 10000; // 10 secondes
  private readonly LOW_ACCURACY_TIMEOUT = 15000; // 15 secondes
  private readonly LOCATION_MAX_AGE = 60000; // 1 minute

  constructor(private supabaseFranceService: SupabaseFranceService) {}

  /**
   * Démarrer le tracking de localisation pour un livreur
   */
  async startLocationTracking(driverId: number): Promise<boolean> {
    try {
      console.log(`📍 [DriverLocation] Démarrage tracking pour livreur ${driverId}`);

      // 1. Vérifier les permissions
      const hasPermission = await this.checkLocationPermissions();
      if (!hasPermission) {
        console.error('❌ [DriverLocation] Permissions géolocalisation refusées');
        return false;
      }

      // 2. Stocker l'ID du livreur
      this.currentDriverId = driverId;

      // 3. Marquer le livreur comme en ligne
      const onlineSet = await this.setDriverOnlineStatus(driverId, true);
      if (!onlineSet) {
        console.error('❌ [DriverLocation] Impossible de marquer le livreur en ligne');
        return false;
      }

      // 4. Obtenir la position initiale
      const initialLocation = await this.getCurrentPosition();
      if (initialLocation) {
        await this.updateDriverLocation(driverId, initialLocation);
        this.currentLocationSubject.next({
          driver_id: driverId,
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          accuracy: initialLocation.accuracy,
          timestamp: new Date().toISOString()
        });
      }

      // 5. Démarrer le tracking périodique
      this.startPeriodicTracking();

      // 6. Mettre à jour les statuts
      this.onlineStatusSubject.next(true);

      console.log(`✅ [DriverLocation] Tracking démarré pour livreur ${driverId}`);
      return true;

    } catch (error) {
      console.error(`❌ [DriverLocation] Erreur démarrage tracking:`, error);
      return false;
    }
  }

  /**
   * Arrêter le tracking de localisation
   */
  async stopLocationTracking(): Promise<void> {
    try {
      console.log('🛑 [DriverLocation] Arrêt du tracking');

      // 1. Arrêter le tracking périodique
      if (this.trackingSubscription) {
        this.trackingSubscription.unsubscribe();
        this.trackingSubscription = undefined;
      }

      // 2. Marquer le livreur comme hors ligne
      if (this.currentDriverId) {
        await this.setDriverOnlineStatus(this.currentDriverId, false);
        this.currentDriverId = null;
      }

      // 3. Mettre à jour les statuts
      this.onlineStatusSubject.next(false);
      this.currentLocationSubject.next(null);

      console.log('✅ [DriverLocation] Tracking arrêté');
    } catch (error) {
      console.error('❌ [DriverLocation] Erreur arrêt tracking:', error);
    }
  }

  /**
   * Obtenir la position actuelle avec haute précision
   */
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number; accuracy?: number } | null> {
    try {
      // Essayer d'abord avec haute précision
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: this.HIGH_ACCURACY_TIMEOUT,
          maximumAge: this.LOCATION_MAX_AGE
        });

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } catch (highAccuracyError) {
        console.warn('⚠️ [DriverLocation] Haute précision échouée, tentative précision normale');
        
        // Fallback avec précision normale
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: this.LOW_ACCURACY_TIMEOUT,
          maximumAge: this.LOCATION_MAX_AGE
        });

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      }
    } catch (error) {
      console.error('❌ [DriverLocation] Erreur obtention position:', error);
      return null;
    }
  }

  /**
   * Calculer la distance entre deux points (formule Haversine)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Obtenir les livreurs à proximité d'une adresse
   */
  async getNearbyDrivers(
    targetLatitude: number, 
    targetLongitude: number, 
    restaurantId: number, 
    maxDistanceKm: number = 10
  ): Promise<DriverDistance[]> {
    try {
      // 1. Obtenir les livreurs en ligne avec leur position
      const { data, error } = await this.supabaseFranceService.client
        .from('france_available_drivers')
        .select('id, first_name, last_name, current_latitude, current_longitude, location_freshness')
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('❌ [DriverLocation] Erreur récupération livreurs disponibles:', error);
        return [];
      }

      // 2. Calculer les distances et filtrer
      const driversWithDistance: DriverDistance[] = [];
      
      for (const driver of data || []) {
        if (driver.current_latitude && driver.current_longitude) {
          const distance = this.calculateDistance(
            targetLatitude,
            targetLongitude,
            driver.current_latitude,
            driver.current_longitude
          );

          if (distance <= maxDistanceKm) {
            driversWithDistance.push({
              driver_id: driver.id,
              driver_name: `${driver.first_name} ${driver.last_name}`,
              distance_km: Math.round(distance * 100) / 100, // 2 décimales
              location_freshness: driver.location_freshness
            });
          }
        }
      }

      // 3. Trier par distance
      driversWithDistance.sort((a, b) => a.distance_km - b.distance_km);

      console.log(`📍 [DriverLocation] ${driversWithDistance.length} livreurs trouvés à proximité (< ${maxDistanceKm}km)`);
      return driversWithDistance;

    } catch (error) {
      console.error('❌ [DriverLocation] Erreur recherche livreurs proximité:', error);
      return [];
    }
  }

  /**
   * Sauvegarder une position dans l'historique
   */
  async saveLocationHistory(driverId: number, location: DriverLocation): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_driver_locations')
        .insert({
          driver_id: driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy_meters: location.accuracy,
          recorded_at: location.timestamp
        });

      if (error) {
        console.error('❌ [DriverLocation] Erreur sauvegarde historique:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ [DriverLocation] Erreur service sauvegarde historique:', error);
      return false;
    }
  }

  /**
   * Obtenir l'historique de position d'un livreur
   */
  async getDriverLocationHistory(driverId: number, hoursBack: number = 24): Promise<DriverLocation[]> {
    try {
      const fromTime = new Date();
      fromTime.setHours(fromTime.getHours() - hoursBack);

      const { data, error } = await this.supabaseFranceService.client
        .from('france_driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .gte('recorded_at', fromTime.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('❌ [DriverLocation] Erreur récupération historique:', error);
        return [];
      }

      return (data || []).map(record => ({
        driver_id: record.driver_id,
        latitude: record.latitude,
        longitude: record.longitude,
        accuracy: record.accuracy_meters,
        timestamp: record.recorded_at
      }));

    } catch (error) {
      console.error('❌ [DriverLocation] Erreur service historique:', error);
      return [];
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  /**
   * Vérifier les permissions de géolocalisation
   */
  private async checkLocationPermissions(): Promise<boolean> {
    try {
      // Vérifier permission actuelle
      let permission = await Geolocation.checkPermissions();
      
      if (permission.location === 'granted') {
        return true;
      }

      // Demander permission si pas accordée
      if (permission.location === 'prompt') {
        permission = await Geolocation.requestPermissions();
      }

      return permission.location === 'granted';
    } catch (error) {
      console.error('❌ [DriverLocation] Erreur vérification permissions:', error);
      return false;
    }
  }

  /**
   * Mettre à jour le statut en ligne d'un livreur
   */
  private async setDriverOnlineStatus(driverId: number, isOnline: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update({
          is_online: isOnline,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('❌ [DriverLocation] Erreur mise à jour statut en ligne:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ [DriverLocation] Erreur service statut en ligne:', error);
      return false;
    }
  }

  /**
   * Mettre à jour la position d'un livreur
   */
  private async updateDriverLocation(driverId: number, location: { latitude: number; longitude: number; accuracy?: number }): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update({
          current_latitude: location.latitude,
          current_longitude: location.longitude,
          // Le trigger SQL met à jour last_location_update automatiquement
        })
        .eq('id', driverId);

      if (error) {
        console.error('❌ [DriverLocation] Erreur mise à jour position:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ [DriverLocation] Erreur service mise à jour position:', error);
      return false;
    }
  }

  /**
   * Démarrer le tracking périodique
   */
  private startPeriodicTracking(): void {
    this.trackingSubscription = timer(0, this.LOCATION_UPDATE_INTERVAL_MS).subscribe(async () => {
      if (!this.currentDriverId) return;

      try {
        const position = await this.getCurrentPosition();
        if (position) {
          // Mettre à jour en base
          await this.updateDriverLocation(this.currentDriverId, position);

          // Créer objet location
          const locationData: DriverLocation = {
            driver_id: this.currentDriverId,
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            timestamp: new Date().toISOString()
          };

          // Mettre à jour le subject
          this.currentLocationSubject.next(locationData);

          // Sauvegarder dans l'historique (optionnel, peut être fait moins fréquemment)
          await this.saveLocationHistory(this.currentDriverId, locationData);

          console.log(`📍 [DriverLocation] Position mise à jour: ${position.latitude}, ${position.longitude}`);
        }
      } catch (error) {
        console.error('❌ [DriverLocation] Erreur tracking périodique:', error);
      }
    });
  }

  /**
   * Convertir en radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Formater la distance pour affichage
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else {
      return `${distanceKm.toFixed(1)}km`;
    }
  }

  /**
   * Obtenir la couleur selon la fraîcheur de la localisation
   */
  getLocationFreshnessColor(freshness: string): string {
    const colors: Record<string, string> = {
      'recent': 'success',
      'stale': 'warning', 
      'offline': 'danger'
    };
    return colors[freshness] || 'medium';
  }

  /**
   * Obtenir le texte selon la fraîcheur
   */
  getLocationFreshnessText(freshness: string): string {
    const texts: Record<string, string> = {
      'recent': 'Position récente',
      'stale': 'Position ancienne',
      'offline': 'Hors ligne'
    };
    return texts[freshness] || 'Statut inconnu';
  }

  /**
   * Nettoyer les ressources au destroy
   */
  ngOnDestroy(): void {
    this.stopLocationTracking();
  }
}