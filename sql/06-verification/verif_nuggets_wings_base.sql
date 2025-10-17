-- 🔍 VÉRIFICATION - NUGGETS et WINGS pour MENU 4

-- 1. Chercher NUGGETS dans toute la base
SELECT 'RECHERCHE NUGGETS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    c.name as categorie,
    c.slug as categorie_slug,
    p.price_on_site_base as prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (p.name ILIKE '%nugget%' OR p.name ILIKE '%nuggets%')
ORDER BY p.name;

-- 2. Chercher WINGS dans toute la base  
SELECT 'RECHERCHE WINGS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    c.name as categorie,
    c.slug as categorie_slug,
    p.price_on_site_base as prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (p.name ILIKE '%wing%' OR p.name ILIKE '%wings%')
ORDER BY p.name;

-- 3. Vérifier catégorie POULET & SNACKS (où devraient être nuggets/wings)
SELECT 'PRODUITS CATÉGORIE POULET & SNACKS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    p.price_on_site_base as prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'poulet-snacks'
  AND c.restaurant_id = 1
ORDER BY p.name;

-- 4. Vérifier catégorie SNACKS
SELECT 'PRODUITS CATÉGORIE SNACKS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    p.price_on_site_base as prix
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'snacks'
  AND c.restaurant_id = 1
ORDER BY p.name;

-- 5. Recherche exacte des noms utilisés dans le menu
SELECT 'RECHERCHE EXACTE' as verification;
SELECT 
    p.id,
    p.name,
    c.name as categorie,
    p.is_active
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
  AND (
    p.name = 'WINGS 6 PIÈCES' OR
    p.name = 'NUGGETS 8 PIÈCES' OR
    p.name = 'WINGS' OR
    p.name = 'NUGGETS'
  );