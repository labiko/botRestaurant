// 📜 API HISTORIQUE DES SCRIPTS SQL
// ==================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimezoneService } from '@/lib/timezone-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📜 Récupération historique des scripts...');

    // Récupérer le paramètre source de l'URL
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');

    console.log('🔍 Filtre par source:', source || 'aucun');

    // Connexion à la base DEV (où sont stockés les scripts) - Configuration corrigée
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construire la requête
    let query = supabase
      .from('menu_ai_scripts')
      .select('*');

    // Appliquer le filtre par source si fourni
    if (source) {
      query = query.ilike('command_source', `%${source}%`);
    }

    // Récupération des scripts avec tri par date décroissante
    const { data: scripts, error } = await query
      .order('created_at', { ascending: false })
      .limit(50); // Limiter aux 50 derniers scripts

    if (error) {
      console.error('❌ Erreur récupération scripts:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    console.log(`✅ ${scripts?.length || 0} scripts récupérés${source ? ` pour source: ${source}` : ''}`);

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
        dev_executed_at: TimezoneService.getCurrentTimeForDB()
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
      script: newScript,
      scriptId: newScript?.id // Ajouter scriptId pour compatibilité
    });

  } catch (error) {
    console.error('❌ Erreur sauvegarde script:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}