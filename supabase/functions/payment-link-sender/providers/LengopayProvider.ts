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
  restaurant?: { name: string };
}

interface PaymentConfig {
  merchant_id: string;        // website_id LengoPay
  api_key_secret: string;     // license_key LengoPay
  config: {
    api_url?: string;         // URL de l'API depuis config
    currency?: string;
    website_id?: string;      // redondant avec merchant_id mais pour cohérence
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
  private licenseKey: string;
  private websiteId: string;

  constructor(websiteId: string, licenseKey: string) {
    this.websiteId = websiteId;
    this.licenseKey = licenseKey;
  }

  async createPaymentLink(order: Order, config: PaymentConfig): Promise<PaymentLinkResult> {
    console.log(`💳 [Lengopay] Création lien pour commande #${order.order_number}`);
    console.log(`🔗 [Lengopay] URLs reçues dans config:`);
    console.log(`   - success_url: ${config.success_url}`);
    console.log(`   - cancel_url: ${config.cancel_url}`);

    try {
      // URL de l'API depuis la configuration (pas hardcodée)
      const apiUrl = config.config.api_url || 'https://sandbox.lengopay.com/api/v1/payments';

      // URLs finales qui seront envoyées à LengoPay
      const finalSuccessUrl = config.success_url || `https://menu-ai-admin.vercel.app/payment-success.html?pay_id={PAY_ID}`;
      const finalFailureUrl = config.cancel_url || `https://menu-ai-admin.vercel.app/payment-cancel.html?pay_id={PAY_ID}`;
      const finalCallbackUrl = config.webhook_url || `https://menu-ai-admin.vercel.app/api/lengopay-callback`;

      console.log(`🎯 [Lengopay] URLs FINALES envoyées à LengoPay:`);
      console.log(`   - return_url: ${finalSuccessUrl}`);
      console.log(`   - failure_url: ${finalFailureUrl}`);
      console.log(`   - callback_url: ${finalCallbackUrl}`);

      // Requête selon la vraie API LengoPay (testée avec curl)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.licenseKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          websiteid: this.websiteId,
          amount: order.total_amount,
          currency: config.config.currency || 'GNF',
          return_url: finalSuccessUrl,
          failure_url: finalFailureUrl,
          callback_url: finalCallbackUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [Lengopay] Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`Lengopay API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      console.log(`✅ [Lengopay] Lien créé: ${data.pay_id}`);
      console.log(`🔗 [Lengopay] URL: ${data.payment_url}`);
      console.log(`🔗 [Lengopay] Status: ${data.status}`);

      return {
        success: true,
        paymentUrl: data.payment_url,
        paymentIntentId: data.pay_id,
        metadata: {
          paymentId: data.pay_id,
          amount: order.total_amount,
          currency: config.config.currency || 'GNF'
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