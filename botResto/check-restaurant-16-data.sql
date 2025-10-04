-- ========================================
-- DIAGNOSTIC RESTAURANT ID 16 - TACOS
-- ========================================

-- 1. VÉRIFIER LE RESTAURANT
SELECT
    id,
    name,
    slug,
    is_active,
    created_at
FROM france_restaurants
WHERE id = 16;

-- ========================================

-- 2. VÉRIFIER LES CATÉGORIES DU RESTAURANT
SELECT
    c.id,
    c.name,
    c.icon,
    c.display_order,
    c.is_active,
    COUNT(p.id) as nombre_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.restaurant_id = 16
WHERE c.restaurant_id = 16
GROUP BY c.id, c.name, c.icon, c.display_order, c.is_active
ORDER BY c.display_order;

-- ========================================

-- 3. VÉRIFIER LA CATÉGORIE TACOS SPÉCIFIQUEMENT
SELECT
    c.id as category_id,
    c.name as category_name,
    COUNT(p.id) as total_products
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
WHERE c.restaurant_id = 16
    AND UPPER(c.name) LIKE '%TACOS%'
GROUP BY c.id, c.name;

-- ========================================

-- 4. LISTER TOUS LES PRODUITS DE LA CATÉGORIE TACOS
SELECT
    p.id,
    p.name,
    p.category_id,
    c.name as category_name,
    p.price_on_site_base,
    p.price_delivery_base,
    p.product_type,
    p.is_active,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 16
    AND UPPER(c.name) LIKE '%TACOS%'
ORDER BY p.display_order;

-- ========================================

-- 5. VÉRIFIER LES OPTIONS POUR LES PRODUITS TACOS
SELECT
    po.id,
    po.product_id,
    p.name as product_name,
    po.option_group,
    po.option_name,
    po.is_required,
    po.is_active
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 16
    AND UPPER(c.name) LIKE '%TACOS%'
ORDER BY po.product_id, po.group_order, po.display_order
LIMIT 20;

-- ========================================

-- 6. RÉSUMÉ GLOBAL DU RESTAURANT
SELECT
    'Restaurant' as type,
    COUNT(DISTINCT r.id) as count
FROM france_restaurants r
WHERE r.id = 16

UNION ALL

SELECT
    'Catégories' as type,
    COUNT(DISTINCT c.id) as count
FROM france_menu_categories c
WHERE c.restaurant_id = 16

UNION ALL

SELECT
    'Produits' as type,
    COUNT(DISTINCT p.id) as count
FROM france_products p
WHERE p.restaurant_id = 16

UNION ALL

SELECT
    'Options' as type,
    COUNT(DISTINCT po.id) as count
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 16;

-- ========================================
-- SI AUCUNE DONNÉE, VÉRIFIER :
-- 1. L'environnement (DEV vs PROD)
-- 2. Si les données ont été migrées
-- 3. Si le restaurant_id est correct
-- ========================================