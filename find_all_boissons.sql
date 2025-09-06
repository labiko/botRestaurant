-- 🔍 RECHERCHE EXHAUSTIVE BOISSONS - Toutes variantes possibles

-- 1. TOUTES les catégories qui pourraient être boissons
SELECT id, name, slug, is_active, restaurant_id, display_order
FROM france_menu_categories 
WHERE restaurant_id = 1 
ORDER BY display_order;

-- 2. RECHERCHE ÉLARGIE dans noms de catégories
SELECT id, name, slug, is_active
FROM france_menu_categories 
WHERE restaurant_id = 1
  AND (
    LOWER(name) LIKE '%drink%' OR
    LOWER(name) LIKE '%boisson%' OR 
    LOWER(name) LIKE '%soda%' OR
    LOWER(name) LIKE '%eau%' OR
    LOWER(name) LIKE '%jus%' OR
    LOWER(slug) LIKE '%drink%' OR
    LOWER(slug) LIKE '%boisson%' OR
    LOWER(slug) LIKE '%beverage%'
  );

-- 3. RECHERCHE DIRECTE par noms de produits boissons
SELECT 
    p.id, 
    p.name, 
    p.category_id,
    c.name as category_name,
    p.is_active
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (
    LOWER(p.name) LIKE '%coca%' OR
    LOWER(p.name) LIKE '%sprite%' OR
    LOWER(p.name) LIKE '%fanta%' OR
    LOWER(p.name) LIKE '%eau%' OR
    LOWER(p.name) LIKE '%jus%' OR
    LOWER(p.name) LIKE '%soda%' OR
    LOWER(p.name) LIKE '%drink%' OR
    LOWER(p.name) LIKE '%boisson%'
  );

-- 4. TOUS les produits avec variants (33CL, 1L5, etc.)
SELECT 
    p.id, 
    p.name as product_name,
    c.name as category_name,
    pv.variant_name,
    pv.is_active,
    c.id as category_id
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_variants pv ON p.id = pv.product_id
WHERE p.restaurant_id = 1
  AND (
    pv.variant_name ILIKE '%33%' OR
    pv.variant_name ILIKE '%1L%' OR
    pv.variant_name ILIKE '%50%' OR
    pv.variant_name ILIKE '%75%'
  );