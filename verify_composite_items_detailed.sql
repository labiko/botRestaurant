-- VÉRIFICATION DÉTAILLÉE DES ÉLÉMENTS COMPOSITES POUR COMPRENDRE LA LOGIQUE
-- À copier/coller dans votre client SQL

-- 1. Voir TOUS les éléments composites du restaurant (pas seulement Menu Pizza)
SELECT 
    ci.id,
    ci.composite_product_id,
    ci.component_name,
    ci.quantity,
    ci.unit,
    p.name as product_name,
    c.name as category_name,
    p.product_type,
    p.workflow_type
FROM france_composite_items ci
JOIN france_products p ON ci.composite_product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
ORDER BY c.name, p.name, ci.id;

-- 2. Vérifier s'il existe des pizzas JUNIOR dans la base
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.base_price,
    p.price_on_site_base,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
    AND (p.name ILIKE '%junior%' OR c.name ILIKE '%pizza%')
ORDER BY c.name, p.name;

-- 3. Vérifier s'il existe des pizzas SÉNIOR dans la base
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.base_price,
    p.price_on_site_base,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
    AND p.name ILIKE '%sénior%'
ORDER BY p.name;

-- 4. Vérifier s'il existe des pizzas MEGA dans la base
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.base_price,
    p.price_on_site_base,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
    AND p.name ILIKE '%mega%'
ORDER BY p.name;

-- 5. Vérifier les boissons disponibles
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.base_price,
    p.price_on_site_base,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
    AND (c.name ILIKE '%drink%' OR c.name ILIKE '%boisson%' OR p.name ILIKE '%boisson%' OR p.name ILIKE '%coca%' OR p.name ILIKE '%fanta%')
ORDER BY c.name, p.name;