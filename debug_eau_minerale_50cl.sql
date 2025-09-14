-- 🔍 DIAGNOSTIC: Pourquoi EAU MINÉRALE affiche 50CL au lieu de 33CL
-- Analyse complète du produit EAU MINÉRALE et ses variants

BEGIN;

-- 1. Trouver le produit EAU MINÉRALE
SELECT 
    'PRODUIT EAU MINÉRALE' as section,
    p.id,
    p.name,
    p.category_id,
    p.type,
    p.price_on_site as price_base,
    p.price_delivery as price_delivery_base,
    p.is_active,
    c.name as category_name
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name ILIKE '%EAU%MINERALE%' 
   OR p.name ILIKE '%EAU MINERALE%'
   OR p.name ILIKE 'EAU%'
ORDER BY p.id;

-- 2. Analyser TOUS les variants de l'eau minérale
SELECT 
    'VARIANTS EAU MINÉRALE' as section,
    pv.id as variant_id,
    pv.product_id,
    p.name as product_name,
    pv.variant_name,
    pv.price_on_site,
    pv.price_delivery,
    pv.is_active as variant_active,
    pv.display_order
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.name ILIKE '%EAU%'
ORDER BY pv.product_id, pv.display_order;

-- 3. Vérifier si il y a un problème avec les variants 33CL vs 50CL
SELECT 
    'COMPARAISON VARIANTS SUSPECTS' as section,
    pv.variant_name,
    COUNT(*) as count_variants,
    GROUP_CONCAT(p.name) as products_concernés
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.category_id = 14 -- catégorie boissons
  AND pv.variant_name IN ('33CL', '50CL', '1L5')
GROUP BY pv.variant_name
ORDER BY pv.variant_name;

-- 4. Vérifier l'ordre d'affichage des variants pour EAU MINÉRALE
SELECT 
    'ORDRE AFFICHAGE EAU MINÉRALE' as section,
    pv.display_order,
    pv.variant_name,
    pv.price_on_site,
    pv.is_active,
    CASE 
        WHEN pv.display_order = 1 THEN '👈 PREMIER AFFICHÉ'
        ELSE ''
    END as premier_choix
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.name ILIKE '%EAU%MINERALE%'
ORDER BY pv.display_order ASC;

-- 5. Rechercher tous les produits avec variant 50CL
SELECT 
    'TOUS PRODUITS AVEC 50CL' as section,
    p.name as product_name,
    pv.variant_name,
    pv.display_order,
    pv.price_on_site
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE pv.variant_name = '50CL'
ORDER BY p.name;

COMMIT;

-- 🎯 HYPOTHÈSES À VÉRIFIER:
-- 1. Le bot prend-il le premier variant par display_order ?
-- 2. Y a-t-il un variant 50CL configuré par erreur ?
-- 3. Le variant 33CL a-t-il display_order = 1 ?
-- 4. Le variant 33CL est-il actif ?