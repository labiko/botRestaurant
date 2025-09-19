// 🔄 API MISE À JOUR STATUT SCRIPT
// =================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Mise à jour statut script...');

    const body = await request.json();
    const {
      script_sql,
      dev_status,
      prod_status,
      dev_executed_at,
      prod_executed_at,
      dev_error_message,
      prod_error_message
    } = body;

    if (!script_sql) {
      return NextResponse.json({
        success: false,
        error: 'Script SQL requis pour identification'
      });
    }

    // Connexion à la base DEV - Configuration corrigée
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Préparer les données de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (dev_status) {
      updateData.dev_status = dev_status;
      if (dev_executed_at) updateData.dev_executed_at = dev_executed_at;
      if (dev_error_message) updateData.dev_error_message = dev_error_message;
    }

    if (prod_status) {
      updateData.prod_status = prod_status;
      if (prod_executed_at) updateData.prod_executed_at = prod_executed_at;
      if (prod_error_message) updateData.prod_error_message = prod_error_message;
    }

    console.log('📝 Données mise à jour:', updateData);

    // Mise à jour du script par SQL (plus récent avec ce SQL)
    const { data: updatedScript, error } = await supabase
      .from('menu_ai_scripts')
      .update(updateData)
      .eq('script_sql', script_sql)
      .order('created_at', { ascending: false })
      .limit(1)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Statut script mis à jour:', updatedScript);

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      script: updatedScript
    });

  } catch (error) {
    console.error('❌ Erreur API update-script-status:', error);

    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}