-- 🔍 DIAGNOSTIC COMPLET - Templates et configurations existants

-- 1. Vérifier les tables de templates qui existent vraiment
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%template%' 
ORDER BY table_name;

-- 2. Vérifier les workflow templates (vus dans les logs)
SELECT 
    wt.id,
    wt.restaurant_id,
    wt.template_name,
    wt.description,
    wt.steps_config
FROM france_workflow_templates wt
WHERE wt.restaurant_id = 1
ORDER BY wt.template_name;

-- 3. Voir quels produits utilisent des workflow templates
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
WHERE p.restaurant_id = 1
AND (p.workflow_type IS NOT NULL OR p.steps_config IS NOT NULL OR p.requires_steps = true)
ORDER BY p.name;

-- 4. Vérifier s'il y a des configurations de display
SELECT 
    p.name,
    p.product_type,
    COUNT(ps.id) as nb_tailles,
    CASE 
        WHEN COUNT(ps.id) > 0 THEN 'COMPOSITE_WORKFLOW'
        ELSE 'SIMPLE_LIST' 
    END as parcours_actuel
FROM france_products p
LEFT JOIN france_product_sizes ps ON ps.product_id = p.id AND ps.is_active = true
WHERE p.restaurant_id = 1
GROUP BY p.id, p.name, p.product_type
ORDER BY p.category_id, p.name;