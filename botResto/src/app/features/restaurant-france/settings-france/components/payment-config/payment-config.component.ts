import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { RestaurantPaymentConfigService, PaymentConfig, PaymentStats } from '../../../../../core/services/restaurant-payment-config.service';
import { AuthFranceService } from '../../../auth-france/services/auth-france.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-payment-config',
  templateUrl: './payment-config.component.html',
  styleUrls: ['./payment-config.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PaymentConfigComponent implements OnInit {

  currentState: 'loading' | 'empty' | 'form' | 'active' = 'loading';

  paymentConfig: PaymentConfig | null = null;
  stats: PaymentStats | null = null;
  availableProviders = this.paymentService.getAvailableProviders();

  form = {
    provider: 'stripe' as 'stripe' | 'lengopay' | 'wave' | 'orange_money' | 'custom',
    is_active: true,
    // Stripe
    api_key_public: '',
    api_key_secret: '',
    webhook_secret: '',
    // Lengopay
    license_key: '',
    website_id: '',
    merchant_id: '',
    telephone_marchand: '',
    api_url: '',
    // Options d'envoi automatique
    auto_send_on_order: false,
    send_on_delivery: false,
    // Commun
    config: { currency: 'EUR' }
  };

  restaurantId: number;

  constructor(
    private paymentService: RestaurantPaymentConfigService,
    private authService: AuthFranceService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.restaurantId = this.authService.getCurrentRestaurantId()!;
    console.log('💳 [PaymentConfig] Restaurant ID:', this.restaurantId);
  }

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    this.currentState = 'loading';
    console.log('💳 [PaymentConfig] loadConfig() - Restaurant ID:', this.restaurantId);

    try {
      const config = await this.paymentService.getConfig(this.restaurantId);
      console.log('💳 [PaymentConfig] Config récupérée:', config);

      if (config) {
        this.paymentConfig = config;
        this.stats = await this.paymentService.getStats(this.restaurantId);
        console.log('💳 [PaymentConfig] Stats:', this.stats);
        this.currentState = 'active';
      } else {
        console.warn('💳 [PaymentConfig] Aucune config trouvée pour restaurant_id:', this.restaurantId);
        this.currentState = 'empty';
      }
    } catch (error) {
      console.error('💳 [PaymentConfig] Erreur chargement config:', error);
      this.currentState = 'empty';
    }
  }

  showForm() {
    if (this.paymentConfig) {
      // Édition : charger les données existantes
      this.form = {
        provider: this.paymentConfig.provider,
        is_active: this.paymentConfig.is_active,
        api_key_public: this.paymentConfig.api_key_public || '',
        api_key_secret: this.paymentConfig.api_key_secret || '',
        webhook_secret: this.paymentConfig.webhook_secret || '',
        license_key: this.paymentConfig.license_key || '',
        website_id: this.paymentConfig.website_id || '',
        merchant_id: this.paymentConfig.merchant_id || '',
        telephone_marchand: this.paymentConfig.telephone_marchand || '',
        api_url: this.paymentConfig.api_url || '',
        auto_send_on_order: this.paymentConfig.auto_send_on_order || false,
        send_on_delivery: this.paymentConfig.send_on_delivery || false,
        config: this.paymentConfig.config || { currency: 'EUR' }
      };
    }
    this.currentState = 'form';
  }

  onProviderChange() {
    // Réinitialiser les champs spécifiques au provider
    this.form.api_key_public = '';
    this.form.api_key_secret = '';
    this.form.webhook_secret = '';
    this.form.license_key = '';
    this.form.website_id = '';
    this.form.merchant_id = '';
    this.form.telephone_marchand = '';
    this.form.api_url = '';
  }

  async saveConfig() {
    try {
      // Préparer les données du formulaire uniquement
      const configData: any = {
        provider: this.form.provider,
        is_active: this.form.is_active,
        auto_send_on_order: this.form.auto_send_on_order,
        send_on_delivery: this.form.send_on_delivery,
        config: this.form.config
      };

      // Ne pas envoyer les URLs génériques - elles sont gérées automatiquement par le système

      if (this.form.provider === 'stripe') {
        configData.api_key_public = this.form.api_key_public;
        configData.api_key_secret = this.form.api_key_secret;
        configData.webhook_secret = this.form.webhook_secret;
      } else if (this.form.provider === 'lengopay') {
        // Pour LengoPay, utiliser config JSON + merchant_id
        configData.merchant_id = this.form.merchant_id;
        configData.config = {
          ...configData.config,
          license_key: this.form.license_key,
          website_id: this.form.website_id,
          telephone_marchand: this.form.telephone_marchand,
          api_url: this.form.api_url
        };
      }

      await this.paymentService.saveConfig(this.restaurantId, configData);

      const toast = await this.toastController.create({
        message: '✅ Configuration enregistrée',
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      await this.loadConfig();

    } catch (error: any) {
      const toast = await this.toastController.create({
        message: `❌ Erreur : ${error.message}`,
        duration: 4000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  cancelForm() {
    this.currentState = this.paymentConfig ? 'active' : 'empty';
  }

  getProviderDashboardUrl() {
    switch (this.paymentConfig?.provider) {
      case 'stripe':
        return 'https://dashboard.stripe.com';
      case 'lengopay':
        return 'https://dashboard.lengopay.com';
      default:
        return null;
    }
  }

  openGuide() {
    window.open('https://docs.bot-restaurant.com/payment-setup', '_blank');
  }

  openProviderDashboard() {
    const url = this.getProviderDashboardUrl();
    if (url) window.open(url, '_blank');
  }

  async copyToClipboard(text: string) {
    if (!text || text.trim() === '') {
      const toast = await this.toastController.create({
        message: '⚠️ Aucune URL à copier',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      const toast = await this.toastController.create({
        message: '✅ URL copiée dans le presse-papier',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } catch (error) {
      console.error('❌ [PaymentConfig] Erreur copie:', error);

      const toast = await this.toastController.create({
        message: '❌ Impossible de copier l\'URL',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  async testConnection() {
    const loading = await this.toastController.create({
      message: 'Test de connexion en cours...',
      duration: 0
    });
    await loading.present();

    try {
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));

      await loading.dismiss();

      const toast = await this.toastController.create({
        message: '✅ Connexion réussie !',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      await loading.dismiss();

      const toast = await this.toastController.create({
        message: '❌ Erreur de connexion',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async generateTestLink() {
    const loading = await this.toastController.create({
      message: '🔗 Génération lien test...',
      duration: 0
    });
    await loading.present();

    try {
      // Générer le lien de paiement test
      const result = await this.paymentService.generateTestPaymentLink(this.restaurantId);

      loading.dismiss();

      if (!result.success) {
        throw new Error(result.error || 'Erreur génération lien test');
      }

      // Afficher le lien avec bouton copier
      const alert = await this.alertController.create({
        header: '🔗 Lien de paiement test',
        message: `
          <div style="text-align: left;">
            <p style="font-size: 14px; margin-bottom: 12px;">
              Lien de test généré (1€) :
            </p>
            <p style="font-size: 12px; word-break: break-all; background: #f0f0f0; padding: 8px; border-radius: 4px;">
              ${result.paymentUrl}
            </p>

            <p style="margin-top: 16px; font-size: 13px;">
              <strong>Carte test Stripe :</strong>
            </p>
            <ul style="font-size: 13px; padding-left: 20px;">
              <li><strong>Numéro</strong> : 4242 4242 4242 4242</li>
              <li><strong>Date</strong> : n'importe quelle date future</li>
              <li><strong>CVC</strong> : n'importe quel 3 chiffres</li>
            </ul>
          </div>
        `,
        buttons: [
          {
            text: 'Copier',
            handler: () => {
              navigator.clipboard.writeText(result.paymentUrl!);
              this.showToast('✅ Lien copié', 'success');
            }
          },
          {
            text: 'Ouvrir',
            handler: () => {
              window.open(result.paymentUrl, '_blank');
            }
          },
          {
            text: 'Fermer',
            role: 'cancel'
          }
        ]
      });

      await alert.present();

    } catch (error: any) {
      loading.dismiss();

      const toast = await this.toastController.create({
        message: `❌ ${error.message}`,
        duration: 4000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async testWebhook() {
    const toast = await this.toastController.create({
      message: '📡 Test du webhook en cours...',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();

    // TODO: Implémenter un test webhook
  }


  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Détermine l'environnement actuel
   */
  getCurrentEnvironment(): string {
    return environment.environmentName;
  }
}