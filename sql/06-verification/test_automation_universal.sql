-- SCRIPT DE TEST GÉNÉRIQUE UNIVERSEL
-- ⚠️ MODIFIEZ CES PARAMÈTRES SELON VOS BESOINS:
DO $$
DECLARE
    v_restaurant_id INTEGER := 1;              -- Pizza Yolo 77
    v_category_name TEXT := 'SMASHS';          -- Catégorie à tester
BEGIN
    -- Stocker dans une table temporaire pour utilisation ultérieure
    CREATE TEMP TABLE IF NOT EXISTS test_params (
        restaurant_id INTEGER,
        category_name TEXT
    );
    DELETE FROM test_params;
    INSERT INTO test_params VALUES (v_restaurant_id, v_category_name);
    
    RAISE NOTICE 'PARAMÈTRES DE TEST:';
    RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
    RAISE NOTICE 'Catégorie: %', v_category_name;
END $$;

BEGIN;

-- Vérifier que la catégorie existe pour ce restaurant
SELECT 'VÉRIFICATION CATÉGORIE:' as info;
SELECT 
    c.id,
    c.name,
    c.restaurant_id,
    COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
CROSS JOIN test_params tp
WHERE c.restaurant_id = tp.restaurant_id
AND c.name ILIKE '%' || tp.category_name || '%'
GROUP BY c.id, c.name, c.restaurant_id;

-- État AVANT
SELECT 'AVANT - Restaurant ' || tp.restaurant_id || ' - Catégorie: ' || tp.category_name as phase
FROM test_params tp;

SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_steps_config,
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles,
    (SELECT COUNT(*) FROM france_product_options po WHERE po.product_id = p.id AND po.option_group = 'Boisson 33CL incluse') as nb_boissons_avant
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
CROSS JOIN test_params tp
WHERE c.restaurant_id = tp.restaurant_id
AND c.name ILIKE '%' || tp.category_name || '%'
ORDER BY p.name;

-- Exécution de l'automatisation
SELECT configure_category_workflow(tp.category_name, 'composite', true) as result
FROM test_params tp;

-- État APRÈS
SELECT 'APRÈS - Restaurant ' || tp.restaurant_id || ' - Catégorie: ' || tp.category_name as phase
FROM test_params tp;

SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_config,
    (SELECT COUNT(*) FROM france_product_sizes ps WHERE ps.product_id = p.id) as nb_tailles_restantes,
    (SELECT COUNT(*) FROM france_product_options po WHERE po.product_id = p.id AND po.option_group = 'Boisson 33CL incluse') as nb_boissons_après
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
CROSS JOIN test_params tp
WHERE c.restaurant_id = tp.restaurant_id
AND c.name ILIKE '%' || tp.category_name || '%'
ORDER BY p.name;

-- Détail des boissons créées
SELECT 'BOISSONS AUTOMATIQUES - Restaurant ' || tp.restaurant_id || ' - Catégorie: ' || tp.category_name as phase
FROM test_params tp;

SELECT 
    po.option_group,
    COUNT(po.id) as nb_options,
    STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) as liste_boissons
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
CROSS JOIN test_params tp
WHERE c.restaurant_id = tp.restaurant_id
AND c.name ILIKE '%' || tp.category_name || '%'
AND po.option_group = 'Boisson 33CL incluse'
GROUP BY po.option_group;

COMMIT;
