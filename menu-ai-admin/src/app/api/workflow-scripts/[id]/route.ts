// ===================================================================
// API WORKFLOW SCRIPTS - SUPPRESSION
// ===================================================================
// DELETE /api/workflow-scripts/[id]
// Supprime un script SQL spécifique

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scriptId = params.id;

    console.log('🗑️ [WORKFLOW-SCRIPTS] Suppression script:', scriptId);

    if (!scriptId || isNaN(parseInt(scriptId))) {
      return NextResponse.json({
        success: false,
        error: 'ID de script invalide'
      }, { status: 400 });
    }

    // Connexion Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier d'abord que le script existe
    const { data: existingScript, error: selectError } = await supabase
      .from('workflow_sql_scripts')
      .select('id, product_name, created_at')
      .eq('id', parseInt(scriptId))
      .single();

    if (selectError || !existingScript) {
      console.warn('⚠️ [WORKFLOW-SCRIPTS] Script non trouvé:', scriptId);
      return NextResponse.json({
        success: false,
        error: 'Script non trouvé'
      }, { status: 404 });
    }

    console.log('📝 [WORKFLOW-SCRIPTS] Script à supprimer:', {
      id: existingScript.id,
      product_name: existingScript.product_name,
      created_at: existingScript.created_at
    });

    // Suppression du script
    const { error: deleteError } = await supabase
      .from('workflow_sql_scripts')
      .delete()
      .eq('id', parseInt(scriptId));

    if (deleteError) {
      console.error('❌ [WORKFLOW-SCRIPTS] Erreur suppression:', deleteError);
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 });
    }

    console.log('✅ [WORKFLOW-SCRIPTS] Script supprimé avec succès:', scriptId);

    return NextResponse.json({
      success: true,
      message: 'Script supprimé avec succès',
      deletedScript: {
        id: existingScript.id,
        product_name: existingScript.product_name
      }
    });

  } catch (error) {
    console.error('❌ [WORKFLOW-SCRIPTS] Erreur suppression:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}