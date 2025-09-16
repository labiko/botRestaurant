-- DIAGNOSTIC COMPLET - TENDERS 1 PIECE (Pourquoi propose encore boisson ?)
-- Structure analysée: botResto\database_fr_structure.sql

-- 1. VÉRIFIER LE PRODUIT "TENDERS 1 PIECE"
SELECT 
    'PRODUIT TENDERS 1 PIECE' as section,
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'POULET & SNACKS'
AND p.name = 'TENDERS 1 PIECE';

-- 2. VÉRIFIER LES OPTIONS RESTANTES (après suppression)
SELECT 
    'OPTIONS RESTANTES TENDERS 1 PIECE' as section,
    po.id,
    po.option_group,
    po.option_name,
    po.is_required,
    po.max_selections
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'POULET & SNACKS'
AND p.name = 'TENDERS 1 PIECE';

-- 3. VÉRIFIER LES COMPOSITE ITEMS
SELECT 
    'COMPOSITE ITEMS TENDERS 1 PIECE' as section,
    ci.id,
    ci.component_name,
    ci.quantity,
    ci.unit
FROM france_composite_items ci
JOIN france_products p ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'POULET & SNACKS'
AND p.name = 'TENDERS 1 PIECE';

-- 4. COMPARAISON AVEC UN PRODUIT SIMPLE QUI FONCTIONNE (BURGERS)
SELECT 
    'COMPARAISON AVEC BURGER SIMPLE' as section,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    COUNT(po.id) as nb_options,
    COUNT(ci.id) as nb_composite_items
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options po ON po.product_id = p.id
LEFT JOIN france_composite_items ci ON ci.composite_product_id = p.id
WHERE c.slug = 'burgers'
AND p.product_type = 'simple'
GROUP BY p.name, p.product_type, p.workflow_type, p.requires_steps
LIMIT 1;

-- 5. CONFIGURATION WORKFLOW DE LA CATÉGORIE
SELECT 
    'WORKFLOW CATÉGORIE POULET & SNACKS' as section,
    c.name,
    c.slug,
    p.workflow_type,
    p.requires_steps,
    COUNT(*) as nb_produits_par_workflow
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
WHERE c.name = 'POULET & SNACKS'
GROUP BY c.name, c.slug, p.workflow_type, p.requires_steps;

-- 6. SOLUTION POTENTIELLE - VÉRIFIER STEPS_CONFIG
SELECT 
    'STEPS CONFIG PROBLÉMATIQUE' as section,
    p.name,
    p.product_type,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'POULET & SNACKS'
AND p.product_type = 'simple'
AND (p.steps_config IS NOT NULL OR p.workflow_type IS NOT NULL);

/*
HYPOTHÈSES DU PROBLÈME :

1. Le produit a workflow_type = 'composite_workflow' au lieu de NULL
2. Le produit a requires_steps = true au lieu de false  
3. Le produit a steps_config rempli au lieu de NULL
4. La fonction copy_from a modifié ces champs sur TOUS les produits

SOLUTION PROBABLE :
UPDATE france_products 
SET workflow_type = NULL, requires_steps = false, steps_config = NULL
WHERE category_id = (SELECT id FROM france_menu_categories WHERE name = 'POULET & SNACKS')
AND product_type = 'simple';
*/