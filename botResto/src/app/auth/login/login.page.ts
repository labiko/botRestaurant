import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { PasswordRecoveryUIService } from '../../core/services/password-recovery-ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  userType: 'restaurant' | 'delivery' = 'restaurant';
  
  // Restaurant login
  restaurantPhone: string = '';
  restaurantPassword: string = '';
  
  // Delivery login
  deliveryPhone: string = '';
  deliveryCode: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private passwordRecoveryUI: PasswordRecoveryUIService
  ) { }

  ngOnInit() {
    // Récupérer le type d'utilisateur depuis les query params
    this.route.queryParams.subscribe(params => {
      if (params['userType']) {
        this.userType = params['userType'];
      }
      
      // Vérifier si l'utilisateur a été déconnecté pour blocage
      if (params['blocked'] === 'true') {
        console.log('🚫 Livreur déconnecté pour cause de blocage');
        // TODO: Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  async loginRestaurant() {
    try {
      const success = await this.authService.loginRestaurant(this.restaurantPhone, this.restaurantPassword);
      if (success) {
        this.router.navigate(['/restaurant/dashboard']);
      } else {
        // TODO: Show error toast
        console.error('Login failed');
        this.showModernAlert('❌ Connexion échouée', 'Numéro de téléphone ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showModernAlert('🌐 Erreur réseau', 'Vérifiez votre connexion internet et réessayez');
    }
  }

  async loginDelivery() {
    try {
      const result = await this.authService.loginDelivery(this.deliveryPhone, this.deliveryCode);
      if (result.success) {
        this.router.navigate(['/delivery/dashboard']);
      } else {
        this.showDeliveryError(result.error || 'UNKNOWN_ERROR');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showDeliveryError('NETWORK_ERROR');
    }
  }

  private showDeliveryError(errorCode: string) {
    let message = '';
    let title = '';

    switch (errorCode) {
      case 'PHONE_NOT_FOUND':
        title = '📱 Numéro non reconnu';
        message = 'Ce numéro de téléphone n\'est pas enregistré comme livreur. Vérifiez votre numéro ou contactez le restaurant.';
        break;
      case 'INVALID_CODE':
        title = '🔐 Code incorrect';
        message = 'Le code d\'accès saisi est incorrect. Vérifiez votre code à 6 chiffres reçu par WhatsApp.';
        break;
      case 'USER_BLOCKED':
        title = '🚫 Accès bloqué';
        message = 'Votre compte livreur a été temporairement bloqué par le restaurant. Contactez le restaurant pour plus d\'informations.';
        break;
      case 'USER_INACTIVE':
        title = '💤 Compte inactif';
        message = 'Votre compte livreur est actuellement inactif. Contactez le restaurant pour réactiver votre compte.';
        break;
      case 'NETWORK_ERROR':
        title = '🌐 Erreur de connexion';
        message = 'Impossible de se connecter. Vérifiez votre connexion internet et réessayez.';
        break;
      default:
        title = '⚠️ Erreur de connexion';
        message = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
    }

    // Afficher une alerte moderne au lieu d'un toast
    this.showModernAlert(title, message);
  }

  private async showModernAlert(title: string, message: string) {
    console.error(`${title}: ${message}`);
    
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: [{
        text: 'Compris',
        role: 'confirm',
        handler: () => {
          console.log('User acknowledged error');
        }
      }],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  /**
   * Affiche la modal de récupération de code d'accès pour les livreurs
   */
  async showPasswordRecovery() {
    await this.passwordRecoveryUI.showDeliveryPasswordRecovery();
  }

  /**
   * Affiche la modal de récupération de mot de passe pour les restaurants
   */
  async showRestaurantPasswordRecovery() {
    await this.passwordRecoveryUI.showRestaurantPasswordRecovery();
  }
}