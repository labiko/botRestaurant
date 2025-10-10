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

    // Route: GET CONFIG
    if (action === 'get_config') {
      const { data, error } = await supabase
        .from('admin_stripe_config')
        .select('*')
        .eq('config_name', 'main')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Masquer la clé secrète
      if (data) {
        data.stripe_secret_key = '***MASKED***';
      }

      return new Response(
        JSON.stringify({ config: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: UPDATE CONFIG
    if (action === 'update_config') {
      const { config } = body;

      const { data, error } = await supabase
        .from('admin_stripe_config')
        .upsert({
          config_name: 'main',
          ...config,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'config_name'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, config: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: TEST STRIPE
    if (action === 'test_stripe') {
      const { stripe_secret_key } = body;

      const stripe = new Stripe(stripe_secret_key, {
        apiVersion: '2023-10-16',
      });

      const account = await stripe.account.retrieve();

      return new Response(
        JSON.stringify({
          success: true,
          account: {
            id: account.id,
            email: account.email,
            country: account.country,
            charges_enabled: account.charges_enabled
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: PROLONG (prolongation manuelle - mobile money)
    if (action === 'prolong') {
      const { restaurant_id, duration_months, notes, admin_user } = body;

      // 1. Récupérer date actuelle
      const { data: restaurant, error: fetchError } = await supabase
        .from('france_restaurants')
        .select('subscription_end_date, subscription_status')
        .eq('id', restaurant_id)
        .single();

      if (fetchError) throw fetchError;

      const oldEndDate = restaurant.subscription_end_date
        ? new Date(restaurant.subscription_end_date)
        : new Date();

      const now = new Date();
      const startFrom = oldEndDate > now ? oldEndDate : now;
      const newEndDate = new Date(startFrom);
      newEndDate.setMonth(newEndDate.getMonth() + duration_months);

      // 2. Mettre à jour restaurant
      const { error: updateError } = await supabase
        .from('france_restaurants')
        .update({
          subscription_end_date: newEndDate.toISOString(),
          subscription_status: 'active'
        })
        .eq('id', restaurant_id);

      if (updateError) throw updateError;

      // 3. Historique
      await supabase
        .from('subscription_history')
        .insert({
          restaurant_id,
          action: 'manual_renewal',
          old_end_date: oldEndDate.toISOString(),
          new_end_date: newEndDate.toISOString(),
          duration_months,
          payment_method: 'manual',
          admin_user: admin_user || 'admin',
          notes: notes || `Prolongation manuelle de ${duration_months} mois`
        });

      return new Response(
        JSON.stringify({
          success: true,
          old_end_date: oldEndDate.toISOString(),
          new_end_date: newEndDate.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Action inconnue: ${action}`);

  } catch (error) {
    console.error('❌ Erreur subscription-admin:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
