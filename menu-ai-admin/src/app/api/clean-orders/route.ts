import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

/**
 * API de nettoyage des commandes d'un restaurant
 * Supprime toutes les commandes, items et sessions pour les tests
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Démarrage nettoyage des commandes...');

    const { restaurantId, environment } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'ID du restaurant requis'
      }, { status: 400 });
    }

    const dataLoader = new SupabaseDataLoader(environment);

    console.log(`🎯 Nettoyage des commandes du restaurant ID: ${restaurantId} (ENV: ${environment})`);

    // Exécuter la fonction PostgreSQL de nettoyage
    console.log('🧹 Exécution fonction PostgreSQL de nettoyage...');
    const { data: result, error: functionError } = await dataLoader.supabase
      .rpc('clean_restaurant_orders', {
        p_restaurant_id: restaurantId
      });

    if (functionError) {
      console.error('❌ Erreur fonction PostgreSQL:', functionError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'exécution de la fonction de nettoyage',
        details: functionError.message
      }, { status: 500 });
    }

    console.log('📊 Résultat fonction PostgreSQL:', result);

    // Vérifier le succès de la fonction
    if (!result || !result.success) {
      return NextResponse.json({
        success: false,
        error: result?.error || 'Erreur lors du nettoyage',
        details: result?.details
      }, { status: 400 });
    }

    console.log('✅ Nettoyage terminé avec succès !');

    return NextResponse.json({
      success: true,
      message: result.message,
      restaurant: result.restaurant,
      statisticsBefore: result.statistics_before,
      statisticsDeleted: result.statistics_deleted
    });

  } catch (error) {
    console.error('❌ Erreur nettoyage commandes:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors du nettoyage des commandes',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

/**
 * API pour obtenir un aperçu des données à nettoyer
 */
export async function POST(request: NextRequest) {
  try {
    console.log('👁️ Demande aperçu nettoyage...');

    const { restaurantId, environment } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'ID du restaurant requis'
      }, { status: 400 });
    }

    const dataLoader = new SupabaseDataLoader(environment);

    console.log(`👁️ Aperçu nettoyage restaurant ID: ${restaurantId} (ENV: ${environment})`);

    // Exécuter la fonction PostgreSQL d'aperçu
    console.log('👁️ Exécution fonction PostgreSQL d\'aperçu...');
    const { data: result, error: functionError } = await dataLoader.supabase
      .rpc('preview_restaurant_orders_cleanup', {
        p_restaurant_id: restaurantId
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
    console.error('❌ Erreur aperçu nettoyage:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'aperçu',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
