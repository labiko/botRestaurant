// ↩️ API GÉNÉRATION ROLLBACK AVEC IA
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('↩️ Génération rollback avec IA...');

    const body = await request.json();
    const { scriptId } = body;

    if (!scriptId) {
      return NextResponse.json({
        success: false,
        error: 'scriptId requis'
      });
    }

    // Connexion à la base DEV
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupération du script original
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

    console.log(`📋 Génération rollback pour: ${script.command_source || 'Script ' + scriptId}`);

    // Si un rollback existe déjà
    if (script.rollback_sql) {
      console.log('✅ Rollback déjà existant');
      return NextResponse.json({
        success: true,
        rollback_sql: script.rollback_sql,
        cached: true
      });
    }

    // Prompt pour l'IA
    const systemPrompt = `
Tu es un expert en SQL PostgreSQL. Tu dois générer un script de ROLLBACK pour annuler les modifications d'un script SQL.

RÈGLES DE GÉNÉRATION DE ROLLBACK :
1. Pour INSERT → Générer DELETE avec les mêmes IDs
2. Pour UPDATE → Tu dois d'abord faire un SELECT pour récupérer les anciennes valeurs, puis UPDATE avec ces valeurs
3. Pour DELETE → Tu ne peux pas restaurer sans backup (indiquer dans un commentaire)
4. Toujours utiliser des transactions (BEGIN; ... COMMIT;)
5. Ajouter des commentaires explicatifs

IMPORTANT :
- Le rollback doit être EXACTEMENT l'inverse du script original
- Inclure des vérifications avant/après
- Gérer les cas d'erreur possibles

Génère UNIQUEMENT le script SQL de rollback, sans explications supplémentaires.
`;

    const userPrompt = `
Script SQL original à annuler :
${script.script_sql}

Contexte : ${script.ai_explanation || script.command_source || 'Modification de menu restaurant'}

Génère le script SQL de ROLLBACK complet.
`;

    // Appel à OpenAI
    console.log('🤖 Envoi requête OpenAI pour rollback...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 1500
    });

    const rollbackSQL = completion.choices[0]?.message?.content;

    if (!rollbackSQL) {
      throw new Error('Pas de réponse de l\'IA');
    }

    console.log('✅ Rollback généré avec succès');

    // Sauvegarde du rollback
    const { error: updateError } = await supabase
      .from('menu_ai_scripts')
      .update({
        rollback_sql: rollbackSQL
      })
      .eq('id', scriptId);

    if (updateError) {
      console.error('⚠️ Erreur sauvegarde rollback:', updateError);
    }

    return NextResponse.json({
      success: true,
      rollback_sql: rollbackSQL,
      cached: false
    });

  } catch (error) {
    console.error('❌ Erreur génération rollback:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Exécution rollback...');

    const body = await request.json();
    const { scriptId, environment } = body;

    if (!scriptId || !environment) {
      return NextResponse.json({
        success: false,
        error: 'scriptId et environment requis'
      });
    }

    if (!['DEV', 'PROD'].includes(environment)) {
      return NextResponse.json({
        success: false,
        error: 'Environment invalide. Utilisez: DEV ou PROD'
      });
    }

    // Connexion à la base DEV
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupération du script avec rollback
    const { data: script, error: fetchError } = await supabase
      .from('menu_ai_scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (fetchError || !script || !script.rollback_sql) {
      console.error('❌ Script ou rollback non trouvé:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Script ou rollback non trouvé'
      });
    }

    console.log(`🔄 Exécution rollback en ${environment}...`);

    // Mise à jour du statut
    const statusField = environment === 'DEV' ? 'dev_status' : 'prod_status';
    const { error: updateError } = await supabase
      .from('menu_ai_scripts')
      .update({
        [statusField]: 'rolled_back'
      })
      .eq('id', scriptId);

    if (updateError) {
      console.error('❌ Erreur mise à jour statut:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: `Rollback marqué comme exécuté en ${environment}`,
      rollback_sql: script.rollback_sql
    });

  } catch (error) {
    console.error('❌ Erreur exécution rollback:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}