// ============================================================================
// LENGOPAY PROVIDER - Génération de liens de paiement Lengopay
// ============================================================================

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  phone_number: string;
  customer_name?: string;
  restaurant_id: number;
}

interface PaymentConfig {
  merchant_id: string;
  api_key_secret: string;
  config: {
    currency?: string;
    payment_methods?: string[];
  };
  success_url?: string;
  cancel_url?: string;
  webhook_url?: string;
}

interface PaymentLinkResult {
  success: boolean;
  paymentUrl?: string;
  paymentIntentId?: string;
  metadata?: any;
  error?: string;
}

export class LengopayProvider {
  private apiUrl: string;
  private merchantId: string;
  private apiKey: string;

  constructor(merchantId: string, apiKey: string) {
    this.apiUrl = 'https://api.lengopay.com/v1'; // URL à confirmer avec Lengopay
    this.merchantId = merchantId;
    this.apiKey = apiKey;
  }

  async createPaymentLink(order: Order, config: PaymentConfig): Promise<PaymentLinkResult> {
    console.log(`💳 [Lengopay] Création lien pour commande #${order.order_number}`);

    try {
      const response = await fetch(`${this.apiUrl}/payment-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-Id': this.merchantId
        },
        body: JSON.stringify({
          amount: order.total_amount,
          currency: config.config.currency || 'GNF',
          description: `Commande #${order.order_number}`,
          customer: {
            phone: order.phone_number,
            name: order.customer_name || 'Client'
          },
          metadata: {
            order_id: order.id.toString(),
            order_number: order.order_number,
            restaurant_id: order.restaurant_id.toString()
          },
          success_url: config.success_url || `${Deno.env.get('APP_URL')}/payment/success`,
          cancel_url: config.cancel_url || `${Deno.env.get('APP_URL')}/payment/cancel`,
          webhook_url: config.webhook_url || `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook-handler`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [Lengopay] Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`Lengopay API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      console.log(`✅ [Lengopay] Lien créé: ${data.payment_id}`);
      console.log(`🔗 [Lengopay] URL: ${data.payment_url}`);

      return {
        success: true,
        paymentUrl: data.payment_url,
        paymentIntentId: data.payment_id,
        metadata: {
          paymentId: data.payment_id,
          amount: order.total_amount,
          currency: config.config.currency || 'GNF',
          expiresAt: data.expires_at
        }
      };
    } catch (error: any) {
      console.error('❌ [Lengopay] Erreur création lien:', error);
      return {
        success: false,
        error: error.message || 'Erreur Lengopay inconnue'
      };
    }
  }
}