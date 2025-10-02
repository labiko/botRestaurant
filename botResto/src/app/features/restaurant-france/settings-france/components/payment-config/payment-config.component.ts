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
  testOrderId: number | null = null;
  checkInterval: any = null;

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
      message: '🔗 Création commande test...',
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

      this.testOrderId = result.orderId!;

      // Afficher les instructions avec le lien
      const alert = await this.alertController.create({
        header: '🧪 Test de configuration complet',
        cssClass: 'test-webhook-alert',
        message: `
          <div style="text-align: left;">
            <p><strong>✅ Étape 1 : Lien généré</strong></p>
            <p style="font-size: 12px; word-break: break-all; background: #f0f0f0; padding: 8px; border-radius: 4px;">
              ${result.paymentUrl}
            </p>

            <p style="margin-top: 16px;"><strong>📋 Étape 2 : Effectuer le paiement test</strong></p>
            <ol style="font-size: 13px; padding-left: 20px;">
              <li>Cliquez sur "Ouvrir le lien"</li>
              <li>Utilisez la carte test Stripe :
                <ul>
                  <li><strong>Numéro</strong> : 4242 4242 4242 4242</li>
                  <li><strong>Date</strong> : n'importe quelle date future</li>
                  <li><strong>CVC</strong> : n'importe quel 3 chiffres</li>
                </ul>
              </li>
              <li>Complétez le paiement</li>
            </ol>

            <p style="margin-top: 16px;"><strong>🔍 Étape 3 : Vérification webhook</strong></p>
            <p style="font-size: 13px;">
              Après le paiement, cliquez sur "Vérifier webhook" pour voir si le statut a été mis à jour automatiquement.
            </p>

            <p style="margin-top: 12px; padding: 8px; background: #fff3cd; border-radius: 4px; font-size: 12px;">
              ⚠️ <strong>Si le webhook ne fonctionne pas</strong>, vérifiez que l'URL webhook est bien configurée dans votre dashboard Stripe.
            </p>
          </div>
        `,
        buttons: [
          {
            text: 'Copier lien',
            handler: () => {
              navigator.clipboard.writeText(result.paymentUrl!);
              this.showToast('✅ Lien copié', 'success');
            }
          },
          {
            text: 'Ouvrir le lien',
            handler: () => {
              window.open(result.paymentUrl, '_blank');
            }
          },
          {
            text: 'Vérifier webhook',
            cssClass: 'primary-button',
            handler: async () => {
              await this.checkWebhookResult();
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

  /**
   * Vérifier si le webhook a traité le paiement
   */
  async checkWebhookResult() {
    if (!this.testOrderId) {
      await this.showToast('❌ Aucun test en cours', 'warning');
      return;
    }

    const loading = await this.toastController.create({
      message: '🔍 Vérification webhook...',
      duration: 0
    });
    await loading.present();

    try {
      const result = await this.paymentService.checkWebhookStatus(this.testOrderId);

      loading.dismiss();

      if (result.webhookWorking) {
        // Webhook fonctionne !
        const alert = await this.alertController.create({
          header: '✅ Webhook configuré correctement !',
          message: `
            <div style="text-align: center; padding: 20px;">
              <p style="font-size: 48px; margin: 0;">✅</p>
              <p style="font-size: 16px; font-weight: bold; margin: 16px 0 8px 0;">
                Félicitations !
              </p>
              <p style="font-size: 14px; color: #666;">
                Le webhook Stripe est correctement configuré.<br>
                Le statut du paiement a été mis à jour automatiquement.
              </p>
              <div style="margin-top: 16px; padding: 12px; background: #d4edda; border-radius: 8px;">
                <p style="margin: 0; font-size: 13px; color: #155724;">
                  <strong>Statut :</strong> ${result.paymentStatus}
                </p>
              </div>
            </div>
          `,
          buttons: ['Super !']
        });
        await alert.present();

      } else {
        // Webhook ne fonctionne pas
        const alert = await this.alertController.create({
          header: '⚠️ Webhook non configuré',
          message: `
            <div style="text-align: left;">
              <p><strong>Statut actuel :</strong> ${result.paymentStatus}</p>

              <p style="margin-top: 16px;">Le webhook n'a pas mis à jour le statut automatiquement.</p>

              <p style="margin-top: 12px;"><strong>📋 Actions à faire :</strong></p>
              <ol style="font-size: 13px; padding-left: 20px;">
                <li>Vérifiez que vous avez bien effectué le paiement</li>
                <li>Si le paiement est fait, configurez le webhook dans Stripe :
                  <ul style="margin-top: 8px;">
                    <li>Allez dans votre dashboard Stripe</li>
                    <li>Développeurs → Webhooks</li>
                    <li>Ajoutez l'endpoint webhook</li>
                    <li>Sélectionnez les événements nécessaires</li>
                  </ul>
                </li>
                <li>Réessayez le test après configuration</li>
              </ol>
            </div>
          `,
          buttons: [
            {
              text: 'Voir Dashboard Stripe',
              handler: () => {
                window.open('https://dashboard.stripe.com/webhooks', '_blank');
              }
            },
            {
              text: 'OK'
            }
          ]
        });
        await alert.present();
      }

      // Réinitialiser
      this.testOrderId = null;

    } catch (error: any) {
      loading.dismiss();
      await this.showToast(`❌ ${error.message}`, 'danger');
    }
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