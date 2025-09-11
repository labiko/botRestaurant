-- FIX : Appliquer l'automatisation avec le BON nom de catégorie
BEGIN;

-- 1. Vérifier le nom exact de la catégorie
SELECT 'CATÉGORIES DISPONIBLES:' as info;
SELECT id, name, slug 
FROM france_menu_categories 
WHERE restaurant_id = 1
AND (name ILIKE '%BURGER%' OR slug ILIKE '%burger%');

-- 2. Appliquer l'automatisation avec le nom CORRECT
SELECT 'APPLICATION AUTOMATISATION:' as info;
SELECT configure_category_workflow('BURGERS', 'composite', true) as result;

-- 3. Vérifier le résultat
SELECT 'VÉRIFICATION APRÈS AUTOMATISATION:' as info;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles,
    (SELECT COUNT(*) FROM france_product_options po WHERE po.product_id = p.id AND po.option_group = 'Boisson 33CL incluse') as nb_boissons
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name = 'BURGERS'
ORDER BY p.name;

COMMIT;
