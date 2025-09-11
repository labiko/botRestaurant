-- Vérification des produits GOURMET actuels
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%';
