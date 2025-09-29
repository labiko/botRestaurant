import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  DeliveryManagementService,
  DeliveryDriver,
  FranceOrder,
  DeliveryAssignment
} from '../../../services/delivery-management.service';

import { RestaurantConfigService } from '../../../services/restaurant-config.service';
import { AuthFranceService } from '../../../auth-france/services/auth-france.service';

@Component({
  selector: 'app-delivery-config',
  templateUrl: './delivery-config.component.html',
  styleUrls: ['./delivery-config.component.scss'],
  standalone: false
})
export class DeliveryConfigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  deliveryForm!: FormGroup;
  drivers: DeliveryDriver[] = [];
  availableDrivers: DeliveryDriver[] = [];
  pendingOrders: FranceOrder[] = [];
  recentAssignments: DeliveryAssignment[] = [];
  
  isLoading = false;

  restaurantId: number;

  // Delivery zones - to be loaded from database
  deliveryZones: any[] = [];

  constructor(
    private fb: FormBuilder,
    private deliveryService: DeliveryManagementService,
    private restaurantConfigService: RestaurantConfigService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authFranceService: AuthFranceService
  ) {
    // Récupérer l'ID du restaurant depuis la session
    const id = this.authFranceService.getCurrentRestaurantId();
    if (id === null) {
      console.error('❌ [DeliveryConfig] Impossible de récupérer restaurant ID - utilisateur non connecté');
      throw new Error('Restaurant ID requis - utilisateur non connecté');
    }
    this.restaurantId = id;

    this.initializeForm();
  }

  ngOnInit() {
    this.loadDeliveryData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.deliveryForm = this.fb.group({
      delivery_zone_km: [5, [Validators.required, Validators.min(1)]],
      min_order_amount: [15, [Validators.required, Validators.min(0)]],
      delivery_fee: [2.50, [Validators.required, Validators.min(0)]],
      delivery_enabled: [true],
      delivery_address_mode: ['address'] // NOUVEAU: Valeur par défaut 'address'
    });
  }

  private async loadDeliveryData() {
    const loading = await this.loadingController.create({
      message: 'Chargement des données de livraison...'
    });
    await loading.present();

    try {
      // Load restaurant delivery config
      this.restaurantConfigService.getRestaurantConfig(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (config) => {
            this.deliveryForm.patchValue({
              delivery_zone_km: config.delivery_zone_km,
              min_order_amount: config.min_order_amount,
              delivery_fee: config.delivery_fee,
              delivery_address_mode: config.delivery_address_mode || 'address' // NOUVEAU
            });
          },
          error: (error) => {
            console.error('Error loading restaurant config:', error);
            this.presentToast('Erreur lors du chargement de la configuration', 'danger');
          }
        });

      // Load drivers
      this.deliveryService.getDeliveryDrivers(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (drivers) => {
            this.drivers = drivers;
          },
          error: (error) => {
            console.error('Error loading drivers:', error);
            this.presentToast('Erreur lors du chargement des livreurs', 'danger');
          }
        });

      // Load available drivers
      this.deliveryService.getAvailableDrivers(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (drivers) => {
            this.availableDrivers = drivers;
          },
          error: (error) => {
            console.error('Error loading available drivers:', error);
          }
        });

      // Load pending delivery orders
      this.deliveryService.getPendingDeliveryOrders(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (orders) => {
            this.pendingOrders = orders;
          },
          error: (error) => {
            console.error('Error loading pending orders:', error);
            this.presentToast('Erreur lors du chargement des commandes', 'danger');
          }
        });

      // Load recent assignments
      this.deliveryService.getDeliveryAssignments(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (assignments) => {
            this.recentAssignments = assignments.slice(0, 5); // Show only recent 5
          },
          error: (error) => {
            console.error('Error loading assignments:', error);
          }
        });

    } finally {
      loading.dismiss();
    }
  }

  async onSaveDeliveryConfig() {
    if (this.deliveryForm.invalid) {
      this.presentToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sauvegarde de la configuration...'
    });
    await loading.present();

    try {
      const formValues = this.deliveryForm.value;

      // NOUVEAU: Mise à jour du mode de collecte d'adresse
      if (formValues.delivery_address_mode) {
        await this.restaurantConfigService.updateDeliveryAddressMode(
          this.restaurantId,
          formValues.delivery_address_mode
        ).toPromise();
      }

      this.presentToast('Configuration de livraison sauvegardée', 'success');
    } catch (error) {
      console.error('Error saving delivery config:', error);
      this.presentToast('Erreur lors de la sauvegarde', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async onCreateDriver() {
    const alert = await this.alertController.create({
      header: 'Nouveau Livreur',
      inputs: [
        {
          name: 'firstName',
          type: 'text',
          placeholder: 'Prénom *',
          attributes: { required: true }
        },
        {
          name: 'lastName',
          type: 'text',
          placeholder: 'Nom *',
          attributes: { required: true }
        },
        {
          name: 'phoneNumber',
          type: 'tel',
          placeholder: 'Téléphone (ex: 0612345678) *',
          attributes: { required: true }
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Créer',
          handler: (data) => {
            if (data.firstName && data.lastName && data.phoneNumber) {
              const newDriver: Omit<DeliveryDriver, 'id' | 'created_at' | 'updated_at'> = {
                restaurant_id: this.restaurantId,
                first_name: data.firstName,
                last_name: data.lastName,
                phone_number: data.phoneNumber,
                email: data.email || undefined,
                is_active: true,
                is_online: false,
                last_location_update: new Date().toISOString(),
                password: '000000' // Default password
              };

              this.deliveryService.createDeliveryDriver(newDriver)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (driver) => {
                    this.drivers.unshift(driver);
                    this.presentToast('Livreur créé avec succès', 'success');
                  },
                  error: (error) => {
                    console.error('Error creating driver:', error);
                    this.presentToast('Erreur lors de la création du livreur', 'danger');
                  }
                });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onToggleDriverStatus(driver: DeliveryDriver, field: 'is_active' | 'is_online') {
    const currentStatus = driver[field];
    const newStatus = !currentStatus;
    
    const statusText = field === 'is_active' ? 'statut' : 'connexion';
    const actionText = newStatus ? 'activer' : 'désactiver';
    
    const alert = await this.alertController.create({
      header: `Changer le ${statusText}`,
      message: `Voulez-vous ${actionText} ${field === 'is_active' ? 'le compte de' : 'la connexion de'} ${driver.first_name} ${driver.last_name} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            const updates: Partial<DeliveryDriver> = {};
            updates[field] = newStatus;
            
            this.deliveryService.updateDeliveryDriver(driver.id, updates)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  driver[field] = newStatus;
                  this.presentToast(
                    `${statusText} ${newStatus ? 'activé' : 'désactivé'}`, 
                    newStatus ? 'success' : 'warning'
                  );
                  
                  // Update available drivers list if needed
                  if (field === 'is_online' || field === 'is_active') {
                    this.updateAvailableDrivers();
                  }
                },
                error: (error) => {
                  console.error('Error updating driver status:', error);
                  this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async onAssignOrderToDriver(order: FranceOrder) {
    if (this.availableDrivers.length === 0) {
      this.presentToast('Aucun livreur disponible', 'warning');
      return;
    }

    const driverOptions = this.availableDrivers.map(driver => ({
      name: 'driverId',
      type: 'radio' as const,
      label: `${driver.first_name} ${driver.last_name}`,
      value: driver.id.toString()
    }));

    const alert = await this.alertController.create({
      header: 'Assigner la commande',
      message: `Commande #${order.order_number || order.id}`,
      inputs: driverOptions,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Assigner',
          handler: (driverId) => {
            if (driverId) {
              this.deliveryService.assignOrderToDriver(order.id, parseInt(driverId))
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    // Remove order from pending list
                    this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);
                    this.presentToast('Commande assignée avec succès', 'success');
                  },
                  error: (error) => {
                    console.error('Error assigning order:', error);
                    this.presentToast('Erreur lors de l\'assignation', 'danger');
                  }
                });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onAddDeliveryZone() {
    const alert = await this.alertController.create({
      header: 'Nouvelle Zone de Livraison',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nom de la zone *',
          attributes: { required: true }
        },
        {
          name: 'deliveryFee',
          type: 'number',
          placeholder: 'Frais de livraison (€) *',
          attributes: { required: true, step: '0.10' }
        },
        {
          name: 'minOrderAmount',
          type: 'number',
          placeholder: 'Commande minimum (€) *',
          attributes: { required: true, step: '0.10' }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ajouter',
          handler: (data) => {
            if (data.name && data.deliveryFee && data.minOrderAmount) {
              const newZone = {
                id: Math.max(...this.deliveryZones.map(z => z.id)) + 1,
                name: data.name,
                delivery_fee: parseFloat(data.deliveryFee),
                min_order_amount: parseFloat(data.minOrderAmount),
                is_active: true
              };
              
              this.deliveryZones.push(newZone);
              this.presentToast('Zone de livraison ajoutée', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  onToggleZoneStatus(zone: any) {
    zone.is_active = !zone.is_active;
    this.presentToast(
      `Zone ${zone.is_active ? 'activée' : 'désactivée'}`, 
      zone.is_active ? 'success' : 'warning'
    );
  }

  onRemoveZone(zone: any) {
    this.deliveryZones = this.deliveryZones.filter(z => z.id !== zone.id);
    this.presentToast('Zone supprimée', 'success');
  }

  private updateAvailableDrivers() {
    this.deliveryService.getAvailableDrivers(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (drivers) => {
          this.availableDrivers = drivers;
        },
        error: (error) => {
          console.error('Error updating available drivers:', error);
        }
      });
  }

  getDriverStatusColor(driver: DeliveryDriver): string {
    if (!driver.is_active) return 'danger';
    if (driver.is_online) return 'success';
    return 'warning';
  }

  getDriverStatusText(driver: DeliveryDriver): string {
    if (!driver.is_active) return 'Inactif';
    if (driver.is_online) return 'En ligne';
    return 'Hors ligne';
  }

  getOrderStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmee': 'success',
      'en_preparation': 'warning',
      'prete': 'primary',
      'en_livraison': 'secondary',
      'livree': 'success'
    };
    return colors[status] || 'medium';
  }

  getAssignmentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'accepted': 'success',
      'rejected': 'danger',
      'expired': 'medium'
    };
    return colors[status] || 'medium';
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