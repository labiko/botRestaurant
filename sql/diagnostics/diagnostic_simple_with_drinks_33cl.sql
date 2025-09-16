-- 🔍 DIAGNOSTIC - Identifier les catégories "simple_with_drinks_33cl"
-- Objectif: Trouver quelles catégories devraient être simple + boissons 33CL

-- 1. TOUTES LES CATÉGORIES ACTUELLES
\echo '=== 1. TOUTES LES CATÉGORIES ==='
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY c.display_order;

-- 2. ÉTAT ACTUEL DES PRODUITS PAR CATÉGORIE
\echo ''
\echo '=== 2. ÉTAT ACTUEL DES PRODUITS PAR CATÉGORIE ==='
SELECT 
    c.name as categorie,
    COUNT(*) as total_produits,
    COUNT(CASE WHEN p.product_type = 'simple' THEN 1 END) as nb_simple,
    COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) as nb_composite,
    COUNT(CASE WHEN p.requires_steps = true THEN 1 END) as nb_avec_steps,
    COUNT(CASE WHEN p.steps_config IS NOT NULL THEN 1 END) as nb_avec_config
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id 
WHERE c.is_active = true AND p.is_active = true
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- 3. CATÉGORIES AVEC COMPOSITE_ITEMS (WORKFLOW COMPLEXE)
\echo ''
\echo '=== 3. CATÉGORIES AVEC COMPOSITE_ITEMS (COMPLEXES) ==='
SELECT 
    c.name as categorie,
    COUNT(DISTINCT p.id) as nb_produits_avec_items,
    COUNT(fci.id) as total_composite_items,
    STRING_AGG(DISTINCT fci.component_name, ', ') as composants_exemples
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
JOIN france_composite_items fci ON fci.composite_product_id = p.id
WHERE c.is_active = true AND p.is_active = true
GROUP BY c.name
ORDER BY total_composite_items DESC;

-- 4. CATÉGORIES AVEC PRODUCT_OPTIONS BOISSONS (DÉJÀ CONFIGURÉES)
\echo ''
\echo '=== 4. CATÉGORIES AVEC OPTIONS BOISSONS 33CL ==='
SELECT 
    c.name as categorie,
    COUNT(DISTINCT p.id) as nb_produits_avec_boissons,
    COUNT(fpo.id) as total_options_boissons,
    STRING_AGG(DISTINCT fpo.option_group, ', ') as groupes_options
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.is_active = true AND p.is_active = true
AND (fpo.option_group ILIKE '%boisson%' OR fpo.option_group ILIKE '%33cl%')
GROUP BY c.name
ORDER BY total_options_boissons DESC;

-- 5. ANALYSE : CATÉGORIES CANDIDATES POUR "simple_with_drinks_33cl"
\echo ''
\echo '=== 5. ANALYSE - CANDIDATS SIMPLE_WITH_DRINKS_33CL ==='
-- Catégories qui sont actuellement "composite" MAIS sans composite_items (= cassées)
-- OU qui sont "simple" et pourraient bénéficier des boissons 33CL
SELECT 
    c.name as categorie,
    c.slug,
    COUNT(p.id) as nb_produits,
    COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) as nb_composite,
    COUNT(CASE WHEN p.product_type = 'simple' THEN 1 END) as nb_simple,
    COALESCE(composite_stats.nb_items, 0) as nb_composite_items,
    COALESCE(options_stats.nb_options, 0) as nb_options_boissons,
    CASE 
        WHEN COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) > 0 
             AND COALESCE(composite_stats.nb_items, 0) = 0 THEN
            '🚨 CASSÉ: Composite sans items'
        WHEN COUNT(CASE WHEN p.product_type = 'simple' THEN 1 END) > 0 
             AND COALESCE(options_stats.nb_options, 0) = 0 
             AND c.slug NOT IN ('drinks', 'desserts', 'ice-cream') THEN
            '✅ CANDIDAT: Simple sans boissons'
        WHEN COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) > 0 
             AND COALESCE(composite_stats.nb_items, 0) > 0 THEN
            '⚠️ COMPLEXE: A des composite_items'
        ELSE '❓ À ANALYSER'
    END as statut_recommandation
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
LEFT JOIN (
    SELECT 
        p.category_id,
        COUNT(fci.id) as nb_items
    FROM france_products p
    JOIN france_composite_items fci ON fci.composite_product_id = p.id
    GROUP BY p.category_id
) composite_stats ON composite_stats.category_id = c.id
LEFT JOIN (
    SELECT 
        p.category_id,
        COUNT(fpo.id) as nb_options
    FROM france_products p
    JOIN france_product_options fpo ON fpo.product_id = p.id
    WHERE fpo.option_group ILIKE '%boisson%' OR fpo.option_group ILIKE '%33cl%'
    GROUP BY p.category_id
) options_stats ON options_stats.category_id = c.id
WHERE c.is_active = true AND p.is_active = true
GROUP BY c.name, c.slug, c.id, composite_stats.nb_items, options_stats.nb_options
ORDER BY 
    CASE 
        WHEN COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) > 0 
             AND COALESCE(composite_stats.nb_items, 0) = 0 THEN 1 -- Cassés en premier
        WHEN COUNT(CASE WHEN p.product_type = 'simple' THEN 1 END) > 0 
             AND COALESCE(options_stats.nb_options, 0) = 0 THEN 2 -- Candidats ensuite
        ELSE 3
    END;

-- 6. RECOMMANDATIONS FINALES
\echo ''
\echo '=== 6. RECOMMANDATIONS ==='
\echo '🚨 CASSÉ: Appliquer fix_category_configuration() puis simple_with_drinks_33cl'
\echo '✅ CANDIDAT: Appliquer directement simple_with_drinks_33cl'  
\echo '⚠️ COMPLEXE: Garder le système actuel (ne pas toucher)'
\echo '❓ À ANALYSER: Examiner manuellement'