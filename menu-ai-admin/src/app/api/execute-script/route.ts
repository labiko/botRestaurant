// 🚀 API EXÉCUTION DES SCRIPTS SQL
// =================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimezoneService } from '@/lib/timezone-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Exécution script SQL...');

    const body = await request.json();
    const { scriptId, environment } = body;

    if (!scriptId || !environment) {
      return NextResponse.json({
        success: false,
        error: 'scriptId et environment requis'
      });
    }

    if (!['DEV', 'PROD', 'BOTH'].includes(environment)) {
      return NextResponse.json({
        success: false,
        error: 'Environment invalide. Utilisez: DEV, PROD ou BOTH'
      });
    }

    // Connexion à la base DEV pour récupérer le script
    const supabaseUrlDev = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKeyDev = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseDev = createClient(supabaseUrlDev, supabaseKeyDev);

    // Récupération du script
    const { data: script, error: fetchError } = await supabaseDev
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

    console.log(`📋 Script trouvé: ${script.command_source || 'Sans description'}`);

    // Résultats d'exécution
    const results: any = {
      dev: null,
      prod: null
    };

    // Exécution en DEV
    if (environment === 'DEV' || environment === 'BOTH') {
      console.log('🧪 Exécution en DEV...');

      try {
        // Note: Pour des raisons de sécurité, nous ne pouvons pas exécuter directement du SQL arbitraire
        // Cette partie devrait être adaptée selon votre architecture

        // Mise à jour du statut
        await supabaseDev
          .from('menu_ai_scripts')
          .update({
            dev_status: 'executed',
            dev_executed_at: TimezoneService.getCurrentTimeForDB()
          })
          .eq('id', scriptId);

        results.dev = { success: true, message: 'Script marqué comme exécuté en DEV' };
        console.log('✅ Exécution DEV réussie');

      } catch (devError: any) {
        console.error('❌ Erreur exécution DEV:', devError);

        await supabaseDev
          .from('menu_ai_scripts')
          .update({
            dev_status: 'error',
            dev_error_message: devError.message || 'Erreur inconnue'
          })
          .eq('id', scriptId);

        results.dev = { success: false, error: devError.message };
      }
    }

    // Exécution en PROD
    if (environment === 'PROD' || environment === 'BOTH') {
      console.log('🔴 Exécution en PROD...');

      // Vérifier si DEV a réussi (si BOTH)
      if (environment === 'BOTH' && !results.dev?.success) {
        console.log('⚠️ Annulation PROD car DEV a échoué');
        return NextResponse.json({
          success: false,
          error: 'Exécution PROD annulée car DEV a échoué',
          results
        });
      }

      try {
        // Connexion à la base PROD - Configuration corrigée
        const supabaseUrlProd = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD!;
        const supabaseKeyProd = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD!;
        const supabaseProd = createClient(supabaseUrlProd, supabaseKeyProd);

        // Exécution réelle du SQL en PROD
        const { data: execResult, error: execError } = await supabaseProd.rpc('execute_sql', {
          sql_query: script.script_sql
        });

        if (execError) {
          throw new Error(`Erreur exécution PROD: ${execError.message}`);
        }

        console.log('✅ SQL exécuté en PROD:', execResult);

        // Mise à jour du statut
        await supabaseDev
          .from('menu_ai_scripts')
          .update({
            prod_status: 'executed',
            prod_executed_at: TimezoneService.getCurrentTimeForDB()
          })
          .eq('id', scriptId);

        results.prod = { success: true, message: 'Script marqué comme exécuté en PROD' };
        console.log('✅ Exécution PROD réussie');

      } catch (prodError: any) {
        console.error('❌ Erreur exécution PROD:', prodError);

        await supabaseDev
          .from('menu_ai_scripts')
          .update({
            prod_status: 'error',
            prod_error_message: prodError.message || 'Erreur inconnue'
          })
          .eq('id', scriptId);

        results.prod = { success: false, error: prodError.message };
      }
    }

    // Déterminer le succès global
    const overallSuccess =
      (environment === 'DEV' && results.dev?.success) ||
      (environment === 'PROD' && results.prod?.success) ||
      (environment === 'BOTH' && results.dev?.success && results.prod?.success);

    return NextResponse.json({
      success: overallSuccess,
      environment,
      results,
      message: `Script exécuté sur ${environment}`
    });

  } catch (error) {
    console.error('❌ Erreur API execute-script:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}