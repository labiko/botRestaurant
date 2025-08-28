import { Injectable, OnDestroy } from '@angular/core';
import { DeliveryService } from './delivery.service';
import { AuthService } from './auth.service';

// Interface pour la géolocalisation (compatible web et mobile)
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocationTrackerService implements OnDestroy {
  private trackingInterval: any = null;
  private isTracking = false;
  private lastPosition: { latitude: number, longitude: number } | null = null;
  private readonly TRACKING_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_DISTANCE_CHANGE = 50; // 50 mètres minimum pour update

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService
  ) {}

  ngOnDestroy() {
    this.stopTracking();
  }

  // Démarrer le tracking de position
  async startTracking(): Promise<boolean> {
    try {
      console.log('📍 Starting location tracking...');

      // Vérifier si la géolocalisation est supportée
      if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported by this browser');
        return false;
      }

      // Arrêter le tracking précédent s'il existe
      this.stopTracking();

      // Obtenir position initiale
      await this.updateCurrentPosition();

      // Démarrer le tracking périodique
      this.isTracking = true;
      this.trackingInterval = setInterval(() => {
        if (this.isTracking) {
          this.updateCurrentPosition();
        }
      }, this.TRACKING_INTERVAL);

      console.log(`✅ Location tracking started (interval: ${this.TRACKING_INTERVAL / 1000}s)`);
      return true;

    } catch (error) {
      console.error('❌ Error starting location tracking:', error);
      return false;
    }
  }

  // Arrêter le tracking
  stopTracking(): void {
    console.log('🛑 Stopping location tracking...');
    
    this.isTracking = false;
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    
    this.lastPosition = null;
    console.log('✅ Location tracking stopped');
  }

  // Mettre à jour la position actuelle
  private async updateCurrentPosition(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.deliveryPhone) {
        console.error('❌ No delivery phone found for location update');
        return;
      }

      // Obtenir position GPS
      const position = await this.getCurrentPositionPromise({
        enableHighAccuracy: false, // Optimisé pour batterie
        timeout: 10000,
        maximumAge: 60000 // Cache 1 minute
      });

      const currentPos = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      console.log('📍 Current position:', currentPos);

      // Vérifier si la position a suffisamment changé
      if (this.shouldUpdatePosition(currentPos)) {
        const success = await this.deliveryService.updateDriverLocation(
          user.deliveryPhone,
          currentPos.latitude,
          currentPos.longitude,
          position.coords.accuracy || undefined
        );

        if (success) {
          this.lastPosition = currentPos;
          console.log(`✅ Location updated for ${user.deliveryPhone}`);
        } else {
          console.error('❌ Failed to update location in database');
        }
      } else {
        console.log('📍 Position unchanged, skipping update');
      }

    } catch (error) {
      console.error('❌ Error getting current position:', error);
      
      // Si erreur GPS, essayer une fois de plus dans 30s
      if (this.isTracking) {
        setTimeout(() => {
          if (this.isTracking) {
            this.updateCurrentPosition();
          }
        }, 30000);
      }
    }
  }

  // Vérifier si la position doit être mise à jour
  private shouldUpdatePosition(newPos: { latitude: number, longitude: number }): boolean {
    if (!this.lastPosition) {
      return true; // Première position
    }

    // Calculer distance avec formule Haversine simplifiée
    const distance = this.calculateDistance(
      this.lastPosition.latitude,
      this.lastPosition.longitude,
      newPos.latitude,
      newPos.longitude
    );

    return distance >= this.MIN_DISTANCE_CHANGE;
  }

  // Calculer distance entre deux points (en mètres)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Rayon terre en mètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convertir navigator.geolocation en Promise
  private getCurrentPositionPromise(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position as GeolocationPosition),
        (error) => reject(error),
        options
      );
    });
  }

  // Obtenir position unique (pour tests)
  async getCurrentPosition(): Promise<{ latitude: number, longitude: number } | null> {
    try {
      const position = await this.getCurrentPositionPromise({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('❌ Error getting current position:', error);
      return null;
    }
  }

  // Statut du tracking
  get isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}