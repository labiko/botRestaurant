// ============================================================================
// EDGE FUNCTION: PAYMENT LINK SENDER
// Description: Service générique d'envoi de liens de paiement par WhatsApp
// Utilisé par: Back office restaurant + Application livreur (botResto)
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { StripeProvider } from './providers/StripeProvider.ts';
import { LengopayProvider } from './providers/LengopayProvider.ts';

// Types
interface PaymentLinkRequest {
  orderId: number;
  senderId?: number;           // ID du user qui envoie (optionnel)
  senderType: 'restaurant' | 'driver' | 'system';
  customMessage?: string;      // Message personnalisé (optionnel)
  expiresIn?: number;          // Durée d'expiration en heures (défaut: 24h)
  successUrl?: string;         // URL de redirection succès (depuis client)
  cancelUrl?: string;          // URL de redirection annulation (depuis client)
}

interface PaymentLinkResponse {
  success: boolean;
  paymentLinkId?: number;
  paymentUrl?: string;
  messageSent: boolean;
  error?: string;
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  console.log('📥 [Payment Link Sender] Nouvelle requête');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: PaymentLinkRequest = await req.json();
    const { orderId, senderId, senderType, customMessage, expiresIn, successUrl, cancelUrl } = body;

    console.log(`📋 [Payment Link Sender] Commande #${orderId}, Sender: ${senderType}`);

    // ========================================================================
    // 1. Récupérer la commande
    // ========================================================================
    const { data: order, error: orderError } = await supabase
      .from('france_orders')
      .select(`
        *,
        restaurant:france_restaurants(id, name, slug)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ [Payment Link Sender] Commande introuvable:', orderError);
      throw new Error('Commande introuvable');
    }

    console.log(`✅ [Payment Link Sender] Commande trouvée: #${order.order_number}`);

    // ========================================================================
    // 2. Récupérer la config de paiement du restaurant
    // ========================================================================
    const { data: config, error: configError } = await supabase
      .from('restaurant_payment_configs')
      .select('*')
      .eq('restaurant_id', order.restaurant_id)
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.error('❌ [Payment Link Sender] Config paiement introuvable:', configError);
      throw new Error('Aucune configuration de paiement active pour ce restaurant');
    }

    console.log(`✅ [Payment Link Sender] Config trouvée: Provider ${config.provider}`);

    // ========================================================================
    // 3. Créer le lien de paiement via le provider approprié
    // ========================================================================
    let paymentResult;

    // Utiliser les URLs du client (ou fallback)
    const configWithUrls = {
      ...config,
      success_url: successUrl || `${Deno.env.get('APP_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${Deno.env.get('APP_URL')}/payment/cancel`
    };

    console.log(`🔗 [Payment Link Sender] Callback URLs reçues du client: success=${successUrl}, cancel=${cancelUrl}`);

    switch (config.provider) {
      case 'stripe':
        console.log('💳 [Payment Link Sender] Utilisation Stripe');
        console.log(`🔗 [Payment Link Sender] URLs finales: success=${configWithUrls.success_url}, cancel=${configWithUrls.cancel_url}`);
        const stripeProvider = new StripeProvider(config.api_key_secret);
        paymentResult = await stripeProvider.createPaymentLink(order, configWithUrls);
        break;

      case 'lengopay':
        console.log('💳 [Payment Link Sender] Utilisation Lengopay');
        const lengopayProvider = new LengopayProvider(config.merchant_id, config.api_key_secret);
        paymentResult = await lengopayProvider.createPaymentLink(order, config);
        break;

      default:
        console.error(`❌ [Payment Link Sender] Provider non supporté: ${config.provider}`);
        throw new Error(`Provider non supporté: ${config.provider}`);
    }

    if (!paymentResult.success) {
      console.error('❌ [Payment Link Sender] Échec création lien:', paymentResult.error);
      throw new Error(paymentResult.error || 'Échec création lien de paiement');
    }

    console.log(`✅ [Payment Link Sender] Lien créé: ${paymentResult.paymentUrl}`);

    // ========================================================================
    // 4. Enregistrer le lien dans la BDD
    // ========================================================================
    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .insert({
        order_id: orderId,
        restaurant_id: order.restaurant_id,
        config_id: config.id,
        provider: config.provider,
        payment_link_url: paymentResult.paymentUrl,
        payment_intent_id: paymentResult.metadata?.sessionId || paymentResult.paymentIntentId,
        amount: order.total_amount,
        currency: config.config?.currency || 'EUR',
        status: 'pending',
        sent_by_id: senderId,
        sent_by_type: senderType,
        expires_at: new Date(Date.now() + (expiresIn || 24) * 60 * 60 * 1000),
        metadata: paymentResult.metadata
      })
      .select()
      .single();

    if (linkError) {
      console.error('❌ [Payment Link Sender] Erreur enregistrement:', linkError);
      throw new Error('Erreur enregistrement lien de paiement');
    }

    console.log(`✅ [Payment Link Sender] Lien enregistré ID: ${paymentLink.id}`);

    // ========================================================================
    // 5. Envoyer le lien par WhatsApp
    // ========================================================================
    const message = customMessage || formatPaymentMessage(order, paymentResult.paymentUrl, config);

    try {
      // Appel direct à Green API
      const whatsappResponse = await fetch(
        `${Deno.env.get('GREEN_API_URL')}/waInstance${Deno.env.get('GREEN_API_INSTANCE_ID')}/sendMessage/${Deno.env.get('GREEN_API_TOKEN')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: cleanPhoneNumber(order.phone_number),
            message: message
          })
        }
      );

      if (!whatsappResponse.ok) {
        const errorText = await whatsappResponse.text();
        console.error(`❌ [Payment Link Sender] Erreur WhatsApp ${whatsappResponse.status}:`, errorText);
        throw new Error(`Erreur WhatsApp: ${whatsappResponse.status}`);
      }

      const whatsappResult = await whatsappResponse.json();
      console.log(`✅ [Payment Link Sender] Message WhatsApp envoyé: ${whatsappResult.idMessage}`);

      // Marquer comme envoyé
      await supabase
        .from('payment_links')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', paymentLink.id);

      // Mettre à jour la commande
      await supabase
        .from('france_orders')
        .update({ online_payment_status: 'link_sent' })
        .eq('id', orderId);

      console.log('✅ [Payment Link Sender] Succès complet');

      return new Response(JSON.stringify({
        success: true,
        paymentLinkId: paymentLink.id,
        paymentUrl: paymentResult.paymentUrl,
        messageSent: true
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      });

    } catch (sendError: any) {
      console.error('❌ [Payment Link Sender] Erreur envoi WhatsApp:', sendError);

      // Lien créé mais envoi échoué
      return new Response(JSON.stringify({
        success: true,
        paymentLinkId: paymentLink.id,
        paymentUrl: paymentResult.paymentUrl,
        messageSent: false,
        error: 'Lien créé mais envoi WhatsApp échoué'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      });
    }

  } catch (error: any) {
    console.error('❌ [Payment Link Sender] Erreur globale:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur inconnue'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Formatter le message WhatsApp avec le lien de paiement
 */
function formatPaymentMessage(order: any, paymentUrl: string, config: any): string {
  const restaurantName = order.restaurant?.name || 'Restaurant';
  const currency = config.config?.currency === 'GNF' ? 'GNF' : '€';
  const amount = config.config?.currency === 'GNF'
    ? Math.round(order.total_amount)
    : order.total_amount.toFixed(2);

  // Nettoyer l'URL de tout espace ou retour à la ligne potentiel
  const cleanUrl = paymentUrl.trim().replace(/\s+/g, '');

  return `💳 *PAIEMENT EN LIGNE*

Bonjour ${order.customer_name || 'cher client'},

Votre commande #${order.order_number} est prête !

📦 Montant : ${amount}${currency}

Pour finaliser votre commande, veuillez effectuer le paiement en ligne :

🔗 ${cleanUrl}

⏱️ Ce lien expire dans 24 heures.

Merci de votre confiance !
${restaurantName}`;
}

/**
 * Nettoyer et formatter le numéro de téléphone pour Green API
 */
function cleanPhoneNumber(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  if (!cleaned.includes('@')) {
    cleaned = cleaned + '@c.us';
  }

  return cleaned;
}