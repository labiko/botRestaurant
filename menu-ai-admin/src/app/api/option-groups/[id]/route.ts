import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return NextResponse.json(
        { success: false, error: 'Configuration manquante' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide'
        },
        { status: 400 }
      );
    }

    console.log('🗑️ [API] Suppression du groupe ID:', id);

    // Supprimer le groupe
    const { error } = await supabase
      .from('france_option_groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [API] Erreur suppression groupe:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la suppression du groupe',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ [API] Groupe supprimé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Groupe supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ [API] Erreur serveur DELETE option-groups:', error);
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