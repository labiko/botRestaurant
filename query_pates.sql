-- Script SQL pour afficher les produits de la catégorie PÂTES
-- À exécuter dans Supabase Dashboard > SQL Editor

-- REQUÊTE BASIQUE - Produits pâtes avec composition et config
SELECT 
    p.id,
    p.name,
    p.description,
    p.composition,
    p.base_price,
    p.price_on_site_base,
    p.price_delivery_base,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config,
    p.is_active,
    p.display_order,
    p.restaurant_id,
    p.created_at
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug LIKE '%pate%' OR c.slug LIKE '%pasta%' OR c.name ILIKE '%pâte%'
ORDER BY p.display_order ASC, p.name ASC;

-- REQUÊTE COMPLÈTE - Avec restaurant, catégorie, composition et configuration
SELECT 
    p.id,
    r.name as restaurant_name,
    c.name as category_name,
    c.slug as category_slug,
    p.name as product_name,
    p.description,
    p.composition,
    p.base_price,
    p.price_on_site_base,
    p.price_delivery_base,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config,
    p.is_active,
    p.display_order,
    p.created_at
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE c.slug LIKE '%pate%' OR c.slug LIKE '%pasta%' OR c.name ILIKE '%pâte%'
ORDER BY r.name, c.display_order, p.display_order ASC, p.name ASC;

-- REQUÊTE ALTERNATIVE - Si slug exact connu
-- SELECT * FROM france_menu_categories WHERE slug = 'pates' OR name ILIKE '%pâte%';