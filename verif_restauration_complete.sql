-- ✅ VÉRIFICATION POST-RESTAURATION
-- Confirmer que pizzas et menus sont bien restaurés

BEGIN;

-- 1. Vérifier catégorie Pizzas
SELECT 'CATÉGORIE PIZZAS' as verification;
SELECT id, name, slug, display_order, is_active
FROM france_menu_categories 
WHERE restaurant_id = 1 AND slug = 'pizzas';

-- 2. Compter les pizzas actives
SELECT 'PIZZAS ACTIVES' as verification;
SELECT COUNT(*) as nb_pizzas
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'pizzas' AND c.restaurant_id = 1 AND p.is_active = true;

-- 3. Lister quelques pizzas avec leurs tailles
SELECT 'EXEMPLES PIZZAS' as verification;
SELECT 
    p.name,
    ps.size_name,
    ps.price_on_site as prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE c.slug = 'pizzas' AND c.restaurant_id = 1
ORDER BY p.display_order, ps.display_order
LIMIT 10;

-- 4. Vérifier les MENUS PIZZAS (Menu 1,2,3,4)
SELECT 'MENUS PIZZAS' as verification;
SELECT 
    p.name,
    p.composition,
    p.price_on_site_base as prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name LIKE '%MENU%' AND c.restaurant_id = 1
ORDER BY p.display_order;

-- 5. Vérifier que display_order est correct pour toutes les catégories
SELECT 'ORDRE CATÉGORIES' as verification;
SELECT 
    display_order as choix,
    name,
    slug
FROM france_menu_categories 
WHERE restaurant_id = 1 AND is_active = true
ORDER BY display_order
LIMIT 10;

ROLLBACK;