// ============================================================================
// EDGE FUNCTION: PAYMENT WEBHOOK HANDLER
// Description: Gère les webhooks des providers de paiement (Stripe, Lengopay)
// Mise à jour automatique des statuts de paiement
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';

serve(async (req) => {
  console.log('📥 [Webhook Handler] Nouvelle requête webhook');

  try {
    const signature = req.headers.get('stripe-signature');
    let provider = req.headers.get('x-payment-provider');

    // Auto-détection du provider si pas de header
    if (!provider) {
      if (signature) {
        provider = 'stripe';
        console.log('🔍 [Webhook Handler] Provider auto-détecté: Stripe (signature présente)');
      } else {
        // Examiner le content-type et payload pour détecter LengoPay
        const contentType = req.headers.get('content-type') || '';
        console.log(`🔍 [Webhook Handler] Content-Type: ${contentType}`);

        if (contentType.includes('application/x-www-form-urlencoded')) {
          provider = 'lengopay';
          console.log('🔍 [Webhook Handler] Provider auto-détecté: LengoPay (form-urlencoded)');
        } else {
          // Essayer de lire comme JSON
          try {
            const clonedReq = req.clone();
            const payload = await clonedReq.json();

            if (payload.pay_id || payload.payment_id || payload.event || payload.status) {
              provider = 'lengopay';
              console.log('🔍 [Webhook Handler] Provider auto-détecté: LengoPay (payload structure)');
            } else {
              provider = 'stripe'; // fallback
              console.log('🔍 [Webhook Handler] Provider fallback: Stripe');
            }
          } catch (jsonError) {
            // Si ce n'est pas du JSON, c'est probablement LengoPay
            provider = 'lengopay';
            console.log('🔍 [Webhook Handler] Provider auto-détecté: LengoPay (non-JSON)');
          }
        }
      }
    }

    console.log(`🏦 [Webhook Handler] Provider final: ${provider}`);

    if (provider === 'stripe') {
      return await handleStripeWebhook(req, signature);
    } else if (provider === 'lengopay') {
      return await handleLengopayWebhook(req);
    }

    throw new Error('Provider non supporté');

  } catch (error: any) {
    console.error('❌ [Webhook Handler] Erreur:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// ============================================================================
// STRIPE WEBHOOK HANDLER
// ============================================================================

async function handleStripeWebhook(req: Request, signature: string | null) {
  console.log('💳 [Webhook Handler] Traitement webhook Stripe');

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16'
  });

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!webhookSecret) {
    console.error('❌ [Webhook Handler] STRIPE_WEBHOOK_SECRET manquant');
    throw new Error('Configuration webhook manquante');
  }

  if (!signature) {
    throw new Error('Signature webhook manquante');
  }

  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log(`✅ [Webhook Handler] Événement Stripe vérifié: ${event.type}`);
  } catch (err: any) {
    console.error('❌ [Webhook Handler] Erreur vérification signature:', err);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // ========================================================================
  // Traiter l'événement Stripe
  // ========================================================================

  if (event.type === 'checkout.session.completed') {
    console.log('💰 [Webhook Handler] Paiement Stripe complété');

    const session = event.data.object as any;

    // Trouver le payment_link correspondant par session.id
    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('payment_intent_id', session.id)
      .single();

    if (linkError || !paymentLink) {
      console.error('❌ [Webhook Handler] Payment link introuvable:', linkError);
      throw new Error('Payment link introuvable');
    }

    console.log(`✅ [Webhook Handler] Payment link trouvé: ${paymentLink.id}`);

    // Mettre à jour payment_links
    const { error: updateLinkError } = await supabase
      .from('payment_links')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        webhook_events: [...(paymentLink.webhook_events || []), event]
      })
      .eq('id', paymentLink.id);

    if (updateLinkError) {
      console.error('❌ [Webhook Handler] Erreur mise à jour payment_links:', updateLinkError);
    } else {
      console.log(`✅ [Webhook Handler] Payment link ${paymentLink.id} marqué comme payé`);
    }

    // Mettre à jour france_orders
    const { error: updateOrderError } = await supabase
      .from('france_orders')
      .update({
        online_payment_status: 'paid',
        payment_method: 'online'
      })
      .eq('id', paymentLink.order_id);

    if (updateOrderError) {
      console.error('❌ [Webhook Handler] Erreur mise à jour france_orders:', updateOrderError);
    } else {
      console.log(`✅ [Webhook Handler] Commande ${paymentLink.order_id} marquée comme payée`);
    }

  } else if (event.type === 'checkout.session.expired') {
    console.log('⏱️ [Webhook Handler] Session Stripe expirée');

    const session = event.data.object as any;

    const { error: updateError } = await supabase
      .from('payment_links')
      .update({
        status: 'expired',
        webhook_events: supabase.rpc('array_append', {
          arr: 'webhook_events',
          val: event
        })
      })
      .eq('payment_intent_id', session.payment_intent);

    if (updateError) {
      console.error('❌ [Webhook Handler] Erreur mise à jour expiration:', updateError);
    }

  } else if (event.type === 'payment_intent.payment_failed') {
    console.log('❌ [Webhook Handler] Paiement Stripe échoué');

    const paymentIntent = event.data.object as any;

    const { error: updateError } = await supabase
      .from('payment_links')
      .update({
        status: 'failed',
        webhook_events: supabase.rpc('array_append', {
          arr: 'webhook_events',
          val: event
        })
      })
      .eq('payment_intent_id', paymentIntent.id);

    if (updateError) {
      console.error('❌ [Webhook Handler] Erreur mise à jour échec:', updateError);
    }

    // Mettre à jour la commande
    const { data: paymentLink } = await supabase
      .from('payment_links')
      .select('order_id')
      .eq('payment_intent_id', paymentIntent.id)
      .single();

    if (paymentLink) {
      await supabase
        .from('france_orders')
        .update({ online_payment_status: 'failed' })
        .eq('id', paymentLink.order_id);
    }
  }

  console.log('✅ [Webhook Handler] Webhook Stripe traité avec succès');

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// LENGOPAY WEBHOOK HANDLER
// ============================================================================

async function handleLengopayWebhook(req: Request) {
  console.log('💳 [Webhook Handler] Traitement webhook Lengopay');

  // LOGS DÉTAILLÉS - Headers reçus
  console.log('📋 [LengoPay Webhook] Headers reçus:');
  for (const [key, value] of req.headers.entries()) {
    console.log(`   ${key}: ${value}`);
  }

  // Lire le payload selon le content-type
  const contentType = req.headers.get('content-type') || '';
  let payload: any = {};

  if (contentType.includes('application/x-www-form-urlencoded')) {
    // Traiter form data
    const formData = await req.formData();
    console.log('📦 [LengoPay Webhook] Form data reçu:');

    for (const [key, value] of formData.entries()) {
      payload[key] = value;
      console.log(`   ${key}: ${value}`);
    }
  } else {
    // Essayer JSON
    try {
      payload = await req.json();
      console.log('📦 [LengoPay Webhook] JSON payload reçu:');
      console.log(JSON.stringify(payload, null, 2));
    } catch (e) {
      // En dernier recours, lire comme texte
      const text = await req.text();
      console.log('📦 [LengoPay Webhook] Text payload reçu:', text);

      // Parser manuellement si c'est du form-urlencoded dans du texte
      if (text.includes('=')) {
        const params = new URLSearchParams(text);
        for (const [key, value] of params.entries()) {
          payload[key] = value;
        }
      }
    }
  }

  // LOGS DÉTAILLÉS - Analyse des champs
  console.log('🔍 [LengoPay Webhook] Analyse des champs:');
  console.log(`   - payload.pay_id: ${payload.pay_id}`);
  console.log(`   - payload.status: ${payload.status}`);
  console.log(`   - payload.amount: ${payload.amount}`);
  console.log(`   - payload.message: ${payload.message}`);
  console.log(`   - payload.Client: ${payload.Client}`);
  console.log(`   - payload.event: ${payload.event}`);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Traiter selon le format Lengopay (à adapter selon la vraie doc Lengopay)
  console.log('🔄 [LengoPay Webhook] Vérification des conditions de succès...');

  if (payload.status === 'SUCCESS' || payload.event === 'payment.success' || payload.status === 'completed') {
    console.log('💰 [LengoPay Webhook] Paiement Lengopay complété - Traitement...');

    // Déterminer l'ID de paiement à rechercher
    const paymentId = payload.pay_id || payload.payment_id || payload.id;
    console.log(`🔍 [LengoPay Webhook] Recherche payment_link avec payment_intent_id: ${paymentId}`);

    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('payment_intent_id', paymentId)
      .single();

    console.log('📊 [LengoPay Webhook] Résultat recherche payment_link:');
    console.log(`   - Trouvé: ${paymentLink ? 'OUI' : 'NON'}`);
    console.log(`   - Erreur: ${linkError ? linkError.message : 'AUCUNE'}`);

    if (paymentLink) {
      console.log(`   - ID: ${paymentLink.id}`);
      console.log(`   - Order ID: ${paymentLink.order_id}`);
      console.log(`   - Status actuel: ${paymentLink.status}`);
    }

    if (linkError || !paymentLink) {
      console.error('❌ [LengoPay Webhook] Payment link introuvable:', linkError);
      throw new Error('Payment link introuvable');
    }

    // Mettre à jour payment_links
    console.log(`🔄 [LengoPay Webhook] Mise à jour payment_links ID: ${paymentLink.id}`);
    const { error: updateLinkError } = await supabase
      .from('payment_links')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        webhook_events: [...(paymentLink.webhook_events || []), payload]
      })
      .eq('id', paymentLink.id);

    if (updateLinkError) {
      console.error('❌ [LengoPay Webhook] Erreur mise à jour payment_links:', updateLinkError);
    } else {
      console.log('✅ [LengoPay Webhook] Payment_links mis à jour avec succès');
    }

    // Mettre à jour france_orders
    console.log(`🔄 [LengoPay Webhook] Mise à jour france_orders ID: ${paymentLink.order_id}`);
    const { error: updateOrderError } = await supabase
      .from('france_orders')
      .update({
        online_payment_status: 'paid',
        payment_method: 'online'
      })
      .eq('id', paymentLink.order_id);

    if (updateOrderError) {
      console.error('❌ [LengoPay Webhook] Erreur mise à jour france_orders:', updateOrderError);
    } else {
      console.log('✅ [LengoPay Webhook] France_orders mis à jour avec succès');
    }

    console.log(`🎉 [LengoPay Webhook] Commande ${paymentLink.order_id} marquée comme payée !`);
  } else {
    console.log('ℹ️ [LengoPay Webhook] Événement non traité:');
    console.log(`   - Status: ${payload.status}`);
    console.log(`   - Event: ${payload.event}`);
    console.log('   Aucune action prise.');
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}