// 🏷️ API MISE À JOUR NOM CATÉGORIE
// ==================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase DEV par défaut
const environment = 'DEV'; // Force DEV
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(request: NextRequest) {
  try {
    const { categoryId, restaurantId, newName } = await request.json();

    if (!categoryId || !restaurantId || !newName?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Paramètres manquants'
      }, { status: 400 });
    }

    // Mise à jour simple du nom de catégorie
    const { error } = await supabase
      .from('france_menu_categories')
      .update({
        name: newName.trim(),
        slug: newName.trim().toLowerCase().replace(/\s+/g, '-')
      })
      .eq('id', categoryId)
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('❌ Erreur mise à jour nom:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Catégorie renommée en "${newName.trim()}"`
    });

  } catch (error) {
    console.error('❌ Erreur API update-name:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour du nom'
    }, { status: 500 });
  }
}