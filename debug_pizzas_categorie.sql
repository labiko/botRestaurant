-- 🔍 DEBUG - Vérifier pourquoi catégorie PIZZAS affiche "Aucune pizza disponible"

BEGIN;

-- 1. Identifier la catégorie "Pizzas" (choix 2)
SELECT 'CATÉGORIE PIZZAS' as verification;
SELECT id, name, slug, is_active, display_order
FROM france_menu_categories 
WHERE restaurant_id = 1 AND is_active = true
ORDER BY display_order;

-- 2. Vérifier les produits dans la catégorie Pizzas spécifiquement
SELECT 'PRODUITS CATÉGORIE PIZZAS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    p.display_order,
    c.name as categorie_name,
    c.slug as categorie_slug
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1 
  AND c.name = 'Pizzas' -- Catégorie exacte
  AND p.is_active = true
ORDER BY p.display_order
LIMIT 10;

-- 3. Alternative: chercher par slug 'pizzas'
SELECT 'PRODUITS SLUG PIZZAS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    c.name as categorie_name,
    c.slug as categorie_slug
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1 
  AND c.slug ILIKE '%pizza%'
  AND p.is_active = true
ORDER BY p.display_order
LIMIT 10;

-- 4. Compter TOUS les produits par catégorie active
SELECT 'COMPTAGE PAR CATÉGORIE' as verification;
SELECT 
    c.display_order,
    c.name as categorie,
    c.slug,
    COUNT(p.id) as nb_produits_actifs
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id AND p.is_active = true
WHERE c.restaurant_id = 1 AND c.is_active = true
GROUP BY c.display_order, c.name, c.slug
ORDER BY c.display_order;

-- 5. Vérifier la catégorie avec display_order = 2 (choix 2)
SELECT 'CATÉGORIE CHOIX 2' as verification;
SELECT 
    c.id,
    c.name,
    c.slug,
    c.display_order,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id AND p.is_active = true
WHERE c.restaurant_id = 1 AND c.is_active = true AND c.display_order = 2
GROUP BY c.id, c.name, c.slug, c.display_order;

ROLLBACK;