-- 🔍 DIAGNOSTIC CONFIGURATION GOURMETS (RÉFÉRENCE QUI FONCTIONNE)
-- Objectif: Analyser exactement comment GOURMETS est configuré pour copier sur SANDWICHS

-- 1. CONFIGURATION GÉNÉRALE DES GOURMETS
\echo '=== 1. CONFIGURATION GÉNÉRALE GOURMETS ==='
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
WHERE c.slug = 'gourmets'
AND p.is_active = true
ORDER BY p.name;

-- 2. DÉTAIL DES PRODUCT_OPTIONS GOURMETS
\echo ''
\echo '=== 2. PRODUCT_OPTIONS GOURMETS (MODÈLE À COPIER) ==='
SELECT 
    p.name as produit,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required,
    fpo.max_selections,
    fpo.display_order,
    fpo.group_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'gourmets'
AND p.name = (SELECT MIN(p2.name) FROM france_products p2 
              JOIN france_menu_categories c2 ON c2.id = p2.category_id 
              WHERE c2.slug = 'gourmets' AND p2.is_active = true)
ORDER BY fpo.display_order;

-- 3. VÉRIFIER S'IL Y A DES STEPS_CONFIG
\echo ''
\echo '=== 3. STEPS_CONFIG GOURMETS ==='
SELECT 
    p.name,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'gourmets'
AND p.steps_config IS NOT NULL
LIMIT 1;

-- 4. VÉRIFIER S'IL Y A DES COMPOSITE_ITEMS
\echo ''
\echo '=== 4. COMPOSITE_ITEMS GOURMETS ==='
SELECT 
    p.name as produit,
    fci.component_name,
    fci.quantity,
    fci.unit
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_composite_items fci ON fci.composite_product_id = p.id
WHERE c.slug = 'gourmets'
ORDER BY p.name, fci.id;

-- 5. STATISTIQUES COMPARATIVES
\echo ''
\echo '=== 5. COMPARAISON GOURMETS vs SANDWICHS ==='
SELECT 
    'GOURMETS' as categorie,
    COUNT(DISTINCT p.id) as nb_produits,
    COUNT(fpo.id) as nb_options_total,
    COUNT(fpo.id) / COUNT(DISTINCT p.id) as options_par_produit,
    p.product_type as type_produit,
    p.workflow_type as workflow_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'gourmets'
GROUP BY p.product_type, p.workflow_type

UNION ALL

SELECT 
    'SANDWICHS' as categorie,
    COUNT(DISTINCT p.id) as nb_produits,
    COUNT(fpo.id) as nb_options_total,
    CASE WHEN COUNT(DISTINCT p.id) > 0 THEN COUNT(fpo.id) / COUNT(DISTINCT p.id) ELSE 0 END as options_par_produit,
    p.product_type as type_produit,
    p.workflow_type as workflow_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'sandwichs'
GROUP BY p.product_type, p.workflow_type;

-- 6. MODÈLE EXACT À REPRODUIRE
\echo ''
\echo '=== 6. MODÈLE EXACT POUR SANDWICHS ==='
SELECT 
    'OPTION_GROUP' as parametre,
    fpo.option_group as valeur
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'gourmets'
GROUP BY fpo.option_group
LIMIT 1;

SELECT 
    'PRICE_MODIFIER' as parametre,
    fpo.price_modifier::text as valeur
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'gourmets'
GROUP BY fpo.price_modifier
LIMIT 1;

SELECT 
    'IS_REQUIRED' as parametre,
    fpo.is_required::text as valeur
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'gourmets'
GROUP BY fpo.is_required
LIMIT 1;

SELECT 
    'MAX_SELECTIONS' as parametre,
    fpo.max_selections::text as valeur
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'gourmets'
GROUP BY fpo.max_selections
LIMIT 1;

-- 7. TEMPLATE SQL POUR COPIER LA CONFIG
\echo ''
\echo '=== 7. TEMPLATE POUR REPRODUCTION ==='
\echo 'Utiliser ces paramètres pour reproduire sur SANDWICHS:'
\echo '- option_group: "Boisson 33CL incluse"'
\echo '- price_modifier: 0'  
\echo '- is_required: true'
\echo '- max_selections: 1'
\echo '- Format option_name: "1️⃣ 🏝️ MIRANDA TROPICAL"'