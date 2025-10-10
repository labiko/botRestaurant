import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature');
    }

    const body = await req.text();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer webhook secret
    const { data: config } = await supabase
      .from('admin_stripe_config')
      .select('stripe_secret_key, stripe_webhook_secret')
      .eq('config_name', 'main')
      .single();

    if (!config) throw new Error('Config not found');

    const stripe = new Stripe(config.stripe_secret_key, {
      apiVersion: '2023-10-16',
    });

    // Vérifier signature webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe_webhook_secret
    );

    // Gérer l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const restaurantId = parseInt(session.metadata.restaurant_id);
      const plan = session.metadata.plan;

      // Calculer durée selon le plan
      let durationMonths = 1;
      if (plan === 'quarterly') durationMonths = 3;
      if (plan === 'annual') durationMonths = 12;

      // Prolonger l'abonnement
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('subscription_end_date')
        .eq('id', restaurantId)
        .single();

      const oldEndDate = restaurant.subscription_end_date
        ? new Date(restaurant.subscription_end_date)
        : new Date();

      const now = new Date();
      const startFrom = oldEndDate > now ? oldEndDate : now;
      const newEndDate = new Date(startFrom);
      newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

      // Mise à jour
      await supabase
        .from('france_restaurants')
        .update({
          subscription_end_date: newEndDate.toISOString(),
          subscription_status: 'active',
          subscription_plan: plan
        })
        .eq('id', restaurantId);

      // Historique
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
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
