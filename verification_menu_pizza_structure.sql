-- 🔍 VÉRIFICATION STRUCTURE MENUS PIZZA
-- Diagnostiquer le problème "(unknown)" dans l'affichage des tailles

BEGIN;

-- 1. Vérifier les produits MENU PIZZA avec leur steps_config
SELECT
    'MENU PIZZA - CONFIGURATION' as diagnostic,
    p.id,
    p.name,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.name ILIKE '%menu%'
    AND p.name ILIKE '%pizza%'
    AND p.is_active = true
ORDER BY p.name;

-- 2. Vérifier les tailles/variants des pizzas individuelles
SELECT
    'PIZZAS - VARIANTS TAILLES' as diagnostic,
    p.name as pizza_name,
    pv.variant_name as taille,
    pv.price_on_site,
    pv.price_delivery,
    pv.is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_variants pv ON pv.product_id = p.id
WHERE c.slug = 'pizzas'
    AND p.is_active = true
    AND pv.is_active = true
ORDER BY p.name, pv.display_order;

-- 3. Vérifier la structure menu_config dans steps_config
SELECT
    'MENU_CONFIG STRUCTURE' as diagnostic,
    p.name,
    CASE
        WHEN p.steps_config->>'menu_config' IS NOT NULL
        THEN p.steps_config->'menu_config'
        ELSE 'PAS DE menu_config'::jsonb
    END as menu_config_structure
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.name ILIKE '%menu%'
    AND p.name ILIKE '%pizza%'
    AND p.is_active = true;

-- 4. Analyser les components dans menu_config
SELECT
    'COMPONENTS ANALYSIS' as diagnostic,
    p.name as menu_name,
    jsonb_array_elements(p.steps_config->'menu_config'->'components') as component_detail
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.name ILIKE '%menu%'
    AND p.name ILIKE '%pizza%'
    AND p.is_active = true
    AND p.steps_config->'menu_config'->'components' IS NOT NULL;

-- 5. Vérifier s'il y a des tables spécifiques aux menus
SELECT
    'TABLES MENU EXISTANTES' as diagnostic,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE '%menu%'
ORDER BY table_name;

ROLLBACK;