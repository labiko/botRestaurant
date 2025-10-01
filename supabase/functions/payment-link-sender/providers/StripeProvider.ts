// ============================================================================
// STRIPE PROVIDER - Génération de liens de paiement Stripe
// ============================================================================

import Stripe from 'https://esm.sh/stripe@14.0.0';

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  phone_number: string;
  restaurant_id: number;
  restaurant?: { name: string };
}

interface PaymentConfig {
  api_key_secret: string;
  config: {
    currency?: string;
    payment_methods?: string[];
  };
  success_url?: string;
  cancel_url?: string;
}

interface PaymentLinkResult {
  success: boolean;
  paymentUrl?: string;
  paymentIntentId?: string;
  metadata?: any;
  error?: string;
}

export class StripeProvider {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentLink(order: Order, config: PaymentConfig): Promise<PaymentLinkResult> {
    console.log(`💳 [Stripe] Création lien pour commande #${order.order_number}`);
    console.log(`🔗 [Stripe] URLs reçues dans config:`);
    console.log(`   - success_url: ${config.success_url}`);
    console.log(`   - cancel_url: ${config.cancel_url}`);

    try {
      // URLs finales qui seront envoyées à Stripe
      const finalSuccessUrl = config.success_url || `https://menu-ai-admin.vercel.app/payment-success.html?session_id={CHECKOUT_SESSION_ID}`;
      const finalCancelUrl = config.cancel_url || `https://menu-ai-admin.vercel.app/payment-cancel.html?session_id={CHECKOUT_SESSION_ID}`;

      console.log(`🎯 [Stripe] URLs FINALES envoyées à Stripe:`);
      console.log(`   - success_url: ${finalSuccessUrl}`);
      console.log(`   - cancel_url: ${finalCancelUrl}`);

      // Créer un Checkout Session avec payment_intent_data
      const session = await this.stripe.checkout.sessions.create({
        payment_intent_data: {
          metadata: {
            order_id: order.id.toString(),
            order_number: order.order_number,
            restaurant_id: order.restaurant_id.toString(),
            customer_phone: order.phone_number
          }
        },
        mode: 'payment',
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        line_items: [
          {
            price_data: {
              currency: config.config.currency || 'eur',
              product_data: {
                name: `Commande #${order.order_number}`,
                description: order.restaurant?.name ? `Restaurant: ${order.restaurant.name}` : undefined
              },
              unit_amount: Math.round(order.total_amount * 100)
            },
            quantity: 1
          }
        ]
      });

      console.log(`✅ [Stripe] Checkout Session créé: ${session.id}`);
      console.log(`🔗 [Stripe] URL: ${session.url}`);
      console.log(`🔗 [Stripe] success_url configurée: ${session.success_url}`);
      console.log(`🔗 [Stripe] cancel_url configurée: ${session.cancel_url}`);

      return {
        success: true,
        paymentUrl: session.url!,
        paymentIntentId: session.payment_intent as string,
        metadata: {
          sessionId: session.id,
          paymentIntentId: session.payment_intent,
          amount: order.total_amount,
          currency: config.config.currency || 'eur'
        }
      };
    } catch (error: any) {
      console.error('❌ [Stripe] Erreur création lien:', error);
      return {
        success: false,
        error: error.message || 'Erreur Stripe inconnue'
      };
    }
  }
}