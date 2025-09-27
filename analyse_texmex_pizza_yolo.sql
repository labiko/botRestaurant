-- ===============================================
-- ANALYSE CATÉGORIE TEX-MEX - PIZZA YOLO (Restaurant ID=1)
-- Vérification complète avant duplication
-- ===============================================

-- 1. INFORMATIONS RESTAURANT PIZZA YOLO
SELECT
    'RESTAURANT INFO' as section,
    id,
    name as restaurant_name,
    is_active
FROM france_restaurants
WHERE id = 1;

-- 2. CATÉGORIE TEX-MEX
SELECT
    'CATÉGORIE TEX-MEX' as section,
    id as category_id,
    name as category_name,
    slug,
    display_order,
    is_active
FROM france_menu_categories
WHERE restaurant_id = 1
  AND (name ILIKE '%TEX%MEX%' OR slug ILIKE '%tex%mex%');

-- 3. PRODUITS DE LA CATÉGORIE TEX-MEX
WITH texmex_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%TEX%MEX%' OR slug ILIKE '%tex%mex%')
    LIMIT 1
)
SELECT
    'PRODUITS TEX-MEX' as section,
    fp.id as product_id,
    fp.name as product_name,
    fp.product_type,
    fp.workflow_type,
    fp.requires_steps,
    fp.steps_config,
    fp.display_order,
    fp.is_active,
    fp.base_price,
    fp.price_on_site_base,
    fp.price_delivery_base
FROM france_products fp
JOIN texmex_category tc ON fp.category_id = tc.category_id
WHERE fp.restaurant_id = 1
ORDER BY fp.display_order;

-- 4. ANALYSE DÉTAILLÉE DES STEPS_CONFIG
WITH texmex_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%TEX%MEX%' OR slug ILIKE '%tex%mex%')
    LIMIT 1
)
SELECT
    'ANALYSE STEPS_CONFIG' as section,
    fp.id as product_id,
    fp.name as product_name,
    fp.steps_config->>'steps' as steps_raw,
    json_array_length(fp.steps_config->'steps') as nb_steps,
    (
        SELECT string_agg(
            'Step ' || (step->>'step') || ': ' ||
            CASE WHEN (step->>'required')::boolean THEN 'OBLIGATOIRE' ELSE 'FACULTATIF' END ||
            ' (' || (step->>'prompt') || ')',
            ' | '
        )
        FROM json_array_elements(fp.steps_config->'steps') as step
    ) as steps_summary
FROM france_products fp
JOIN texmex_category tc ON fp.category_id = tc.category_id
WHERE fp.restaurant_id = 1
  AND fp.requires_steps = true
ORDER BY fp.display_order;

-- 5. OPTIONS PAR PRODUIT TEX-MEX
WITH texmex_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%TEX%MEX%' OR slug ILIKE '%tex%mex%')
    LIMIT 1
),
texmex_products AS (
    SELECT fp.id as product_id, fp.name as product_name
    FROM france_products fp
    JOIN texmex_category tc ON fp.category_id = tc.category_id
    WHERE fp.restaurant_id = 1 AND fp.is_active = true
)
SELECT
    'OPTIONS DÉTAILLÉES' as section,
    tp.product_name,
    fpo.product_id,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required,
    fpo.max_selections,
    fpo.display_order,
    fpo.group_order,
    fpo.is_active
FROM france_product_options fpo
JOIN texmex_products tp ON fpo.product_id = tp.product_id
ORDER BY tp.product_name, fpo.group_order, fpo.display_order;

-- 6. COMPARAISON STEPS_CONFIG vs IS_REQUIRED
WITH texmex_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%TEX%MEX%' OR slug ILIKE '%tex%mex%')
    LIMIT 1
),
steps_analysis AS (
    SELECT
        fp.id as product_id,
        fp.name as product_name,
        step_data.step_info->>'step' as step_number,
        step_data.step_info->'option_groups'->0 as option_group_name,
        (step_data.step_info->>'required')::boolean as step_required
    FROM france_products fp
    JOIN texmex_category tc ON fp.category_id = tc.category_id
    CROSS JOIN LATERAL json_array_elements(fp.steps_config->'steps') as step_data(step_info)
    WHERE fp.restaurant_id = 1
      AND fp.requires_steps = true
)
SELECT
    'INCOHÉRENCES STEPS vs OPTIONS' as section,
    sa.product_name,
    sa.option_group_name::text as option_group,
    sa.step_required as step_dit_obligatoire,
    COALESCE(fpo.is_required, false) as options_dit_obligatoire,
    CASE
        WHEN sa.step_required != COALESCE(fpo.is_required, false)
        THEN '❌ INCOHÉRENCE DÉTECTÉE'
        ELSE '✅ COHÉRENT'
    END as status,
    COUNT(fpo.id) as nb_options_dans_groupe
FROM steps_analysis sa
LEFT JOIN france_product_options fpo ON sa.product_id = fpo.product_id
    AND fpo.option_group = sa.option_group_name::text
GROUP BY sa.product_name, sa.option_group_name, sa.step_required, fpo.is_required
ORDER BY sa.product_name, sa.option_group_name;

-- 7. STATISTIQUES RÉSUMÉ
SELECT
    'RÉSUMÉ STATISTIQUES' as section,
    COUNT(DISTINCT fp.id) as nb_produits_texmex,
    COUNT(DISTINCT CASE WHEN fp.requires_steps THEN fp.id END) as nb_produits_avec_steps,
    COUNT(DISTINCT fpo.option_group) as nb_groupes_options,
    COUNT(fpo.id) as nb_options_total,
    COUNT(CASE WHEN fpo.is_required = true THEN 1 END) as nb_options_obligatoires,
    COUNT(CASE WHEN fpo.is_required = false THEN 1 END) as nb_options_facultatives
FROM france_products fp
JOIN france_menu_categories fmc ON fp.category_id = fmc.id
LEFT JOIN france_product_options fpo ON fp.id = fpo.product_id
WHERE fp.restaurant_id = 1
  AND fmc.restaurant_id = 1
  AND (fmc.name ILIKE '%TEX%MEX%' OR fmc.slug ILIKE '%tex%mex%')
  AND fp.is_active = true;