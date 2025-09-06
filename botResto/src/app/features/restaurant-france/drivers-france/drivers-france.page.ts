import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../auth-france/services/auth-france.service';
import { DriversFranceService, FranceDriver, CreateDriverRequest } from '../../../core/services/drivers-france.service';
import { AddDriverModalComponent, DriverFormData } from './add-driver-modal/add-driver-modal.component';
import { DriverStatusManagementService, StatusChangeResult } from '../../../core/services/driver-status-management.service';

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
    private driverStatusManagementService: DriverStatusManagementService,
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

    // Validation format téléphone français (06 ou 07)
    const phoneRegex = /^(06|07)\d{8}$/;
    if (!phoneRegex.test(data.phone_number.replace(/\s+/g, ''))) {
      this.showError('Format de téléphone invalide. Utilisez le format: 0612345678');
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
        access_code: data.access_code,
        is_online: data.is_online,
        is_active: data.is_active
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
   * Changer le statut d'un livreur via le service dédié
   */
  async toggleDriverStatus(driver: FranceDriver) {
    const newStatus = !driver.is_active;
    const action = newStatus ? 'activer' : 'désactiver';
    
    try {
      // 1. Validation préalable via le service
      const validation = await this.driverStatusManagementService.validateStatusChange(driver.id, newStatus);
      
      if (!validation.canChangeStatus) {
        await this.showToast(validation.reason || 'Changement impossible', 'warning');
        return;
      }

      // 2. Afficher la confirmation avec le message d'impact du service
      const impactMessage = this.driverStatusManagementService.generateImpactMessage(newStatus, validation.warnings);
      
      const alert = await this.alertController.create({
        header: `${action.charAt(0).toUpperCase() + action.slice(1)} le livreur`,
        message: `${this.getDriverFullName(driver)}

${impactMessage.replace(/<[^>]*>/g, '').replace('⚠️', '⚠️ ATTENTION:')}`,
        cssClass: 'custom-alert-driver-status',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          },
          {
            text: this.driverStatusManagementService.getActionButtonText(driver.is_active),
            cssClass: newStatus ? 'alert-button-success' : 'alert-button-warning',
            handler: async () => {
              await this.executeStatusChange(driver, newStatus);
            }
          }
        ]
      });

      await alert.present();

    } catch (error) {
      console.error('❌ [DriversPage] Erreur toggle status:', error);
      await this.showToast('Erreur lors de la préparation du changement', 'danger');
    }
  }

  /**
   * Exécuter le changement de statut via le service
   */
  private async executeStatusChange(driver: FranceDriver, newStatus: boolean) {
    try {
      const result: StatusChangeResult = await this.driverStatusManagementService.changeDriverStatus(driver.id, newStatus);
      
      if (result.success) {
        // Mise à jour locale immédiate
        driver.is_active = newStatus;
        
        // Message de succès
        const statusText = newStatus ? 'activé' : 'désactivé';
        await this.showToast(`${this.getDriverFullName(driver)} ${statusText} avec succès`, 'success');
        
        // Recharger les données pour synchroniser
        await this.loadDrivers();
      } else {
        await this.showToast(result.message, 'danger');
      }
    } catch (error) {
      console.error('❌ [DriversPage] Erreur exécution changement:', error);
      await this.showToast('Erreur lors du changement de statut', 'danger');
    }
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
    return this.driverStatusManagementService.getStatusDisplayColor(isActive);
  }

  getStatusText(isActive: boolean): string {
    return this.driverStatusManagementService.getStatusDisplayText(isActive);
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

  getOnlineDriversCount(): number {
    return this.drivers.filter(d => d.is_active && d.is_online).length;
  }

  /**
   * Toggle du statut en ligne d'un livreur
   */
  async toggleDriverOnlineStatus(driver: FranceDriver) {
    if (!driver.is_active) {
      await this.showToast('Le livreur doit être actif pour être mis en ligne', 'warning');
      return;
    }

    const newOnlineStatus = !driver.is_online;
    const success = await this.driversFranceService.updateDriverOnlineStatus(driver.id, newOnlineStatus);
    
    if (success) {
      driver.is_online = newOnlineStatus;
      const statusText = newOnlineStatus ? 'mis en ligne' : 'mis hors ligne';
      await this.showToast(`${this.getDriverFullName(driver)} ${statusText}`, 'success');
      await this.loadDrivers(); // Recharger pour synchroniser
    } else {
      await this.showToast('Erreur lors de la mise à jour du statut', 'danger');
    }
  }

  /**
   * Couleur du badge statut en ligne
   */
  getOnlineStatusColor(isOnline: boolean | undefined): string {
    return isOnline ? 'primary' : 'medium';
  }

  /**
   * Texte du badge statut en ligne
   */
  getOnlineStatusText(isOnline: boolean | undefined): string {
    return isOnline ? 'En ligne' : 'Hors ligne';
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

  /**
   * Refresh manuel via bouton header
   */
  async manualRefresh() {
    console.log('🔄 [DriversFrance] Refresh manuel déclenché');
    
    if (this.isLoading) return; // Éviter double refresh
    
    try {
      if (this.currentUser && this.currentUser.restaurantId) {
        await this.loadDrivers();
        await this.showToast('✅ Données actualisées', 'success');
        console.log('✅ [DriversFrance] Refresh manuel réussi');
      }
    } catch (error) {
      console.error('❌ [DriversFrance] Erreur refresh manuel:', error);
      await this.showToast('❌ Erreur lors de l\'actualisation', 'danger');
    }
  }

  /**
   * Pull to refresh - Actualiser les données
   */
  async doRefresh(event: any) {
    console.log('🔄 [DriversFrance] Pull to refresh déclenché');
    
    try {
      if (this.currentUser && this.currentUser.restaurantId) {
        await this.loadDrivers();
        console.log('✅ [DriversFrance] Données actualisées avec succès');
      }
    } catch (error) {
      console.error('❌ [DriversFrance] Erreur lors de l\'actualisation:', error);
    } finally {
      // Terminer l'animation de refresh après un court délai
      setTimeout(() => {
        event.target.complete();
      }, 500);
    }
  }
}
