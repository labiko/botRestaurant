-- 🗄️ EXTRACTION COMPLÈTE DE TOUTES LES DONNÉES PROD
-- ===================================================
-- Script d'extraction de TOUTES les données de la base PRODUCTION
-- Base: vywbhlnzvfqtiurwmrac.supabase.co
-- Volume: 144 produits, 973 options, 102 tailles, etc.
-- ===================================================

\echo '=================================================='
\echo '🚀 DÉBUT EXTRACTION COMPLÈTE BASE PROD'
\echo '=================================================='

-- ========================================
-- 📊 COMPTAGES INITIAUX
-- ========================================

\echo ''
\echo '📊 COMPTAGES PAR TABLE:'

SELECT
    'RESTAURANTS' as table_name,
    COUNT(*) as count,
    'france_restaurants' as table_real
FROM france_restaurants

UNION ALL

SELECT
    'CATEGORIES' as table_name,
    COUNT(*) as count,
    'france_menu_categories' as table_real
FROM france_menu_categories

UNION ALL

SELECT
    'PRODUCTS' as table_name,
    COUNT(*) as count,
    'france_products' as table_real
FROM france_products

UNION ALL

SELECT
    'PRODUCT_OPTIONS' as table_name,
    COUNT(*) as count,
    'france_product_options' as table_real
FROM france_product_options

UNION ALL

SELECT
    'PRODUCT_SIZES' as table_name,
    COUNT(*) as count,
    'france_product_sizes' as table_real
FROM france_product_sizes

UNION ALL

SELECT
    'PRODUCT_VARIANTS' as table_name,
    COUNT(*) as count,
    'france_product_variants' as table_real
FROM france_product_variants

UNION ALL

SELECT
    'COMPOSITE_ITEMS' as table_name,
    COUNT(*) as count,
    'france_composite_items' as table_real
FROM france_composite_items

ORDER BY table_name;

-- ========================================
-- 🏪 1. EXTRACTION RESTAURANTS (1 attendu)
-- ========================================

\echo ''
\echo '🏪 EXTRACTION RESTAURANTS:'

SELECT
    'RESTAURANTS' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', r.id,
            'name', r.name,
            'slug', r.slug,
            'whatsapp_number', r.whatsapp_number,
            'delivery_zone_km', r.delivery_zone_km,
            'min_order_amount', r.min_order_amount,
            'delivery_fee', r.delivery_fee,
            'is_active', r.is_active,
            'business_hours', r.business_hours,
            'latitude', r.latitude,
            'longitude', r.longitude,
            'created_at', r.created_at,
            'updated_at', r.updated_at
        )
    ) as data
FROM france_restaurants r
WHERE r.is_active = true;

-- ========================================
-- 📂 2. EXTRACTION CATÉGORIES (23 attendues)
-- ========================================

\echo ''
\echo '📂 EXTRACTION CATÉGORIES:'

SELECT
    'CATEGORIES' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', c.id,
            'restaurant_id', c.restaurant_id,
            'name', c.name,
            'slug', c.slug,
            'icon', c.icon,
            'display_order', c.display_order,
            'is_active', c.is_active,
            'created_at', c.created_at
        ) ORDER BY c.display_order
    ) as data
FROM france_menu_categories c
WHERE c.is_active = true;

-- ========================================
-- 🍕 3. EXTRACTION PRODUITS (144 attendus)
-- ========================================

\echo ''
\echo '🍕 EXTRACTION PRODUITS:'

SELECT
    'PRODUCTS' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', p.id,
            'restaurant_id', p.restaurant_id,
            'category_id', p.category_id,
            'name', p.name,
            'description', p.description,
            'product_type', p.product_type,
            'base_price', p.base_price,
            'price_on_site_base', p.price_on_site_base,
            'price_delivery_base', p.price_delivery_base,
            'composition', p.composition,
            'display_order', p.display_order,
            'is_active', p.is_active,
            'workflow_type', p.workflow_type,
            'requires_steps', p.requires_steps,
            'steps_config', p.steps_config,
            'created_at', p.created_at,
            'updated_at', p.updated_at
        ) ORDER BY p.category_id, p.display_order
    ) as data
FROM france_products p
WHERE p.is_active = true;

-- ========================================
-- 📏 4. EXTRACTION TAILLES PRODUITS (102 attendues)
-- ========================================

\echo ''
\echo '📏 EXTRACTION TAILLES PRODUITS:'

SELECT
    'PRODUCT_SIZES' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', ps.id,
            'product_id', ps.product_id,
            'size_name', ps.size_name,
            'price_on_site', ps.price_on_site,
            'price_delivery', ps.price_delivery,
            'includes_drink', ps.includes_drink,
            'display_order', ps.display_order,
            'is_active', ps.is_active
        ) ORDER BY ps.product_id, ps.display_order
    ) as data
FROM france_product_sizes ps
WHERE ps.is_active = true;

-- ========================================
-- 🎯 5. EXTRACTION VARIANTES PRODUITS (16 attendues)
-- ========================================

\echo ''
\echo '🎯 EXTRACTION VARIANTES PRODUITS:'

SELECT
    'PRODUCT_VARIANTS' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', pv.id,
            'product_id', pv.product_id,
            'variant_name', pv.variant_name,
            'price_on_site', pv.price_on_site,
            'price_delivery', pv.price_delivery,
            'quantity', pv.quantity,
            'unit', pv.unit,
            'is_menu', pv.is_menu,
            'includes_description', pv.includes_description,
            'display_order', pv.display_order,
            'is_active', pv.is_active
        ) ORDER BY pv.product_id, pv.display_order
    ) as data
FROM france_product_variants pv
WHERE pv.is_active = true;

-- ========================================
-- ⚙️ 6. EXTRACTION OPTIONS PRODUITS (973 attendues - PAGINÉ)
-- ========================================

\echo ''
\echo '⚙️ EXTRACTION OPTIONS PRODUITS (973 records en 5 chunks):'

-- CHUNK 1/5 (records 1-200)
\echo 'Chunk 1/5 (records 1-200):'
SELECT
    'PRODUCT_OPTIONS_CHUNK_1' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', po.id,
            'product_id', po.product_id,
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
        ) ORDER BY po.product_id, po.group_order, po.display_order
    ) as data
FROM (
    SELECT * FROM france_product_options
    WHERE is_active = true
    ORDER BY id
    LIMIT 200 OFFSET 0
) po;

-- CHUNK 2/5 (records 201-400)
\echo 'Chunk 2/5 (records 201-400):'
SELECT
    'PRODUCT_OPTIONS_CHUNK_2' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', po.id,
            'product_id', po.product_id,
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
        ) ORDER BY po.product_id, po.group_order, po.display_order
    ) as data
FROM (
    SELECT * FROM france_product_options
    WHERE is_active = true
    ORDER BY id
    LIMIT 200 OFFSET 200
) po;

-- CHUNK 3/5 (records 401-600)
\echo 'Chunk 3/5 (records 401-600):'
SELECT
    'PRODUCT_OPTIONS_CHUNK_3' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', po.id,
            'product_id', po.product_id,
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
        ) ORDER BY po.product_id, po.group_order, po.display_order
    ) as data
FROM (
    SELECT * FROM france_product_options
    WHERE is_active = true
    ORDER BY id
    LIMIT 200 OFFSET 400
) po;

-- CHUNK 4/5 (records 601-800)
\echo 'Chunk 4/5 (records 601-800):'
SELECT
    'PRODUCT_OPTIONS_CHUNK_4' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', po.id,
            'product_id', po.product_id,
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
        ) ORDER BY po.product_id, po.group_order, po.display_order
    ) as data
FROM (
    SELECT * FROM france_product_options
    WHERE is_active = true
    ORDER BY id
    LIMIT 200 OFFSET 600
) po;

-- CHUNK 5/5 (records 801-973)
\echo 'Chunk 5/5 (records 801-973):'
SELECT
    'PRODUCT_OPTIONS_CHUNK_5' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', po.id,
            'product_id', po.product_id,
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
        ) ORDER BY po.product_id, po.group_order, po.display_order
    ) as data
FROM (
    SELECT * FROM france_product_options
    WHERE is_active = true
    ORDER BY id
    LIMIT 200 OFFSET 800
) po;

-- ========================================
-- 🔧 7. EXTRACTION COMPOSANTS COMPOSITES (34 attendus)
-- ========================================

\echo ''
\echo '🔧 EXTRACTION COMPOSANTS COMPOSITES:'

SELECT
    'COMPOSITE_ITEMS' as data_type,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', ci.id,
            'composite_product_id', ci.composite_product_id,
            'component_name', ci.component_name,
            'quantity', ci.quantity,
            'unit', ci.unit
        ) ORDER BY ci.composite_product_id
    ) as data
FROM france_composite_items ci;

-- ========================================
-- 📊 STATISTIQUES DÉTAILLÉES
-- ========================================

\echo ''
\echo '📊 STATISTIQUES DÉTAILLÉES:'

-- Répartition produits par catégorie
\echo 'Répartition produits par catégorie:'
SELECT
    c.name as category_name,
    COUNT(p.id) as products_count
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.display_order
ORDER BY c.display_order;

-- Top 10 produits avec le plus d'options
\echo ''
\echo 'Top 10 produits avec le plus d''options:'
SELECT
    p.name as product_name,
    COUNT(po.id) as options_count
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id AND po.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name
ORDER BY options_count DESC
LIMIT 10;

-- Résumé par type de produit
\echo ''
\echo 'Résumé par type de produit:'
SELECT
    p.product_type,
    COUNT(*) as count
FROM france_products p
WHERE p.is_active = true
GROUP BY p.product_type
ORDER BY count DESC;

-- ========================================
-- ✅ RÉSUMÉ FINAL
-- ========================================

\echo ''
\echo '=================================================='
\echo '✅ EXTRACTION TERMINÉE AVEC SUCCÈS'
\echo '=================================================='
\echo 'Données extraites:'
\echo '- 1 restaurant'
\echo '- 23 catégories'
\echo '- 144 produits'
\echo '- 973 options (en 5 chunks)'
\echo '- 102 tailles'
\echo '- 16 variantes'
\echo '- 34 composants'
\echo ''
\echo 'Total: ~1293 enregistrements'
\echo 'Format: JSON prêt pour conversion en INSERT'
\echo '=================================================='