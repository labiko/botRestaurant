-- Analyse des boissons dans la catégorie DRINKS
SELECT 'BOISSONS DANS CATÉGORIE DRINKS' as info;
SELECT 
    p.name,
    p.product_type,
    p.base_price,
    p.price_on_site_base,
    p.description,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
ORDER BY p.display_order, p.name;

-- Vérifier s'il y a des variantes/tailles pour ces boissons
SELECT 'VARIANTES DES BOISSONS DRINKS' as info;
SELECT 
    p.name,
    pv.variant_name,
    pv.price_on_site
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_variants pv ON pv.product_id = p.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
ORDER BY p.name, pv.variant_name;
