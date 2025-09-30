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
    const provider = req.headers.get('x-payment-provider') || 'stripe';

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

  const payload = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Traiter selon le format Lengopay (à adapter selon la vraie doc Lengopay)
  if (payload.event === 'payment.success' || payload.status === 'completed') {
    console.log('💰 [Webhook Handler] Paiement Lengopay complété');

    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('payment_intent_id', payload.payment_id || payload.id)
      .single();

    if (linkError || !paymentLink) {
      console.error('❌ [Webhook Handler] Payment link introuvable:', linkError);
      throw new Error('Payment link introuvable');
    }

    // Mettre à jour payment_links
    await supabase
      .from('payment_links')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        webhook_events: [...(paymentLink.webhook_events || []), payload]
      })
      .eq('id', paymentLink.id);

    // Mettre à jour france_orders
    await supabase
      .from('france_orders')
      .update({
        online_payment_status: 'paid',
        payment_method: 'online'
      })
      .eq('id', paymentLink.order_id);

    console.log(`✅ [Webhook Handler] Commande ${paymentLink.order_id} marquée comme payée (Lengopay)`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}