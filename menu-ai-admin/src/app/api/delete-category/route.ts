// 🗑️ API SUPPRESSION DE CATÉGORIE COMPLÈTE
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase DEV par défaut
const environment = 'DEV'; // Force DEV
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface DeleteCategoryRequest {
  categoryId: number;
  restaurantId: number;
}

export async function DELETE(request: NextRequest) {
  try {
    const { categoryId, restaurantId }: DeleteCategoryRequest = await request.json();

    console.log('🗑️ Début suppression catégorie...', {
      categoryId,
      restaurantId
    });

    // Appel direct à la fonction de base de données avec transaction
    const { data, error } = await supabase.rpc('delete_category_complete', {
      p_category_id: categoryId,
      p_restaurant_id: restaurantId
    });

    if (error) {
      console.error('❌ Erreur fonction DB:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    // La fonction DB retourne directement un JSON avec success/error
    if (!data.success) {
      console.error('❌ Erreur suppression:', data.error);
      return NextResponse.json({
        success: false,
        error: data.error
      }, { status: 400 });
    }

    console.log('✅ Suppression réussie:', data.message);
    console.log('📊 Éléments supprimés:', data.deleted);

    return NextResponse.json({
      success: true,
      message: data.message,
      deleted: data.deleted
    });

  } catch (error) {
    console.error('❌ Erreur suppression catégorie:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression de la catégorie'
    }, { status: 500 });
  }
}