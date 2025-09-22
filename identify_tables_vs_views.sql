-- =========================================================================
-- IDENTIFICATION TABLES vs VUES
-- =========================================================================
-- Script pour différencier les vraies tables des vues
-- =========================================================================

-- 1. Identifier le type (TABLE vs VIEW) pour chacune des 5 "tables"
SELECT
    table_name,
    table_type,
    CASE
        WHEN table_type = 'BASE TABLE' THEN '📋 TABLE - À supprimer'
        WHEN table_type = 'VIEW' THEN '👁️ VUE - Ne pas supprimer'
        ELSE '❓ AUTRE'
    END as action_required
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'france_active_assignments',
    'france_available_drivers',
    'france_product_display_configs',
    'france_user_sessions',
    'france_workflow_templates'
  )
ORDER BY table_type, table_name;

-- 2. Récupérer SEULEMENT les vraies tables (BASE TABLE) qui ont restaurant_id
SELECT
    t.table_name,
    '📋 VRAIE TABLE À AJOUTER DANS LES FONCTIONS' as status
FROM information_schema.tables t
JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND c.column_name = 'restaurant_id'
    AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN (
    'france_active_assignments',
    'france_available_drivers',
    'france_product_display_configs',
    'france_user_sessions',
    'france_workflow_templates'
  )
ORDER BY t.table_name;

-- 3. Lister TOUTES les vraies tables avec restaurant_id (pas déjà gérées)
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
    t.table_name,
    '🎯 VRAIE TABLE MANQUANTE À AJOUTER' as status
FROM information_schema.tables t
JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND c.column_name = 'restaurant_id'
    AND c.table_schema = 'public'
LEFT JOIN tables_gerees g ON t.table_name = g.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'  -- SEULEMENT les vraies tables
  AND g.table_name IS NULL
ORDER BY t.table_name;