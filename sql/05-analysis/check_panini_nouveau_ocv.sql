-- 🔍 VÉRIFICATION PANINIS - Le Nouveau O'CV Moissy
-- ================================================

-- 1. Informations restaurant
SELECT 'RESTAURANT INFO' as type, id, name FROM france_restaurants
WHERE name = 'Le Nouveau O''CV Moissy';

-- 2. Produit panini avec sa configuration
SELECT
    'PANINI PRODUIT' as type,
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
AND p.name LIKE '%Panini%';

-- 3. Options existantes pour ce produit (si elles existent)
SELECT
    'OPTIONS EXISTANTES' as type,
    po.option_group,
    po.option_name,
    po.price_modifier,
    po.is_required,
    po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
AND p.name LIKE '%Panini%'
ORDER BY po.option_group, po.display_order;

-- 4. Catégorie du panini
SELECT
    'CATÉGORIE PANINI' as type,
    c.id,
    c.name,
    c.slug
FROM france_menu_categories c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
AND c.name LIKE '%Panini%';