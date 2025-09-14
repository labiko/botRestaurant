import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AudioNotificationService, AudioSettings } from '../../../../../core/services/audio-notification.service';
import { AuthFranceService } from '../../../auth-france/services/auth-france.service';
import { FuseauHoraireService } from '../../../../../core/services/fuseau-horaire.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-notifications-config',
  templateUrl: './audio-notifications-config.component.html',
  styleUrls: ['./audio-notifications-config.component.scss'],
  standalone: false
})
export class AudioNotificationsConfigComponent implements OnInit, OnDestroy {

  audioSettings: AudioSettings | null = null;
  isLoading: boolean = true;
  isTestingSound: boolean = false;
  formattedEnabledSince: string = '';
  private restaurantId: number = 1; // TODO: Récupérer depuis AuthService
  private subscriptions: Subscription[] = [];

  constructor(
    private audioNotificationService: AudioNotificationService,
    private authService: AuthFranceService,
    private toastController: ToastController,
    private fuseauHoraireService: FuseauHoraireService
  ) { }

  ngOnInit() {
    this.loadAudioSettings();
    this.audioNotificationService.setCurrentRestaurant(this.restaurantId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Charger les paramètres audio du restaurant
   */
  async loadAudioSettings(): Promise<void> {
    this.isLoading = true;
    
    const subscription = this.audioNotificationService.getAudioSettings(this.restaurantId)
      .subscribe({
        next: async (settings) => {
          this.audioSettings = settings;
          
          // Formater le timestamp une seule fois
          if (settings?.audio_enabled_since) {
            this.formattedEnabledSince = await this.formatTimestamp(settings.audio_enabled_since);
          } else {
            this.formattedEnabledSince = '';
          }
          
          this.isLoading = false;
          
          if (!settings) {
            this.presentToast('Erreur lors du chargement des paramètres', 'danger');
          }
        },
        error: (error) => {
          console.error('[AudioConfig] Erreur chargement paramètres:', error);
          this.isLoading = false;
          this.presentToast('Erreur de connexion', 'danger');
        }
      });
    
    this.subscriptions.push(subscription);
  }

  /**
   * Activer/désactiver les notifications audio
   */
  async toggleAudioNotifications(event: any): Promise<void> {
    const enabled = event.detail.checked;
    
    try {
      let subscription: Subscription;
      
      if (enabled) {
        subscription = this.audioNotificationService.enableAudioNotifications(this.restaurantId)
          .subscribe({
            next: () => {
              this.presentToast('Notifications audio activées', 'success');
              this.loadAudioSettings(); // Recharger pour avoir le timestamp formaté
            },
            error: (error) => {
              console.error('[AudioConfig] Erreur activation:', error);
              this.presentToast('Erreur lors de l\'activation', 'danger');
              // Revert toggle
              if (this.audioSettings) {
                this.audioSettings.audio_notifications_enabled = false;
              }
            }
          });
      } else {
        subscription = this.audioNotificationService.disableAudioNotifications(this.restaurantId)
          .subscribe({
            next: () => {
              this.presentToast('Notifications audio désactivées', 'warning');
              this.loadAudioSettings(); // Recharger pour mettre à jour l'UI
            },
            error: (error) => {
              console.error('[AudioConfig] Erreur désactivation:', error);
              this.presentToast('Erreur lors de la désactivation', 'danger');
              // Revert toggle
              if (this.audioSettings) {
                this.audioSettings.audio_notifications_enabled = true;
              }
            }
          });
      }
      
      this.subscriptions.push(subscription);
      
    } catch (error) {
      console.error('[AudioConfig] Erreur toggle notifications:', error);
      this.presentToast('Erreur inattendue', 'danger');
    }
  }

  /**
   * Modifier le volume
   */
  async onVolumeChange(event: any): Promise<void> {
    const volume = event.detail.value;
    
    // Mise à jour immédiate de l'UI
    if (this.audioSettings) {
      this.audioSettings.audio_volume = volume;
    }
    
    // Sauvegarde en base (debounced)
    const subscription = this.audioNotificationService.updateAudioVolume(this.restaurantId, volume)
      .subscribe({
        next: () => {
          console.log('[AudioConfig] Volume mis à jour:', volume);
        },
        error: (error) => {
          console.error('[AudioConfig] Erreur mise à jour volume:', error);
          this.presentToast('Erreur sauvegarde volume', 'danger');
        }
      });
    
    this.subscriptions.push(subscription);
  }

  /**
   * Tester le son
   */
  async testSound(): Promise<void> {
    if (this.isTestingSound) {
      return;
    }
    
    this.isTestingSound = true;
    
    try {
      const success = await this.audioNotificationService.testSound();
      
      if (success) {
        this.presentToast('Test réussi ! 🔊', 'success');
      } else {
        this.presentToast('Impossible de jouer le son', 'warning');
      }
      
    } catch (error) {
      console.error('[AudioConfig] Erreur test son:', error);
      this.presentToast('Erreur lors du test', 'danger');
    } finally {
      // Reset après 3 secondes (durée approximative du son + marge)
      setTimeout(() => {
        this.isTestingSound = false;
      }, 3000);
    }
  }

  /**
   * Formater le volume pour le slider
   */
  volumeFormatter = (value: number) => {
    return `${value}%`;
  }

  /**
   * Formater un timestamp pour affichage
   */
  async formatTimestamp(timestamp: string): Promise<string> {
    try {
      // Récupérer le fuseau du restaurant
      const timezone = await this.fuseauHoraireService.getRestaurantTimezone(this.restaurantId);
      
      // Formater le timestamp selon le fuseau du restaurant
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR', {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  /**
   * Afficher un toast
   */
  private async presentToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }
}