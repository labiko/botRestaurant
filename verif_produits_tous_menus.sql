-- 🔍 VÉRIFICATION COMPLÈTE - Produits manquants pour TOUS les menus

-- MENU 1: 3 PIZZAS JUNIORS AU CHOIX
SELECT 'MENU 1 - PIZZAS JUNIOR' as verification;
SELECT COUNT(*) as nb_pizzas_junior
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE c.slug = 'pizzas' 
  AND c.restaurant_id = 1
  AND ps.size_name = 'JUNIOR';

-- MENU 2: 2 PIZZAS SÉNIOR + 1 BOISSON 1.5L
SELECT 'MENU 2 - PIZZAS SÉNIOR' as verification;
SELECT COUNT(*) as nb_pizzas_senior
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE c.slug = 'pizzas' 
  AND c.restaurant_id = 1
  AND ps.size_name = 'SENIOR';

SELECT 'MENU 2 - BOISSONS 1.5L' as verification;
SELECT p.name, pv.variant_name, pv.quantity, pv.unit
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_variants pv ON p.id = pv.product_id
WHERE c.slug = 'drinks' 
  AND c.restaurant_id = 1
  AND pv.variant_name = '1L5';

-- MENU 3: 1 PIZZA MEGA + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5L
SELECT 'MENU 3 - PIZZAS MEGA' as verification;
SELECT COUNT(*) as nb_pizzas_mega
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE c.slug = 'pizzas' 
  AND c.restaurant_id = 1
  AND ps.size_name = 'MEGA';

SELECT 'MENU 3 - NUGGETS 14 PIÈCES' as verification;
SELECT p.id, p.name, p.price_on_site_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (p.name = 'NUGGETS 14 PIÈCES' OR p.name = '14 NUGGETS');

SELECT 'MENU 3 - WINGS 12 PIÈCES' as verification;
SELECT p.id, p.name, p.price_on_site_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (p.name = 'WINGS 12 PIÈCES' OR p.name = '12 WINGS');

-- MENU 4: 1 PIZZA SÉNIOR + 6 WINGS OU 8 NUGGETS + 2 BOISSONS 33CL
SELECT 'MENU 4 - NUGGETS 8 PIÈCES' as verification;
SELECT p.id, p.name, p.price_on_site_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (p.name = 'NUGGETS 8 PIÈCES' OR p.name = '8 NUGGETS');

SELECT 'MENU 4 - WINGS 6 PIÈCES' as verification;
SELECT p.id, p.name, p.price_on_site_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (p.name = 'WINGS 6 PIÈCES' OR p.name = '6 WINGS');

SELECT 'MENU 4 - BOISSONS 33CL' as verification;
SELECT COUNT(*) as nb_boissons_33cl
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' 
  AND c.restaurant_id = 1
  AND p.product_type = 'simple'
  AND p.is_active = true;

-- RÉSUMÉ DES PRODUITS MANQUANTS
SELECT 'RÉSUMÉ PRODUITS MANQUANTS' as verification;
SELECT 
    'MENU 3: NUGGETS 14 PIÈCES' as produit_manquant
UNION ALL
SELECT 'MENU 3: WINGS 12 PIÈCES'
UNION ALL
SELECT 'MENU 4: NUGGETS 8 PIÈCES'
UNION ALL
SELECT 'MENU 4: WINGS 6 PIÈCES';