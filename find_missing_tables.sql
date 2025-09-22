-- =========================================================================
-- RECHERCHE DES VRAIES TABLES MANQUANTES
-- =========================================================================
-- Script pour identifier toutes les tables avec restaurant_id
-- et comparer avec celles déjà gérées dans delete_restaurant_complete
-- =========================================================================

-- 1. Trouver TOUTES les tables qui ont une colonne restaurant_id
SELECT
    table_name,
    '✅ Table avec restaurant_id' as status
FROM information_schema.columns
WHERE column_name = 'restaurant_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- 2. Tables DÉJÀ GÉRÉES dans delete_restaurant_complete (d'après le DDL)
WITH tables_gerees AS (
    SELECT unnest(ARRAY[
        'duplication_logs',
        'delivery_driver_actions',
        'delivery_order_logs',
        'delivery_refusals',
        'delivery_tokens',
        'france_delivery_assignments',
        'france_orders',
        'france_delivery_drivers',
        'france_pizza_display_settings',
        'france_restaurant_features',
        'france_restaurant_service_modes',
        'france_whatsapp_numbers',
        'message_templates',
        'restaurant_bot_configs',
        'workflow_definitions',
        'france_product_options',
        'france_product_sizes',
        'france_product_variants',
        'france_composite_items',
        'france_products',
        'france_menu_categories',
        'france_restaurants'
    ]) as table_name
)
-- 3. Identifier les tables MANQUANTES (qui ont restaurant_id mais ne sont pas gérées)
SELECT
    c.table_name,
    CASE
        WHEN g.table_name IS NULL THEN '❌ MANQUANTE - À ajouter'
        ELSE '✅ Déjà gérée'
    END as status
FROM information_schema.columns c
LEFT JOIN tables_gerees g ON c.table_name = g.table_name
WHERE c.column_name = 'restaurant_id'
  AND c.table_schema = 'public'
ORDER BY
    CASE WHEN g.table_name IS NULL THEN 1 ELSE 2 END,
    c.table_name;

-- 4. Afficher seulement les tables VRAIMENT MANQUANTES
WITH tables_gerees AS (
    SELECT unnest(ARRAY[
        'duplication_logs', 'delivery_driver_actions', 'delivery_order_logs',
        'delivery_refusals', 'delivery_tokens', 'france_delivery_assignments',
        'france_orders', 'france_delivery_drivers', 'france_pizza_display_settings',
        'france_restaurant_features', 'france_restaurant_service_modes',
        'france_whatsapp_numbers', 'message_templates', 'restaurant_bot_configs',
        'workflow_definitions', 'france_product_options', 'france_product_sizes',
        'france_product_variants', 'france_composite_items', 'france_products',
        'france_menu_categories', 'france_restaurants'
    ]) as table_name
)
SELECT
    '🎯 TABLES À AJOUTER DANS LES FONCTIONS:' as titre,
    c.table_name
FROM information_schema.columns c
LEFT JOIN tables_gerees g ON c.table_name = g.table_name
WHERE c.column_name = 'restaurant_id'
  AND c.table_schema = 'public'
  AND g.table_name IS NULL
ORDER BY c.table_name;