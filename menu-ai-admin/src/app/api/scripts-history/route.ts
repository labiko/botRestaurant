// 📜 API HISTORIQUE DES SCRIPTS SQL
// ==================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('📜 Récupération historique des scripts...');

    // Connexion à la base DEV (où sont stockés les scripts) - Configuration corrigée
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupération des scripts avec tri par date décroissante
    const { data: scripts, error } = await supabase
      .from('menu_ai_scripts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // Limiter aux 50 derniers scripts

    if (error) {
      console.error('❌ Erreur récupération scripts:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    console.log(`✅ ${scripts?.length || 0} scripts récupérés`);

    return NextResponse.json({
      success: true,
      scripts: scripts || [],
      count: scripts?.length || 0
    });

  } catch (error) {
    console.error('❌ Erreur API scripts-history:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Sauvegarde nouveau script...');

    const body = await request.json();
    const {
      script_sql,
      command_source,
      ai_explanation,
      category_name
    } = body;

    if (!script_sql) {
      return NextResponse.json({
        success: false,
        error: 'Script SQL requis'
      });
    }

    // Connexion à la base DEV - Configuration corrigée
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insertion du nouveau script (directement exécuté en DEV)
    const { data: newScript, error } = await supabase
      .from('menu_ai_scripts')
      .insert([{
        script_sql,
        command_source,
        ai_explanation,
        category_name,
        dev_status: 'executed',
        prod_status: 'not_applied',
        dev_executed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion script:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Script sauvegardé avec ID:', newScript?.id);

    return NextResponse.json({
      success: true,
      script: newScript
    });

  } catch (error) {
    console.error('❌ Erreur sauvegarde script:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}