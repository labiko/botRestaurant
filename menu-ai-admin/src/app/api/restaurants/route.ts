// 🏪 API CHARGEMENT DES RESTAURANTS
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/lib/api-helpers';
import { TimezoneService } from '@/lib/timezone-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🏪 Chargement des restaurants...');

    const dataLoader = getSupabaseForRequest(request);

    // Charger tous les restaurants depuis la base
    const restaurants = await dataLoader.getRestaurants();

    console.log(`✅ ${restaurants.length} restaurants chargés`);

    // Ajouter les statistiques pour chaque restaurant
    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          console.log(`📊 Calcul statistiques pour ${restaurant.name}...`);

          const stats = await dataLoader.getRestaurantStats(restaurant.id);

          console.log(`   - ${stats.categories} catégories, ${stats.products} produits, ${stats.workflows} workflows, ${stats.options} options`);

          return {
            ...restaurant,
            stats,
            created_at: restaurant.created_at || TimezoneService.getCurrentTimeForDB()
          };
        } catch (error) {
          console.error(`❌ Erreur stats pour ${restaurant.name}:`, error);
          return {
            ...restaurant,
            stats: { categories: 0, products: 0, workflows: 0, options: 0 },
            created_at: restaurant.created_at || TimezoneService.getCurrentTimeForDB()
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      restaurants: restaurantsWithStats
    });

  } catch (error) {
    console.error('❌ Erreur chargement restaurants:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement des restaurants',
      restaurants: []
    }, { status: 500 });
  }
}