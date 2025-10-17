-- Vérification complète après automatisation GOURMET
SELECT 'PRODUITS GOURMET CONFIGURÉS:' as info;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE 
        WHEN p.steps_config IS NOT NULL THEN 'OUI'
        ELSE 'NON'
    END as has_config,
    p.steps_config::text
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%'
ORDER BY p.name;

SELECT 'VÉRIFICATION WORKFLOW CONFIG:' as info;
SELECT 
    p.name,
    p.steps_config->'steps'->0->'option_groups' as option_groups_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%'
AND p.steps_config IS NOT NULL;
