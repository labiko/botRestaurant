import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { DriverLocationService } from './driver-location.service';

export interface OnlineStatusUpdate {
  driverId: number;
  isOnline: boolean;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverOnlineStatusService {
  private isUpdatingSubject = new BehaviorSubject<boolean>(false);
  public isUpdating$ = this.isUpdatingSubject.asObservable();

  private onlineStatusSubject = new BehaviorSubject<boolean>(false);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private driverLocationService: DriverLocationService
  ) {}

  /**
   * Charger le statut en ligne initial depuis la base de données
   */
  async loadInitialStatus(driverId: number): Promise<boolean> {
    try {
      console.log(`🔄 [DriverOnlineStatus] Chargement statut initial pour livreur ${driverId}`);

      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('is_online')
        .eq('id', driverId)
        .single();

      if (error) {
        console.error('❌ [DriverOnlineStatus] Erreur chargement statut initial:', error);
        return false;
      }

      const isOnline = data?.is_online || false;
      this.onlineStatusSubject.next(isOnline);
      
      console.log(`✅ [DriverOnlineStatus] Statut initial: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
      return isOnline;

    } catch (error) {
      console.error('❌ [DriverOnlineStatus] Erreur service chargement statut:', error);
      return false;
    }
  }

  /**
   * Basculer le statut en ligne/hors ligne avec synchronisation base de données
   */
  async toggleOnlineStatus(driverId: number): Promise<{ success: boolean; newStatus: boolean; message: string }> {
    // Empêcher les clics multiples
    if (this.isUpdatingSubject.value) {
      console.warn('⚠️ [DriverOnlineStatus] Mise à jour déjà en cours, ignoré');
      return {
        success: false,
        newStatus: this.onlineStatusSubject.value,
        message: 'Mise à jour en cours...'
      };
    }

    this.isUpdatingSubject.next(true);

    try {
      const currentStatus = this.onlineStatusSubject.value;
      const newStatus = !currentStatus;

      console.log(`🔄 [DriverOnlineStatus] Toggle statut livreur ${driverId}: ${currentStatus} -> ${newStatus}`);

      // 1. Mettre à jour immédiatement en base de données
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update({ 
          is_online: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('❌ [DriverOnlineStatus] Erreur mise à jour BDD:', error);
        return {
          success: false,
          newStatus: currentStatus,
          message: 'Erreur lors de la mise à jour du statut'
        };
      }

      // 2. Succès : mettre à jour l'état local
      this.onlineStatusSubject.next(newStatus);

      // 3. Synchroniser avec le service de géolocalisation
      if (newStatus) {
        // Se mettre en ligne avec GPS (sans re-modifier la BDD)
        await this.activateLocationTracking(driverId);
      } else {
        // Se mettre hors ligne (sans re-modifier la BDD)
        await this.deactivateLocationTracking();
      }

      const statusText = newStatus ? 'en ligne' : 'hors ligne';
      const message = `✅ Vous êtes maintenant ${statusText}`;
      
      console.log(`✅ [DriverOnlineStatus] Statut mis à jour: ${statusText}`);
      
      return {
        success: true,
        newStatus: newStatus,
        message: message
      };

    } catch (error) {
      console.error('❌ [DriverOnlineStatus] Erreur toggle statut:', error);
      return {
        success: false,
        newStatus: this.onlineStatusSubject.value,
        message: 'Erreur lors de la mise à jour du statut'
      };
    } finally {
      this.isUpdatingSubject.next(false);
    }
  }

  /**
   * Activer le tracking de localisation (GPS uniquement)
   */
  private async activateLocationTracking(driverId: number): Promise<void> {
    try {
      console.log(`📍 [DriverOnlineStatus] Activation GPS pour livreur ${driverId}`);

      // Le service de localisation se contentera du tracking GPS
      // La mise à jour BDD du statut is_online est déjà faite
      const success = await this.driverLocationService.startLocationTracking(driverId);
      
      if (!success) {
        console.warn('⚠️ [DriverOnlineStatus] GPS non disponible, mais statut en ligne maintenu');
      } else {
        console.log('✅ [DriverOnlineStatus] GPS activé avec succès');
      }
    } catch (error) {
      console.error('❌ [DriverOnlineStatus] Erreur activation GPS:', error);
    }
  }

  /**
   * Désactiver le tracking de localisation (GPS uniquement)
   */
  private async deactivateLocationTracking(): Promise<void> {
    try {
      console.log('📴 [DriverOnlineStatus] Désactivation GPS');

      // Le service de localisation se contentera d'arrêter le GPS
      // La mise à jour BDD du statut is_online est déjà faite
      await this.driverLocationService.stopLocationTracking();
      
      console.log('✅ [DriverOnlineStatus] GPS désactivé avec succès');
    } catch (error) {
      console.error('❌ [DriverOnlineStatus] Erreur désactivation GPS:', error);
    }
  }

  /**
   * Forcer un statut spécifique (utile pour l'initialisation)
   */
  async setOnlineStatus(driverId: number, isOnline: boolean, reason: string = 'manual'): Promise<boolean> {
    try {
      console.log(`🎯 [DriverOnlineStatus] Forcer statut livreur ${driverId}: ${isOnline} (${reason})`);

      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .update({ 
          is_online: isOnline,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('❌ [DriverOnlineStatus] Erreur forcer statut:', error);
        return false;
      }

      this.onlineStatusSubject.next(isOnline);
      
      // Synchroniser GPS selon le statut
      if (isOnline) {
        await this.activateLocationTracking(driverId);
      } else {
        await this.deactivateLocationTracking();
      }

      return true;
    } catch (error) {
      console.error('❌ [DriverOnlineStatus] Erreur service forcer statut:', error);
      return false;
    }
  }

  /**
   * Obtenir le statut actuel
   */
  getCurrentStatus(): boolean {
    return this.onlineStatusSubject.value;
  }

  /**
   * Vérifier si une mise à jour est en cours
   */
  isUpdating(): boolean {
    return this.isUpdatingSubject.value;
  }

  /**
   * Obtenir le texte de statut pour l'affichage
   */
  getStatusText(): string {
    return this.onlineStatusSubject.value ? 'En ligne' : 'Hors ligne';
  }

  /**
   * Obtenir la couleur de statut pour l'affichage
   */
  getStatusColor(): string {
    return this.onlineStatusSubject.value ? 'success' : 'medium';
  }

  /**
   * Obtenir l'icône de statut pour l'affichage
   */
  getStatusIcon(): string {
    return this.onlineStatusSubject.value ? 'radio-button-on' : 'radio-button-off';
  }

  /**
   * Nettoyer les ressources au destroy
   */
  ngOnDestroy(): void {
    console.log('🧹 [DriverOnlineStatus] Nettoyage du service');
    this.isUpdatingSubject.complete();
    this.onlineStatusSubject.complete();
  }
}