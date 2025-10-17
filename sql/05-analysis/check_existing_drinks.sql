-- 🔍 VÉRIFICATION : Quelles boissons 33CL existent dans la base de données
BEGIN;

-- 1. Toutes les boissons disponibles dans le restaurant
SELECT 
    'TOUTES BOISSONS DISPONIBLES' as section,
    p.id,
    p.name,
    p.price_on_site_base,
    p.price_delivery_base,
    c.slug as category
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%boisson%' OR c.slug ILIKE '%drink%' OR p.name ILIKE '%33%'
ORDER BY p.name;

-- 2. Boissons avec variantes 33CL
SELECT 
    'BOISSONS VARIANTS 33CL' as section,
    pv.id,
    p.name as product_name,
    pv.variant_name,
    pv.quantity,
    pv.unit,
    pv.price_on_site,
    pv.price_delivery
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE pv.variant_name ILIKE '%33%' OR pv.quantity = 33
ORDER BY p.name, pv.variant_name;

-- 3. Recherche dans toutes les catégories pour boissons
SELECT 
    'RECHERCHE BOISSONS GÉNÉRALE' as section,
    p.id,
    p.name,
    c.name as category_name,
    c.slug as category_slug
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name ILIKE '%coca%' 
   OR p.name ILIKE '%sprite%' 
   OR p.name ILIKE '%fanta%'
   OR p.name ILIKE '%pepsi%'
   OR p.name ILIKE '%eau%'
   OR p.name ILIKE '%jus%'
   OR p.name ILIKE '%boisson%'
ORDER BY c.slug, p.name;

COMMIT;