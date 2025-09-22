// 📂 API CHARGEMENT CATÉGORIE - LISTE COMPLÈTE
// ==============================================

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Chargement catégorie...');

    const { categoryName, restaurantId = 1 } = await request.json();

    if (!categoryName) {
      return NextResponse.json({
        success: false,
        error: 'Nom de catégorie requis'
      });
    }

    const dataLoader = new SupabaseDataLoader();

    // Recherche de la catégorie par nom
    const category = await dataLoader.findCategoryByName(categoryName, restaurantId);

    if (!category) {
      return NextResponse.json({
        success: false,
        error: `Catégorie "${categoryName}" non trouvée`
      });
    }

    // Chargement complet de la catégorie avec ses produits
    const categoryData = await dataLoader.getCategoryWithProducts(category.id);

    // Formatage en liste bot-style
    const productList = categoryData.products.map((product: any, index: number) => {
      const icon = product.name.includes('VERTE') ? '🌿' :
                  product.name.includes('ROMAINE') ? '🥬' :
                  product.name.includes('CREVETTE') ? '🦐' :
                  product.name.includes('NIÇOISE') ? '🍅' :
                  product.name.includes('CHÈVRE') ? '🧀' :
                  product.name.includes('CESAR') ? '🥓' :
                  product.name.includes('PIZZA') ? '🍕' :
                  product.name.includes('BURGER') ? '🍔' :
                  product.name.includes('TACO') ? '🌮' : '🍽️';

      return `${icon} ${index + 1}. ${product.name} - ${product.price_on_site_base}€`;
    }).join('\n');

    console.log(`✅ Catégorie "${category.name}" chargée avec ${categoryData.products.length} produits`);

    return NextResponse.json({
      success: true,
      category: categoryData.category,
      products: categoryData.products,
      productList,
      patterns: categoryData.productPatterns,
      nextOrder: categoryData.nextDisplayOrder
    });

  } catch (error) {
    console.error('❌ Erreur chargement catégorie:', error);

    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}