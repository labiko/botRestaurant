-- 🗄️ SCRIPT D'EXTRACTION COMPLÈTE DE LA BASE DE DONNÉES
-- =====================================================================
-- Ce script extrait TOUTES les données liées aux restaurants et workflows
-- Format: JSON structuré pour création de templates IA
-- =====================================================================

BEGIN;

-- =====================================================================
-- 🏪 1. EXTRACTION RESTAURANTS COMPLETS
-- =====================================================================
SELECT 'RESTAURANTS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'id', r.id,
        'name', r.name,
        'slug', r.slug,
        'phone', r.phone,
        'whatsapp_number', r.whatsapp_number,
        'address', r.address,
        'city', r.city,
        'postal_code', r.postal_code,
        'latitude', r.latitude,
        'longitude', r.longitude,
        'timezone', r.timezone,
        'country_code', r.country_code,
        'delivery_zone_km', r.delivery_zone_km,
        'min_order_amount', r.min_order_amount,
        'delivery_fee', r.delivery_fee,
        'is_active', r.is_active,
        'is_exceptionally_closed', r.is_exceptionally_closed,
        'hide_delivery_info', r.hide_delivery_info,
        'business_hours', r.business_hours,
        'audio_notifications_enabled', r.audio_notifications_enabled,
        'audio_volume', r.audio_volume,
        'created_at', r.created_at,
        'updated_at', r.updated_at
    )
) as data
FROM france_restaurants r
WHERE r.is_active = true;

-- =====================================================================
-- 📂 2. EXTRACTION CATÉGORIES PAR RESTAURANT
-- =====================================================================
SELECT 'CATEGORIES' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', c.restaurant_id,
        'restaurant_name', r.name,
        'category', JSON_BUILD_OBJECT(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'icon', c.icon,
            'display_order', c.display_order,
            'is_active', c.is_active,
            'created_at', c.created_at
        )
    )
) as data
FROM france_menu_categories c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE c.is_active = true;

-- =====================================================================
-- 🍕 3. EXTRACTION PRODUITS COMPLETS AVEC WORKFLOWS
-- =====================================================================
SELECT 'PRODUCTS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'category_id', p.category_id,
        'category_name', c.name,
        'category_slug', c.slug,
        'product', JSON_BUILD_OBJECT(
            'id', p.id,
            'name', p.name,
            'description', p.description,
            'product_type', p.product_type,
            'base_price', p.base_price,
            'price_on_site_base', p.price_on_site_base,
            'price_delivery_base', p.price_delivery_base,
            'composition', p.composition,
            'workflow_type', p.workflow_type,
            'requires_steps', p.requires_steps,
            'steps_config', p.steps_config,
            'display_order', p.display_order,
            'is_active', p.is_active,
            'created_at', p.created_at,
            'updated_at', p.updated_at
        )
    )
) as data
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- =====================================================================
-- 🧩 4. EXTRACTION ÉLÉMENTS COMPOSITES (Suppléments, etc.)
-- =====================================================================
SELECT 'COMPOSITE_ITEMS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'category_name', c.name,
        'product_id', ci.composite_product_id,
        'product_name', p.name,
        'composite_item', JSON_BUILD_OBJECT(
            'id', ci.id,
            'component_name', ci.component_name,
            'quantity', ci.quantity,
            'unit', ci.unit
        )
    )
) as data
FROM france_composite_items ci
JOIN france_products p ON ci.composite_product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id;

-- =====================================================================
-- ⚙️ 5. EXTRACTION OPTIONS PRODUITS (si table existe)
-- =====================================================================
SELECT 'PRODUCT_OPTIONS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'category_name', c.name,
        'product_id', po.product_id,
        'product_name', p.name,
        'option', JSON_BUILD_OBJECT(
            'id', po.id,
            'option_group', po.option_group,
            'option_name', po.option_name,
            'price_modifier', po.price_modifier,
            'is_required', po.is_required,
            'max_selections', po.max_selections,
            'display_order', po.display_order,
            'is_active', po.is_active,
            'group_order', po.group_order,
            'next_group_order', po.next_group_order,
            'conditional_next_group', po.conditional_next_group
        )
    )
) as data
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE po.is_active = true;

-- =====================================================================
-- 📏 6. EXTRACTION TAILLES PRODUITS (si table existe)
-- =====================================================================
SELECT 'PRODUCT_SIZES' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'category_name', c.name,
        'product_id', ps.product_id,
        'product_name', p.name,
        'size', JSON_BUILD_OBJECT(
            'id', ps.id,
            'size_name', ps.size_name,
            'price_on_site', ps.price_on_site,
            'price_delivery', ps.price_delivery,
            'includes_drink', ps.includes_drink,
            'display_order', ps.display_order,
            'is_active', ps.is_active,
            'updated_at', ps.updated_at
        )
    )
) as data
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE ps.is_active = true;

-- =====================================================================
-- 🎨 7. EXTRACTION VARIANTES PRODUITS (si table existe)
-- =====================================================================
SELECT 'PRODUCT_VARIANTS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'category_name', c.name,
        'product_id', pv.product_id,
        'product_name', p.name,
        'variant', JSON_BUILD_OBJECT(
            'id', pv.id,
            'variant_name', pv.variant_name,
            'price_on_site', pv.price_on_site,
            'price_delivery', pv.price_delivery,
            'quantity', pv.quantity,
            'unit', pv.unit,
            'is_menu', pv.is_menu,
            'includes_description', pv.includes_description,
            'display_order', pv.display_order,
            'is_active', pv.is_active
        )
    )
) as data
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE pv.is_active = true;

-- =====================================================================
-- 📊 8. EXTRACTION CONFIGURATIONS D'AFFICHAGE
-- =====================================================================
SELECT 'DISPLAY_CONFIGS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'category_name', c.name,
        'product_id', pdc.product_id,
        'product_name', p.name,
        'display_config', JSON_BUILD_OBJECT(
            'id', pdc.id,
            'restaurant_id', pdc.restaurant_id,
            'product_id', pdc.product_id,
            'display_type', pdc.display_type,
            'template_name', pdc.template_name,
            'show_variants_first', pdc.show_variants_first,
            'custom_header_text', pdc.custom_header_text,
            'custom_footer_text', pdc.custom_footer_text,
            'emoji_icon', pdc.emoji_icon,
            'updated_at', pdc.updated_at,
            'created_at', pdc.created_at
        )
    )
) as data
FROM france_product_display_configs pdc
JOIN france_products p ON pdc.product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
JOIN france_menu_categories c ON p.category_id = c.id
;

-- =====================================================================
-- 🍕 9. EXTRACTION PIZZA DISPLAY SETTINGS (spécifique)
-- =====================================================================
SELECT 'PIZZA_DISPLAY_SETTINGS' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', pds.restaurant_id,
        'restaurant_name', r.name,
        'settings', JSON_BUILD_OBJECT(
            'id', pds.id,
            'use_unified_display', pds.use_unified_display,
            'custom_settings', pds.custom_settings,
            'created_at', pds.created_at,
            'updated_at', pds.updated_at
        )
    )
) as data
FROM france_pizza_display_settings pds
JOIN france_restaurants r ON pds.restaurant_id = r.id;

-- =====================================================================
-- 🏪 10. EXTRACTION FONCTIONNALITÉS RESTAURANT
-- =====================================================================
SELECT 'RESTAURANT_FEATURES' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', rf.restaurant_id,
        'restaurant_name', r.name,
        'feature', JSON_BUILD_OBJECT(
            'id', rf.id,
            'feature_type', rf.feature_type,
            'is_enabled', rf.is_enabled,
            'config', rf.config
        )
    )
) as data
FROM france_restaurant_features rf
JOIN france_restaurants r ON rf.restaurant_id = r.id
WHERE rf.is_enabled = true;

-- =====================================================================
-- 🚀 11. EXTRACTION MODES DE SERVICE RESTAURANT
-- =====================================================================
SELECT 'RESTAURANT_SERVICE_MODES' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', rsm.restaurant_id,
        'restaurant_name', r.name,
        'service_mode', JSON_BUILD_OBJECT(
            'id', rsm.id,
            'service_mode', rsm.service_mode,
            'is_enabled', rsm.is_enabled,
            'display_name', rsm.display_name,
            'description', rsm.description,
            'display_order', rsm.display_order,
            'config', rsm.config,
            'created_at', rsm.created_at,
            'updated_at', rsm.updated_at
        )
    )
) as data
FROM france_restaurant_service_modes rsm
JOIN france_restaurants r ON rsm.restaurant_id = r.id
WHERE rsm.is_enabled = true;

-- =====================================================================
-- 📋 12. EXTRACTION WORKFLOW TEMPLATES
-- =====================================================================
SELECT 'WORKFLOW_TEMPLATES' as data_type, JSON_AGG(
    JSON_BUILD_OBJECT(
        'restaurant_id', wt.restaurant_id,
        'restaurant_name', r.name,
        'template', JSON_BUILD_OBJECT(
            'id', wt.id,
            'template_name', wt.template_name,
            'description', wt.description,
            'steps_config', wt.steps_config,
            'created_at', wt.created_at,
            'updated_at', wt.updated_at
        )
    )
) as data
FROM france_workflow_templates wt
JOIN france_restaurants r ON wt.restaurant_id = r.id;


COMMIT;

-- =====================================================================
-- 📝 INSTRUCTIONS D'UTILISATION
-- =====================================================================
-- 1. Exécutez ce script dans Supabase SQL Editor
-- 2. Exportez chaque résultat en JSON
-- 3. Sauvegardez les fichiers par type (restaurants.json, products.json, etc.)
-- 4. Utilisez ces données comme templates pour l'IA
-- =====================================================================