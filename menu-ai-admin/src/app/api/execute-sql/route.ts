// 🛠️ API EXÉCUTION SQL - BASE DE DONNÉES
// =====================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { sql, environment } = await request.json();

    if (!sql) {
      return NextResponse.json({
        success: false,
        error: 'SQL requis'
      });
    }

    // Configuration Supabase selon l'environnement demandé
    const isProduction = environment === 'PROD';

    const supabaseUrl = isProduction
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey = isProduction
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Configuration Supabase manquante'
      });
    }

    console.log(`🔄 Exécution SQL sur ${isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
    console.log('SQL à exécuter:', sql);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validation basique du SQL pour éviter les commandes dangereuses
    const sqlUpper = sql.toUpperCase();

    // Commandes absolument interdites
    const forbiddenCommands = ['DROP', 'TRUNCATE', 'ALTER TABLE'];

    for (const command of forbiddenCommands) {
      if (sqlUpper.includes(command)) {
        return NextResponse.json({
          success: false,
          error: `Commande SQL dangereuse détectée: ${command}. Cette commande est interdite.`
        });
      }
    }

    // Validation spéciale pour DELETE - autoriser seulement les DELETE sécurisés avec WHERE
    if (sqlUpper.includes('DELETE FROM')) {
      // Vérifier que tous les DELETE ont des conditions WHERE sécurisées
      const deleteStatements = sql.match(/DELETE FROM[\s\S]*?(?=;|$)/gi) || [];

      for (const deleteStmt of deleteStatements) {
        const deleteUpper = deleteStmt.toUpperCase();

        // Vérifier que le DELETE a une clause WHERE
        if (!deleteUpper.includes('WHERE')) {
          return NextResponse.json({
            success: false,
            error: 'DELETE sans clause WHERE détecté. Pour la sécurité, tous les DELETE doivent avoir une condition WHERE.'
          });
        }

        // Vérifier que c'est un DELETE sur france_product_options avec product_id
        if (!deleteUpper.includes('FRANCE_PRODUCT_OPTIONS') || !deleteUpper.includes('PRODUCT_ID')) {
          return NextResponse.json({
            success: false,
            error: 'DELETE autorisé uniquement sur france_product_options avec condition product_id.'
          });
        }
      }

      console.log(`⚠️ DELETE sécurisé autorisé: ${deleteStatements.length} statement(s) validé(s)`);
    }

    // Exécution du SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        error: `Erreur base de données: ${error.message}`
      });
    }

    console.log('✅ SQL exécuté avec succès');

    return NextResponse.json({
      success: true,
      message: 'SQL exécuté avec succès',
      data,
      environment: isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'
    });

  } catch (error) {
    console.error('Erreur API execute-sql:', error);

    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}