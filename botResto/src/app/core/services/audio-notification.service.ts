import { Injectable } from '@angular/core';
import { SupabaseFranceService } from './supabase-france.service';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { from, Observable, of, firstValueFrom } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

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
    console.log('🔊 [AudioNotification] Activation audio pour restaurant:', restaurantId);

    return from(
      (async () => {
        const timestamp = await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant();
        console.log('🔊 [AudioNotification] Timestamp généré:', timestamp);

        const result = await this.supabaseFranceService.client
          .from('france_restaurants')
          .update({
            audio_notifications_enabled: true,
            audio_enabled_since: timestamp
          })
          .eq('id', restaurantId);

        console.log('🔊 [AudioNotification] Résultat UPDATE:', result);

        return result;
      })()
    ).pipe(
      map(({ error, data }) => {
        if (error) {
          console.error('❌ [AudioNotification] Erreur UPDATE:', error);
          throw error;
        }
        console.log('✅ [AudioNotification] Audio activé avec succès pour restaurant', restaurantId);
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
      })
    );
  }

  /**
   * Jouer le son de nouvelle commande
   */
  async playNewOrderSound(): Promise<boolean> {
    try {
      if (!this.audioElement) {
        console.warn('[AudioNotification] Audio element non initialisé');
        return false;
      }

      // Réinitialiser le son au début
      this.audioElement.currentTime = 0;

      // Jouer le son (volume géré par le système utilisateur)
      await this.audioElement.play();

      return true;

    } catch (error) {
      console.error('[AudioNotification] Erreur lecture audio:', error);
      return false;
    }
  }

  /**
   * Tester le son (pour interface paramètres)
   */
  async testSound(): Promise<boolean> {
    return await this.playNewOrderSound();
  }

  /**
   * Vérifier et jouer le son pour nouvelles commandes
   * Méthode principale appelée par le système de refresh
   */
  checkAndPlayForNewOrders(restaurantId: number): Observable<number> {
    console.log('🔊 [AudioNotification] Vérification commandes pour restaurant:', restaurantId);

    // =========================================================================
    // VERSION ORIGINALE (RESTAURÉE) - Subscribe imbriqué
    // =========================================================================
    return this.getEligibleOrdersForSound(restaurantId).pipe(
      map((eligibleOrders) => {
        console.log('🔊 [AudioNotification] Commandes éligibles trouvées:', eligibleOrders.length, eligibleOrders);

        if (eligibleOrders.length === 0) {
          return 0;
        }

        // Subscribe imbriqué - structure originale qui fonctionnait
        this.getAudioSettings(restaurantId).subscribe(async (settings) => {
          console.log('🔊 [AudioNotification] Paramètres audio:', settings);

          if (!settings || !settings.audio_notifications_enabled) {
            console.log('⚠️ [AudioNotification] Audio désactivé ou paramètres manquants');
            return;
          }

          console.log('✅ [AudioNotification] Lecture du son pour', eligibleOrders.length, 'commande(s)');

          // Jouer le son pour chaque commande éligible
          for (const order of eligibleOrders) {
            console.log('🔊 [AudioNotification] Tentative lecture son pour commande:', order.id);
            const played = await this.playNewOrderSound();
            console.log('🔊 [AudioNotification] Son joué:', played);

            if (played) {
              // Marquer comme joué
              this.markOrderAsPlayed(order.id).subscribe(() => {
                console.log('✅ [AudioNotification] Commande', order.id, 'marquée comme jouée');
              });
            }
          }
        });

        return eligibleOrders.length;
      }),
      catchError(error => {
        console.error('❌ [AudioNotification] Erreur checkAndPlayForNewOrders:', error);
        return of(0);
      })
    );

    // =========================================================================
    // VERSION MODIFIÉE (COMMENTÉE) - switchMap + firstValueFrom
    // =========================================================================
    /*
    return this.getEligibleOrdersForSound(restaurantId).pipe(
      switchMap(eligibleOrders => {
        console.log('🔊 [AudioNotification] Commandes éligibles trouvées:', eligibleOrders.length, eligibleOrders);

        if (eligibleOrders.length === 0) {
          return of(0);
        }

        return this.getAudioSettings(restaurantId).pipe(
          switchMap(settings => {
            console.log('🔊 [AudioNotification] Paramètres audio:', settings);

            if (!settings || !settings.audio_notifications_enabled) {
              console.log('⚠️ [AudioNotification] Audio désactivé ou paramètres manquants');
              return of(0);
            }

            console.log('✅ [AudioNotification] Lecture du son pour', eligibleOrders.length, 'commande(s)');

            // Jouer et marquer toutes les commandes en parallèle
            const playPromises = eligibleOrders.map(async order => {
              console.log('🔊 [AudioNotification] Tentative lecture son pour commande:', order.id);
              const played = await this.playNewOrderSound();
              console.log('🔊 [AudioNotification] Son joué:', played);

              if (played) {
                await firstValueFrom(this.markOrderAsPlayed(order.id));
                console.log('✅ [AudioNotification] Commande', order.id, 'marquée comme jouée');
                return true;
              }
              return false;
            });

            return from(Promise.all(playPromises)).pipe(
              map(results => {
                const count = results.filter(r => r).length;
                console.log('🎵 [AudioNotification] Total sons joués:', count);
                return count;
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('❌ [AudioNotification] Erreur checkAndPlayForNewOrders:', error);
        return of(0);
      })
    );
    */
  }
}