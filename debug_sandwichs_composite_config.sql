-- 🔍 DIAGNOSTIC COMPLET CONFIGURATION SANDWICHS APRÈS configure_category_workflow
-- Analysons pourquoi "Erreur configuration LE BOURSIN"

-- 1. ÉTAT ACTUEL DES PRODUITS SANDWICHS
\echo '=== 1. PRODUITS SANDWICHS ACTUELS ==='
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE 
        WHEN p.steps_config IS NOT NULL THEN 'OUI'
        ELSE 'NON'
    END as has_steps_config,
    LENGTH(p.steps_config::text) as config_length
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
ORDER BY p.name;

-- 2. CONTENU DES STEPS_CONFIG (LIMITÉ À 2 EXEMPLES)
\echo ''
\echo '=== 2. STEPS_CONFIG DETAILS ==='
SELECT 
    p.name,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
AND p.steps_config IS NOT NULL
LIMIT 2;

-- 3. FRANCE_COMPOSITE_ITEMS (PROBLÈME PROBABLE - MANQUANTS)
\echo ''
\echo '=== 3. FRANCE_COMPOSITE_ITEMS POUR SANDWICHS ==='
SELECT COUNT(*) as nb_composite_items_sandwichs
FROM france_composite_items fci
JOIN france_products p ON p.id = fci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 4. DÉTAIL DES COMPOSITE_ITEMS SI EXISTANTS
\echo ''
\echo '=== 4. DÉTAIL COMPOSITE_ITEMS (SI EXISTANTS) ==='
SELECT 
    p.name as product_name,
    fci.component_name,
    fci.quantity,
    fci.unit
FROM france_composite_items fci
JOIN france_products p ON p.id = fci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
ORDER BY p.name, fci.id;

-- 5. FRANCE_PRODUCT_OPTIONS CRÉÉES PAR L'AUTOMATION
\echo ''
\echo '=== 5. PRODUCT_OPTIONS CRÉÉES ==='
SELECT COUNT(*) as nb_product_options_sandwichs
FROM france_product_options fpo
JOIN france_products p ON p.id = fpo.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 6. DÉTAIL DES OPTIONS CRÉÉES (BOISSONS)
\echo ''
\echo '=== 6. DÉTAIL OPTIONS CRÉÉES (LIMITÉ À 5) ==='
SELECT 
    p.name as product_name,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required
FROM france_product_options fpo
JOIN france_products p ON p.id = fpo.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
ORDER BY p.name, fpo.display_order
LIMIT 5;

-- 7. COMPARAISON AVEC TACOS QUI FONCTIONNENT
\echo ''
\echo '=== 7. COMPARAISON TACOS vs SANDWICHS ==='
SELECT 
    'TACOS' as category,
    COUNT(*) as nb_produits,
    COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composite,
    COUNT(CASE WHEN steps_config IS NOT NULL THEN 1 END) as nb_avec_steps
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'tacos'

UNION ALL

SELECT 
    'SANDWICHS' as category,
    COUNT(*) as nb_produits,
    COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composite,
    COUNT(CASE WHEN steps_config IS NOT NULL THEN 1 END) as nb_avec_steps
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 8. COMPOSITE_ITEMS COMPARAISON (LE POINT CLÉ)
\echo ''
\echo '=== 8. COMPOSITE_ITEMS - COMPARAISON CRUCIALE ==='
SELECT 
    'TACOS' as category,
    COUNT(*) as nb_composite_items
FROM france_composite_items fci
JOIN france_products p ON p.id = fci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'tacos'

UNION ALL

SELECT 
    'SANDWICHS' as category,
    COUNT(*) as nb_composite_items
FROM france_composite_items fci
JOIN france_products p ON p.id = fci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 9. CONCLUSION DU DIAGNOSTIC
\echo ''
\echo '=== 9. CONCLUSION ==='
\echo 'Si SANDWICHS ont:'
\echo '- composite_items = 0 → PROBLÈME: Workflow composite incomplet'
\echo '- Tandis que TACOS ont composite_items > 0 → Eux fonctionnent'
\echo ''
\echo '✅ DIAGNOSTIC COMPLET TERMINÉ'