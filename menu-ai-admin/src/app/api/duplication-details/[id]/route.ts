import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/lib/api-helpers';

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

    const dataLoader = getSupabaseForRequest(request);

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
        created_at,
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

    // Récupérer les options dupliquées - groupées par produit pour éviter les doublons
    const productIds = categories?.flatMap(cat =>
      cat.france_products?.map(p => p.id) || []
    ) || [];

    const { data: options, error: optError } = await dataLoader.supabase
      .from('france_product_options')
      .select(`
        id,
        product_id,
        option_name,
        option_group,
        price_modifier,
        display_order,
        product:france_products(id, name)
      `)
      .in('product_id', productIds)
      .order('product_id, option_group, display_order');

    if (optError) {
      console.error('❌ Erreur récupération options:', optError);
    }

    // Dédupliquer les options basé uniquement sur option_name et option_group
    // (car toutes les boissons sont identiques pour tous les produits)
    console.log(`🔍 Début déduplication: ${options?.length || 0} options récupérées`);

    const uniqueOptions = options?.reduce((acc, option) => {
      // Normaliser la clé pour éviter les problèmes d'encodage
      const normalizedName = option.option_name?.trim().toLowerCase();
      const normalizedGroup = option.option_group?.trim().toLowerCase();
      const key = `${normalizedGroup}_${normalizedName}`;

      // Garder seulement la première occurrence de chaque combinaison unique
      if (!acc.has(key)) {
        acc.set(key, option);
        console.log(`➕ Nouvelle option ajoutée: "${option.option_name}" (groupe: "${option.option_group}") - clé: "${key}"`);
      } else {
        console.log(`⏭️ Option dupliquée ignorée: "${option.option_name}" (groupe: "${option.option_group}") - clé: "${key}"`);
      }

      return acc;
    }, new Map());

    const deduplicatedOptions = Array.from(uniqueOptions?.values() || []);

    console.log(`✅ Détails duplication ${duplicationId} chargés: ${categories?.length} catégories, ${deduplicatedOptions.length} options uniques (sur ${options?.length || 0} total)`);
    console.log(`📋 Options finales:`, deduplicatedOptions.map(opt => `"${opt.option_name}" (${opt.option_group})`));

    return NextResponse.json({
      success: true,
      duplication: {
        ...duplication,
        source_restaurant: duplication.source_restaurant,
        target_restaurant: duplication.target_restaurant
      },
      categories: categories || [],
      options: deduplicatedOptions
    });

  } catch (error) {
    console.error('❌ Erreur API duplication-details:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}