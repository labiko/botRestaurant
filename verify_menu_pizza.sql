-- VÉRIFICATION COMPLÈTE DE LA CATÉGORIE MENU PIZZA
-- À copier/coller dans votre client SQL

-- 1. Vérifier la catégorie Menu Pizza
SELECT 
    id,
    name,
    slug,
    icon,
    display_order,
    is_active,
    restaurant_id
FROM france_menu_categories 
WHERE name ILIKE '%menu%pizza%' 
    AND restaurant_id = 1;

-- 2. Vérifier les produits dans la catégorie Menu Pizza
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.base_price,
    p.price_on_site_base,
    p.price_delivery_base,
    p.is_active,
    p.display_order,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%menu%pizza%' 
    AND p.restaurant_id = 1
ORDER BY p.display_order;

-- 3. Vérifier les workflows/configurations des produits Menu Pizza
SELECT 
    p.id,
    p.name,
    p.steps_config,
    p.workflow_type,
    p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%menu%pizza%' 
    AND p.restaurant_id = 1
    AND p.requires_steps = true;

-- 4. Vérifier les éléments composites si ils existent
SELECT 
    ci.id,
    ci.composite_product_id,
    ci.component_name,
    ci.quantity,
    ci.unit,
    p.name as product_name
FROM france_composite_items ci
JOIN france_products p ON ci.composite_product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%menu%pizza%' 
    AND p.restaurant_id = 1
ORDER BY ci.composite_product_id, ci.id;

-- 5. Compter le nombre de produits par type dans Menu Pizza
SELECT 
    p.product_type,
    p.workflow_type,
    COUNT(*) as count
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%menu%pizza%' 
    AND p.restaurant_id = 1
GROUP BY p.product_type, p.workflow_type;