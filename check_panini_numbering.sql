-- Vérifier la configuration des PANINI pour voir la numérotation
SELECT 
    p.name as produit,
    po.option_group,
    po.option_name,
    po.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_options po ON po.product_id = p.id
WHERE c.name ILIKE '%PANINI%'
AND po.option_group = 'Boisson 33CL incluse'
AND p.name LIKE '%POULET%'
ORDER BY po.display_order
LIMIT 15;
