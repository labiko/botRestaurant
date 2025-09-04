import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../auth-france/services/auth-france.service';
import { DriversFranceService, FranceDriver, CreateDriverRequest } from '../../../core/services/drivers-france.service';
import { AddDriverModalComponent, DriverFormData } from './add-driver-modal/add-driver-modal.component';

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
    private modalController: ModalController,
    private toastController: ToastController
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
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentUser = user;
        if (user && user.type === 'restaurant') {
          this.loadDrivers();
        }
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
   * Ajouter un nouveau livreur avec modale moderne
   */
  async addDriver() {
    const modal = await this.modalController.create({
      component: AddDriverModalComponent,
      cssClass: 'add-driver-modal',
      backdropDismiss: false,
      showBackdrop: true
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      await this.createDriver(data);
    }
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
  private async createDriver(data: DriverFormData) {
    if (!this.currentUser) return;

    const success = await this.driversFranceService.createDriver(
      this.currentUser.restaurantId,
      {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        email: data.email,
        password: data.password
      }
    );

    if (success) {
      await this.showToast('🎉 Livreur créé avec succès !', 'success');
      await this.loadDrivers(); // Recharger la liste
    } else {
      await this.showToast('❌ Erreur lors de la création du livreur', 'danger');
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

  /**
   * Afficher un toast moderne
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async showSuccess(message: string) {
    await this.showToast(message, 'success');
  }

  private async showError(message: string) {
    await this.showToast(message, 'danger');
  }
}
