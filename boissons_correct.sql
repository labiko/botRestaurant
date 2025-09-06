-- 🔍 REQUÊTES CORRECTES BOISSONS (basées sur database_fr_structure.sql)

-- 1. Vérifier les catégories boissons (table: france_menu_categories)
SELECT id, name, slug, is_active, restaurant_id
FROM france_menu_categories 
WHERE LOWER(name) LIKE '%drink%' OR LOWER(name) LIKE '%boisson%' OR slug LIKE '%drink%';

-- 2. Vérifier les produits boissons (table: france_products)
SELECT p.id, p.name, p.product_type, p.is_active, c.name as category_name
FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id 
WHERE LOWER(c.name) LIKE '%drink%' OR LOWER(c.name) LIKE '%boisson%' OR c.slug LIKE '%drink%';

-- 3. Vérifier les variants boissons (table: france_product_variants)
SELECT id, product_id, variant_name, price_on_site, price_delivery, is_active
FROM france_product_variants 
WHERE variant_name ILIKE '%33%' OR variant_name ILIKE '%1L5%' OR variant_name ILIKE '%50%';

-- 4. Vérifier configuration TACOS includes_drink
SELECT p.id, p.name, ps.includes_drink, ps.size_name, ps.price_on_site
FROM france_products p
JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE p.name = 'TACOS';

-- 5. Vérifier toutes les catégories actives Restaurant Pizza Yolo (ID=1)
SELECT id, name, slug, display_order 
FROM france_menu_categories 
WHERE restaurant_id = 1 AND is_active = true 
ORDER BY display_order;