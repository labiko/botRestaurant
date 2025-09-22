// ===================================================================
// API WORKFLOW SCRIPTS - RÉCUPÉRATION PAR PRODUCT ID
// ===================================================================
// GET /api/workflow-scripts/[productId]
// Récupère tous les scripts SQL pour un produit donné

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface WorkflowScript {
  id: number;
  product_id: number;
  product_name: string;
  sql_script: string;
  created_at: string;
  executed_dev: boolean;
  executed_prod: boolean;
  dev_executed_at: string | null;
  prod_executed_at: string | null;
  modifications_summary: {
    updates: number;
    inserts: number;
    deletes: number;
    total_options: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    console.log('📄 [WORKFLOW-SCRIPTS] Récupération scripts pour produit:', productId);

    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json({
        success: false,
        error: 'ProductId invalide'
      }, { status: 400 });
    }

    // Connexion Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupération des scripts triés par date décroissante
    const { data: scripts, error } = await supabase
      .from('workflow_sql_scripts')
      .select('*')
      .eq('product_id', parseInt(productId))
      .order('created_at', { ascending: false })
      .limit(100); // Limiter pour éviter surcharge

    if (error) {
      console.error('❌ [WORKFLOW-SCRIPTS] Erreur récupération:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ [WORKFLOW-SCRIPTS] ${scripts?.length || 0} scripts trouvés`);

    // Format compatible localStorage existant
    const formattedScripts = scripts?.map(script => ({
      id: script.id.toString(),
      created_at: script.created_at,
      product_name: script.product_name,
      product_id: script.product_id,
      sql_script: script.sql_script,
      executed_dev: script.executed_dev,
      executed_prod: script.executed_prod,
      modifications_summary: script.modifications_summary
    })) || [];

    return NextResponse.json({
      success: true,
      scripts: formattedScripts,
      count: formattedScripts.length
    });

  } catch (error) {
    console.error('❌ [WORKFLOW-SCRIPTS] Erreur serveur:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}