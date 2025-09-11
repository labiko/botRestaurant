-- Test générique de la fonction d'automatisation 
-- USAGE: Remplacer 'CATEGORY_NAME' par la catégorie à tester
-- Exemples: GOURMET, DESSERTS, SALADES, etc.

\set category_name 'GOURMET'

BEGIN;

-- Vérifier l'état avant
SELECT 'AVANT - Catégorie: ' || :'category_name' as phase;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%' || :'category_name' || '%';

-- Exécuter la fonction d'automatisation
SELECT configure_category_workflow(:'category_name', 'composite', true) as result;

-- Vérifier l'état après
SELECT 'APRÈS - Catégorie: ' || :'category_name' as phase;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%' || :'category_name' || '%';

-- Vérifier les options créées
SELECT 'OPTIONS - Catégorie: ' || :'category_name' as phase;
SELECT 
    po.option_group,
    COUNT(po.id) as nb_options,
    STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) as options_list
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%' || :'category_name' || '%'
AND po.option_group = 'Boisson 33CL incluse'
GROUP BY po.option_group;

COMMIT;
