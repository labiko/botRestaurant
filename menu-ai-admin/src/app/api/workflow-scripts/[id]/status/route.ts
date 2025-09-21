// ===================================================================
// API WORKFLOW SCRIPTS - MISE À JOUR STATUT
// ===================================================================
// PATCH /api/workflow-scripts/[id]/status
// Met à jour le statut d'exécution (DEV/PROD) d'un script

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface UpdateStatusRequest {
  environment: 'DEV' | 'PROD';
  executed: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scriptId = params.id;

    console.log('🔄 [WORKFLOW-SCRIPTS] Mise à jour statut script:', scriptId);

    if (!scriptId || isNaN(parseInt(scriptId))) {
      return NextResponse.json({
        success: false,
        error: 'ID de script invalide'
      }, { status: 400 });
    }

    const body: UpdateStatusRequest = await request.json();
    const { environment, executed } = body;

    // Validation
    if (!environment || !['DEV', 'PROD'].includes(environment)) {
      return NextResponse.json({
        success: false,
        error: 'Environment doit être "DEV" ou "PROD"'
      }, { status: 400 });
    }

    if (typeof executed !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'executed doit être un boolean'
      }, { status: 400 });
    }

    // Connexion Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Préparation des champs à mettre à jour
    const updateFields: any = {};

    if (environment === 'DEV') {
      updateFields.executed_dev = executed;
      if (executed) {
        updateFields.dev_executed_at = new Date().toISOString();
      } else {
        updateFields.dev_executed_at = null;
      }
    } else {
      updateFields.executed_prod = executed;
      if (executed) {
        updateFields.prod_executed_at = new Date().toISOString();
      } else {
        updateFields.prod_executed_at = null;
      }
    }

    console.log('📝 [WORKFLOW-SCRIPTS] Champs à mettre à jour:', updateFields);

    // Mise à jour en base
    const { data: updatedScript, error } = await supabase
      .from('workflow_sql_scripts')
      .update(updateFields)
      .eq('id', parseInt(scriptId))
      .select()
      .single();

    if (error) {
      console.error('❌ [WORKFLOW-SCRIPTS] Erreur mise à jour:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!updatedScript) {
      return NextResponse.json({
        success: false,
        error: 'Script non trouvé'
      }, { status: 404 });
    }

    console.log('✅ [WORKFLOW-SCRIPTS] Statut mis à jour:', {
      id: updatedScript.id,
      environment,
      executed,
      executed_dev: updatedScript.executed_dev,
      executed_prod: updatedScript.executed_prod
    });

    // Format compatible localStorage existant
    const formattedScript = {
      id: updatedScript.id.toString(),
      created_at: updatedScript.created_at,
      product_name: updatedScript.product_name,
      product_id: updatedScript.product_id,
      sql_script: updatedScript.sql_script,
      executed_dev: updatedScript.executed_dev,
      executed_prod: updatedScript.executed_prod,
      modifications_summary: updatedScript.modifications_summary
    };

    return NextResponse.json({
      success: true,
      script: formattedScript
    });

  } catch (error) {
    console.error('❌ [WORKFLOW-SCRIPTS] Erreur mise à jour statut:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}