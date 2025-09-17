-- 🔍 DIAGNOSTIC BOWL WORKFLOW PROBLÈME
-- Analyser pourquoi tout s'affiche en une seule fois

BEGIN;

-- 1. Vérifier la configuration actuelle de BOWL
SELECT 
    'CONFIGURATION BOWL ACTUELLE' as diagnostic,
    p.name,
    p.steps_config,
    p.workflow_type,
    p.requires_steps,
    p.product_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'bowls' AND p.name = 'BOWL';

-- 2. Vérifier les option_groups configurés
SELECT 
    'OPTION GROUPS BOWL' as diagnostic,
    fpo.option_group,
    fpo.is_required,
    fpo.max_selections,
    COUNT(*) as nb_options
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
GROUP BY fpo.option_group, fpo.is_required, fpo.max_selections
ORDER BY fpo.option_group;

-- 3. Comparer avec TACOS qui fonctionne
SELECT 
    'CONFIGURATION TACOS RÉFÉRENCE' as diagnostic,
    p.name,
    p.steps_config,
    p.workflow_type,
    p.requires_steps,
    p.product_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'tacos' AND p.name = 'TACOS'
LIMIT 1;

-- 4. Vérifier les option_groups de TACOS
SELECT 
    'OPTION GROUPS TACOS' as diagnostic,
    fpo.option_group,
    fpo.is_required,
    fpo.max_selections,
    COUNT(*) as nb_options
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'tacos' AND p.name = 'TACOS'
GROUP BY fpo.option_group, fpo.is_required, fpo.max_selections
ORDER BY fpo.option_group;

-- 5. Détail des options par groupe pour BOWL
SELECT 
    'DÉTAIL OPTIONS BOWL' as diagnostic,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.display_order,
    fpo.group_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
ORDER BY fpo.option_group, fpo.display_order
LIMIT 20;

ROLLBACK;