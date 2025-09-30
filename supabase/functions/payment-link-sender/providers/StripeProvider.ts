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

    try {
      // Créer un Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convertir en centimes
        currency: config.config.currency || 'eur',
        payment_method_types: config.config.payment_methods || ['card'],
        metadata: {
          order_id: order.id.toString(),
          order_number: order.order_number,
          restaurant_id: order.restaurant_id.toString(),
          customer_phone: order.phone_number
        }
      });

      console.log(`✅ [Stripe] Payment Intent créé: ${paymentIntent.id}`);

      // Créer un Checkout Session
      const session = await this.stripe.checkout.sessions.create({
        payment_intent: paymentIntent.id,
        mode: 'payment',
        success_url: config.success_url || `${Deno.env.get('APP_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config.cancel_url || `${Deno.env.get('APP_URL')}/payment/cancel`,
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

      return {
        success: true,
        paymentUrl: session.url!,
        paymentIntentId: paymentIntent.id,
        metadata: {
          sessionId: session.id,
          paymentIntentId: paymentIntent.id,
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