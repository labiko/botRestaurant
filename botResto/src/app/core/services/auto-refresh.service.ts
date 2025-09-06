import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { REFRESH_CONFIG } from '../config/refresh.config';

export interface AutoRefreshConfig {
  intervalMs: number;
  pauseOnHidden: boolean;
  pauseOnInactive: boolean;
  inactivityTimeoutMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class AutoRefreshService implements OnDestroy {
  // Configuration par défaut depuis le fichier de config
  private readonly DEFAULT_CONFIG: AutoRefreshConfig = {
    intervalMs: REFRESH_CONFIG.DEFAULT_INTERVAL_MS,
    pauseOnHidden: true,
    pauseOnInactive: true,
    inactivityTimeoutMs: REFRESH_CONFIG.INACTIVITY_TIMEOUT_MS
  };

  // État interne
  private refreshTimers = new Map<string, NodeJS.Timeout>();
  private refreshSubjects = new Map<string, BehaviorSubject<boolean>>();
  private refreshConfigs = new Map<string, AutoRefreshConfig>(); // NOUVEAU: Stocker les configs
  private isPageVisible = true;
  private isUserActive = true;
  private lastUserActivity = Date.now();

  // Event listeners pour cleanup
  private visibilityListener?: () => void;
  private activityListeners: (() => void)[] = [];

  constructor() {
    this.initializeGlobalListeners();
  }

  /**
   * Démarre le rafraîchissement automatique pour un composant
   * @param componentId Identifiant unique du composant
   * @param config Configuration optionnelle
   * @returns Observable qui émet true quand il faut rafraîchir
   */
  startAutoRefresh(componentId: string, config?: Partial<AutoRefreshConfig>): Observable<boolean> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    console.log(`🔄 Auto-refresh started for ${componentId} (${finalConfig.intervalMs / 1000}s)`);
    
    // Arrêter le précédent timer s'il existe
    this.stopAutoRefresh(componentId);
    
    // Créer le subject pour ce composant
    const subject = new BehaviorSubject<boolean>(false);
    this.refreshSubjects.set(componentId, subject);
    
    // NOUVEAU: Stocker la configuration pour ce composant
    this.refreshConfigs.set(componentId, finalConfig);
    
    // Démarrer le timer
    this.scheduleNextRefresh(componentId, finalConfig);
    
    return subject.asObservable();
  }

  /**
   * Arrête le rafraîchissement automatique pour un composant
   * @param componentId Identifiant du composant
   */
  stopAutoRefresh(componentId: string): void {
    console.log(`⏹️ Auto-refresh stopped for ${componentId}`);
    
    // Nettoyer le timer
    const timer = this.refreshTimers.get(componentId);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(componentId);
    }
    
    // Nettoyer le subject
    const subject = this.refreshSubjects.get(componentId);
    if (subject) {
      subject.complete();
      this.refreshSubjects.delete(componentId);
    }
    
    // NOUVEAU: Nettoyer la configuration
    this.refreshConfigs.delete(componentId);
  }

  /**
   * Force un rafraîchissement immédiat pour un composant
   * @param componentId Identifiant du composant
   */
  forceRefresh(componentId: string): void {
    const subject = this.refreshSubjects.get(componentId);
    if (subject) {
      console.log(`🔄 Force refresh triggered for ${componentId}`);
      subject.next(true);
    }
  }

  /**
   * Met en pause ou reprend tous les rafraîchissements
   * @param paused État de pause
   */
  setPaused(paused: boolean): void {
    console.log(`${paused ? '⏸️ Pausing' : '▶️ Resuming'} all auto-refresh`);
    
    if (paused) {
      // Mettre en pause tous les timers
      for (const [componentId, timer] of this.refreshTimers.entries()) {
        clearTimeout(timer);
        this.refreshTimers.delete(componentId);
      }
    } else {
      // Reprendre tous les rafraîchissements avec config par défaut
      for (const componentId of this.refreshSubjects.keys()) {
        this.scheduleNextRefresh(componentId, this.DEFAULT_CONFIG);
      }
    }
  }

  /**
   * Obtient le statut actuel du service
   */
  getStatus(): {
    activeRefreshes: number;
    isPageVisible: boolean;
    isUserActive: boolean;
    lastActivity: Date;
  } {
    return {
      activeRefreshes: this.refreshSubjects.size,
      isPageVisible: this.isPageVisible,
      isUserActive: this.isUserActive,
      lastActivity: new Date(this.lastUserActivity)
    };
  }

  /**
   * Change la constante d'intervalle pour tous les rafraîchissements actifs
   * @param intervalMs Nouvel intervalle en millisecondes
   */
  updateGlobalInterval(intervalMs: number): void {
    console.log(`🔧 Updating global refresh interval to ${intervalMs / 1000}s`);
    
    // Mettre à jour la config par défaut
    (this.DEFAULT_CONFIG as any).intervalMs = intervalMs;
    
    // Redémarrer tous les timers avec le nouvel intervalle
    const activeComponents = Array.from(this.refreshSubjects.keys());
    for (const componentId of activeComponents) {
      const subject = this.refreshSubjects.get(componentId);
      if (subject) {
        // Arrêter et redémarrer avec le nouveau timing
        this.stopAutoRefresh(componentId);
        this.refreshSubjects.set(componentId, subject);
        this.scheduleNextRefresh(componentId, this.DEFAULT_CONFIG);
      }
    }
  }

  private scheduleNextRefresh(componentId: string, config: AutoRefreshConfig): void {
    // Vérifier si on doit mettre en pause
    if ((config.pauseOnHidden && !this.isPageVisible) ||
        (config.pauseOnInactive && !this.isUserActive)) {
      console.log(`⏸️ [DEBUG] Refresh paused for ${componentId} (hidden: ${!this.isPageVisible}, inactive: ${!this.isUserActive})`);
      return;
    }
    
    console.log(`⏰ [DEBUG] Programming next refresh for ${componentId} in ${config.intervalMs}ms`);
    
    const timer = setTimeout(() => {
      const subject = this.refreshSubjects.get(componentId);
      if (subject) {
        console.log(`🔄 [DEBUG] Auto-refresh triggered for ${componentId}`);
        subject.next(true);
        // Programmer le prochain rafraîchissement
        this.scheduleNextRefresh(componentId, config);
      }
    }, config.intervalMs);
    
    this.refreshTimers.set(componentId, timer);
  }

  private initializeGlobalListeners(): void {
    if (typeof document !== 'undefined') {
      // Écouter la visibilité de la page
      this.visibilityListener = () => {
        const wasVisible = this.isPageVisible;
        this.isPageVisible = !document.hidden;
        
        if (wasVisible !== this.isPageVisible) {
          console.log(`👁️ Page visibility changed: ${this.isPageVisible ? 'visible' : 'hidden'}`);
          this.handleVisibilityChange();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityListener);
      
      // Écouter l'activité utilisateur depuis la config
      const activityEvents = REFRESH_CONFIG.USER_ACTIVITY_EVENTS;
      
      const handleUserActivity = () => {
        const wasActive = this.isUserActive;
        this.lastUserActivity = Date.now();
        this.isUserActive = true;
        
        if (!wasActive) {
          console.log('🔋 User became active');
          this.handleActivityChange();
        }
      };
      
      // Ajouter les listeners d'activité avec debounce
      for (const event of activityEvents) {
        const listener = () => handleUserActivity();
        document.addEventListener(event, listener, { passive: true });
        this.activityListeners.push(() => document.removeEventListener(event, listener));
      }
      
      // Vérifier périodiquement l'inactivité
      setInterval(() => {
        const inactiveTime = Date.now() - this.lastUserActivity;
        const wasActive = this.isUserActive;
        this.isUserActive = inactiveTime < this.DEFAULT_CONFIG.inactivityTimeoutMs;
        
        if (wasActive !== this.isUserActive && !this.isUserActive) {
          console.log('😴 User became inactive');
          this.handleActivityChange();
        }
      }, REFRESH_CONFIG.INACTIVITY_CHECK_INTERVAL_MS);
    }
  }

  private handleVisibilityChange(): void {
    if (this.isPageVisible) {
      // Page redevenue visible, reprendre tous les rafraîchissements avec leurs configs originales
      for (const componentId of this.refreshSubjects.keys()) {
        const config = this.refreshConfigs.get(componentId) || this.DEFAULT_CONFIG;
        this.scheduleNextRefresh(componentId, config);
      }
    } else {
      // Page cachée, arrêter tous les timers
      for (const [componentId, timer] of this.refreshTimers.entries()) {
        clearTimeout(timer);
        this.refreshTimers.delete(componentId);
      }
    }
  }

  private handleActivityChange(): void {
    if (this.isUserActive) {
      // Utilisateur redevenu actif, reprendre les rafraîchissements avec leurs configs originales
      for (const componentId of this.refreshSubjects.keys()) {
        const config = this.refreshConfigs.get(componentId) || this.DEFAULT_CONFIG;
        this.scheduleNextRefresh(componentId, config);
      }
    } else {
      // Utilisateur inactif, mettre en pause
      for (const [componentId, timer] of this.refreshTimers.entries()) {
        clearTimeout(timer);
        this.refreshTimers.delete(componentId);
      }
    }
  }

  ngOnDestroy(): void {
    console.log('🧹 AutoRefreshService cleanup');
    
    // Arrêter tous les rafraîchissements
    for (const componentId of this.refreshSubjects.keys()) {
      this.stopAutoRefresh(componentId);
    }
    
    // Nettoyer les listeners globaux
    if (this.visibilityListener) {
      document?.removeEventListener('visibilitychange', this.visibilityListener);
    }
    
    for (const removeListener of this.activityListeners) {
      removeListener();
    }
    
    this.activityListeners = [];
  }
}