-- 🔍 DIAGNOSTIC: Pourquoi le produit dupliqué ne s'affiche pas

-- 1. Vérifier les détails complets du produit dupliqué
SELECT 
    'DÉTAILS PRODUIT DUPLIQUÉ' as section,
    p.id,
    p.name,
    p.category_id,
    p.restaurant_id,
    p.is_active,
    p.product_type,
    p.display_order,
    c.name as category_name,
    c.is_active as category_active
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.id = 328;

-- 2. Comparer avec l'original pour voir les différences
SELECT 
    'COMPARAISON ORIGINAL vs COPIE' as section,
    p.id,
    p.name,
    p.category_id,
    p.restaurant_id,
    p.is_active,
    p.product_type,
    p.display_order,
    p.price_on_site_base,
    p.price_delivery_base
FROM france_products p
WHERE p.name ILIKE '%miranda%tropical%'
ORDER BY p.id;

-- 3. Vérifier si la catégorie du produit dupliqué existe et est active
SELECT 
    'VÉRIFICATION CATÉGORIE' as section,
    id,
    name,
    slug,
    is_active,
    restaurant_id
FROM france_menu_categories 
WHERE id = (SELECT category_id FROM france_products WHERE id = 328);