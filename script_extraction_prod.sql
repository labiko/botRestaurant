-- =====================================================
-- SCRIPT D'EXTRACTION COMPLÈTE DES DONNÉES PROD
-- =====================================================
--
-- Base PROD: postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres
--
-- VOLUMES ATTENDUS:
-- - 1 restaurant
-- - 23 catégories
-- - 144 produits
-- - 973 options produits (ÉNORME)
-- - 102 tailles produits
-- - 16 variantes produits
-- - 34 composites items
--
-- ORDRE DES DÉPENDANCES: restaurants → catégories → produits → options/sizes/variants/composites
--
-- =====================================================

-- =====================================================
-- 1. EXTRACTION RESTAURANTS (1 attendu)
-- =====================================================
\echo '=== EXTRACTION RESTAURANTS ==='
SELECT
    'france_restaurants' as table_name,
    COUNT(*) as total_records
FROM france_restaurants;

-- Export JSON complet
\echo '=== RESTAURANTS - FORMAT JSON ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'name', name,
        'slug', slug,
        'address', address,
        'city', city,
        'postal_code', postal_code,
        'phone', phone,
        'whatsapp_number', whatsapp_number,
        'delivery_zone_km', delivery_zone_km,
        'min_order_amount', min_order_amount,
        'delivery_fee', delivery_fee,
        'is_active', is_active,
        'business_hours', business_hours,
        'password_hash', password_hash,
        'timezone', timezone,
        'country_code', country_code,
        'hide_delivery_info', hide_delivery_info,
        'is_exceptionally_closed', is_exceptionally_closed,
        'latitude', latitude,
        'longitude', longitude,
        'audio_notifications_enabled', audio_notifications_enabled,
        'audio_volume', audio_volume,
        'audio_enabled_since', audio_enabled_since,
        'created_at', created_at,
        'updated_at', updated_at
    )
) as restaurants_json
FROM france_restaurants
ORDER BY id;

-- =====================================================
-- 2. EXTRACTION CATÉGORIES (23 attendues)
-- =====================================================
\echo '=== EXTRACTION CATÉGORIES ==='
SELECT
    'france_menu_categories' as table_name,
    COUNT(*) as total_records
FROM france_menu_categories;

-- Export JSON complet
\echo '=== CATÉGORIES - FORMAT JSON ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'restaurant_id', restaurant_id,
        'name', name,
        'slug', slug,
        'icon', icon,
        'display_order', display_order,
        'is_active', is_active,
        'created_at', created_at
    ) ORDER BY display_order, id
) as categories_json
FROM france_menu_categories
ORDER BY restaurant_id, display_order, id;

-- =====================================================
-- 3. EXTRACTION PRODUITS (144 attendus)
-- =====================================================
\echo '=== EXTRACTION PRODUITS ==='
SELECT
    'france_products' as table_name,
    COUNT(*) as total_records
FROM france_products;

-- Répartition par catégorie
\echo '=== PRODUITS PAR CATÉGORIE ==='
SELECT
    c.name as category_name,
    COUNT(p.id) as products_count
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
GROUP BY c.id, c.name, c.display_order
ORDER BY c.display_order;

-- Export JSON complet (paginé si nécessaire)
\echo '=== PRODUITS - FORMAT JSON ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'restaurant_id', restaurant_id,
        'category_id', category_id,
        'name', name,
        'description', description,
        'product_type', product_type,
        'base_price', base_price,
        'composition', composition,
        'display_order', display_order,
        'is_active', is_active,
        'price_on_site_base', price_on_site_base,
        'price_delivery_base', price_delivery_base,
        'workflow_type', workflow_type,
        'requires_steps', requires_steps,
        'steps_config', steps_config,
        'created_at', created_at,
        'updated_at', updated_at
    ) ORDER BY category_id, display_order, id
) as products_json
FROM france_products
ORDER BY category_id, display_order, id;

-- =====================================================
-- 4. EXTRACTION TAILLES PRODUITS (102 attendues)
-- =====================================================
\echo '=== EXTRACTION TAILLES PRODUITS ==='
SELECT
    'france_product_sizes' as table_name,
    COUNT(*) as total_records
FROM france_product_sizes;

-- Export JSON complet
\echo '=== TAILLES PRODUITS - FORMAT JSON ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'size_name', size_name,
        'price_on_site', price_on_site,
        'price_delivery', price_delivery,
        'includes_drink', includes_drink,
        'display_order', display_order,
        'is_active', is_active,
        'updated_at', updated_at
    ) ORDER BY product_id, display_order
) as product_sizes_json
FROM france_product_sizes
ORDER BY product_id, display_order;

-- =====================================================
-- 5. EXTRACTION VARIANTES PRODUITS (16 attendues)
-- =====================================================
\echo '=== EXTRACTION VARIANTES PRODUITS ==='
SELECT
    'france_product_variants' as table_name,
    COUNT(*) as total_records
FROM france_product_variants;

-- Export JSON complet
\echo '=== VARIANTES PRODUITS - FORMAT JSON ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'variant_name', variant_name,
        'price_on_site', price_on_site,
        'price_delivery', price_delivery,
        'quantity', quantity,
        'unit', unit,
        'is_menu', is_menu,
        'includes_description', includes_description,
        'display_order', display_order,
        'is_active', is_active
    ) ORDER BY product_id, display_order
) as product_variants_json
FROM france_product_variants
ORDER BY product_id, display_order;

-- =====================================================
-- 6. EXTRACTION OPTIONS PRODUITS (973 attendues - ÉNORME)
-- =====================================================
\echo '=== EXTRACTION OPTIONS PRODUITS ==='
SELECT
    'france_product_options' as table_name,
    COUNT(*) as total_records
FROM france_product_options;

-- Répartition par produit (top 10)
\echo '=== TOP 10 PRODUITS AVEC LE PLUS D\'OPTIONS ==='
SELECT
    p.name as product_name,
    COUNT(po.id) as options_count
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
GROUP BY p.id, p.name
ORDER BY options_count DESC
LIMIT 10;

-- Export JSON par chunks de 200 pour éviter les timeouts
\echo '=== OPTIONS PRODUITS - FORMAT JSON (CHUNK 1/5 - IDs 1-200) ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'option_group', option_group,
        'option_name', option_name,
        'price_modifier', price_modifier,
        'is_required', is_required,
        'max_selections', max_selections,
        'display_order', display_order,
        'is_active', is_active,
        'group_order', group_order,
        'next_group_order', next_group_order,
        'conditional_next_group', conditional_next_group
    ) ORDER BY product_id, group_order, display_order
) as product_options_chunk1_json
FROM france_product_options
WHERE id <= 200
ORDER BY product_id, group_order, display_order;

\echo '=== OPTIONS PRODUITS - FORMAT JSON (CHUNK 2/5 - IDs 201-400) ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'option_group', option_group,
        'option_name', option_name,
        'price_modifier', price_modifier,
        'is_required', is_required,
        'max_selections', max_selections,
        'display_order', display_order,
        'is_active', is_active,
        'group_order', group_order,
        'next_group_order', next_group_order,
        'conditional_next_group', conditional_next_group
    ) ORDER BY product_id, group_order, display_order
) as product_options_chunk2_json
FROM france_product_options
WHERE id > 200 AND id <= 400
ORDER BY product_id, group_order, display_order;

\echo '=== OPTIONS PRODUITS - FORMAT JSON (CHUNK 3/5 - IDs 401-600) ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'option_group', option_group,
        'option_name', option_name,
        'price_modifier', price_modifier,
        'is_required', is_required,
        'max_selections', max_selections,
        'display_order', display_order,
        'is_active', is_active,
        'group_order', group_order,
        'next_group_order', next_group_order,
        'conditional_next_group', conditional_next_group
    ) ORDER BY product_id, group_order, display_order
) as product_options_chunk3_json
FROM france_product_options
WHERE id > 400 AND id <= 600
ORDER BY product_id, group_order, display_order;

\echo '=== OPTIONS PRODUITS - FORMAT JSON (CHUNK 4/5 - IDs 601-800) ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'option_group', option_group,
        'option_name', option_name,
        'price_modifier', price_modifier,
        'is_required', is_required,
        'max_selections', max_selections,
        'display_order', display_order,
        'is_active', is_active,
        'group_order', group_order,
        'next_group_order', next_group_order,
        'conditional_next_group', conditional_next_group
    ) ORDER BY product_id, group_order, display_order
) as product_options_chunk4_json
FROM france_product_options
WHERE id > 600 AND id <= 800
ORDER BY product_id, group_order, display_order;

\echo '=== OPTIONS PRODUITS - FORMAT JSON (CHUNK 5/5 - IDs 801+) ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'product_id', product_id,
        'option_group', option_group,
        'option_name', option_name,
        'price_modifier', price_modifier,
        'is_required', is_required,
        'max_selections', max_selections,
        'display_order', display_order,
        'is_active', is_active,
        'group_order', group_order,
        'next_group_order', next_group_order,
        'conditional_next_group', conditional_next_group
    ) ORDER BY product_id, group_order, display_order
) as product_options_chunk5_json
FROM france_product_options
WHERE id > 800
ORDER BY product_id, group_order, display_order;

-- =====================================================
-- 7. EXTRACTION COMPOSITES ITEMS (34 attendus)
-- =====================================================
\echo '=== EXTRACTION COMPOSITES ITEMS ==='
SELECT
    'france_composite_items' as table_name,
    COUNT(*) as total_records
FROM france_composite_items;

-- Export JSON complet
\echo '=== COMPOSITES ITEMS - FORMAT JSON ==='
SELECT jsonb_agg(
    jsonb_build_object(
        'id', id,
        'composite_product_id', composite_product_id,
        'component_name', component_name,
        'quantity', quantity,
        'unit', unit
    ) ORDER BY composite_product_id, id
) as composite_items_json
FROM france_composite_items
ORDER BY composite_product_id, id;

-- =====================================================
-- 8. RÉSUMÉ GLOBAL
-- =====================================================
\echo '=== RÉSUMÉ GLOBAL DES EXTRACTIONS ==='
SELECT
    'RÉSUMÉ' as section,
    (SELECT COUNT(*) FROM france_restaurants) as restaurants,
    (SELECT COUNT(*) FROM france_menu_categories) as categories,
    (SELECT COUNT(*) FROM france_products) as products,
    (SELECT COUNT(*) FROM france_product_sizes) as product_sizes,
    (SELECT COUNT(*) FROM france_product_variants) as product_variants,
    (SELECT COUNT(*) FROM france_product_options) as product_options,
    (SELECT COUNT(*) FROM france_composite_items) as composite_items;

-- =====================================================
-- 9. VÉRIFICATIONS DE COHÉRENCE
-- =====================================================
\echo '=== VÉRIFICATIONS DE COHÉRENCE ==='

-- Vérifier les relations
SELECT 'Catégories sans restaurant' as check_type, COUNT(*) as count
FROM france_menu_categories c
LEFT JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.id IS NULL;

SELECT 'Produits sans catégorie' as check_type, COUNT(*) as count
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.id IS NULL;

SELECT 'Options sans produit' as check_type, COUNT(*) as count
FROM france_product_options po
LEFT JOIN france_products p ON po.product_id = p.id
WHERE p.id IS NULL;

SELECT 'Tailles sans produit' as check_type, COUNT(*) as count
FROM france_product_sizes ps
LEFT JOIN france_products p ON ps.product_id = p.id
WHERE p.id IS NULL;

SELECT 'Variantes sans produit' as check_type, COUNT(*) as count
FROM france_product_variants pv
LEFT JOIN france_products p ON pv.product_id = p.id
WHERE p.id IS NULL;

SELECT 'Composites sans produit' as check_type, COUNT(*) as count
FROM france_composite_items ci
LEFT JOIN france_products p ON ci.composite_product_id = p.id
WHERE p.id IS NULL;

\echo '=== EXTRACTION TERMINÉE ==='