-- FIX: Supprimer les tailles des produits GOURMET pour forcer le workflow composite
BEGIN;

-- Vérifier ce qu'on va supprimer
SELECT 'TAILLES À SUPPRIMER:' as info;
SELECT 
    p.name,
    ps.size_name,
    ps.price_on_site
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id  
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%';

-- Supprimer les tailles pour forcer le workflow composite
DELETE FROM france_product_sizes 
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON p.category_id = c.id
    WHERE c.name ILIKE '%GOURMET%'
);

-- Vérification après suppression
SELECT 'VÉRIFICATION APRÈS SUPPRESSION:' as info;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles,
    (SELECT COUNT(*) FROM france_product_options po WHERE po.product_id = p.id AND po.option_group = 'Boisson 33CL incluse') as nb_boissons
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name ILIKE '%GOURMET%'
ORDER BY p.name;

COMMIT;
