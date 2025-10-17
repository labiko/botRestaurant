-- Vérification des données CHICKEN BOX
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE 
        WHEN p.steps_config IS NOT NULL THEN 'OUI'
        ELSE 'NON'
    END as has_steps_config,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'chicken-box';