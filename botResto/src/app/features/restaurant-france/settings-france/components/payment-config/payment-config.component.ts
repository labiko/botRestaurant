import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RestaurantPaymentConfigService, PaymentConfig, PaymentStats } from '../../../../../core/services/restaurant-payment-config.service';
import { AuthFranceService } from '../../../auth-france/services/auth-france.service';

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
  availableProviders = [
    { value: 'stripe', label: 'Stripe', icon: 'card' },
    { value: 'lengopay', label: 'Lengopay', icon: 'phone-portrait' },
    { value: 'wave', label: 'Wave', icon: 'water' },
    { value: 'orange_money', label: 'Orange Money', icon: 'logo-bitcoin' }
  ];

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
    // Commun
    config: { currency: 'EUR' }
  };

  restaurantId: number;

  constructor(
    private paymentService: RestaurantPaymentConfigService,
    private authService: AuthFranceService,
    private toastController: ToastController
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
  }

  async saveConfig() {
    try {
      // Préparer les données selon le provider
      const configData: any = {
        provider: this.form.provider,
        is_active: this.form.is_active,
        config: this.form.config
      };

      if (this.form.provider === 'stripe') {
        configData.api_key_public = this.form.api_key_public;
        configData.api_key_secret = this.form.api_key_secret;
      } else if (this.form.provider === 'lengopay') {
        configData.license_key = this.form.license_key;
        configData.website_id = this.form.website_id;
        configData.merchant_id = this.form.merchant_id;
        configData.telephone_marchand = this.form.telephone_marchand;
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
}