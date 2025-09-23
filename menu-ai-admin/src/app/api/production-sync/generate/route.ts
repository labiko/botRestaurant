// 📜 API GÉNÉRATION SCRIPT SQL SYNCHRONISATION PRODUCTION
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fonction pour récupérer le mapping des groupes depuis la base
async function getGroupMapping(supabase: any): Promise<Map<string, { component_name: string, unit: string }>> {
  try {
    const { data: groups, error } = await supabase
      .from('france_option_groups')
      .select('group_name, component_name, unit')
      .eq('is_active', true);

    const mapping = new Map();

    if (groups && !error) {
      groups.forEach((group: any) => {
        // Ajouter le mapping exact
        mapping.set(group.group_name.toLowerCase(), {
          component_name: group.component_name,
          unit: group.unit
        });

        // Ajouter des variantes courantes pour compatibilité
        if (group.group_name.toLowerCase().endsWith('s')) {
          // Ajouter la version singulier (plats → plat)
          mapping.set(group.group_name.toLowerCase().slice(0, -1), {
            component_name: group.component_name,
            unit: group.unit
          });
        }
      });
    }

    console.log('✅ [SQL Generator] Mapping groupes chargé:', mapping.size, 'entrées');
    return mapping;
  } catch (error) {
    console.error('❌ [SQL Generator] Erreur chargement mapping:', error);
    return new Map();
  }
}

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

    // 3. Charger le mapping des groupes depuis la base
    const groupMapping = await getGroupMapping(supabase);

    // 4. Générer le script SQL
    const script = generateSQLScript({
      restaurant,
      categories: filteredCategories,
      products: filteredProducts,
      productOptions: filteredProductOptions,
      botConfig: botConfig || null,
      displayConfigs: displayConfigs || [],
      groupMapping,
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
  groupMapping: Map<string, { component_name: string, unit: string }>;
  workflowTemplates: any[];
  syncType: string;
  selectedCategories: string[];
  duplicationInfo: any;
}): string {
  const { restaurant, categories, products, productOptions, botConfig, displayConfigs, groupMapping, workflowTemplates, syncType, duplicationInfo } = params;
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
ON CONFLICT (id) DO NOTHING;
-- Note: Approche hybride - Restaurant existant ignoré pour préserver sa configuration

`;

  // 2. Catégories
  if (categories.length > 0) {
    script += `-- 2. Synchronisation catégories (${categories.length})
INSERT INTO france_menu_categories (
  restaurant_id, name, slug, icon, display_order, is_active
)
VALUES\n`;

    const categoryValues = categories.map(cat =>
      `  (${cat.restaurant_id}, '${cat.name.replace(/'/g, "''")}', '${cat.slug.replace(/'/g, "''")}', '${cat.icon?.replace(/'/g, "''") || '📁'}', ${cat.display_order}, ${cat.is_active !== false})`
    ).join(',\n');

    script += categoryValues;
    script += `
ON CONFLICT (restaurant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

`;
  }

  // 3. Produits
  if (products.length > 0) {
    script += `-- 3. Synchronisation produits (${products.length})
INSERT INTO france_products (
  restaurant_id, category_id, name, description, product_type,
  display_order, is_active, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config
)
VALUES\n`;

    const productValues = products.map(prod => {
      // Trouver le nom de la catégorie pour mapping
      const category = categories.find(cat => cat.id === prod.category_id);
      const categoryName = category ? category.name.replace(/'/g, "''") : '';

      return `  (${prod.restaurant_id}, (SELECT id FROM france_menu_categories WHERE name = '${categoryName}' AND restaurant_id = ${prod.restaurant_id} LIMIT 1), '${prod.name.replace(/'/g, "''")}', '${prod.description?.replace(/'/g, "''") || ''}', '${prod.product_type || 'simple'}', ${prod.display_order}, ${prod.is_active !== false}, ${prod.price_on_site_base || 0}, ${prod.price_delivery_base || 0}, '${prod.workflow_type?.replace(/'/g, "''") || ''}', ${prod.requires_steps || false}, '${JSON.stringify(prod.steps_config || {}).replace(/'/g, "''")}')`;
    }).join(',\n');

    script += productValues;
    script += `
ON CONFLICT (name, restaurant_id) DO NOTHING;
-- Note: Approche hybride - Insertion nouveaux produits uniquement
-- Les modifications se font via le back-office PROD

`;
  }

  // 4. Options des produits
  if (productOptions.length > 0) {
    script += `-- 4. Synchronisation options produits (${productOptions.length})
-- Stratégie: Insertion directe sans gestion de conflit (nouvelles options pour nouveaux produits)
`;

    // Grouper les options par produit pour insertion séquentielle
    const optionsByProduct = productOptions.reduce((acc, option) => {
      const productId = option.product_id;
      if (!acc[productId]) acc[productId] = [];
      acc[productId].push(option);
      return acc;
    }, {} as Record<number, any[]>);

    Object.entries(optionsByProduct).forEach(([productId, options]) => {
      const product = products.find(prod => prod.id === parseInt(productId));
      const productName = product ? product.name.replace(/'/g, "''") : '';

      script += `
-- Options pour le produit: ${product?.name || 'Inconnu'}
INSERT INTO france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, is_active,
  group_order, next_group_order, conditional_next_group
)
SELECT
  prod.id,
  vals.option_group,
  vals.option_name,
  vals.price_modifier,
  vals.is_required,
  vals.max_selections,
  vals.display_order,
  vals.is_active,
  vals.group_order,
  vals.next_group_order,
  vals.conditional_next_group
FROM france_products prod,
(VALUES
`;

      const optionValues = options.map(option =>
        `  ('${option.option_group?.replace(/'/g, "''") || ''}', '${option.option_name?.replace(/'/g, "''") || ''}', ${option.price_modifier || 0}, ${option.is_required || false}, ${option.max_selections || 1}, ${option.display_order || 0}, ${option.is_active !== false}, ${option.group_order || 0}, ${option.next_group_order ? option.next_group_order : 'null::integer'}, ${option.conditional_next_group ? `'${JSON.stringify(option.conditional_next_group).replace(/'/g, "''")}'::jsonb` : 'null::jsonb'})`
      ).join(',\n');

      script += optionValues;
      script += `
) AS vals(option_group, option_name, price_modifier, is_required, max_selections, display_order, is_active, group_order, next_group_order, conditional_next_group)
WHERE prod.name = '${productName}' AND prod.restaurant_id = ${restaurant.id}
AND NOT EXISTS (
  SELECT 1 FROM france_product_options existing
  WHERE existing.product_id = prod.id
  AND existing.option_group = vals.option_group
  AND existing.option_name = vals.option_name
);

`;
    });
  }

  // 5. Génération automatique des composants de base pour l'interface
  if (products.length > 0) {
    const compositeProducts = products.filter(p =>
      p.workflow_type === 'universal_workflow_v2' ||
      (p.product_type === 'composite' && p.steps_config)
    );

    if (compositeProducts.length > 0) {
      script += `-- 5. Synchronisation composants de base (interface PROD)
-- Génération automatique pour les produits avec workflows
`;

      compositeProducts.forEach(product => {
        const productName = product.name.replace(/'/g, "''");

        // Analyser steps_config pour détecter les groupes
        let componentItems = [];

        if (product.steps_config && typeof product.steps_config === 'object' && product.steps_config.steps) {
          const steps = product.steps_config.steps;

          steps.forEach((step, index) => {
            if (step.option_groups && step.option_groups.length > 0) {
              step.option_groups.forEach(groupName => {
                let componentName = '';
                let unit = 'choix';

                // Utiliser le mapping dynamique depuis la base de données
                const mapping = groupMapping.get(groupName.toLowerCase());
                if (mapping) {
                  componentName = mapping.component_name;
                  unit = mapping.unit;
                } else {
                  // Fallback si le groupe n'est pas trouvé dans la base
                  componentName = groupName + ' au choix';
                  unit = 'choix';
                  console.log(`⚠️ [SQL Generator] Groupe non trouvé dans la base: "${groupName}" - utilisation du fallback`);
                }

                componentItems.push({
                  name: componentName,
                  quantity: 1,
                  unit: unit
                });
              });
            }
          });
        }

        // Si pas de steps_config détectable, utiliser des composants par défaut
        if (componentItems.length === 0) {
          componentItems = [
            { name: 'Plat au choix', quantity: 1, unit: 'choix' },
            { name: 'Boisson', quantity: 1, unit: 'choix' }
          ];
        }

        if (componentItems.length > 0) {
          script += `
-- Composants pour le produit: ${product.name}
INSERT INTO france_composite_items (
  composite_product_id, component_name, quantity, unit
)
SELECT
  prod.id,
  vals.component_name,
  vals.quantity,
  vals.unit
FROM france_products prod,
(VALUES
`;

          const componentValues = componentItems.map(item =>
            `  ('${item.name.replace(/'/g, "''")}', ${item.quantity}, '${item.unit.replace(/'/g, "''")}')`
          ).join(',\n');

          script += componentValues;
          script += `
) AS vals(component_name, quantity, unit)
WHERE prod.name = '${productName}' AND prod.restaurant_id = ${restaurant.id}
AND NOT EXISTS (
  SELECT 1 FROM france_composite_items existing
  WHERE existing.composite_product_id = prod.id
  AND existing.component_name = vals.component_name
);

`;
        }
      });
    }
  }

  // 6. Configuration bot
  if (botConfig) {
    script += `-- 6. Synchronisation configuration bot
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

  // 7. Configurations d'affichage produit
  if (displayConfigs.length > 0) {
    script += `-- 7. Synchronisation configurations affichage produit (${displayConfigs.length})
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

  // 8. Templates workflow
  if (workflowTemplates.length > 0) {
    script += `-- 8. Synchronisation templates workflow (${workflowTemplates.length})
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