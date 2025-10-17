-- Test de la fonction d'automatisation avec GOURMET
BEGIN;

-- Vérifier l'état avant
SELECT 'AVANT:' as phase;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%';

-- Exécuter la fonction d'automatisation
SELECT configure_category_workflow('GOURMET', 'composite', true) as result;

-- Vérifier l'état après
SELECT 'APRÈS:' as phase;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%';

-- Vérifier que les options de boisson existent
SELECT 'OPTIONS BOISSON:' as phase;
SELECT 
    og.group_name,
    og.selection_type,
    COUNT(po.id) as nb_options
FROM france_product_option_groups og
LEFT JOIN france_product_options po ON og.id = po.group_id
WHERE og.group_name = 'Boisson 33CL incluse'
GROUP BY og.group_name, og.selection_type;

COMMIT;
