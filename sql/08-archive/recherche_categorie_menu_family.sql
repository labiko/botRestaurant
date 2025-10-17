-- RECHERCHE CATÉGORIE MENU FAMILY
-- MENU FAMILY = Catégorie séparée (pas dans POULET & SNACKS)

-- 1. Chercher si la catégorie MENU FAMILY existe
SELECT 
    'CATÉGORIE MENU FAMILY' as section,
    id,
    name,
    slug,
    icon,
    display_order,
    is_active
FROM france_menu_categories
WHERE name LIKE '%FAMILY%'
   OR name LIKE '%MENU%'
   OR slug LIKE '%family%'
   OR slug LIKE '%menu%'
ORDER BY name;

-- 2. Chercher les produits dans cette catégorie
SELECT 
    'PRODUITS DANS MENU FAMILY' as section,
    p.id,
    p.name,
    p.product_type,
    p.price_on_site_base,
    p.price_delivery_base,
    p.composition,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name LIKE '%FAMILY%'
   OR c.name LIKE '%MENU%'
   OR c.slug LIKE '%family%'
   OR c.slug LIKE '%menu%'
ORDER BY p.display_order;

-- 3. Si pas trouvé, chercher un produit MENU FAMILY dans toutes les catégories
SELECT 
    'PRODUIT MENU FAMILY DANS TOUTES CATÉGORIES' as section,
    c.name as categorie,
    p.name as produit,
    p.price_on_site_base,
    p.composition
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.name LIKE '%FAMILY%'
   OR p.name LIKE '%MENU FAMILY%'
ORDER BY c.name, p.name;