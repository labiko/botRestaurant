import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RestaurantConfigService } from '../../../services/restaurant-config.service';
import { ServiceModesService } from '../../../services/service-modes.service';

export interface ServiceMode {
  id?: number;
  restaurant_id: number;
  service_mode: 'sur_place' | 'a_emporter' | 'livraison';
  is_enabled: boolean;
  display_name: string;
  description?: string;
  display_order: number;
  config?: any;
}

@Component({
  selector: 'app-service-modes',
  templateUrl: './service-modes.component.html',
  styleUrls: ['./service-modes.component.scss'],
  standalone: false
})
export class ServiceModesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  serviceModes: ServiceMode[] = [];
  isLoading = false;
  
  // Restaurant delivery configuration
  deliveryZoneKm: number = 5;
  deliveryFee: number = 2.50;
  minOrderAmount: number = 0;
  
  // Mock restaurant ID - should come from auth service
  restaurantId = 1;

  constructor(
    private fb: FormBuilder,
    private restaurantConfigService: RestaurantConfigService,
    private serviceModesService: ServiceModesService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadServiceModes();
    this.loadRestaurantConfig();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadServiceModes() {
    const loading = await this.loadingController.create({
      message: 'Chargement des modes de service...'
    });
    await loading.present();

    try {
      // Check if service modes exist for this restaurant
      const hasServiceModes = await this.serviceModesService.hasServiceModes(this.restaurantId).toPromise();
      
      if (!hasServiceModes) {
        // Initialize default service modes if none exist
        await this.serviceModesService.initializeDefaultServiceModes(this.restaurantId).toPromise();
      }
      
      // Load service modes from database
      this.serviceModesService.getServiceModes(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (modes) => {
            this.serviceModes = modes.map(mode => ({
              ...mode,
              description: this.getDefaultDescription(mode.service_mode)
            }));
          },
          error: (error) => {
            console.error('Error loading service modes:', error);
            this.presentToast('Erreur lors du chargement des modes de service', 'danger');
          }
        });
    } catch (error) {
      console.error('Error loading service modes:', error);
      this.presentToast('Erreur lors du chargement des modes de service', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  private getDefaultDescription(serviceMode: string): string {
    switch (serviceMode) {
      case 'sur_place':
        return 'Service à table dans le restaurant';
      case 'a_emporter':
        return 'Commande à récupérer au restaurant';
      case 'livraison':
        return 'Livraison à domicile';
      default:
        return '';
    }
  }

  async toggleMode(mode: ServiceMode) {
    const alert = await this.alertController.create({
      header: `${mode.is_enabled ? 'Désactiver' : 'Activer'} le mode`,
      message: `Voulez-vous ${mode.is_enabled ? 'désactiver' : 'activer'} le mode "${mode.display_name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Mise à jour...'
            });
            await loading.present();

            try {
              const newStatus = !mode.is_enabled;
              await this.serviceModesService.updateServiceModeStatus(
                this.restaurantId, 
                mode.service_mode, 
                newStatus
              ).toPromise();
              
              mode.is_enabled = newStatus;
              await this.presentToast(
                `Mode "${mode.display_name}" ${mode.is_enabled ? 'activé' : 'désactivé'}`,
                'success'
              );
            } catch (error) {
              mode.is_enabled = !mode.is_enabled; // Revert on error
              console.error('Error updating service mode:', error);
              await this.presentToast('Erreur lors de la mise à jour', 'danger');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editModeDetails(mode: ServiceMode) {
    const alert = await this.alertController.create({
      header: `Modifier "${mode.display_name}"`,
      inputs: [
        {
          name: 'display_name',
          type: 'text',
          placeholder: 'Nom d\'affichage',
          value: mode.display_name
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description (optionnelle)',
          value: mode.description || ''
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Sauvegarder',
          handler: async (data) => {
            if (data.display_name.trim()) {
              const loading = await this.loadingController.create({
                message: 'Sauvegarde...'
              });
              await loading.present();

              try {
                await this.serviceModesService.updateServiceModeDisplayName(
                  this.restaurantId,
                  mode.service_mode,
                  data.display_name.trim()
                ).toPromise();
                
                mode.display_name = data.display_name.trim();
                mode.description = data.description.trim();
                await this.presentToast('Mode mis à jour', 'success');
              } catch (error) {
                console.error('Error updating mode details:', error);
                await this.presentToast('Erreur lors de la mise à jour', 'danger');
              } finally {
                loading.dismiss();
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getModeIcon(serviceMode: string): string {
    switch (serviceMode) {
      case 'sur_place':
        return 'restaurant';
      case 'a_emporter':
        return 'bag-handle';
      case 'livraison':
        return 'car';
      default:
        return 'help-circle';
    }
  }

  getModeColor(serviceMode: string): string {
    switch (serviceMode) {
      case 'sur_place':
        return 'primary';
      case 'a_emporter':
        return 'warning';
      case 'livraison':
        return 'success';
      default:
        return 'medium';
    }
  }

  private loadRestaurantConfig() {
    this.restaurantConfigService.getRestaurantConfig(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.deliveryZoneKm = config.delivery_zone_km || 5;
          this.deliveryFee = config.delivery_fee || 2.50;
          this.minOrderAmount = config.min_order_amount || 0;
        },
        error: (error) => {
          console.error('Error loading restaurant config:', error);
        }
      });
  }

  async editDeliveryConfig() {
    const alert = await this.alertController.create({
      header: 'Configuration Livraison',
      inputs: [
        {
          name: 'delivery_zone_km',
          type: 'number',
          placeholder: 'Zone de livraison (km)',
          value: this.deliveryZoneKm,
          min: 1,
          max: 50
        },
        {
          name: 'delivery_fee',
          type: 'number',
          placeholder: 'Frais de livraison (€)',
          value: this.deliveryFee,
          min: 0
        },
        {
          name: 'min_order_amount',
          type: 'number',
          placeholder: 'Commande minimum (€)',
          value: this.minOrderAmount,
          min: 0
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Sauvegarder',
          handler: async (data) => {
            if (data.delivery_zone_km > 0) {
              const loading = await this.loadingController.create({
                message: 'Mise à jour de la configuration...'
              });
              await loading.present();

              try {
                const deliveryConfig = {
                  delivery_zone_km: parseInt(data.delivery_zone_km),
                  delivery_fee: parseFloat(data.delivery_fee),
                  min_order_amount: parseFloat(data.min_order_amount)
                };

                await this.restaurantConfigService.updateDeliveryConfig(this.restaurantId, deliveryConfig).toPromise();

                // Update local values
                this.deliveryZoneKm = deliveryConfig.delivery_zone_km;
                this.deliveryFee = deliveryConfig.delivery_fee;
                this.minOrderAmount = deliveryConfig.min_order_amount;

                await this.presentToast('Configuration de livraison mise à jour', 'success');
                return true;
              } catch (error) {
                console.error('Error updating delivery config:', error);
                await this.presentToast('Erreur lors de la mise à jour', 'danger');
                return false;
              } finally {
                loading.dismiss();
              }
            } else {
              await this.presentToast('La zone de livraison doit être supérieure à 0 km', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}