-- Analyse COMPLÈTE de toutes les boissons pour identifier les critères 33CL
SELECT 'ANALYSE COMPLÈTE DES BOISSONS DRINKS' as info;
SELECT 
    p.id,
    p.name,
    p.description,
    p.composition,
    p.product_type,
    p.base_price,
    p.price_on_site_base,
    p.price_delivery_base,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
ORDER BY p.display_order, p.name;

-- Vérifier les variantes avec détails complets
SELECT 'VARIANTES COMPLÈTES DES BOISSONS' as info;
SELECT 
    p.name as produit_principal,
    pv.variant_name,
    pv.price_on_site,
    pv.price_delivery,
    pv.quantity,
    pv.unit,
    pv.includes_description,
    pv.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_variants pv ON pv.product_id = p.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
ORDER BY p.name, pv.display_order;

-- Vérifier les tailles de boissons
SELECT 'TAILLES DES BOISSONS' as info;
SELECT 
    p.name as produit_principal,
    ps.size_name,
    ps.price_on_site,
    ps.price_delivery,
    ps.includes_drink,
    ps.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_sizes ps ON ps.product_id = p.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
ORDER BY p.name, ps.display_order;
