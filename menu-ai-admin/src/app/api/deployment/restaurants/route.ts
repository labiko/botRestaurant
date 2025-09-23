import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🚀 CONNEXION PRODUCTION pour gestion deployment_status
const SUPABASE_PROD_URL = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD;
const SUPABASE_PROD_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD;

export async function GET() {
  try {
    console.log('🔗 [API] Connexion PRODUCTION pour restaurants deployment_status');
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

    // Client Supabase PRODUCTION
    const supabaseProd = createClient(
      SUPABASE_PROD_URL,
      SUPABASE_PROD_ANON_KEY
    );

    // Récupérer tous les restaurants avec leur deployment_status
    const { data: restaurants, error } = await supabaseProd
      .from('france_restaurants')
      .select(`
        id,
        name,
        deployment_status,
        is_active,
        is_exceptionally_closed,
        phone,
        address
      `)
      .order('name');

    if (error) {
      console.error('❌ [API] Erreur récupération restaurants PROD:', error);
      return NextResponse.json({
        success: false,
        error: `Erreur base PROD: ${error.message}`
      }, { status: 500 });
    }

    console.log(`✅ [API] ${restaurants?.length || 0} restaurants récupérés de PROD`);

    return NextResponse.json({
      success: true,
      restaurants: restaurants || []
    });

  } catch (error) {
    console.error('❌ [API] Exception restaurants PROD:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur connexion PROD'
    }, { status: 500 });
  }
}