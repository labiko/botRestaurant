-- Test de l'automatisation avec catégorie NOS BURGER
BEGIN;

-- Vérifier l'état avant
SELECT 'AVANT - NOS BURGER:' as phase;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_steps_config,
    -- Vérifier s'il y a des tailles existantes
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%BURGER%'
ORDER BY p.name;

-- Exécuter la fonction d'automatisation avec récupération automatique des boissons
SELECT configure_category_workflow('NOS BURGER', 'composite', true) as result;

-- Vérifier l'état après
SELECT 'APRÈS - NOS BURGER:' as phase;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_config,
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles_restantes,
    (SELECT COUNT(*) FROM france_product_options po WHERE po.product_id = p.id AND po.option_group = 'Boisson 33CL incluse') as nb_boissons
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%BURGER%'
ORDER BY p.name;

-- Vérifier les boissons créées automatiquement
SELECT 'BOISSONS RÉCUPÉRÉES AUTOMATIQUEMENT - NOS BURGER:' as phase;
SELECT 
    p.name as produit,
    po.option_name,
    po.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_product_options po ON po.product_id = p.id
WHERE c.name ILIKE '%BURGER%'
AND po.option_group = 'Boisson 33CL incluse'
AND p.name LIKE '%BACON%'  -- Prendre un exemple de burger
ORDER BY po.display_order
LIMIT 15;

COMMIT;
