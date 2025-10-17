-- Fonction pour récupérer automatiquement les boissons 33CL
-- Test de la requête de récupération automatique
SELECT 'BOISSONS 33CL RÉCUPÉRÉES AUTOMATIQUEMENT' as info;
SELECT 
    p.name as drink_name,
    pv.price_on_site,
    pv.display_order,
    ROW_NUMBER() OVER (ORDER BY p.display_order, p.name) as auto_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_variants pv ON pv.product_id = p.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
AND (
    pv.variant_name = '33CL' 
    OR (pv.quantity = 33 AND pv.unit = 'cl')
)
AND p.is_active = true
AND pv.is_active = true
ORDER BY p.display_order, p.name;

-- Test avec mapping des icônes
SELECT 'AVEC MAPPING ICÔNES' as info;
SELECT 
    p.name as drink_name,
    CASE 
        WHEN p.name ILIKE '%7 UP%' AND p.name NOT ILIKE '%CHERRY%' AND p.name NOT ILIKE '%TROPICAL%' THEN '🥤'
        WHEN p.name ILIKE '%CHERRY%' THEN '🍒'
        WHEN p.name ILIKE '%TROPICAL%' THEN '🌴'
        WHEN p.name ILIKE '%COCA%' AND p.name NOT ILIKE '%ZERO%' THEN '🥤'
        WHEN p.name ILIKE '%ZERO%' THEN '⚫'
        WHEN p.name ILIKE '%EAU%' OR p.name ILIKE '%PERRIER%' THEN '💧'
        WHEN p.name ILIKE '%ICE TEA%' THEN '🧊'
        WHEN p.name ILIKE '%FRAISE%' THEN '🍓'
        WHEN p.name ILIKE '%MIRANDA TROPICAL%' THEN '🏝️'
        WHEN p.name ILIKE '%OASIS%' THEN '🌺'
        WHEN p.name ILIKE '%PERRIER%' THEN '💎'
        WHEN p.name ILIKE '%TROPICO%' THEN '🍊'
        ELSE '🥤'
    END as icon,
    ROW_NUMBER() OVER (ORDER BY p.display_order, p.name) as auto_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_variants pv ON pv.product_id = p.id
WHERE c.name = 'DRINKS'
AND c.restaurant_id = 1
AND (pv.variant_name = '33CL' OR (pv.quantity = 33 AND pv.unit = 'cl'))
AND p.is_active = true
AND pv.is_active = true
ORDER BY p.display_order, p.name;
