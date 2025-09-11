-- Comparaison PANINI vs GOURMET pour la numérotation
SELECT 'PANINI (RÉFÉRENCE):' as categorie;
SELECT 
    po.option_name,
    po.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_options po ON po.product_id = p.id
WHERE c.name ILIKE '%PANINI%'
AND po.option_group = 'Boisson 33CL incluse'
AND p.name LIKE '%POULET%'
ORDER BY po.display_order
LIMIT 12;

SELECT 'GOURMET (ACTUEL):' as categorie;
SELECT 
    po.option_name,
    po.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_options po ON po.product_id = p.id
WHERE c.name ILIKE '%GOURMET%'
AND po.option_group = 'Boisson 33CL incluse'
AND p.name = 'LE SAVOYARD'
ORDER BY po.display_order
LIMIT 12;
