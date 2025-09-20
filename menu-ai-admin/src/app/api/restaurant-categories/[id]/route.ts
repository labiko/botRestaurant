import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id);

    if (isNaN(restaurantId)) {
      return NextResponse.json({
        success: false,
        error: 'ID restaurant invalide'
      }, { status: 400 });
    }

    // Récupérer les catégories avec statistiques
    const { data: categories, error: categoriesError } = await supabase
      .from('france_menu_categories')
      .select(`
        id,
        name,
        slug,
        icon,
        display_order,
        products:france_products(
          id,
          name,
          requires_steps,
          product_type
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('display_order');

    if (categoriesError) {
      console.error('❌ Erreur récupération catégories:', categoriesError);
      return NextResponse.json({
        success: false,
        error: categoriesError.message
      }, { status: 400 });
    }

    if (!categories) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé ou aucune catégorie'
      }, { status: 404 });
    }

    // Enrichir avec les statistiques de workflows
    const enrichedCategories = categories.map(category => {
      const products = category.products || [];
      const workflowsCount = products.filter(p => p.requires_steps).length;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        display_order: category.display_order,
        stats: {
          products: products.length,
          workflows: workflowsCount,
          simple: products.filter(p => p.product_type === 'simple').length,
          composite: products.filter(p => p.product_type === 'composite').length
        }
      };
    });

    return NextResponse.json({
      success: true,
      categories: enrichedCategories
    });

  } catch (error) {
    console.error('❌ Erreur GET categories:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des catégories'
    }, { status: 500 });
  }
}