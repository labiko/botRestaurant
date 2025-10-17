-- 🔍 VÉRIFICATION TOUS PRODUITS - Le Nouveau O'CV Moissy
-- ========================================================

-- 1. Restaurant info
SELECT 'RESTAURANT' as type, id, name FROM france_restaurants
WHERE name = 'Le Nouveau O''CV Moissy';

-- 2. Tous les produits créés
SELECT
    'PRODUITS CRÉÉS' as type,
    p.id,
    p.name,
    c.name as category,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.price_on_site_base,
    p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
ORDER BY c.display_order, p.display_order;

-- 3. Compter par catégorie
SELECT
    'PRODUITS PAR CATÉGORIE' as type,
    c.name as category,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
GROUP BY c.id, c.name, c.display_order
ORDER BY c.display_order;

-- 4. Produits composites avec leurs configurations
SELECT
    'PRODUITS COMPOSITES' as type,
    p.name,
    p.steps_config
FROM france_products p
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
AND p.requires_steps = true;