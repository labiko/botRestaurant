-- 🚨 DIAGNOSTIC PERTE DONNÉES - Vérifier ce qui reste en base

BEGIN;

-- 1. Vérifier TOUS les restaurants
SELECT 'TOUS RESTAURANTS' as verification;
SELECT id, name, slug FROM france_restaurants;

-- 2. Compter produits par restaurant  
SELECT 'PRODUITS PAR RESTAURANT' as verification;
SELECT 
    r.name as restaurant,
    r.slug,
    COUNT(p.id) as nb_produits_total,
    COUNT(CASE WHEN p.is_active THEN 1 END) as nb_produits_actifs
FROM france_restaurants r
LEFT JOIN france_products p ON r.id = p.restaurant_id
GROUP BY r.id, r.name, r.slug;

-- 3. Vérifier tous les produits restaurant_id=1 (actifs ET inactifs)
SELECT 'TOUS PRODUITS RESTAURANT 1' as verification;
SELECT 
    p.name,
    p.product_type,
    p.is_active,
    c.name as categorie
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id  
WHERE p.restaurant_id = 1
ORDER BY c.name, p.name
LIMIT 50;

-- 4. Compter par catégorie
SELECT 'PRODUITS PAR CATÉGORIE' as verification;
SELECT 
    c.name as categorie,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id AND p.restaurant_id = 1
WHERE c.restaurant_id = 1
GROUP BY c.id, c.name
ORDER BY nb_produits DESC;

ROLLBACK;