// 📁 API CATÉGORIES D'UN RESTAURANT
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id);

    if (!restaurantId || isNaN(restaurantId)) {
      return NextResponse.json({
        success: false,
        error: 'ID restaurant invalide'
      }, { status: 400 });
    }

    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';
    const supabaseUrl = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
      : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log(`📁 Récupération catégories du restaurant ${restaurantId}...`);

    // Récupérer les catégories avec comptage des produits
    const { data: categories, error } = await supabase
      .from('france_menu_categories')
      .select(`
        id,
        name,
        slug,
        display_order,
        is_active
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('❌ Erreur récupération catégories:', error);
      throw error;
    }

    // Compter les produits pour chaque catégorie
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from('france_products')
          .select('id', { count: 'exact' })
          .eq('category_id', category.id)
          .eq('is_active', true);

        return {
          ...category,
          products_count: count || 0
        };
      })
    );

    console.log(`✅ ${categoriesWithCount.length} catégories récupérées pour restaurant ${restaurantId}`);

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount
    });

  } catch (error) {
    console.error('❌ Erreur API catégories restaurant:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des catégories',
      categories: []
    }, { status: 500 });
  }
}