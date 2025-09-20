import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const duplicationId = parseInt(params.id);

    if (isNaN(duplicationId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de duplication invalide'
      }, { status: 400 });
    }

    console.log(`📋 Chargement détails duplication ${duplicationId}...`);

    const dataLoader = new SupabaseDataLoader();

    // Récupérer les informations de la duplication
    const { data: duplication, error: dupError } = await dataLoader.supabase
      .from('duplication_logs')
      .select(`
        *,
        source_restaurant:source_restaurant_id(name),
        target_restaurant:target_restaurant_id(name)
      `)
      .eq('id', duplicationId)
      .single();

    if (dupError) {
      console.error('❌ Erreur récupération duplication:', dupError);
      return NextResponse.json({
        success: false,
        error: 'Duplication non trouvée'
      }, { status: 404 });
    }

    // Récupérer les catégories dupliquées avec leurs produits
    const { data: categories, error: catError } = await dataLoader.supabase
      .from('france_menu_categories')
      .select(`
        id,
        name,
        icon,
        display_order,
        france_products(
          id,
          name,
          description,
          price_on_site_base,
          price_delivery_base,
          display_order
        )
      `)
      .eq('restaurant_id', duplication.target_restaurant_id)
      .order('display_order');

    if (catError) {
      console.error('❌ Erreur récupération catégories:', catError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors du chargement des catégories'
      }, { status: 500 });
    }

    // Récupérer les options dupliquées
    const { data: options, error: optError } = await dataLoader.supabase
      .from('france_product_options')
      .select(`
        id,
        option_name,
        option_group,
        price_modifier,
        display_order,
        product:france_products(name)
      `)
      .in('product_id',
        categories?.flatMap(cat =>
          cat.france_products?.map(p => p.id) || []
        ) || []
      )
      .order('display_order');

    if (optError) {
      console.error('❌ Erreur récupération options:', optError);
    }

    console.log(`✅ Détails duplication ${duplicationId} chargés: ${categories?.length} catégories, ${options?.length || 0} options`);

    return NextResponse.json({
      success: true,
      duplication: {
        ...duplication,
        source_restaurant: duplication.source_restaurant,
        target_restaurant: duplication.target_restaurant
      },
      categories: categories || [],
      options: options || []
    });

  } catch (error) {
    console.error('❌ Erreur API duplication-details:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}