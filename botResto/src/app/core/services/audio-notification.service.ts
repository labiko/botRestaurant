import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { from, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AudioSettings {
  audio_notifications_enabled: boolean;
  audio_volume: number;
  audio_enabled_since: string | null;
}

export interface EligibleOrder {
  id: number;
  restaurant_id: number;
  created_at: string;
  audio_played: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioNotificationService {

  private audioElement: HTMLAudioElement | null = null;
  private currentRestaurantId: number | null = null;

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private fuseauHoraireService: FuseauHoraireService
  ) {
    this.preloadAudio();
  }

  /**
   * Précharger le fichier audio pour éviter la latence
   */
  private preloadAudio(): void {
    try {
      this.audioElement = new Audio('assets/sounds/nouvelle-commande.wav');
      this.audioElement.preload = 'auto';
      this.audioElement.load();
    } catch (error) {
      console.error('[AudioNotification] Erreur préchargement audio:', error);
    }
  }

  /**
   * Définir le restaurant courant
   */
  setCurrentRestaurant(restaurantId: number): void {
    this.currentRestaurantId = restaurantId;
  }

  /**
   * Récupérer les paramètres audio du restaurant
   */
  getAudioSettings(restaurantId: number): Observable<AudioSettings | null> {
    return from(
      this.supabaseFranceService.client
        .from('france_restaurants')
        .select('audio_notifications_enabled, audio_volume, audio_enabled_since')
        .eq('id', restaurantId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('[AudioNotification] Erreur récupération paramètres:', error);
          return null;
        }
        return data as AudioSettings;
      }),
      catchError(error => {
        console.error('[AudioNotification] Erreur getAudioSettings:', error);
        return [null];
      })
    );
  }

  /**
   * Activer les notifications audio pour un restaurant
   */
  enableAudioNotifications(restaurantId: number): Observable<void> {
    return from(
      (async () => {
        const timestamp = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 0);
        return this.supabaseFranceService.client
          .from('france_restaurants')
          .update({
            audio_notifications_enabled: true,
            audio_enabled_since: timestamp
          })
          .eq('id', restaurantId);
      })()
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        console.log('[AudioNotification] Notifications audio activées pour restaurant:', restaurantId);
      })
    );
  }

  /**
   * Désactiver les notifications audio pour un restaurant
   */
  disableAudioNotifications(restaurantId: number): Observable<void> {
    return from(
      this.supabaseFranceService.client
        .from('france_restaurants')
        .update({
          audio_notifications_enabled: false,
          audio_enabled_since: null
        })
        .eq('id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        console.log('[AudioNotification] Notifications audio désactivées pour restaurant:', restaurantId);
      })
    );
  }

  /**
   * Mettre à jour le volume audio
   */
  updateAudioVolume(restaurantId: number, volume: number): Observable<void> {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    
    return from(
      this.supabaseFranceService.client
        .from('france_restaurants')
        .update({ audio_volume: clampedVolume })
        .eq('id', restaurantId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        console.log('[AudioNotification] Volume mis à jour:', clampedVolume);
      })
    );
  }

  /**
   * Récupérer les commandes éligibles pour notification audio
   */
  getEligibleOrdersForSound(restaurantId: number): Observable<EligibleOrder[]> {
    return from(
      this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          id,
          restaurant_id,
          created_at,
          audio_played,
          france_restaurants!inner(
            audio_notifications_enabled,
            audio_enabled_since
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('france_restaurants.audio_notifications_enabled', true)
        .eq('audio_played', false)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('[AudioNotification] Erreur récupération commandes éligibles:', error);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        // Filtrer selon audio_enabled_since
        return data.filter((order: any) => {
          const restaurant = order.france_restaurants;
          if (!restaurant.audio_enabled_since) return false;
          
          const orderTime = new Date(order.created_at);
          const enabledSince = new Date(restaurant.audio_enabled_since);
          
          return orderTime >= enabledSince;
        }).map((order: any) => ({
          id: order.id,
          restaurant_id: order.restaurant_id,
          created_at: order.created_at,
          audio_played: order.audio_played
        }));
      }),
      catchError(error => {
        console.error('[AudioNotification] Erreur getEligibleOrdersForSound:', error);
        return [[]];
      })
    );
  }

  /**
   * Marquer une commande comme ayant eu sa notification audio
   */
  markOrderAsPlayed(orderId: number): Observable<void> {
    return from(
      this.supabaseFranceService.client
        .from('france_orders')
        .update({ audio_played: true })
        .eq('id', orderId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        console.log('[AudioNotification] Commande marquée comme "sonnée":', orderId);
      })
    );
  }

  /**
   * Jouer le son de nouvelle commande
   */
  async playNewOrderSound(volume?: number): Promise<boolean> {
    try {
      if (!this.audioElement) {
        console.warn('[AudioNotification] Audio element non initialisé');
        return false;
      }

      // Réinitialiser le son au début
      this.audioElement.currentTime = 0;
      
      // Définir le volume (0.0 à 1.0)
      if (volume !== undefined) {
        this.audioElement.volume = Math.max(0, Math.min(1, volume / 100));
      }

      // Jouer le son
      await this.audioElement.play();
      console.log('[AudioNotification] Son joué avec succès');
      
      return true;
      
    } catch (error) {
      console.error('[AudioNotification] Erreur lecture audio:', error);
      return false;
    }
  }

  /**
   * Tester le son (pour interface paramètres)
   */
  async testSound(volume: number = 50): Promise<boolean> {
    console.log('[AudioNotification] Test du son avec volume:', volume);
    return await this.playNewOrderSound(volume);
  }

  /**
   * Vérifier et jouer le son pour nouvelles commandes
   * Méthode principale appelée par le système de refresh
   */
  checkAndPlayForNewOrders(restaurantId: number): Observable<number> {
    return this.getEligibleOrdersForSound(restaurantId).pipe(
      map(async (eligibleOrders) => {
        if (eligibleOrders.length === 0) {
          return 0;
        }

        // Récupérer les paramètres audio
        this.getAudioSettings(restaurantId).subscribe(async (settings) => {
          if (!settings || !settings.audio_notifications_enabled) {
            return;
          }

          // Jouer le son pour chaque commande éligible
          for (const order of eligibleOrders) {
            const played = await this.playNewOrderSound(settings.audio_volume);
            
            if (played) {
              // Marquer comme joué
              this.markOrderAsPlayed(order.id).subscribe();
            }
          }
        });

        return eligibleOrders.length;
      }),
      map((asyncResult) => {
        return 0; // Retourner 0 en attendant le traitement async
      }),
      catchError(error => {
        console.error('[AudioNotification] Erreur checkAndPlayForNewOrders:', error);
        return [0];
      })
    );
  }
}