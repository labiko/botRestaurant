import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';
import { AuthFranceService } from '../auth-france/services/auth-france.service';

@Component({
  selector: 'app-payments-france',
  templateUrl: './payments-france.page.html',
  styleUrls: ['./payments-france.page.scss'],
  standalone: false
})
export class PaymentsFrancePage implements OnInit {
  // Onglet actif
  selectedTab: 'renewal' | 'history' = 'renewal';

  // Config Stripe
  stripeConfig: any = null;
  isLoadingStripe = false;
  isCreatingCheckout = false;

  // Historique
  subscriptionHistory: any[] = [];
  isLoadingHistory = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private supabaseFranceService: SupabaseFranceService,
    private authFranceService: AuthFranceService
  ) {}

  ngOnInit() {
    this.loadStripeConfig();
    this.loadSubscriptionHistory();
  }

  /**
   * Changer d'onglet
   */
  selectTab(tab: any) {
    if (tab === 'renewal' || tab === 'history') {
      this.selectedTab = tab;
    }
  }

  /**
   * Charger config Stripe
   */
  async loadStripeConfig() {
    this.isLoadingStripe = true;
    try {
      const { data } = await this.supabaseFranceService.client.functions.invoke('subscription-restaurant', {
        body: { action: 'get_config' }
      });
      this.stripeConfig = data?.config;
    } catch (error) {
      console.error('❌ Erreur config Stripe:', error);
    } finally {
      this.isLoadingStripe = false;
    }
  }

  /**
   * Renouveler abonnement
   */
  async renewSubscription(plan: 'monthly' | 'quarterly' | 'annual') {
    this.isCreatingCheckout = true;
    try {
      const restaurantId = this.authFranceService.getCurrentRestaurantId();
      if (!restaurantId) {
        throw new Error('Restaurant ID non trouvé');
      }

      const { data, error } = await this.supabaseFranceService.client.functions.invoke('subscription-restaurant', {
        body: {
          action: 'create_checkout',
          restaurant_id: restaurantId,
          plan: plan
        }
      });

      if (error) throw error;

      // Ouvrir Stripe Checkout dans un nouvel onglet
      if (data.url) {
        window.open(data.url, '_blank');
      }

    } catch (error) {
      console.error('❌ Erreur checkout:', error);
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Erreur lors de la création du paiement',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isCreatingCheckout = false;
    }
  }

  /**
   * Charger historique des abonnements
   */
  async loadSubscriptionHistory() {
    this.isLoadingHistory = true;
    try {
      const restaurantId = this.authFranceService.getCurrentRestaurantId();
      if (!restaurantId) return;

      const { data, error } = await this.supabaseFranceService.client
        .from('subscription_history')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      this.subscriptionHistory = data || [];
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    } finally {
      this.isLoadingHistory = false;
    }
  }

  /**
   * Formater date
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Label action
   */
  getActionLabel(action: string): string {
    const labels: any = {
      'manual_renewal': '🔄 Renouvellement manuel',
      'stripe_renewal': '💳 Renouvellement Stripe',
      'initial_setup': '🆕 Configuration initiale',
      'suspension': '⏸️ Suspension',
      'reactivation': '▶️ Réactivation'
    };
    return labels[action] || action;
  }

  /**
   * Label méthode paiement
   */
  getPaymentMethodLabel(method: string): string {
    const labels: any = {
      'manual': '💰 Mobile Money',
      'stripe': '💳 Carte bancaire',
      'free': '🎁 Gratuit'
    };
    return labels[method] || method;
  }

  /**
   * Retour au dashboard
   */
  goBack() {
    this.router.navigate(['/restaurant-france/dashboard-france']);
  }
}
