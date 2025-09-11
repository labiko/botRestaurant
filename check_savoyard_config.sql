-- Vérification configuration LE SAVOYARD
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config,
    -- Vérifier s'il y a des tailles configurées
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%'
AND p.name = 'LE SAVOYARD';
