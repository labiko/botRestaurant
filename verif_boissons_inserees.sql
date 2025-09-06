-- ✅ VÉRIFICATION POST-EXÉCUTION reset_drinks_complet.sql

-- 1. Compter les boissons dans DRINKS
SELECT 'TOTAL BOISSONS DRINKS' as verification;
SELECT COUNT(*) as nb_boissons FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1;

-- 2. Lister toutes les boissons créées
SELECT 'LISTE BOISSONS CRÉÉES' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.price_on_site_base,
    p.price_delivery_base,
    p.composition,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1
ORDER BY p.display_order;

-- 3. Vérifier les variants 1L5
SELECT 'VARIANTS 1L5' as verification;
SELECT 
    p.name as produit,
    pv.variant_name,
    pv.price_on_site,
    pv.price_delivery
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1
ORDER BY p.name;

-- 4. Test fonction bot - Requête que le bot utilise pour chercher les boissons
SELECT 'TEST REQUÊTE BOT' as verification;
SELECT 
    p.id,
    p.name,
    pv.variant_name,
    pv.price_on_site as price,
    p.is_active
FROM france_products p
LEFT JOIN france_product_variants pv ON p.id = pv.product_id  
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' 
  AND p.restaurant_id = 1 
  AND p.is_active = true
ORDER BY p.display_order, pv.display_order;