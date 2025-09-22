// 📜 API GÉNÉRATION SCRIPT SQL SYNCHRONISATION PRODUCTION
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { duplicationId, syncType, selectedCategories } = await request.json();

    if (!duplicationId) {
      return NextResponse.json({
        success: false,
        error: 'ID de duplication requis'
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

    console.log(`📜 Génération script SQL pour duplication ${duplicationId}, type: ${syncType}`);

    // 1. Récupérer les informations de la duplication
    const { data: duplication, error: dupError } = await supabase
      .from('duplication_logs')
      .select(`
        *,
        source_restaurant:source_restaurant_id(name),
        target_restaurant:target_restaurant_id(name, address, phone)
      `)
      .eq('id', duplicationId)
      .single();

    if (dupError || !duplication) {
      throw new Error('Duplication non trouvée');
    }

    // 2. Récupérer les données du restaurant cible (DEV)
    const restaurantId = duplication.target_restaurant_id;

    // Récupérer le restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('france_restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (restError) throw restError;

    // Récupérer les catégories
    const { data: categories, error: catError } = await supabase
      .from('france_menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order');

    if (catError) throw catError;

    // Récupérer les produits
    const { data: products, error: prodError } = await supabase
      .from('france_products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category_id, display_order');

    if (prodError) throw prodError;

    // 3. Générer le script SQL
    const script = generateSQLScript({
      restaurant,
      categories: categories || [],
      products: products || [],
      syncType,
      selectedCategories: selectedCategories || [],
      duplicationInfo: {
        id: duplicationId,
        type: syncType,
        restaurantName: duplication.target_restaurant?.name || 'Restaurant'
      }
    });

    // 4. Enregistrer dans l'historique
    await supabase
      .from('production_sync_history')
      .insert({
        duplication_log_id: duplicationId,
        restaurant_id: restaurantId,
        sync_type: syncType,
        items_synced: {
          categories: categories?.length || 0,
          products: products?.length || 0,
          sync_mode: syncType
        },
        sql_script: script,
        executed_by: 'admin', // À améliorer avec l'authentification
        execution_status: 'pending'
      });

    console.log(`✅ Script SQL généré pour ${duplication.target_restaurant?.name}`);

    return NextResponse.json({
      success: true,
      script,
      summary: {
        restaurant: restaurant?.name,
        categories: categories?.length || 0,
        products: products?.length || 0,
        syncType
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération script:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération du script SQL'
    }, { status: 500 });
  }
}

// Fonction de génération du script SQL
function generateSQLScript(params: {
  restaurant: any;
  categories: any[];
  products: any[];
  syncType: string;
  selectedCategories: string[];
  duplicationInfo: any;
}): string {
  const { restaurant, categories, products, syncType, duplicationInfo } = params;
  const timestamp = new Date().toLocaleString('fr-FR');

  let script = `-- 🔄 SYNCHRONISATION PRODUCTION
-- Restaurant: ${restaurant.name} (ID: ${restaurant.id})
-- Type: ${syncType.toUpperCase()}
-- Généré le: ${timestamp}
-- Stratégie: UPSERT uniquement (pas de suppression)

BEGIN;

-- ⚠️ ATTENTION: Cette synchronisation ne supprime AUCUNE donnée existante
-- Les éléments existants en production sont préservés
-- Seuls les nouveaux éléments sont ajoutés ou mis à jour

`;

  // 1. Restaurant
  if (syncType === 'complete' || syncType === 'initial') {
    script += `-- 1. Synchronisation restaurant
INSERT INTO france_restaurants (
  id, name, address, phone, business_hours,
  is_active, timezone, created_at, updated_at
)
VALUES (
  ${restaurant.id},
  '${restaurant.name.replace(/'/g, "''")}',
  '${restaurant.address?.replace(/'/g, "''") || ''}',
  '${restaurant.phone || ''}',
  '${JSON.stringify(restaurant.business_hours || {}).replace(/'/g, "''")}',
  ${restaurant.is_active || true},
  '${restaurant.timezone || 'Europe/Paris'}',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  business_hours = EXCLUDED.business_hours,
  is_active = EXCLUDED.is_active,
  timezone = EXCLUDED.timezone,
  updated_at = NOW();

`;
  }

  // 2. Catégories
  if (categories.length > 0) {
    script += `-- 2. Synchronisation catégories (${categories.length})
INSERT INTO france_menu_categories (
  id, restaurant_id, name, slug, display_order,
  is_active, created_at, updated_at
)
VALUES\n`;

    const categoryValues = categories.map(cat =>
      `  (${cat.id}, ${cat.restaurant_id}, '${cat.name.replace(/'/g, "''")}', '${cat.slug.replace(/'/g, "''")}', ${cat.display_order}, ${cat.is_active}, NOW(), NOW())`
    ).join(',\n');

    script += categoryValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

`;
  }

  // 3. Produits
  if (products.length > 0) {
    script += `-- 3. Synchronisation produits (${products.length})
INSERT INTO france_products (
  id, restaurant_id, category_id, name, slug, description,
  price_on_site_base, price_delivery_base, display_order,
  is_active, created_at, updated_at
)
VALUES\n`;

    const productValues = products.map(prod =>
      `  (${prod.id}, ${prod.restaurant_id}, ${prod.category_id}, '${prod.name.replace(/'/g, "''")}', '${prod.slug?.replace(/'/g, "''") || ''}', '${prod.description?.replace(/'/g, "''") || ''}', ${prod.price_on_site_base}, ${prod.price_delivery_base}, ${prod.display_order}, ${prod.is_active}, NOW(), NOW())`
    ).join(',\n');

    script += productValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price_on_site_base = EXCLUDED.price_on_site_base,
  price_delivery_base = EXCLUDED.price_delivery_base,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

`;
  }

  // 4. Log de synchronisation
  script += `-- 4. Log de synchronisation
INSERT INTO production_sync_history (
  duplication_log_id, restaurant_id, sync_type,
  items_synced, executed_by, execution_status
)
VALUES (
  ${duplicationInfo.id}, ${restaurant.id}, '${syncType}',
  '{"categories": ${categories.length}, "products": ${products.length}, "restaurant": "${restaurant.name}"}',
  'admin', 'executed'
);

-- 5. Mise à jour statut duplication
UPDATE duplication_logs
SET
  production_status = 'synced',
  last_production_sync = NOW(),
  sync_count = COALESCE(sync_count, 0) + 1
WHERE id = ${duplicationInfo.id};

COMMIT;

-- ✅ Synchronisation terminée
-- ℹ️ Restaurant: ${restaurant.name}
-- ℹ️ Catégories synchronisées: ${categories.length}
-- ℹ️ Produits synchronisés: ${products.length}
-- ℹ️ Aucune suppression effectuée
-- ℹ️ Données existantes préservées
`;

  return script;
}