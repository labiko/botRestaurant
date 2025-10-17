-- ========================================
-- AFFICHAGE DE TOUTES LES ICÔNES
-- Catégories, Produits et Options
-- ========================================

-- 1. ICÔNES DES CATÉGORIES
SELECT
    'CATEGORIES' as type,
    c.id,
    c.name,
    c.icon,
    r.name as restaurant_name,
    c.display_order
FROM france_menu_categories c
JOIN france_restaurants r ON r.id = c.restaurant_id
WHERE c.icon IS NOT NULL
    AND c.icon != ''
ORDER BY r.name, c.display_order;

-- ========================================

-- 2. ICÔNES DES PRODUITS
SELECT
    'PRODUCTS' as type,
    p.id,
    p.name,
    p.icon,
    c.name as category_name,
    r.name as restaurant_name,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE p.icon IS NOT NULL
    AND p.icon != ''
ORDER BY r.name, c.name, p.display_order;

-- ========================================

-- 3. ICÔNES DES OPTIONS
SELECT
    'OPTIONS' as type,
    po.id,
    po.option_name,
    po.icon,
    po.option_group,
    p.name as product_name,
    c.name as category_name,
    r.name as restaurant_name
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.icon IS NOT NULL
    AND po.icon != ''
ORDER BY r.name, c.name, p.name, po.option_group, po.display_order;

-- ========================================

-- 4. RÉSUMÉ STATISTIQUES ICÔNES
SELECT
    'STATISTICS' as section,
    'Categories avec icônes' as description,
    COUNT(*) as count
FROM france_menu_categories
WHERE icon IS NOT NULL AND icon != ''

UNION ALL

SELECT
    'STATISTICS' as section,
    'Produits avec icônes' as description,
    COUNT(*) as count
FROM france_products
WHERE icon IS NOT NULL AND icon != ''

UNION ALL

SELECT
    'STATISTICS' as section,
    'Options avec icônes' as description,
    COUNT(*) as count
FROM france_product_options
WHERE icon IS NOT NULL AND icon != ''

UNION ALL

SELECT
    'STATISTICS' as section,
    'Total icônes utilisées' as description,
    (
        (SELECT COUNT(*) FROM france_menu_categories WHERE icon IS NOT NULL AND icon != '') +
        (SELECT COUNT(*) FROM france_products WHERE icon IS NOT NULL AND icon != '') +
        (SELECT COUNT(*) FROM france_product_options WHERE icon IS NOT NULL AND icon != '')
    ) as count;

-- ========================================

-- 5. ICÔNES UNIQUES UTILISÉES
SELECT
    'UNIQUE_ICONS' as section,
    icon,
    COUNT(*) as usage_count,
    'Categories' as used_in
FROM france_menu_categories
WHERE icon IS NOT NULL AND icon != ''
GROUP BY icon

UNION ALL

SELECT
    'UNIQUE_ICONS' as section,
    icon,
    COUNT(*) as usage_count,
    'Products' as used_in
FROM france_products
WHERE icon IS NOT NULL AND icon != ''
GROUP BY icon

UNION ALL

SELECT
    'UNIQUE_ICONS' as section,
    icon,
    COUNT(*) as usage_count,
    'Options' as used_in
FROM france_product_options
WHERE icon IS NOT NULL AND icon != ''
GROUP BY icon

ORDER BY section, usage_count DESC;