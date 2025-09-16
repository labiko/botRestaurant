-- 🔍 DIAGNOSTIC SPÉCIFIQUE - État existant SANDWICHS + Boissons 33CL
-- Objectif: Comprendre l'existant avant de créer la fonction simple_with_drinks

-- 1. ÉTAT ACTUEL DES SANDWICHS
\echo '=== 1. ÉTAT ACTUEL DES SANDWICHS ==='
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE WHEN p.steps_config IS NULL THEN 'NULL' ELSE 'PRESENT' END as steps_config_status,
    p.price_on_site_base,
    p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
AND p.is_active = true
ORDER BY p.name;

-- 2. PRODUCT_OPTIONS ACTUELLES POUR SANDWICHS
\echo ''
\echo '=== 2. PRODUCT_OPTIONS ACTUELLES SANDWICHS ==='
SELECT 
    p.name as produit,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required,
    fpo.max_selections,
    fpo.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'sandwichs'
ORDER BY p.name, fpo.display_order
LIMIT 10;

-- 3. COMPOSITE_ITEMS ACTUELS POUR SANDWICHS
\echo ''
\echo '=== 3. COMPOSITE_ITEMS ACTUELS SANDWICHS ==='
SELECT 
    p.name as produit,
    fci.component_name,
    fci.quantity,
    fci.unit
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_composite_items fci ON fci.composite_product_id = p.id
WHERE c.slug = 'sandwichs'
ORDER BY p.name;

-- 4. IDENTIFIER LA CATÉGORIE BOISSONS
\echo ''
\echo '=== 4. CATÉGORIES BOISSONS DISPONIBLES ==='
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(p.id) as nb_produits_boissons
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.is_active = true
WHERE c.name ILIKE '%boisson%' OR c.name ILIKE '%drink%' OR c.slug ILIKE '%drink%'
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- 5. BOISSONS 33CL DISPONIBLES
\echo ''
\echo '=== 5. BOISSONS 33CL DISPONIBLES ==='
-- Chercher les boissons avec variantes 33CL
SELECT 
    c.name as categorie_boisson,
    p.name as nom_boisson,
    pv.variant_name,
    pv.quantity,
    pv.unit,
    pv.price_on_site,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_variants pv ON pv.product_id = p.id
WHERE (c.name ILIKE '%boisson%' OR c.name ILIKE '%drink%' OR c.slug ILIKE '%drink%')
AND p.is_active = true
AND (
    pv.variant_name ILIKE '%33%' 
    OR (pv.quantity = 33 AND pv.unit = 'cl')
    OR pv.variant_name IS NULL -- Produits sans variantes
)
ORDER BY p.display_order, p.name;

-- 6. ALTERNATIVE: BOISSONS SIMPLES (sans variantes)
\echo ''
\echo '=== 6. BOISSONS SIMPLES (SANS VARIANTES) ==='
SELECT 
    c.name as categorie_boisson,
    p.name as nom_boisson,
    p.price_on_site_base,
    p.display_order,
    COUNT(pv.id) as nb_variantes
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_variants pv ON pv.product_id = p.id
WHERE (c.name ILIKE '%boisson%' OR c.name ILIKE '%drink%' OR c.slug ILIKE '%drink%')
AND p.is_active = true
GROUP BY c.name, p.name, p.price_on_site_base, p.display_order, p.id
HAVING COUNT(pv.id) = 0 -- Produits sans variantes
ORDER BY p.display_order, p.name;

-- 7. VÉRIFIER S'IL Y A DÉJÀ DES OPTIONS BOISSONS CONFIGURÉES
\echo ''
\echo '=== 7. OPTIONS BOISSONS DÉJÀ CONFIGURÉES (TOUTES CATÉGORIES) ==='
SELECT 
    c.name as categorie,
    COUNT(DISTINCT p.id) as nb_produits_avec_boissons,
    COUNT(fpo.id) as total_options_boissons,
    STRING_AGG(DISTINCT fpo.option_group, ', ') as groupes_options,
    COUNT(DISTINCT fpo.option_name) as nb_boissons_distinctes
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE fpo.option_group ILIKE '%boisson%' OR fpo.option_group ILIKE '%33cl%'
GROUP BY c.name
ORDER BY total_options_boissons DESC;

-- 8. EXEMPLE D'OPTIONS BOISSONS EXISTANTES
\echo ''
\echo '=== 8. EXEMPLES OPTIONS BOISSONS EXISTANTES ==='
SELECT 
    c.name as categorie,
    p.name as produit,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE fpo.option_group ILIKE '%boisson%' OR fpo.option_group ILIKE '%33cl%'
ORDER BY c.name, p.name, fpo.display_order
LIMIT 15;

-- 9. RÉCAPITULATIF POUR LA FONCTION
\echo ''
\echo '=== 9. RÉCAPITULATIF POUR LA FONCTION ==='
SELECT 'INFORMATIONS CLÉS:' as info;

-- Compter les sandwichs
SELECT 
    'SANDWICHS: ' || COUNT(*) || ' produits trouvés' as info
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs' AND p.is_active = true

UNION ALL

-- Compter les boissons disponibles
SELECT 
    'BOISSONS: ' || COUNT(*) || ' produits dans les catégories boissons' as info
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE (c.name ILIKE '%boisson%' OR c.name ILIKE '%drink%' OR c.slug ILIKE '%drink%')
AND p.is_active = true

UNION ALL

-- Compter les boissons 33CL
SELECT 
    'BOISSONS 33CL: ' || COUNT(*) || ' variantes 33CL trouvées' as info
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_variants pv ON pv.product_id = p.id
WHERE (c.name ILIKE '%boisson%' OR c.name ILIKE '%drink%' OR c.slug ILIKE '%drink%')
AND p.is_active = true
AND (pv.variant_name ILIKE '%33%' OR (pv.quantity = 33 AND pv.unit = 'cl'))

UNION ALL

-- Options actuelles des sandwichs
SELECT 
    'OPTIONS SANDWICHS: ' || COUNT(*) || ' options actuelles' as info
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'sandwichs';