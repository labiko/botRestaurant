import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 [API] Récupération des groupes d\'options prédéfinis');

    // Récupérer tous les groupes d'options actifs, triés par ordre d'affichage
    const { data: groups, error } = await supabase
      .from('france_option_groups')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ [API] Erreur récupération groupes:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur récupération groupes d\'options',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ [API] Groupes récupérés:', groups?.length || 0);

    return NextResponse.json({
      success: true,
      groups: groups || [],
      count: groups?.length || 0
    });

  } catch (error) {
    console.error('❌ [API] Erreur serveur option-groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur interne',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}