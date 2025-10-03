import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

/**
 * API de suppression complète d'un restaurant
 * Supprime toutes les données liées : produits, catégories, etc.
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Démarrage suppression restaurant...');

    const { restaurantId, restaurantName, environment } = await request.json();

    if (!restaurantId && !restaurantName) {
      return NextResponse.json({
        success: false,
        error: 'ID ou nom du restaurant requis'
      }, { status: 400 });
    }

    const dataLoader = new SupabaseDataLoader(environment);

    // Déterminer l'ID du restaurant
    let targetRestaurantId = restaurantId;

    if (!targetRestaurantId && restaurantName) {
      const { data, error } = await dataLoader.supabase
        .from('france_restaurants')
        .select('id')
        .eq('name', restaurantName)
        .single();

      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: 'Restaurant non trouvé'
        }, { status: 404 });
      }

      targetRestaurantId = data.id;
    }

    console.log(`🎯 Suppression du restaurant ID: ${targetRestaurantId}`);

    // Exécuter la fonction PostgreSQL de suppression complète
    console.log('🗑️ Exécution fonction PostgreSQL de suppression complète...');
    const { data: result, error: functionError } = await dataLoader.supabase
      .rpc('delete_restaurant_complete', {
        p_restaurant_id: targetRestaurantId
      });

    if (functionError) {
      console.error('❌ Erreur fonction PostgreSQL:', functionError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'exécution de la fonction de suppression',
        details: functionError.message
      }, { status: 500 });
    }

    console.log('📊 Résultat fonction PostgreSQL:', result);

    // Vérifier le succès de la fonction
    if (!result || !result.success) {
      return NextResponse.json({
        success: false,
        error: result?.error || 'Erreur lors de la suppression',
        details: result?.details
      }, { status: 400 });
    }

    console.log('✅ Suppression terminée avec succès !');

    return NextResponse.json({
      success: true,
      message: result.message,
      deletedRestaurant: result.deleted_restaurant,
      statisticsBefore: result.statistics_before,
      statisticsDeleted: result.statistics_deleted
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

    const { restaurantId, restaurantName, environment } = await request.json();

    if (!restaurantId && !restaurantName) {
      return NextResponse.json({
        success: false,
        error: 'ID ou nom du restaurant requis'
      }, { status: 400 });
    }

    const dataLoader = new SupabaseDataLoader(environment);

    // Déterminer l'ID du restaurant
    let targetRestaurantId = restaurantId;

    if (!targetRestaurantId && restaurantName) {
      const { data, error } = await dataLoader.supabase
        .from('france_restaurants')
        .select('id')
        .eq('name', restaurantName)
        .single();

      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: 'Restaurant non trouvé'
        }, { status: 404 });
      }

      targetRestaurantId = data.id;
    }

    console.log(`👁️ Aperçu suppression restaurant ID: ${targetRestaurantId}`);

    // Exécuter la fonction PostgreSQL d'aperçu
    console.log('👁️ Exécution fonction PostgreSQL d\'aperçu...');
    const { data: result, error: functionError } = await dataLoader.supabase
      .rpc('preview_restaurant_deletion', {
        p_restaurant_id: targetRestaurantId
      });

    if (functionError) {
      console.error('❌ Erreur fonction PostgreSQL:', functionError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'exécution de la fonction d\'aperçu',
        details: functionError.message
      }, { status: 500 });
    }

    console.log('📊 Résultat aperçu PostgreSQL:', result);

    // Vérifier le succès de la fonction
    if (!result || !result.success) {
      return NextResponse.json({
        success: false,
        error: result?.error || 'Erreur lors de la génération de l\'aperçu',
        details: result?.details
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      restaurant: result.restaurant,
      preview: result.preview
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