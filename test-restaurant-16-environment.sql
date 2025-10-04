-- ========================================
-- TEST ENVIRONNEMENTS - RESTAURANT 16
-- Vérifier données DEV vs PROD
-- ========================================

-- ===== ENVIRONNEMENT DEV =====
\echo '🔧 ENVIRONNEMENT DEV'
\echo '=================='

-- Connexion DEV (URL: lphvdoyhwaelmwdfkfuh.supabase.co)
-- Vérifier le restaurant
SELECT
    'DEV - Restaurant' as test,
    id, name, slug, is_active
FROM france_restaurants
WHERE id = 16;

-- Vérifier les catégories
SELECT
    'DEV - Catégories' as test,
    c.id, c.name, c.icon,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
WHERE c.restaurant_id = 16
GROUP BY c.id, c.name, c.icon
ORDER BY c.display_order;

-- Vérifier spécifiquement la catégorie TACOS
SELECT
    'DEV - Catégorie TACOS' as test,
    c.id as category_id,
    c.name as category_name,
    COUNT(p.id) as total_products
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
WHERE c.restaurant_id = 16
    AND UPPER(c.name) LIKE '%TACOS%'
GROUP BY c.id, c.name;

-- Lister les produits TACOS
SELECT
    'DEV - Produits TACOS' as test,
    p.id, p.name, p.price_on_site_base, p.is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 16
    AND UPPER(c.name) LIKE '%TACOS%'
ORDER BY p.display_order
LIMIT 5;

-- Vérifier les options des produits TACOS
SELECT
    'DEV - Options TACOS' as test,
    COUNT(po.id) as total_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 16
    AND UPPER(c.name) LIKE '%TACOS%';

\echo ''
\echo '🚀 ENVIRONNEMENT PROD'
\echo '==================='

-- ===== ENVIRONNEMENT PROD =====
-- Connexion PROD (URL: vywbhlnzvfqtiurwmrac.supabase.co)
-- Il faut changer de connexion pour tester PROD

-- Résumé des environnements
\echo ''
\echo '📊 RÉSUMÉ COMPARATIF'
\echo '=================='
\echo 'Si les données sont dans DEV:'
\echo '  - Interface doit être sur DEV pour voir les données'
\echo '  - Vérifier que le sélecteur d_environnement est sur DEV'
\echo ''
\echo 'Si les données sont dans PROD:'
\echo '  - Interface doit être sur PROD pour voir les données'
\echo '  - Vérifier que le sélecteur d_environnement est sur PROD'
\echo ''
\echo 'Si aucune donnée dans les deux:'
\echo '  - Problème de migration ou restaurant_id incorrect'