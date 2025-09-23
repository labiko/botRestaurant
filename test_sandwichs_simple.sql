-- TEST SIMPLE SANDWICHS - RECHERCHE PRODUITS COMPOSITE
-- ====================================================

-- 1. Catégorie SANDWICHS
SELECT id, name FROM france_menu_categories
WHERE restaurant_id = 1 AND name ILIKE '%SANDWICH%';

-- 2. Produits avec steps
SELECT
    id,
    name,
    product_type,
    requires_steps,
    CASE WHEN steps_config IS NOT NULL THEN 'OUI' ELSE 'NON' END as has_config
FROM france_products
WHERE restaurant_id = 1
  AND category_id = (SELECT id FROM france_menu_categories WHERE restaurant_id = 1 AND name ILIKE '%SANDWICH%')
ORDER BY id;

-- 3. TEST CRUCIAL: Steps vs Options (si produits trouvés)
WITH steps_vs_options AS (
    SELECT
        fp.name as produit,
        step_info->>'required' as step_required,
        step_info->'option_groups'->>0 as groupe,
        fpo.is_required as option_required
    FROM france_products fp
    CROSS JOIN json_array_elements(fp.steps_config->'steps') step_info
    JOIN france_product_options fpo ON fp.id = fpo.product_id
        AND fpo.option_group = step_info->'option_groups'->>0
    WHERE fp.restaurant_id = 1
      AND fp.requires_steps = true
      AND fp.category_id = (SELECT id FROM france_menu_categories WHERE restaurant_id = 1 AND name ILIKE '%SANDWICH%')
)
SELECT
    produit,
    groupe,
    step_required,
    bool_and(option_required) as toutes_options_required,
    CASE
        WHEN step_required::boolean != bool_and(option_required) THEN '🔥 PROBLÈME'
        ELSE '✅ OK'
    END as status
FROM steps_vs_options
GROUP BY produit, groupe, step_required;