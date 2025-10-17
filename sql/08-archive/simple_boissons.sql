-- 🔍 REQUÊTE SIMPLE BOISSONS

-- 1. Vérifier les catégories boissons
SELECT * FROM categories WHERE name ILIKE '%drink%' OR name ILIKE '%boisson%';

-- 2. Vérifier les produits boissons
SELECT p.id, p.name, c.name as category 
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE c.name ILIKE '%drink%' OR c.name ILIKE '%boisson%';

-- 3. Vérifier les variants 33CL et 1L5
SELECT * FROM product_sizes WHERE variant_name ILIKE '%33%' OR variant_name ILIKE '%1L5%';