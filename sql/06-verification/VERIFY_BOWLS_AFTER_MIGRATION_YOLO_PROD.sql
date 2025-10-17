-- ========================================================================
-- VÉRIFICATION APRÈS MIGRATION BOWLS
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- PRODUIT: BOWL (ID: 238)
--
-- OBJECTIF: Vérifier que la migration vers universal_workflow_v2 est OK
-- ========================================================================

-- 1. Vérifier le produit BOWL
SELECT
    'PRODUIT BOWL' AS info,
    id,
    name,
    product_type,
    workflow_type,
    price_on_site_base,
    is_active
FROM france_products
WHERE id = 238;

-- 2. Compter les options par groupe
SELECT
    option_group AS groupe,
    COUNT(*) AS nb_options
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group
ORDER BY
    CASE option_group
        WHEN 'Plats' THEN 1
        WHEN 'Sauces' THEN 2
        WHEN 'Boisson 33CL incluse' THEN 3
        WHEN 'Suppléments' THEN 4
        ELSE 5
    END;

-- 3. Résumé attendu
SELECT
    'RÉSUMÉ ATTENDU' AS info,
    '36 options total' AS attendu,
    '6 Plats + 16 Sauces + 12 Boissons + 2 Suppléments' AS détail;

-- 4. Total réel
SELECT
    'TOTAL RÉEL' AS info,
    COUNT(*) AS nb_options_total
FROM france_product_options
WHERE product_id = 238;

-- 5. Vérifier les 6 viandes (groupe Plats)
SELECT
    'PLATS (6 viandes)' AS groupe,
    option_name,
    price_modifier,
    display_order
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Plats'
ORDER BY display_order;

-- 6. Vérifier les suppléments (doivent être Potatoes et Frites maison)
SELECT
    'SUPPLÉMENTS (2 options)' AS groupe,
    option_name,
    price_modifier,
    display_order
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Suppléments'
ORDER BY display_order;

-- 7. Afficher la config complète des steps
SELECT
    id,
    workflow_type,
    steps_config
FROM france_products
WHERE id = 238;
