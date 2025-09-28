import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return NextResponse.json(
        { success: false, error: 'Configuration manquante' },
        { status: 500 }
      );
    }

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

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const { group_name, icon, display_order } = body;

    // Validation
    if (!group_name || !icon || !display_order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants'
        },
        { status: 400 }
      );
    }

    console.log('➕ [API] Ajout d\'un nouveau groupe:', group_name);

    // Générer le component_name basé sur le group_name
    const component_name = group_name.endsWith('s')
      ? group_name.slice(0, -1)
      : group_name + ' au choix';

    // Ajouter le nouveau groupe
    const { data, error } = await supabase
      .from('france_option_groups')
      .insert({
        group_name,
        component_name,
        unit: 'choix',
        icon,
        display_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Erreur ajout groupe:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de l\'ajout du groupe',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ [API] Groupe ajouté:', data);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ [API] Erreur serveur POST option-groups:', error);
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