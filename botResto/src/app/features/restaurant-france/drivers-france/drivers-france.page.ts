import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../auth-france/services/auth-france.service';
import { DriversFranceService, FranceDriver, CreateDriverRequest } from '../../../core/services/drivers-france.service';

@Component({
  selector: 'app-drivers-france',
  templateUrl: './drivers-france.page.html',
  styleUrls: ['./drivers-france.page.scss'],
  standalone: false
})
export class DriversFrancePage implements OnInit, OnDestroy {
  currentUser: FranceUser | null = null;
  drivers: FranceDriver[] = [];
  isLoading = false;
  
  private userSubscription?: Subscription;
  private driversSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private driversFranceService: DriversFranceService,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initializePage();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.driversSubscription) {
      this.driversSubscription.unsubscribe();
    }
  }

  /**
   * Initialisation de la page
   */
  private initializePage() {
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.type === 'restaurant') {
        this.loadDrivers();
      }
    });

    this.driversSubscription = this.driversFranceService.drivers$.subscribe(drivers => {
      this.drivers = drivers;
    });
  }

  /**
   * Charger les livreurs
   */
  private async loadDrivers() {
    if (!this.currentUser) return;

    this.isLoading = true;
    try {
      await this.driversFranceService.loadDrivers(this.currentUser.restaurantId);
    } catch (error) {
      console.error('Erreur chargement livreurs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Ajouter un nouveau livreur
   */
  async addDriver() {
    const alert = await this.alertController.create({
      header: 'Ajouter un livreur',
      inputs: [
        {
          name: 'first_name',
          type: 'text',
          placeholder: 'Prénom',
          attributes: {
            required: true
          }
        },
        {
          name: 'last_name',
          type: 'text',
          placeholder: 'Nom',
          attributes: {
            required: true
          }
        },
        {
          name: 'phone_number',
          type: 'tel',
          placeholder: 'Téléphone (ex: 33612345678)',
          attributes: {
            required: true
          }
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email (optionnel)'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Mot de passe',
          attributes: {
            required: true,
            minlength: 6
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ajouter',
          handler: async (data) => {
            if (this.validateDriverData(data)) {
              await this.createDriver(data);
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Valider les données du livreur
   */
  private validateDriverData(data: any): boolean {
    if (!data.first_name?.trim() || !data.last_name?.trim()) {
      this.showError('Le prénom et le nom sont obligatoires');
      return false;
    }

    if (!data.phone_number?.trim()) {
      this.showError('Le numéro de téléphone est obligatoire');
      return false;
    }

    if (!data.password || data.password.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    // Validation format téléphone français
    const phoneRegex = /^33[67]\d{8}$/;
    if (!phoneRegex.test(data.phone_number.replace(/\s+/g, ''))) {
      this.showError('Format de téléphone invalide. Utilisez le format: 33612345678');
      return false;
    }

    return true;
  }

  /**
   * Créer un livreur
   */
  private async createDriver(data: CreateDriverRequest) {
    if (!this.currentUser) return;

    const success = await this.driversFranceService.createDriver(
      this.currentUser.restaurantId,
      {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone_number: data.phone_number.replace(/\s+/g, ''),
        email: data.email?.trim() || undefined,
        password: data.password
      }
    );

    if (success) {
      this.showSuccess('Livreur ajouté avec succès');
    } else {
      this.showError('Erreur lors de l\'ajout du livreur');
    }
  }

  /**
   * Changer le statut d'un livreur
   */
  async toggleDriverStatus(driver: FranceDriver) {
    const newStatus = !driver.is_active;
    const action = newStatus ? 'activer' : 'désactiver';
    
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Voulez-vous ${action} ${this.getDriverFullName(driver)} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: async () => {
            const success = await this.driversFranceService.updateDriverStatus(driver.id, newStatus);
            if (success) {
              driver.is_active = newStatus;
              this.showSuccess(`Statut mis à jour avec succès`);
            } else {
              this.showError('Erreur lors de la mise à jour');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Supprimer un livreur
   */
  async deleteDriver(driver: FranceDriver) {
    const alert = await this.alertController.create({
      header: 'Supprimer le livreur',
      message: `Êtes-vous sûr de vouloir supprimer ${this.getDriverFullName(driver)} ? Cette action est irréversible.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            const success = await this.driversFranceService.deleteDriver(driver.id);
            if (success) {
              await this.loadDrivers(); // Recharger la liste
              this.showSuccess('Livreur supprimé avec succès');
            } else {
              this.showError('Erreur lors de la suppression');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Retour au dashboard
   */
  goBack() {
    this.router.navigate(['/restaurant-france/dashboard-france']);
  }

  /**
   * Helpers
   */
  getDriverFullName(driver: FranceDriver): string {
    return this.driversFranceService.getDriverFullName(driver);
  }

  getStatusColor(isActive: boolean): string {
    return this.driversFranceService.getStatusColor(isActive);
  }

  getStatusText(isActive: boolean): string {
    return this.driversFranceService.getStatusText(isActive);
  }

  formatPhone(phone: string): string {
    return this.driversFranceService.formatPhone(phone);
  }

  getActiveDriversCount(): number {
    return this.drivers.filter(d => d.is_active).length;
  }

  getInactiveDriversCount(): number {
    return this.drivers.filter(d => !d.is_active).length;
  }

  private async showSuccess(message: string) {
    const alert = await this.alertController.create({
      header: 'Succès',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Erreur',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
