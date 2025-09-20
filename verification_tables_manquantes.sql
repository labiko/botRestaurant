-- =========================================================================
-- VÉRIFICATION DES VRAIES TABLES MANQUANTES (PAS LES VUES)
-- =========================================================================
-- Script pour identifier et vérifier seulement les vraies tables
-- =========================================================================

-- 1. Identifier les vraies tables vs les vues
SELECT
    table_name,
    table_type,
    CASE
        WHEN table_type = 'BASE TABLE' THEN '📋 VRAIE TABLE - À gérer'
        WHEN table_type = 'VIEW' THEN '👁️ VUE - Ne pas toucher'
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

-- 2. Vérifier SEULEMENT les vraies tables qui ont restaurant_id
SELECT
    t.table_name,
    t.table_type,
    CASE
        WHEN c.column_name = 'restaurant_id' THEN '✅ Colonne restaurant_id existe'
        ELSE '❌ Colonne restaurant_id manquante'
    END as status,
    c.data_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND c.column_name = 'restaurant_id'
    AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'  -- SEULEMENT les vraies tables
  AND t.table_name IN (
    'france_active_assignments',
    'france_available_drivers',
    'france_product_display_configs',
    'france_user_sessions',
    'france_workflow_templates'
  )
ORDER BY t.table_name;

-- 3. Identifier TOUTES les vraies tables manquantes (pas déjà gérées)
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
    '🎯 VRAIES TABLES À AJOUTER :' as titre,
    t.table_name,
    t.table_type
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

-- 4. Compter les enregistrements SEULEMENT pour les vraies tables identifiées
-- ⚠️ À exécuter APRÈS avoir identifié les vraies tables dans la requête précédente

-- 4. Test de suppression simulée (ROLLBACK) - SEULEMENT pour les VRAIES TABLES
-- ⚠️ REMPLACER par les vraies tables identifiées dans l'étape 3

/*
TEMPLATE pour test avec les vraies tables :

BEGIN;
    -- Compter AVANT
    SELECT 'AVANT' as phase,
           (SELECT COUNT(*) FROM [vraie_table_1] WHERE restaurant_id = 15) as table1,
           (SELECT COUNT(*) FROM [vraie_table_2] WHERE restaurant_id = 15) as table2;

    -- Simulation suppression
    DELETE FROM [vraie_table_1] WHERE restaurant_id = 15;
    DELETE FROM [vraie_table_2] WHERE restaurant_id = 15;

    -- Compter APRÈS
    SELECT 'APRÈS' as phase,
           (SELECT COUNT(*) FROM [vraie_table_1] WHERE restaurant_id = 15) as table1,
           (SELECT COUNT(*) FROM [vraie_table_2] WHERE restaurant_id = 15) as table2;
ROLLBACK;

-- Vérifier ROLLBACK
SELECT 'ROLLBACK' as phase,
       (SELECT COUNT(*) FROM [vraie_table_1] WHERE restaurant_id = 15) as table1,
       (SELECT COUNT(*) FROM [vraie_table_2] WHERE restaurant_id = 15) as table2;
*/