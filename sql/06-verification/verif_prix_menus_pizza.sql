-- 🔍 VÉRIFICATION - Prix des menus pizza

SELECT 'PRIX MENUS PIZZA' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.price_on_site_base,
    p.price_delivery_base,
    p.composition,
    CASE 
        WHEN p.price_on_site_base IS NULL THEN '❌ Prix NULL'
        WHEN p.price_on_site_base = 0 THEN '⚠️ Prix = 0'
        ELSE '✅ Prix OK: ' || p.price_on_site_base || '€'
    END as statut_prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name LIKE '%MENU%' 
  AND c.slug = 'menus'
  AND c.restaurant_id = 1
ORDER BY p.display_order;