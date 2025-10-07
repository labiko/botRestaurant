// ===================================================================
// API WORKFLOW SCRIPTS - CRÉATION
// ===================================================================
// POST /api/workflow-scripts
// Sauvegarde un nouveau script SQL généré par le workflow

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

interface CreateScriptRequest {
  productId: number;
  productName: string;
  sqlScript: string;
  modificationsSummary?: {
    updates: number;
    inserts: number;
    deletes: number;
    total_options: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [WORKFLOW-SCRIPTS-API] Début sauvegarde nouveau script...');

    const body: CreateScriptRequest = await request.json();
    console.log('📥 [WORKFLOW-SCRIPTS-API] Body reçu:', {
      productId: body.productId,
      productName: body.productName,
      sqlLength: body.sqlScript?.length || 0,
      hasModifications: !!body.modificationsSummary
    });

    const { productId, productName, sqlScript, modificationsSummary } = body;

    // Validation des données requises
    if (!productId || !productName || !sqlScript) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes: productId, productName et sqlScript sont requis'
      }, { status: 400 });
    }

    if (typeof productId !== 'number' || productId <= 0) {
      return NextResponse.json({
        success: false,
        error: 'ProductId doit être un nombre positif'
      }, { status: 400 });
    }

    // Connexion Supabase (respecte l'environnement DEV/PROD)
    const supabase = getSupabaseClientForRequest(request);

    // Préparation des données avec defaults
    const scriptData = {
      product_id: productId,
      product_name: productName.trim(),
      sql_script: sqlScript.trim(),
      modifications_summary: modificationsSummary || {
        updates: 0,
        inserts: 0,
        deletes: 0,
        total_options: 0
      }
    };

    console.log('📝 [WORKFLOW-SCRIPTS-API] Données à insérer:', {
      product_id: scriptData.product_id,
      product_name: scriptData.product_name,
      sql_length: scriptData.sql_script.length,
      modifications: scriptData.modifications_summary
    });

    // Insertion en base
    console.log('💽 [WORKFLOW-SCRIPTS-API] Début insertion...');
    const { data: newScript, error } = await supabase
      .from('workflow_sql_scripts')
      .insert([scriptData])
      .select()
      .single();

    if (error) {
      console.error('❌ [WORKFLOW-SCRIPTS-API] Erreur insertion:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details
      }, { status: 500 });
    }

    console.log('✅ [WORKFLOW-SCRIPTS-API] Script sauvegardé avec ID:', newScript?.id, newScript);

    // Format compatible localStorage existant
    const formattedScript = {
      id: newScript.id.toString(),
      created_at: newScript.created_at,
      product_name: newScript.product_name,
      product_id: newScript.product_id,
      sql_script: newScript.sql_script,
      executed_dev: newScript.executed_dev,
      executed_prod: newScript.executed_prod,
      modifications_summary: newScript.modifications_summary
    };

    return NextResponse.json({
      success: true,
      script: formattedScript
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [WORKFLOW-SCRIPTS] Erreur sauvegarde:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}