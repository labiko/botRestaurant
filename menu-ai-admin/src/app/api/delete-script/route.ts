// 🗑️ API SUPPRESSION DES SCRIPTS NON EXÉCUTÉS
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Suppression script...');

    // Récupération de l'ID depuis l'URL
    const url = new URL(request.url);
    const scriptId = url.searchParams.get('id');

    if (!scriptId) {
      return NextResponse.json({
        success: false,
        error: 'ID du script requis'
      });
    }

    // Connexion à la base DEV
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérification que le script n'a pas été exécuté
    const { data: script, error: fetchError } = await supabase
      .from('menu_ai_scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (fetchError || !script) {
      console.error('❌ Script non trouvé:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Script non trouvé'
      });
    }

    // Vérifier que le script n'a jamais été exécuté
    if (script.dev_status === 'executed' || script.prod_status === 'executed') {
      console.log('⚠️ Script déjà exécuté, suppression interdite');
      return NextResponse.json({
        success: false,
        error: 'Impossible de supprimer un script déjà exécuté',
        details: {
          dev_status: script.dev_status,
          prod_status: script.prod_status
        }
      });
    }

    // Suppression du script
    const { error: deleteError } = await supabase
      .from('menu_ai_scripts')
      .delete()
      .eq('id', scriptId);

    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError);
      return NextResponse.json({
        success: false,
        error: deleteError.message
      });
    }

    console.log(`✅ Script ${scriptId} supprimé avec succès`);

    return NextResponse.json({
      success: true,
      message: 'Script supprimé avec succès',
      deletedId: scriptId
    });

  } catch (error) {
    console.error('❌ Erreur API delete-script:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}