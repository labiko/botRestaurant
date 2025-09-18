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
    const dangerousCommands = ['DROP', 'TRUNCATE', 'DELETE FROM', 'ALTER TABLE'];

    for (const command of dangerousCommands) {
      if (sqlUpper.includes(command)) {
        return NextResponse.json({
          success: false,
          error: `Commande SQL dangereuse détectée: ${command}. Pour la sécurité, seules les commandes INSERT et UPDATE sont autorisées.`
        });
      }
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