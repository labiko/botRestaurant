import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    console.log('🔍 Test de connexion démarré...');

    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('📍 URL Supabase:', supabaseUrl ? 'PRÉSENT' : 'MANQUANT');
    console.log('🔑 Service Key:', supabaseKey ? 'PRÉSENT' : 'MANQUANT');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Variables d\'environnement manquantes',
        env: {
          SUPABASE_URL: !!supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !!supabaseKey
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client Supabase créé');

    // Test simple de connexion
    const { data: restaurants, error } = await supabase
      .from('france_restaurants')
      .select('id, name')
      .limit(1);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        details: error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Test réussi:', restaurants);

    return new Response(JSON.stringify({
      success: true,
      message: 'Connexion Supabase OK',
      data: {
        restaurants_count: restaurants?.length || 0,
        sample_restaurant: restaurants?.[0] || null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur critique:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur critique: ' + error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});