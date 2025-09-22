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

    // Récupérer les options des produits
    const productIds = products?.map(p => p.id) || [];
    let productOptions: any[] = [];
    if (productIds.length > 0) {
      const { data: options, error: optionsError } = await supabase
        .from('france_product_options')
        .select('*')
        .in('product_id', productIds);

      if (!optionsError) {
        productOptions = options || [];
      }
    }

    // Récupérer la configuration bot
    const { data: botConfig, error: botConfigError } = await supabase
      .from('restaurant_bot_configs')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    // Récupérer les configurations d'affichage produit
    const { data: displayConfigs, error: displayConfigsError } = await supabase
      .from('france_product_display_configs')
      .select('*')
      .eq('restaurant_id', restaurantId);

    // Récupérer les templates workflow
    const { data: workflowTemplates, error: workflowTemplatesError } = await supabase
      .from('france_workflow_templates')
      .select('*')
      .eq('restaurant_id', restaurantId);

    // Filtrage sélectif selon le type de synchronisation
    let filteredCategories = categories || [];
    let filteredProducts = products || [];
    let filteredProductOptions = productOptions || [];

    if (syncType === 'category' && selectedCategories && selectedCategories.length > 0) {
      // Synchronisation sélective par catégorie
      const selectedCategoryIds = selectedCategories.map(id => parseInt(id.toString()));

      filteredCategories = categories?.filter(cat => selectedCategoryIds.includes(cat.id)) || [];
      filteredProducts = products?.filter(prod => selectedCategoryIds.includes(prod.category_id)) || [];

      // Filtrer les options des produits sélectionnés
      const selectedProductIds = filteredProducts.map(p => p.id);
      filteredProductOptions = productOptions?.filter(opt => selectedProductIds.includes(opt.product_id)) || [];
    }

    // 3. Générer le script SQL
    const script = generateSQLScript({
      restaurant,
      categories: filteredCategories,
      products: filteredProducts,
      productOptions: filteredProductOptions,
      botConfig: botConfig || null,
      displayConfigs: displayConfigs || [],
      workflowTemplates: workflowTemplates || [],
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
          categories: filteredCategories?.length || 0,
          products: filteredProducts?.length || 0,
          productOptions: filteredProductOptions?.length || 0,
          botConfig: botConfig ? 1 : 0,
          displayConfigs: displayConfigs?.length || 0,
          workflowTemplates: workflowTemplates?.length || 0,
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
        categories: filteredCategories?.length || 0,
        products: filteredProducts?.length || 0,
        productOptions: filteredProductOptions?.length || 0,
        botConfig: botConfig ? 1 : 0,
        displayConfigs: displayConfigs?.length || 0,
        workflowTemplates: workflowTemplates?.length || 0,
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
  productOptions: any[];
  botConfig: any;
  displayConfigs: any[];
  workflowTemplates: any[];
  syncType: string;
  selectedCategories: string[];
  duplicationInfo: any;
}): string {
  const { restaurant, categories, products, productOptions, botConfig, displayConfigs, workflowTemplates, syncType, duplicationInfo } = params;
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

  // 1. Restaurant (TOUJOURS synchronisé)
  script += `-- 1. Synchronisation restaurant
INSERT INTO france_restaurants (
  id, name, slug, address, city, phone, whatsapp_number,
  delivery_zone_km, delivery_fee, is_active, business_hours,
  password_hash, timezone
)
VALUES (
  ${restaurant.id},
  '${restaurant.name.replace(/'/g, "''")}',
  '${restaurant.slug?.replace(/'/g, "''") || restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '')}',
  '${restaurant.address?.replace(/'/g, "''") || ''}',
  '${restaurant.city?.replace(/'/g, "''") || ''}',
  '${restaurant.phone || ''}',
  '${restaurant.whatsapp_number?.replace(/'/g, "''") || restaurant.phone || ''}',
  ${restaurant.delivery_zone_km || 5},
  ${restaurant.delivery_fee || 2.5},
  ${restaurant.is_active !== false},
  '${JSON.stringify(restaurant.business_hours || {
    "lundi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "mardi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "mercredi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "jeudi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "vendredi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "samedi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
    "dimanche": {"isOpen": true, "opening": "07:00", "closing": "23:50"}
  }).replace(/'/g, "''")}',
  '${restaurant.password_hash || '810790'}',
  '${restaurant.timezone || 'Europe/Paris'}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  phone = EXCLUDED.phone,
  whatsapp_number = EXCLUDED.whatsapp_number,
  delivery_zone_km = EXCLUDED.delivery_zone_km,
  delivery_fee = EXCLUDED.delivery_fee,
  is_active = EXCLUDED.is_active,
  business_hours = EXCLUDED.business_hours,
  password_hash = EXCLUDED.password_hash,
  timezone = EXCLUDED.timezone;

`;

  // 2. Catégories
  if (categories.length > 0) {
    script += `-- 2. Synchronisation catégories (${categories.length})
INSERT INTO france_menu_categories (
  id, restaurant_id, name, slug, icon, display_order, is_active
)
VALUES\n`;

    const categoryValues = categories.map(cat =>
      `  (${cat.id}, ${cat.restaurant_id}, '${cat.name.replace(/'/g, "''")}', '${cat.slug.replace(/'/g, "''")}', '${cat.icon?.replace(/'/g, "''") || '📁'}', ${cat.display_order}, ${cat.is_active !== false})`
    ).join(',\n');

    script += categoryValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

`;
  }

  // 3. Produits
  if (products.length > 0) {
    script += `-- 3. Synchronisation produits (${products.length})
INSERT INTO france_products (
  id, restaurant_id, category_id, name, description, product_type,
  display_order, is_active, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config
)
VALUES\n`;

    const productValues = products.map(prod =>
      `  (${prod.id}, ${prod.restaurant_id}, ${prod.category_id}, '${prod.name.replace(/'/g, "''")}', '${prod.description?.replace(/'/g, "''") || ''}', '${prod.product_type || 'simple'}', ${prod.display_order}, ${prod.is_active !== false}, ${prod.price_on_site_base}, ${prod.price_delivery_base}, '${prod.workflow_type?.replace(/'/g, "''") || ''}', ${prod.requires_steps || false}, '${JSON.stringify(prod.steps_config || {}).replace(/'/g, "''")}' )`
    ).join(',\n');

    script += productValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  product_type = EXCLUDED.product_type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  price_on_site_base = EXCLUDED.price_on_site_base,
  price_delivery_base = EXCLUDED.price_delivery_base,
  workflow_type = EXCLUDED.workflow_type,
  requires_steps = EXCLUDED.requires_steps,
  steps_config = EXCLUDED.steps_config;

`;
  }

  // 4. Options des produits
  if (productOptions.length > 0) {
    script += `-- 4. Synchronisation options produits (${productOptions.length})
INSERT INTO france_product_options (
  id, product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, is_active,
  group_order, next_group_order, conditional_next_group
)
VALUES
`;

    const optionValues = productOptions.map(option =>
      `  (${option.id}, ${option.product_id}, '${option.option_group?.replace(/'/g, "''") || ''}', '${option.option_name?.replace(/'/g, "''") || ''}', ${option.price_modifier || 0}, ${option.is_required || false}, ${option.max_selections || 1}, ${option.display_order || 0}, ${option.is_active !== false}, ${option.group_order || 0}, ${option.next_group_order || 'null'}, ${option.conditional_next_group || 'null'})`
    ).join(',\n');

    script += optionValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  option_group = EXCLUDED.option_group,
  option_name = EXCLUDED.option_name,
  price_modifier = EXCLUDED.price_modifier,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  group_order = EXCLUDED.group_order,
  next_group_order = EXCLUDED.next_group_order,
  conditional_next_group = EXCLUDED.conditional_next_group;

`;
  }

  // 5. Configuration bot
  if (botConfig) {
    script += `-- 5. Synchronisation configuration bot
INSERT INTO restaurant_bot_configs (
  id, restaurant_id, config_name, brand_name, welcome_message,
  available_workflows, features, is_active
)
VALUES (
  ${botConfig.id}, ${restaurant.id}, '${botConfig.config_name?.replace(/'/g, "''") || 'main'}', '${botConfig.brand_name?.replace(/'/g, "''") || ''}', '${botConfig.welcome_message?.replace(/'/g, "''") || ''}',
  '${JSON.stringify(botConfig.available_workflows || []).replace(/'/g, "''")}', '${JSON.stringify(botConfig.features || {}).replace(/'/g, "''")}', ${botConfig.is_active !== false}
)
ON CONFLICT (id) DO UPDATE SET
  config_name = EXCLUDED.config_name,
  brand_name = EXCLUDED.brand_name,
  welcome_message = EXCLUDED.welcome_message,
  available_workflows = EXCLUDED.available_workflows,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

`;
  }

  // 6. Configurations d'affichage produit
  if (displayConfigs.length > 0) {
    script += `-- 6. Synchronisation configurations affichage produit (${displayConfigs.length})
INSERT INTO france_product_display_configs (
  id, restaurant_id, product_id, display_type, template_name,
  show_variants_first, custom_header_text, custom_footer_text, emoji_icon
)
VALUES
`;

    const displayValues = displayConfigs.map(config =>
      `  (${config.id}, ${restaurant.id}, ${config.product_id}, '${config.display_type?.replace(/'/g, "''") || ''}', '${config.template_name?.replace(/'/g, "''") || ''}', ${config.show_variants_first || false}, '${config.custom_header_text?.replace(/'/g, "''") || ''}', '${config.custom_footer_text?.replace(/'/g, "''") || ''}', '${config.emoji_icon?.replace(/'/g, "''") || ''}')`
    ).join(',\n');

    script += displayValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  display_type = EXCLUDED.display_type,
  template_name = EXCLUDED.template_name,
  show_variants_first = EXCLUDED.show_variants_first,
  custom_header_text = EXCLUDED.custom_header_text,
  custom_footer_text = EXCLUDED.custom_footer_text,
  emoji_icon = EXCLUDED.emoji_icon;

`;
  }

  // 7. Templates workflow
  if (workflowTemplates.length > 0) {
    script += `-- 7. Synchronisation templates workflow (${workflowTemplates.length})
INSERT INTO france_workflow_templates (
  id, restaurant_id, template_name, description, steps_config
)
VALUES
`;

    const templateValues = workflowTemplates.map(template =>
      `  (${template.id}, ${restaurant.id}, '${template.template_name?.replace(/'/g, "''") || ''}', '${template.description?.replace(/'/g, "''") || ''}', '${JSON.stringify(template.steps_config || {}).replace(/'/g, "''")}' )`
    ).join(',\n');

    script += templateValues;
    script += `
ON CONFLICT (id) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  description = EXCLUDED.description,
  steps_config = EXCLUDED.steps_config;

`;
  }

  // 8. Finalisation (pas de log production_sync_history qui n'existe qu'en DEV)
  script += `
-- ⚠️ Note: Le statut de synchronisation sera mis à jour en DEV via le bouton "✅ Exécuté"
-- La table production_sync_history n'existe qu'en environnement DEV

COMMIT;

-- ✅ Synchronisation terminée
-- ℹ️ Restaurant: ${restaurant.name}
-- ℹ️ Catégories synchronisées: ${categories.length}
-- ℹ️ Produits synchronisés: ${products.length}
-- ℹ️ Options produits synchronisées: ${productOptions.length}
-- ℹ️ Configuration bot: ${botConfig ? 'Synchronisée' : 'Aucune'}
-- ℹ️ Configurations affichage: ${displayConfigs.length}
-- ℹ️ Templates workflow: ${workflowTemplates.length}
-- ℹ️ Aucune suppression effectuée
-- ℹ️ Données existantes préservées
`;

  return script;
}