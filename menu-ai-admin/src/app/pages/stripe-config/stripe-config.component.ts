import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

interface StripeConfig {
  stripe_public_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  price_id_monthly: string;
  price_id_quarterly: string;
  price_id_annual: string;
  amount_monthly: number;
  amount_quarterly: number;
  amount_annual: number;
  environment: 'test' | 'live';
  notes: string;
}

@Component({
  selector: 'app-stripe-config',
  templateUrl: './stripe-config.component.html',
  styleUrls: ['./stripe-config.component.scss']
})
export class StripeConfigComponent implements OnInit {
  config: StripeConfig = {
    stripe_public_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    price_id_monthly: '',
    price_id_quarterly: '',
    price_id_annual: '',
    amount_monthly: 49.00,
    amount_quarterly: 127.00,
    amount_annual: 420.00,
    environment: 'live',
    notes: ''
  };

  isLoading = false;
  isSaving = false;
  isTesting = false;
  testResult: any = null;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    this.isLoading = true;
    try {
      const { data } = await this.supabase.client.functions.invoke('subscription-admin', {
        body: { action: 'get_config' }
      });
      if (data?.config) {
        this.config = { ...this.config, ...data.config };
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveConfig() {
    if (!this.validateConfig()) return;

    this.isSaving = true;
    try {
      const { error } = await this.supabase.client.functions.invoke('subscription-admin', {
        body: {
          action: 'update_config',
          config: this.config
        }
      });

      if (error) throw error;

      alert('✅ Configuration Stripe sauvegardée !');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur sauvegarde');
    } finally {
      this.isSaving = false;
    }
  }

  async testConnection() {
    if (!this.config.stripe_secret_key) {
      alert('⚠️ Clé secrète requise');
      return;
    }

    this.isTesting = true;
    this.testResult = null;

    try {
      const { data } = await this.supabase.client.functions.invoke('subscription-admin', {
        body: {
          action: 'test_stripe',
          stripe_secret_key: this.config.stripe_secret_key
        }
      });

      this.testResult = data;

      if (data.success) {
        alert(`✅ Connexion réussie !\nCompte: ${data.account.email}`);
      } else {
        alert(`❌ Échec: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Test échoué:', error);
      alert('Erreur test connexion');
    } finally {
      this.isTesting = false;
    }
  }

  validateConfig(): boolean {
    if (!this.config.stripe_public_key || !this.config.stripe_secret_key) {
      alert('⚠️ Clés Stripe requises');
      return false;
    }

    const publicPrefix = this.config.environment === 'test' ? 'pk_test_' : 'pk_live_';
    const secretPrefix = this.config.environment === 'test' ? 'sk_test_' : 'sk_live_';

    if (!this.config.stripe_public_key.startsWith(publicPrefix)) {
      alert(`⚠️ Clé publique doit commencer par ${publicPrefix}`);
      return false;
    }

    if (!this.config.stripe_secret_key.startsWith(secretPrefix)) {
      alert(`⚠️ Clé secrète doit commencer par ${secretPrefix}`);
      return false;
    }

    return true;
  }
}
