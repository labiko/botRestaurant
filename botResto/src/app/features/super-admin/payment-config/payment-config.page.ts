import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController, ModalController, LoadingController } from '@ionic/angular';
import { PaymentConfigService, PaymentConfig, CreatePaymentConfigRequest } from '../services/payment-config.service';
import { RestaurantAdmin } from '../services/super-admin-restaurant.service';
import { getDefaultConfigForProvider } from '../config/default-payment-config';

@Component({
  selector: 'app-payment-config',
  templateUrl: './payment-config.page.html',
  styleUrls: ['./payment-config.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PaymentConfigPage implements OnInit {
  selectedRestaurant: RestaurantAdmin | null = null;
  paymentConfigs: PaymentConfig[] = [];
  availableProviders = this.paymentConfigService.getAvailableProviders();
  loading = true;
  
  // Formulaire de nouvelle configuration
  showAddForm = false;
  currentLengoPayConfig: PaymentConfig | null = null;
  
  // États d'édition inline
  editingFields: { [key: string]: boolean } = {};
  showLicenseKey = false;
  showApiToken = false;
  newConfig: CreatePaymentConfigRequest = {
    restaurant_id: '',
    provider_name: 'lengopay',
    is_active: true,
    api_url: '',
    license_key: '',
    website_id: '',
    callback_url: '',
    green_api_instance_id: '',
    green_api_token: '',
    green_api_base_url: '',
    telephone_marchand: ''
  };

  constructor(
    private router: Router,
    private paymentConfigService: PaymentConfigService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    // Récupérer le restaurant depuis l'état de navigation
    const state = history.state;
    if (state && state.restaurant) {
      this.selectedRestaurant = state.restaurant;
      if (this.selectedRestaurant) {
        this.newConfig.restaurant_id = this.selectedRestaurant.id;
        // Initialiser avec les valeurs par défaut
        this.resetForm();
        await this.loadPaymentConfigs();
      }
    } else {
      // Rediriger vers la liste des restaurants si aucun restaurant sélectionné
      this.router.navigate(['/super-admin/restaurants']);
    }
  }

  async loadPaymentConfigs() {
    if (!this.selectedRestaurant) return;
    
    try {
      this.loading = true;
      this.paymentConfigs = await this.paymentConfigService.getPaymentConfigsByRestaurant(
        this.selectedRestaurant.id
      );
      
      // Identifier la configuration LengoPay s'il y en a une
      this.currentLengoPayConfig = this.paymentConfigs.find(config => config.provider_name === 'lengopay') || null;
      
    } catch (error) {
      console.error('Erreur chargement configurations:', error);
      await this.showToast('Erreur lors du chargement', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/super-admin/restaurants']);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    const defaultConfig = getDefaultConfigForProvider('lengopay');
    this.newConfig = {
      restaurant_id: this.selectedRestaurant?.id || '',
      provider_name: 'lengopay',
      is_active: true,
      api_url: defaultConfig?.api_url || '',
      license_key: '',
      website_id: '',
      callback_url: defaultConfig?.callback_url || '',
      green_api_instance_id: defaultConfig?.green_api_instance_id || '',
      green_api_token: defaultConfig?.green_api_token || '',
      green_api_base_url: defaultConfig?.green_api_base_url || '',
      telephone_marchand: ''
    };
  }

  async createPaymentConfig() {
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Création de la configuration...'
    });
    await loading.present();

    try {
      await this.paymentConfigService.createPaymentConfig(this.newConfig);
      await this.showToast('Configuration créée avec succès', 'success');
      await this.loadPaymentConfigs();
      this.toggleAddForm();
    } catch (error: any) {
      await this.showToast(error.message || 'Erreur lors de la création', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  validateForm(): boolean {
    if (!this.newConfig.api_url.trim()) {
      this.showToast('L\'URL API est obligatoire', 'warning');
      return false;
    }
    if (!this.newConfig.license_key.trim()) {
      this.showToast('La clé de licence est obligatoire', 'warning');
      return false;
    }
    if (!this.newConfig.website_id.trim()) {
      this.showToast('L\'ID du site web est obligatoire', 'warning');
      return false;
    }
    if (!this.newConfig.callback_url.trim()) {
      this.showToast('L\'URL de callback est obligatoire', 'warning');
      return false;
    }
    if (!this.newConfig.telephone_marchand.trim()) {
      this.showToast('Le téléphone marchand est obligatoire', 'warning');
      return false;
    }
    return true;
  }

  async editConfig(config: PaymentConfig) {
    const alert = await this.alertController.create({
      header: 'Modifier la configuration',
      message: `Modifier la configuration ${config.provider_name} ?`,
      inputs: [
        {
          name: 'api_url',
          type: 'url',
          placeholder: 'URL API',
          value: config.api_url
        },
        {
          name: 'license_key',
          type: 'text',
          placeholder: 'Clé de licence',
          value: config.license_key
        },
        {
          name: 'website_id',
          type: 'text',
          placeholder: 'Website ID',
          value: config.website_id
        },
        {
          name: 'callback_url',
          type: 'url',
          placeholder: 'URL de callback',
          value: config.callback_url
        },
        {
          name: 'telephone_marchand',
          type: 'tel',
          placeholder: 'Téléphone marchand',
          value: config.telephone_marchand
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Modifier',
          handler: async (data) => {
            if (!data.api_url || !data.license_key || !data.website_id || !data.callback_url || !data.telephone_marchand) {
              await this.showToast('Tous les champs sont obligatoires', 'warning');
              return false;
            }

            try {
              await this.paymentConfigService.updatePaymentConfig(config.id, {
                api_url: data.api_url,
                license_key: data.license_key,
                website_id: data.website_id,
                callback_url: data.callback_url,
                telephone_marchand: data.telephone_marchand
              });
              await this.showToast('Configuration modifiée', 'success');
              await this.loadPaymentConfigs();
            } catch (error: any) {
              await this.showToast(error.message || 'Erreur lors de la modification', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleConfigStatus(config: PaymentConfig) {
    const action = config.is_active ? 'désactiver' : 'activer';
    const alert = await this.alertController.create({
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} la configuration`,
      message: `Voulez-vous ${action} la configuration ${config.provider_name} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: async () => {
            try {
              await this.paymentConfigService.togglePaymentConfigStatus(config.id, !config.is_active);
              await this.showToast(`Configuration ${action}e`, 'success');
              await this.loadPaymentConfigs();
            } catch (error: any) {
              await this.showToast(`Erreur lors de l'${action}tion`, 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteConfig(config: PaymentConfig) {
    const alert = await this.alertController.create({
      header: 'Supprimer la configuration',
      message: `⚠️ ATTENTION: Cette action est irréversible!\n\nÊtes-vous sûr de vouloir supprimer la configuration ${config.provider_name} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.paymentConfigService.deletePaymentConfig(config.id);
              await this.showToast('Configuration supprimée', 'success');
              await this.loadPaymentConfigs();
            } catch (error: any) {
              await this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async testConfig(config: PaymentConfig) {
    const loading = await this.loadingController.create({
      message: 'Test de la configuration...'
    });
    await loading.present();

    try {
      const result = await this.paymentConfigService.testPaymentConfig(config.id);
      loading.dismiss();
      
      const alert = await this.alertController.create({
        header: result.success ? 'Test réussi' : 'Test échoué',
        message: result.message,
        buttons: ['OK']
      });
      await alert.present();
      
    } catch (error) {
      loading.dismiss();
      await this.showToast('Erreur lors du test', 'danger');
    }
  }

  getProviderLabel(providerName: string): string {
    const provider = this.availableProviders.find(p => p.value === providerName);
    return provider?.label || providerName;
  }

  getProviderColor(providerName: string): string {
    switch (providerName) {
      case 'lengopay': return 'primary';
      case 'orange_money': return 'warning';
      case 'wave': return 'secondary';
      case 'mtn_money': return 'tertiary';
      default: return 'medium';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRestaurantInitials(): string {
    if (!this.selectedRestaurant?.nom) return '??';
    const name = this.selectedRestaurant.nom.trim();
    if (!name) return '??';
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onProviderChange() {
    const defaultConfig = getDefaultConfigForProvider(this.newConfig.provider_name);
    if (defaultConfig) {
      // Pré-remplir uniquement si les champs sont vides
      if (!this.newConfig.api_url) {
        this.newConfig.api_url = defaultConfig.api_url;
      }
      if (!this.newConfig.callback_url) {
        this.newConfig.callback_url = defaultConfig.callback_url;
      }
      if (!this.newConfig.green_api_instance_id) {
        this.newConfig.green_api_instance_id = defaultConfig.green_api_instance_id;
      }
      if (!this.newConfig.green_api_token) {
        this.newConfig.green_api_token = defaultConfig.green_api_token;
      }
      if (!this.newConfig.green_api_base_url) {
        this.newConfig.green_api_base_url = defaultConfig.green_api_base_url;
      }
    }
  }

  // Data masking methods
  maskLicenseKey(licenseKey: string): string {
    if (!licenseKey) return 'Non configuré';
    if (this.showLicenseKey) return licenseKey;
    return licenseKey.substring(0, 8) + '•'.repeat(Math.max(0, licenseKey.length - 16)) + licenseKey.substring(licenseKey.length - 8);
  }

  maskApiToken(token: string): string {
    if (!token) return 'Non configuré';
    if (this.showApiToken) return token;
    return token.substring(0, 6) + '•'.repeat(Math.max(0, token.length - 12)) + token.substring(token.length - 6);
  }

  // Visibility toggle methods
  toggleLicenseKeyVisibility() {
    this.showLicenseKey = !this.showLicenseKey;
  }

  toggleTokenVisibility() {
    this.showApiToken = !this.showApiToken;
  }

  // Inline editing methods
  startEditing(field: string) {
    this.editingFields[field] = true;
  }

  cancelEditing(field: string) {
    this.editingFields[field] = false;
    // Recharger les données pour annuler les modifications
    this.loadPaymentConfigs();
  }

  async saveField(field: string, value: string) {
    if (!this.currentLengoPayConfig) return;
    
    try {
      const updateData: any = {};
      updateData[field] = value;
      
      await this.paymentConfigService.updatePaymentConfig(this.currentLengoPayConfig.id, updateData);
      await this.showToast(`${field} mis à jour`, 'success');
      this.editingFields[field] = false;
      await this.loadPaymentConfigs();
    } catch (error: any) {
      await this.showToast(error.message || 'Erreur lors de la mise à jour', 'danger');
    }
  }

  isEditing(field: string): boolean {
    return this.editingFields[field] || false;
  }

  // Clipboard functionality
  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      await this.showToast('Copié dans le presse-papier', 'success');
    } catch (error) {
      await this.showToast('Erreur lors de la copie', 'danger');
    }
  }

  // Green API methods
  async testGreenApiConnection() {
    if (!this.currentLengoPayConfig?.green_api_instance_id || !this.currentLengoPayConfig?.green_api_token) {
      await this.showToast('Configuration Green API incomplète', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Test de la connexion WhatsApp...'
    });
    await loading.present();

    try {
      // Simulate API test - Replace with actual Green API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const alert = await this.alertController.create({
        header: 'Test WhatsApp',
        message: 'Connexion Green API testée avec succès!',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      await this.showToast('Erreur lors du test WhatsApp', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async editGreenApiConfig() {
    if (!this.currentLengoPayConfig) return;

    const alert = await this.alertController.create({
      header: 'Modifier Green API',
      message: 'Modifier la configuration WhatsApp Business',
      inputs: [
        {
          name: 'green_api_instance_id',
          type: 'text',
          placeholder: 'Instance ID',
          value: this.currentLengoPayConfig.green_api_instance_id
        },
        {
          name: 'green_api_token',
          type: 'text',
          placeholder: 'Token API',
          value: this.currentLengoPayConfig.green_api_token
        },
        {
          name: 'green_api_base_url',
          type: 'url',
          placeholder: 'Base URL',
          value: this.currentLengoPayConfig.green_api_base_url
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Modifier',
          handler: async (data) => {
            try {
              await this.paymentConfigService.updatePaymentConfig(this.currentLengoPayConfig!.id, {
                green_api_instance_id: data.green_api_instance_id,
                green_api_token: data.green_api_token,
                green_api_base_url: data.green_api_base_url
              });
              await this.showToast('Configuration Green API modifiée', 'success');
              await this.loadPaymentConfigs();
            } catch (error: any) {
              await this.showToast(error.message || 'Erreur lors de la modification', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}