-- 🔍 RECHERCHE BOISSONS DOUBLONS DANS TOUTES LES TABLES

BEGIN;

-- 1. Chercher dans france_products (probablement là)
SELECT 
    'FRANCE_PRODUCTS' as table_source,
    p.id,
    p.name,
    p.category_id,
    c.name as category_name,
    p.is_active
FROM france_products p
LEFT JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.name IN ('MIRANDA TROPICALV3', 'MIRANDA TROPICALV2', '7 UP (COPIE) V1')
   OR p.name ILIKE '%MIRANDA TROPICAL%'
   OR p.name ILIKE '%7 UP%COPIE%'
ORDER BY p.name;

-- 2. Chercher aussi dans france_product_options (au cas où)
SELECT 
    'FRANCE_PRODUCT_OPTIONS' as table_source,
    fpo.id,
    fpo.option_name as name,
    fpo.product_id,
    p.name as product_name
FROM france_product_options fpo
LEFT JOIN france_products p ON p.id = fpo.product_id
WHERE fpo.option_name IN ('MIRANDA TROPICALV3', 'MIRANDA TROPICALV2', '7 UP (COPIE) V1')
   OR fpo.option_name ILIKE '%MIRANDA TROPICAL%'
   OR fpo.option_name ILIKE '%7 UP%COPIE%';

-- 3. Identifier la catégorie BOISSONS
SELECT 
    'CATÉGORIE BOISSONS' as info,
    id,
    name,
    slug,
    is_active
FROM france_menu_categories
WHERE name ILIKE '%boisson%' OR slug ILIKE '%boisson%' OR slug ILIKE '%drink%';

-- 4. Compter tous les produits MIRANDA et 7 UP
SELECT 
    'RÉSUMÉ DOUBLONS' as info,
    COUNT(CASE WHEN name = 'MIRANDA TROPICALV3' THEN 1 END) as nb_miranda_v3,
    COUNT(CASE WHEN name = 'MIRANDA TROPICALV2' THEN 1 END) as nb_miranda_v2,  
    COUNT(CASE WHEN name = 'MIRANDA TROPICAL' THEN 1 END) as nb_miranda_original,
    COUNT(CASE WHEN name = '7 UP (COPIE) V1' THEN 1 END) as nb_7up_copie
FROM france_products
WHERE category_id IN (
    SELECT id FROM france_menu_categories 
    WHERE name ILIKE '%boisson%' OR slug ILIKE '%boisson%' OR slug ILIKE '%drink%'
);

ROLLBACK;