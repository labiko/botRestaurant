import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Route: GET CONFIG (config publique pour restaurants)
    if (action === 'get_config') {
      const { data, error } = await supabase
        .from('admin_stripe_config')
        .select('stripe_public_key, price_id_monthly, price_id_quarterly, price_id_annual, amount_monthly, amount_quarterly, amount_annual, currency')
        .eq('config_name', 'main')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ config: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: CREATE CHECKOUT (créer session Stripe)
    if (action === 'create_checkout') {
      const { restaurant_id, plan } = body;

      // 1. Récupérer config Stripe
      const { data: config, error: configError } = await supabase
        .from('admin_stripe_config')
        .select('*')
        .eq('config_name', 'main')
        .eq('is_active', true)
        .single();

      if (configError) throw configError;

      // 2. Récupérer info restaurant
      const { data: restaurant, error: restoError } = await supabase
        .from('france_restaurants')
        .select('name, email')
        .eq('id', restaurant_id)
        .single();

      if (restoError) throw restoError;

      // 3. Sélectionner price_id selon le plan
      let priceId = '';
      if (plan === 'monthly') priceId = config.price_id_monthly;
      if (plan === 'quarterly') priceId = config.price_id_quarterly;
      if (plan === 'annual') priceId = config.price_id_annual;

      if (!priceId) {
        throw new Error(`Price ID non configuré pour le plan: ${plan}`);
      }

      // 4. Créer session Stripe
      const stripe = new Stripe(config.stripe_secret_key, {
        apiVersion: '2023-10-16',
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/dashboard-france?success=true`,
        cancel_url: `${req.headers.get('origin')}/dashboard-france?canceled=true`,
        client_reference_id: restaurant_id.toString(),
        customer_email: restaurant.email,
        metadata: {
          restaurant_id: restaurant_id.toString(),
          plan: plan
        }
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Action inconnue: ${action}`);

  } catch (error) {
    console.error('❌ Erreur subscription-restaurant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
