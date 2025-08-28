import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DeliveryPasswordRecoveryService } from './delivery-password-recovery.service';
import { RestaurantPasswordRecoveryService } from './restaurant-password-recovery.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoveryUIService {

  constructor(
    private alertController: AlertController,
    private deliveryPasswordRecoveryService: DeliveryPasswordRecoveryService,
    private restaurantPasswordRecoveryService: RestaurantPasswordRecoveryService
  ) { }

  /**
   * Affiche la modal de récupération de code d'accès pour les livreurs
   */
  async showDeliveryPasswordRecovery(): Promise<void> {
    const alert = await this.alertController.create({
      header: '🔐 Code oublié ?',
      subHeader: '📱 Récupération rapide par WhatsApp',
      message: 'Saisissez votre numéro pour recevoir votre code d\'accès instantanément.',
      inputs: [
        {
          name: 'recoveryPhone',
          type: 'tel',
          placeholder: 'Numéro de téléphone',
          attributes: {
            maxlength: 15,
            autocomplete: 'tel',
            inputmode: 'numeric'
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'modern-cancel-button',
          handler: () => {
            console.log('Recovery cancelled');
          }
        },
        {
          text: '📤 Envoyer',
          cssClass: 'modern-confirm-button',
          handler: (data) => {
            if (data.recoveryPhone && data.recoveryPhone.trim()) {
              this.processDeliveryPasswordRecovery(data.recoveryPhone.trim());
              return true;
            } else {
              this.showErrorAlert('📱 Numéro manquant', 'Saisissez votre numéro pour continuer.');
              return false;
            }
          }
        }
      ],
      cssClass: 'modern-recovery-alert'
    });

    await alert.present();
  }

  /**
   * Affiche la modal de récupération de mot de passe pour les restaurants
   */
  async showRestaurantPasswordRecovery(): Promise<void> {
    const alert = await this.alertController.create({
      header: '🔐 Mot de passe oublié ?',
      subHeader: '📱 Récupération rapide par WhatsApp',
      message: 'Saisissez votre numéro de téléphone pour recevoir votre mot de passe instantanément.',
      inputs: [
        {
          name: 'recoveryPhone',
          type: 'tel',
          placeholder: '33620951645',
          attributes: {
            maxlength: 15,
            autocomplete: 'tel',
            inputmode: 'numeric'
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'modern-cancel-button',
          handler: () => {
            console.log('Restaurant recovery cancelled');
          }
        },
        {
          text: '📤 Envoyer',
          cssClass: 'modern-confirm-button',
          handler: (data) => {
            if (data.recoveryPhone && data.recoveryPhone.trim()) {
              this.processRestaurantPasswordRecovery(data.recoveryPhone.trim());
              return true;
            } else {
              this.showErrorAlert('📱 Numéro manquant', 'Saisissez votre numéro pour continuer.');
              return false;
            }
          }
        }
      ],
      cssClass: 'modern-recovery-alert restaurant-recovery-alert'
    });

    await alert.present();
  }

  /**
   * Traite la demande de récupération de code d'accès livreur
   */
  private async processDeliveryPasswordRecovery(phone: string): Promise<void> {
    // Pas de validation du format pour permettre les tests
    
    // Afficher un loading pendant l'envoi
    const loadingAlert = await this.alertController.create({
      header: '🚀 Envoi en cours',
      message: 'Recherche de votre profil et envoi par WhatsApp...',
      backdropDismiss: false,
      cssClass: 'modern-loading-alert'
    });

    await loadingAlert.present();

    try {
      // Appeler le service de récupération
      const result = await this.deliveryPasswordRecoveryService.sendAccessCode(phone);
      
      await loadingAlert.dismiss();

      if (result.success) {
        await this.showDeliverySuccessAlert();
      } else {
        await this.showDeliveryRecoveryError(result.message);
      }
    } catch (error) {
      await loadingAlert.dismiss();
      await this.showDeliveryRecoveryError('SYSTEM_ERROR');
    }
  }

  /**
   * Traite la demande de récupération de mot de passe restaurant
   */
  private async processRestaurantPasswordRecovery(phone: string): Promise<void> {
    // Pas de validation du format pour permettre les tests

    // Afficher un loading pendant l'envoi
    const loadingAlert = await this.alertController.create({
      header: '🚀 Envoi en cours',
      message: 'Recherche de votre restaurant et envoi par WhatsApp...',
      backdropDismiss: false,
      cssClass: 'modern-loading-alert'
    });

    await loadingAlert.present();

    try {
      // Appeler le service de récupération
      const result = await this.restaurantPasswordRecoveryService.sendPassword(phone);
      
      await loadingAlert.dismiss();

      if (result.success) {
        await this.showRestaurantSuccessAlert();
      } else {
        await this.showRestaurantRecoveryError(result.message);
      }
    } catch (error) {
      await loadingAlert.dismiss();
      await this.showRestaurantRecoveryError('SYSTEM_ERROR');
    }
  }

  /**
   * Affiche les erreurs de récupération de code livreur
   */
  private async showDeliveryRecoveryError(errorCode: string): Promise<void> {
    let title = '';
    let message = '';

    switch (errorCode) {
      case 'PHONE_NOT_FOUND':
        title = '📱 Numéro non trouvé';
        message = 'Ce numéro de téléphone n\'est pas enregistré dans notre système. Vérifiez votre numéro ou contactez le restaurant.';
        break;
      case 'USER_BLOCKED':
        title = '🚫 Compte bloqué';
        message = 'Votre compte livreur est temporairement bloqué. Contactez le restaurant pour débloquer votre compte.';
        break;
      case 'USER_INACTIVE':
        title = '💤 Compte inactif';
        message = 'Votre compte livreur n\'est pas activé. Contactez le restaurant pour activer votre compte.';
        break;
      case 'SEND_FAILED':
        title = '📤 Envoi échoué';
        message = 'Impossible d\'envoyer le message WhatsApp. Vérifiez votre connexion et réessayez.';
        break;
      default:
        title = '⚠️ Erreur système';
        message = 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support.';
    }

    await this.showErrorAlert(title, message);
  }

  /**
   * Affiche les erreurs de récupération de mot de passe restaurant
   */
  private async showRestaurantRecoveryError(errorCode: string): Promise<void> {
    let title = '';
    let message = '';

    switch (errorCode) {
      case 'PHONE_NOT_FOUND':
        title = '📱 Numéro non trouvé';
        message = 'Ce numéro de téléphone n\'est pas enregistré dans notre système. Vérifiez votre numéro ou contactez le support.';
        break;
      case 'USER_INACTIVE':
        title = '💤 Restaurant inactif';
        message = 'Votre restaurant n\'est pas activé. Contactez le support pour activer votre compte.';
        break;
      case 'NO_PASSWORD':
        title = '🔐 Mot de passe non configuré';
        message = 'Aucun mot de passe configuré pour ce restaurant. Contactez le support pour configurer votre mot de passe.';
        break;
      case 'NO_PHONE_NUMBER':
        title = '📱 Numéro manquant';
        message = 'Aucun numéro WhatsApp associé à ce restaurant. Contactez le support pour ajouter un numéro.';
        break;
      case 'SEND_FAILED':
        title = '📤 Envoi échoué';
        message = 'Impossible d\'envoyer le message WhatsApp. Vérifiez votre connexion et réessayez.';
        break;
      default:
        title = '⚠️ Erreur système';
        message = 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support.';
    }

    await this.showErrorAlert(title, message);
  }

  /**
   * Affiche le message de succès pour les livreurs
   */
  private async showDeliverySuccessAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: '🎉 Code envoyé !',
      subHeader: '📱 WhatsApp → Votre téléphone',
      message: 'Vérifiez vos messages et utilisez le code pour vous connecter.',
      buttons: [
        {
          text: '🚀 Super !',
          cssClass: 'modern-success-button',
          handler: () => {
            console.log('✅ Code d\'accès envoyé avec succès');
          }
        }
      ],
      cssClass: 'modern-success-alert'
    });

    await alert.present();
  }

  /**
   * Affiche le message de succès pour les restaurants
   */
  private async showRestaurantSuccessAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: '🎉 Mot de passe envoyé !',
      subHeader: '📱 WhatsApp → Votre téléphone',
      message: 'Vérifiez vos messages et utilisez le mot de passe pour vous connecter.',
      buttons: [
        {
          text: '🚀 Super !',
          cssClass: 'modern-success-button',
          handler: () => {
            console.log('✅ Mot de passe restaurant envoyé avec succès');
          }
        }
      ],
      cssClass: 'modern-success-alert'
    });

    await alert.present();
  }

  /**
   * Affiche une alerte d'erreur générique
   */
  private async showErrorAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: [
        {
          text: '👍 Compris',
          cssClass: 'modern-error-button'
        }
      ],
      cssClass: 'modern-error-alert'
    });

    await alert.present();
  }
}