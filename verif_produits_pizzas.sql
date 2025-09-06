-- 🔍 VÉRIFICATION EXPLICITE - Produits dans la catégorie Pizzas
-- Voir si la catégorie Pizzas contient des produits actifs

BEGIN;

-- 1. Vérifier la catégorie Pizzas après correction display_order
SELECT 'CATÉGORIE PIZZAS CORRIGÉE' as verification;
SELECT 
    id,
    name,
    slug,
    display_order,
    is_active
FROM france_menu_categories 
WHERE restaurant_id = 1 AND slug = 'pizzas';

-- 2. Compter les produits ACTIFS dans la catégorie Pizzas
SELECT 'NOMBRE PRODUITS PIZZAS' as verification;
SELECT COUNT(*) as nb_pizzas_actives
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'pizzas' 
  AND c.restaurant_id = 1 
  AND p.is_active = true;

-- 3. Lister TOUS les produits de la catégorie Pizzas (actifs ET inactifs)
SELECT 'TOUS PRODUITS PIZZAS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    p.display_order,
    CASE WHEN p.is_active THEN '✅' ELSE '❌' END as statut
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'pizzas' 
  AND c.restaurant_id = 1
ORDER BY p.is_active DESC, p.display_order;

-- 4. Si aucun produit, vérifier s'il y a des pizzas dans d'autres catégories
SELECT 'PIZZAS DANS AUTRES CATÉGORIES' as verification;
SELECT 
    p.id,
    p.name,
    p.is_active,
    c.name as categorie,
    c.slug as categorie_slug
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name ILIKE '%pizza%' 
  AND c.restaurant_id = 1 
  AND p.is_active = true
ORDER BY c.name, p.name;

-- 5. Vérifier les sizes/variants des pizzas s'ils existent
SELECT 'PIZZA SIZES/VARIANTS' as verification;
SELECT 
    p.name as pizza,
    ps.size_name,
    ps.price_on_site,
    ps.price_delivery,
    ps.includes_drink
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE c.slug = 'pizzas' 
  AND c.restaurant_id = 1
  AND p.is_active = true
ORDER BY p.name, ps.display_order;

ROLLBACK;