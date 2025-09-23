import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🚀 CONNEXION PRODUCTION pour mise à jour deployment_status
const SUPABASE_PROD_URL = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD;
const SUPABASE_PROD_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD;

export async function PUT(request: NextRequest) {
  try {
    console.log('🔗 [API] Mise à jour deployment_status PROD');
    console.log('🔍 [API] SUPABASE_URL_PROD:', SUPABASE_PROD_URL ? 'Défini' : 'MANQUANT');
    console.log('🔍 [API] SUPABASE_ANON_KEY_PROD:', SUPABASE_PROD_ANON_KEY ? 'Défini' : 'MANQUANT');

    // Vérification des variables d'environnement
    if (!SUPABASE_PROD_URL || !SUPABASE_PROD_ANON_KEY) {
      console.error('❌ [API] Variables d\'environnement PROD manquantes');
      return NextResponse.json({
        success: false,
        error: 'Configuration PROD manquante. Vérifiez NEXT_PUBLIC_SUPABASE_URL_PROD et NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD'
      }, { status: 500 });
    }

    const { restaurant_id, deployment_status } = await request.json();

    console.log(`🔗 [API] Mise à jour deployment_status PROD: restaurant ${restaurant_id} → ${deployment_status}`);

    // Validation des données
    if (!restaurant_id || !deployment_status) {
      return NextResponse.json({
        success: false,
        error: 'restaurant_id et deployment_status requis'
      }, { status: 400 });
    }

    // Validation du statut
    const validStatuses = ['development', 'testing', 'production'];
    if (!validStatuses.includes(deployment_status)) {
      return NextResponse.json({
        success: false,
        error: `deployment_status doit être: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    // Client Supabase PRODUCTION
    const supabaseProd = createClient(
      SUPABASE_PROD_URL,
      SUPABASE_PROD_ANON_KEY
    );

    // Récupérer d'abord le nom du restaurant pour le retour
    const { data: restaurant, error: fetchError } = await supabaseProd
      .from('france_restaurants')
      .select('name')
      .eq('id', restaurant_id)
      .single();

    if (fetchError) {
      console.error('❌ [API] Restaurant non trouvé:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 });
    }

    // Mettre à jour le deployment_status en PRODUCTION
    const { error: updateError } = await supabaseProd
      .from('france_restaurants')
      .update({ deployment_status })
      .eq('id', restaurant_id);

    if (updateError) {
      console.error('❌ [API] Erreur mise à jour deployment_status PROD:', updateError);
      return NextResponse.json({
        success: false,
        error: `Erreur mise à jour PROD: ${updateError.message}`
      }, { status: 500 });
    }

    console.log(`✅ [API] deployment_status mis à jour avec succès en PROD`);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour avec succès`,
      restaurant_name: restaurant.name,
      new_status: deployment_status
    });

  } catch (error) {
    console.error('❌ [API] Exception mise à jour deployment_status:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}