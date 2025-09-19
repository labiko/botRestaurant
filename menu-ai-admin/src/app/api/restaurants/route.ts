// 🏪 API CHARGEMENT DES RESTAURANTS
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

export async function GET(request: NextRequest) {
  try {
    console.log('🏪 Chargement des restaurants...');

    const dataLoader = new SupabaseDataLoader();

    // Charger tous les restaurants depuis la base
    const restaurants = await dataLoader.getRestaurants();

    console.log(`✅ ${restaurants.length} restaurants chargés`);

    return NextResponse.json({
      success: true,
      restaurants: restaurants
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