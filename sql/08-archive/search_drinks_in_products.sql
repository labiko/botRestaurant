-- Recherche où sont stockées toutes les boissons dans la base
-- Recherche 1: Dans les catégories de produits
SELECT 'CATÉGORIES CONTENANT "BOISSON"' as recherche;
SELECT 
    id,
    name,
    slug,
    restaurant_id
FROM france_menu_categories 
WHERE name ILIKE '%BOISSON%' 
   OR name ILIKE '%DRINK%'
   OR slug ILIKE '%boisson%'
   OR slug ILIKE '%drink%';

-- Recherche 2: Dans les produits avec "boisson" dans le nom
SELECT 'PRODUITS CONTENANT "BOISSON"' as recherche;
SELECT 
    p.name,
    c.name as categorie,
    p.product_type,
    p.description
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name ILIKE '%BOISSON%'
   OR p.name ILIKE '%DRINK%'
   OR p.name ILIKE '%33CL%'
   OR p.name ILIKE '%COCA%'
   OR p.name ILIKE '%7UP%'
   OR p.description ILIKE '%boisson%'
LIMIT 20;
-- Recherche 3: Dans les options de produits (france_product_options)
SELECT 'OPTIONS CONTENANT BOISSONS' as recherche;
SELECT DISTINCT
    po.option_group,
    COUNT(*) as nb_options,
    STRING_AGG(DISTINCT po.option_name, ', ') as exemples_boissons
FROM france_product_options po
WHERE po.option_group ILIKE '%BOISSON%'
   OR po.option_group ILIKE '%DRINK%'  
   OR po.option_name ILIKE '%COCA%'
   OR po.option_name ILIKE '%7UP%'
   OR po.option_name ILIKE '%EAU%'
   OR po.option_name ILIKE '%PERRIER%'
GROUP BY po.option_group;

-- Recherche 4: Analyse de tous les groupes d'options
SELECT 'TOUS LES GROUPES D OPTIONS' as recherche;
SELECT DISTINCT
    po.option_group,
    COUNT(*) as nb_options
FROM france_product_options po
GROUP BY po.option_group
ORDER BY po.option_group;
-- Recherche 5: Dans les tailles/variantes de produits
SELECT 'TAILLES AVEC BOISSONS' as recherche;
SELECT 
    ps.size_name,
    ps.includes_drink,
    p.name as produit,
    c.name as categorie
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE ps.includes_drink = true
LIMIT 10;

-- Recherche 6: Variantes contenant boissons
SELECT 'VARIANTES AVEC BOISSONS' as recherche;
SELECT 
    pv.variant_name,
    pv.includes_description,
    p.name as produit
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE pv.includes_description ILIKE '%boisson%'
   OR pv.variant_name ILIKE '%boisson%'
   OR pv.variant_name ILIKE '%33cl%'
LIMIT 10;
