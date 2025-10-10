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

    console.log('📥 [DEBUG] Requête reçue:', { action, body });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Route: GET CONFIG (config publique pour restaurants)
    if (action === 'get_config') {
      console.log('🔍 [DEBUG] Action: get_config');

      const { data, error } = await supabase
        .from('admin_stripe_config')
        .select('stripe_public_key, price_id_monthly, price_id_quarterly, price_id_annual, amount_monthly, amount_quarterly, amount_annual, currency')
        .eq('config_name', 'main')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ [DEBUG] Erreur récupération config:', error);
        throw error;
      }

      console.log('✅ [DEBUG] Config récupérée:', data ? 'OK' : 'NULL');

      return new Response(
        JSON.stringify({ config: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: CREATE CHECKOUT (créer session Stripe)
    if (action === 'create_checkout') {
      const { restaurant_id, plan } = body;
      console.log('🔍 [DEBUG] Action: create_checkout', { restaurant_id, plan });

      // 1. Récupérer config Stripe
      console.log('🔍 [DEBUG] Étape 1: Récupération config Stripe...');
      const { data: config, error: configError } = await supabase
        .from('admin_stripe_config')
        .select('*')
        .eq('config_name', 'main')
        .eq('is_active', true)
        .single();

      if (configError) {
        console.error('❌ [DEBUG] Erreur récupération config Stripe:', configError);
        throw new Error(`Config Stripe non trouvée: ${configError.message}`);
      }

      console.log('✅ [DEBUG] Config Stripe récupérée:', {
        has_public_key: !!config.stripe_public_key,
        has_secret_key: !!config.stripe_secret_key,
        has_monthly: !!config.price_id_monthly,
        has_quarterly: !!config.price_id_quarterly,
        has_annual: !!config.price_id_annual
      });

      // 2. Récupérer info restaurant
      console.log('🔍 [DEBUG] Étape 2: Récupération restaurant ID:', restaurant_id);
      const { data: restaurant, error: restoError } = await supabase
        .from('france_restaurants')
        .select('name, whatsapp_number')
        .eq('id', restaurant_id)
        .single();

      if (restoError) {
        console.error('❌ [DEBUG] Erreur récupération restaurant:', restoError);
        throw new Error(`Restaurant non trouvé: ${restoError.message}`);
      }

      console.log('✅ [DEBUG] Restaurant trouvé:', restaurant.name);

      // 3. Sélectionner price_id selon le plan
      console.log('🔍 [DEBUG] Étape 3: Sélection price_id pour plan:', plan);
      let priceId = '';
      if (plan === 'monthly') priceId = config.price_id_monthly;
      if (plan === 'quarterly') priceId = config.price_id_quarterly;
      if (plan === 'annual') priceId = config.price_id_annual;

      if (!priceId) {
        console.error('❌ [DEBUG] Price ID vide pour plan:', plan);
        throw new Error(`Price ID non configuré pour le plan: ${plan}`);
      }

      console.log('✅ [DEBUG] Price ID sélectionné:', priceId);

      // 4. Créer session Stripe
      console.log('🔍 [DEBUG] Étape 4: Création session Stripe...');
      const stripe = new Stripe(config.stripe_secret_key, {
        apiVersion: '2023-10-16',
      });

      const origin = req.headers.get('origin') || 'http://localhost:4200';
      console.log('🔍 [DEBUG] Origin:', origin);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',  // Changé de 'payment' à 'subscription'
        success_url: `${origin}/restaurant-france/dashboard-france?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/restaurant-france/dashboard-france?canceled=true`,
        client_reference_id: restaurant_id.toString(),
        metadata: {
          restaurant_id: restaurant_id.toString(),
          restaurant_name: restaurant.name,
          restaurant_whatsapp: restaurant.whatsapp_number,
          plan: plan
        },
        subscription_data: {
          metadata: {
            restaurant_id: restaurant_id.toString(),
            restaurant_name: restaurant.name,
            plan: plan
          }
        }
      });

      console.log('✅ [DEBUG] Session Stripe créée:', session.id);

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
