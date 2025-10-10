import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

serve(async (req) => {
  try {
    console.log('📥 [WEBHOOK] Requête webhook reçue');

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ [WEBHOOK] Signature manquante');
      throw new Error('No signature');
    }

    const body = await req.text();
    console.log('📦 [WEBHOOK] Body reçu, taille:', body.length);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer webhook secret
    console.log('🔍 [WEBHOOK] Récupération config Stripe...');
    const { data: config } = await supabase
      .from('admin_stripe_config')
      .select('stripe_secret_key, stripe_webhook_secret')
      .eq('config_name', 'main')
      .single();

    if (!config) {
      console.error('❌ [WEBHOOK] Config non trouvée');
      throw new Error('Config not found');
    }

    console.log('✅ [WEBHOOK] Config récupérée');

    const stripe = new Stripe(config.stripe_secret_key, {
      apiVersion: '2023-10-16',
    });

    // Vérifier signature webhook
    console.log('🔐 [WEBHOOK] Vérification signature...');
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      config.stripe_webhook_secret
    );

    console.log('✅ [WEBHOOK] Signature valide, type événement:', event.type);

    // Gérer l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      console.log('💳 [WEBHOOK] Traitement checkout.session.completed');
      const session = event.data.object;
      const restaurantId = parseInt(session.metadata.restaurant_id);
      const plan = session.metadata.plan;

      console.log('📊 [WEBHOOK] Restaurant ID:', restaurantId, 'Plan:', plan);

      // Calculer durée selon le plan
      let durationMonths = 1;
      if (plan === 'quarterly') durationMonths = 3;
      if (plan === 'annual') durationMonths = 12;

      console.log('📅 [WEBHOOK] Durée calculée:', durationMonths, 'mois');

      // Prolonger l'abonnement
      console.log('🔍 [WEBHOOK] Récupération date fin actuelle...');
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('subscription_end_date')
        .eq('id', restaurantId)
        .single();

      const oldEndDate = restaurant?.subscription_end_date
        ? new Date(restaurant.subscription_end_date)
        : new Date();

      const now = new Date();
      const startFrom = oldEndDate > now ? oldEndDate : now;
      const newEndDate = new Date(startFrom);
      newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

      console.log('📅 [WEBHOOK] Ancienne fin:', oldEndDate.toISOString());
      console.log('📅 [WEBHOOK] Nouvelle fin:', newEndDate.toISOString());

      // Mise à jour
      console.log('💾 [WEBHOOK] Mise à jour restaurant...');
      await supabase
        .from('france_restaurants')
        .update({
          subscription_end_date: newEndDate.toISOString(),
          subscription_status: 'active',
          subscription_plan: plan
        })
        .eq('id', restaurantId);

      console.log('✅ [WEBHOOK] Restaurant mis à jour');

      // Historique
      console.log('📝 [WEBHOOK] Création entrée historique...');
      await supabase
        .from('subscription_history')
        .insert({
          restaurant_id: restaurantId,
          action: 'stripe_renewal',
          old_end_date: oldEndDate.toISOString(),
          new_end_date: newEndDate.toISOString(),
          duration_months: durationMonths,
          amount_paid: session.amount_total / 100,
          payment_method: 'stripe',
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          notes: `Renouvellement automatique via Stripe - Plan ${plan}`
        });

      console.log('✅ [WEBHOOK] Historique créé');
    }

    // Gérer l'événement invoice.payment_succeeded (paiements récurrents)
    else if (event.type === 'invoice.payment_succeeded') {
      console.log('💳 [WEBHOOK] Traitement invoice.payment_succeeded');
      const invoice = event.data.object;
      const subscription = invoice.subscription;

      if (subscription && typeof subscription === 'string') {
        console.log('🔍 [WEBHOOK] Récupération données abonnement...');
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
        const restaurantId = parseInt(stripeSubscription.metadata.restaurant_id);
        const plan = stripeSubscription.metadata.plan;

        console.log('📊 [WEBHOOK] Restaurant ID:', restaurantId, 'Plan:', plan);

        // Calculer durée selon le plan
        let durationMonths = 1;
        if (plan === 'quarterly') durationMonths = 3;
        if (plan === 'annual') durationMonths = 12;

        console.log('📅 [WEBHOOK] Durée calculée:', durationMonths, 'mois');

        // Prolonger l'abonnement
        console.log('🔍 [WEBHOOK] Récupération date fin actuelle...');
        const { data: restaurant } = await supabase
          .from('france_restaurants')
          .select('subscription_end_date')
          .eq('id', restaurantId)
          .single();

        const oldEndDate = restaurant?.subscription_end_date
          ? new Date(restaurant.subscription_end_date)
          : new Date();

        const now = new Date();
        const startFrom = oldEndDate > now ? oldEndDate : now;
        const newEndDate = new Date(startFrom);
        newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

        console.log('📅 [WEBHOOK] Ancienne fin:', oldEndDate.toISOString());
        console.log('📅 [WEBHOOK] Nouvelle fin:', newEndDate.toISOString());

        // Mise à jour
        console.log('💾 [WEBHOOK] Mise à jour restaurant...');
        await supabase
          .from('france_restaurants')
          .update({
            subscription_end_date: newEndDate.toISOString(),
            subscription_status: 'active',
            subscription_plan: plan
          })
          .eq('id', restaurantId);

        console.log('✅ [WEBHOOK] Restaurant mis à jour');

        // Historique
        console.log('📝 [WEBHOOK] Création entrée historique...');
        await supabase
          .from('subscription_history')
          .insert({
            restaurant_id: restaurantId,
            action: 'stripe_renewal',
            old_end_date: oldEndDate.toISOString(),
            new_end_date: newEndDate.toISOString(),
            duration_months: durationMonths,
            amount_paid: invoice.amount_paid / 100,
            payment_method: 'stripe',
            stripe_payment_intent: invoice.payment_intent,
            notes: `Paiement récurrent automatique via Stripe - Plan ${plan}`
          });

        console.log('✅ [WEBHOOK] Historique créé');
      }
    }

    console.log('✅ [WEBHOOK] Traitement terminé avec succès');
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [WEBHOOK] Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
