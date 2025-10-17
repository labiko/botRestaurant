-- 🔍 DEBUG - Analyser la structure exacte des boissons retournées
-- Pour comprendre pourquoi TACOS affiche 1L5 au lieu de seulement 33CL

BEGIN;

-- 1. Vérifier TOUTES les boissons simples (product_type = 'simple')
SELECT 'BOISSONS SIMPLES (33CL)' as debug_section;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.composition,
    p.price_on_site_base,
    p.price_delivery_base,
    p.display_order,
    p.is_active
FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1 
  AND p.product_type = 'simple'
ORDER BY p.display_order;

-- 2. Vérifier TOUTES les boissons avec variants (product_type = 'variant')
SELECT 'BOISSONS AVEC VARIANTS (1L5)' as debug_section;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.display_order,
    pv.variant_name,
    pv.quantity,
    pv.unit,
    pv.price_on_site,
    pv.price_delivery
FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_variants pv ON p.id = pv.product_id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1 
  AND p.product_type = 'variant'
ORDER BY p.display_order, pv.display_order;

-- 3. SIMULATION de ce que retourne getAvailableDrinks() - VERSION SIMPLE PRODUCTS
SELECT 'SIMULATION getAvailableDrinks() - SIMPLE PRODUCTS' as debug_section;
SELECT 
    p.id,
    p.name,
    'simple' as source_type,
    '33CL' as variant_name,
    p.price_on_site_base as price_on_site,
    p.price_delivery_base as price_delivery,
    p.product_type,
    p.display_order
FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1 
  AND p.product_type = 'simple'
  AND p.is_active = true
ORDER BY p.display_order;

-- 4. SIMULATION de ce que retourne getAvailableDrinks() - VARIANTS 33CL SEULEMENT
SELECT 'SIMULATION getAvailableDrinks() - VARIANTS 33CL' as debug_section;
SELECT 
    pv.id,
    p.name,
    'variant' as source_type,
    pv.variant_name,
    pv.price_on_site,
    pv.price_delivery,
    'variant' as product_type,
    0 as display_order,
    pv.quantity,
    pv.unit
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1
  AND pv.quantity = 33
  AND pv.unit = 'cl'
ORDER BY pv.display_order;

ROLLBACK;