-- 🔍 RECHERCHE BRUTALE - Où sont les boissons ?!

-- 1. TOUTES LES CATÉGORIES du restaurant Pizza Yolo
SELECT id, name, slug, is_active, restaurant_id, display_order
FROM france_menu_categories 
WHERE restaurant_id = 1
ORDER BY display_order;

-- 2. TOUS LES PRODUITS avec "COCA" dans le nom (forcer la recherche)
SELECT 
    p.id, 
    p.name, 
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    p.is_active,
    p.restaurant_id
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE LOWER(p.name) LIKE '%coca%'
   OR LOWER(p.name) LIKE '%ice tea%'
   OR LOWER(p.name) LIKE '%sprite%'
   OR LOWER(p.name) LIKE '%fanta%';

-- 3. TOUS LES VARIANTS avec "33CL" dans le nom  
SELECT 
    pv.id,
    pv.product_id,
    pv.variant_name,
    p.name as product_name,
    c.name as category_name,
    p.restaurant_id
FROM france_product_variants pv
LEFT JOIN france_products p ON pv.product_id = p.id
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE pv.variant_name ILIKE '%33%'
   OR pv.variant_name ILIKE '%1L%'
   OR pv.variant_name ILIKE '%50%';

-- 4. COMPTER TOUS LES PRODUITS par catégorie (Pizza Yolo)
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
WHERE c.restaurant_id = 1
GROUP BY c.id, c.name, c.slug
ORDER BY c.display_order;