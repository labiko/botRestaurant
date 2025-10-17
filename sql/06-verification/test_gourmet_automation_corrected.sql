-- Test de la fonction d'automatisation avec GOURMET (CORRIGÉ)
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

-- Vérifier que les options de boisson existent (STRUCTURE CORRIGÉE)
SELECT 'OPTIONS BOISSON:' as phase;
SELECT 
    po.option_group,
    COUNT(po.id) as nb_options,
    STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) as options_list
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%'
AND po.option_group = 'Boisson 33CL incluse'
GROUP BY po.option_group;

-- Vérification détaillée des configurations
SELECT 'DÉTAIL CONFIG:' as phase;
SELECT 
    p.name,
    po.option_group,
    po.option_name,
    po.price_modifier,
    po.is_required
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_options po ON po.product_id = p.id
WHERE c.name ILIKE '%GOURMET%'
AND po.option_group = 'Boisson 33CL incluse'
ORDER BY p.name, po.display_order;

COMMIT;
