import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

/**
 * API de suppression complète d'un restaurant
 * Supprime toutes les données liées : produits, catégories, etc.
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Démarrage suppression restaurant...');

    const { restaurantId, restaurantName } = await request.json();

    if (!restaurantId && !restaurantName) {
      return NextResponse.json({
        success: false,
        error: 'ID ou nom du restaurant requis'
      }, { status: 400 });
    }

    const dataLoader = new SupabaseDataLoader();

    // 1. Récupérer les informations du restaurant
    console.log('🔍 Recherche du restaurant...');
    let restaurant;

    if (restaurantId) {
      const { data, error } = await dataLoader.supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      restaurant = data;
    } else {
      const { data, error } = await dataLoader.supabase
        .from('france_restaurants')
        .select('*')
        .eq('name', restaurantName)
        .single();

      if (error) throw error;
      restaurant = data;
    }

    if (!restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 });
    }

    console.log(`🎯 Restaurant trouvé: ${restaurant.name} (ID: ${restaurant.id})`);

    // 2. Compter les données avant suppression
    const [categoriesCount, productsCount] = await Promise.all([
      dataLoader.supabase
        .from('france_menu_categories')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id),
      dataLoader.supabase
        .from('france_products')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
    ]);

    const stats = {
      categories: categoriesCount.count || 0,
      products: productsCount.count || 0
    };

    console.log('📊 Données à supprimer:', stats);

    // 3. Exécuter la suppression en transaction
    console.log('🗑️ Démarrage suppression en cascade...');

    // Suppression des produits (inclut les suppléments)
    console.log('🗑️ Suppression des produits...');
    const { error: productsError } = await dataLoader.supabase
      .from('france_products')
      .delete()
      .eq('restaurant_id', restaurant.id);

    if (productsError) throw productsError;

    // Suppression des catégories
    console.log('🗑️ Suppression des catégories...');
    const { error: categoriesError } = await dataLoader.supabase
      .from('france_menu_categories')
      .delete()
      .eq('restaurant_id', restaurant.id);

    if (categoriesError) throw categoriesError;

    // Suppression du restaurant principal
    console.log('🗑️ Suppression du restaurant...');
    const { error: restaurantError } = await dataLoader.supabase
      .from('france_restaurants')
      .delete()
      .eq('id', restaurant.id);

    if (restaurantError) throw restaurantError;

    console.log('✅ Suppression terminée avec succès !');

    return NextResponse.json({
      success: true,
      message: 'Restaurant supprimé avec succès',
      deletedRestaurant: {
        id: restaurant.id,
        name: restaurant.name
      },
      statistics: {
        categoriesDeleted: stats.categories,
        productsDeleted: stats.products,
        supplementsDeleted: 0 // Inclus dans products
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression restaurant:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression du restaurant',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

/**
 * API pour obtenir un aperçu des données à supprimer
 */
export async function POST(request: NextRequest) {
  try {
    console.log('👁️ Demande aperçu suppression...');

    const { restaurantId, restaurantName } = await request.json();

    if (!restaurantId && !restaurantName) {
      return NextResponse.json({
        success: false,
        error: 'ID ou nom du restaurant requis'
      }, { status: 400 });
    }

    const dataLoader = new SupabaseDataLoader();

    // Récupérer les informations du restaurant
    let restaurant;

    if (restaurantId) {
      const { data, error } = await dataLoader.supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      restaurant = data;
    } else {
      const { data, error } = await dataLoader.supabase
        .from('france_restaurants')
        .select('*')
        .eq('name', restaurantName)
        .single();

      if (error) throw error;
      restaurant = data;
    }

    if (!restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 });
    }

    // Compter toutes les données liées
    const [categoriesResult, productsResult, supplementsResult] = await Promise.all([
      dataLoader.supabase
        .from('france_menu_categories')
        .select('name', { count: 'exact' })
        .eq('restaurant_id', restaurant.id),
      dataLoader.supabase
        .from('france_products')
        .select('name', { count: 'exact' })
        .eq('restaurant_id', restaurant.id),
      dataLoader.supabase
        .from('france_products')
        .select('name', { count: 'exact' })
        .eq('restaurant_id', restaurant.id)
        .eq('category_id', await getCategoryId(dataLoader, restaurant.id, 'Suppléments'))
    ]);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address
      },
      preview: {
        categories: categoriesResult.count || 0,
        products: productsResult.count || 0,
        supplements: supplementsResult.count || 0,
        categoryNames: categoriesResult.data?.map(c => c.name) || [],
        productNames: productsResult.data?.map(p => p.name) || []
      }
    });

  } catch (error) {
    console.error('❌ Erreur aperçu suppression:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'aperçu',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

/**
 * Utilitaire pour récupérer l'ID d'une catégorie
 */
async function getCategoryId(dataLoader: SupabaseDataLoader, restaurantId: number, categoryName: string): Promise<number | null> {
  try {
    const { data, error } = await dataLoader.supabase
      .from('france_menu_categories')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('name', categoryName)
      .single();

    if (error) return null;
    return data?.id || null;
  } catch {
    return null;
  }
}