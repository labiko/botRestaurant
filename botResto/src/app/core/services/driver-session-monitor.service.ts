import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SupabaseFranceService } from './supabase-france.service';

// CONSTANTE MODIFIABLE FACILEMENT
const POLLING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (réduit pour performance)

export interface SessionCheckResult {
  isActive: boolean;
  shouldLogout: boolean;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverSessionMonitorService {
  
  private pollingInterval?: any;
  private isMonitoring = false;
  private currentDriverId?: number;
  
  // Cache simple pour éviter requêtes inutiles (4 minutes < 5 minutes polling)
  private lastCheck: {timestamp: number, isActive: boolean} | undefined = undefined;
  private readonly CACHE_DURATION_MS = 30 * 1000; // 30 secondes (test)

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private router: Router,
    private alertController: AlertController
  ) {
    
    // Gestion états application (arrière-plan/premier plan)
    this.setupVisibilityHandlers();
  }

  /**
   * Démarrer le monitoring pour un livreur
   */
  startMonitoring(driverId: number): void {
    if (this.isMonitoring && this.currentDriverId === driverId) {
      return;
    }

    // Arrêter monitoring précédent si existe
    this.stopMonitoring();

    this.currentDriverId = driverId;
    this.isMonitoring = true;


    // Premier check immédiat (optionnel - pour détecter rapidement)
    this.checkDriverStatus(driverId);

    // Démarrer polling régulier
    this.pollingInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.checkDriverStatus(driverId);
      }
    }, POLLING_INTERVAL_MS);
  }

  /**
   * Arrêter le monitoring
   */
  stopMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    if (this.isMonitoring) {
    }

    this.isMonitoring = false;
    this.currentDriverId = undefined;
    this.lastCheck = undefined;
  }

  /**
   * Forcer vérification immédiate (ignore cache)
   */
  async forceCheck(): Promise<void> {
    if (this.currentDriverId && this.isMonitoring) {
      this.lastCheck = undefined; // Reset cache
      await this.checkDriverStatus(this.currentDriverId);
    } else {
    }
  }

  /**
   * Vérifier le statut du livreur en base de données
   */
  private async checkDriverStatus(driverId: number): Promise<void> {
    try {

      // Vérifier cache simple
      if (this.shouldSkipCheck()) {
        console.log(`⚡ [DriverSessionMonitor] Check skippé (cache valide)`);
        return;
      }

      // Requête BDD simple - seulement is_active
      const { data: driver, error } = await this.supabaseFranceService.client
        .from('france_delivery_drivers')
        .select('is_active')
        .eq('id', driverId)
        .single();

      if (error) {
        console.error('❌ [DriverSessionMonitor] Erreur requête BDD:', error);
        // En cas d'erreur → logout préventif
        await this.forceLogout('Erreur de connexion - déconnexion sécuritaire');
        return;
      }

      // Mettre à jour cache
      this.lastCheck = {
        timestamp: Date.now(),
        isActive: driver?.is_active ?? false
      };


      // Si désactivé → logout immédiat
      if (!driver?.is_active) {
        console.warn(`⚠️ [DriverSessionMonitor] Livreur ${driverId} désactivé - déconnexion forcée`);
        await this.forceLogout('Votre compte a été désactivé par le restaurant');
      }

    } catch (error) {
      console.error('❌ [DriverSessionMonitor] Erreur vérification statut:', error);
      // En cas d'erreur technique → logout préventif
      await this.forceLogout('Erreur technique - déconnexion sécuritaire');
    }
  }

  /**
   * Déconnexion forcée avec nettoyage complet
   */
  private async forceLogout(reason: string): Promise<void> {
    try {

      // 1. Arrêter monitoring avant tout
      this.stopMonitoring();

      // 2. Afficher message à l'utilisateur
      await this.showDisconnectionAlert(reason);

      // 3. Nettoyer session locale (sans toucher à AuthService)
      this.clearLocalSession();

      // 4. Redirection login
      this.router.navigate(['/restaurant-france/auth-france/login-france']);

    } catch (error) {
      console.error('❌ [DriverSessionMonitor] Erreur lors de la déconnexion forcée:', error);
      // En cas d'erreur → redirection directe
      this.router.navigate(['/restaurant-france/auth-france/login-france']);
    }
  }

  /**
   * Afficher alerte de déconnexion à l'utilisateur
   */
  private async showDisconnectionAlert(reason: string): Promise<void> {
    const alert = await this.alertController.create({
      header: '🚨 Déconnexion automatique',
      message: `${reason}

Contactez votre responsable pour plus d'informations.`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Compris',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();
  }

  /**
   * Nettoyer session locale (sans affecter AuthService)
   */
  private clearLocalSession(): void {
    // Nettoyer localStorage et sessionStorage
    const keysToKeep = ['app-config', 'user-preferences']; // Garder config app
    
    // localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // sessionStorage
    sessionStorage.clear();

  }

  /**
   * Vérifier si on doit skipper le check (cache valide)
   */
  private shouldSkipCheck(): boolean {
    if (!this.lastCheck) return false;
    
    const elapsed = Date.now() - this.lastCheck.timestamp;
    return elapsed < this.CACHE_DURATION_MS;
  }

  /**
   * Suspendre/reprendre monitoring selon visibilité app
   */
  private setupVisibilityHandlers(): void {
    document.addEventListener('visibilitychange', () => {
      if (this.isMonitoring) {
        if (document.hidden) {
        } else {
          // Check immédiat au retour
          if (this.currentDriverId) {
            this.checkDriverStatus(this.currentDriverId);
          }
        }
      }
    });
  }

  /**
   * Obtenir l'état actuel du monitoring (pour debug)
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    driverId?: number;
    intervalMs: number;
    lastCheck?: {timestamp: number, isActive: boolean};
  } {
    return {
      isMonitoring: this.isMonitoring,
      driverId: this.currentDriverId,
      intervalMs: POLLING_INTERVAL_MS,
      lastCheck: this.lastCheck
    };
  }
}