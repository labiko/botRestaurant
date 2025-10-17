-- ===============================================
-- ANALYSE CATÉGORIE SANDWICHS - PIZZA YOLO (Restaurant ID=1)
-- Recherche de produits composite avec steps_config
-- ===============================================

-- 1. INFORMATIONS RESTAURANT PIZZA YOLO
SELECT
    'RESTAURANT INFO' as section,
    id,
    name as restaurant_name,
    is_active
FROM france_restaurants
WHERE id = 1;

-- 2. CATÉGORIE SANDWICHS
SELECT
    'CATÉGORIE SANDWICHS' as section,
    id as category_id,
    name as category_name,
    slug,
    display_order,
    is_active
FROM france_menu_categories
WHERE restaurant_id = 1
  AND (name ILIKE '%SANDWICH%' OR slug ILIKE '%sandwich%');

-- 3. PRODUITS DE LA CATÉGORIE SANDWICHS
WITH sandwichs_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%SANDWICH%' OR slug ILIKE '%sandwich%')
    LIMIT 1
)
SELECT
    'PRODUITS SANDWICHS' as section,
    fp.id as product_id,
    fp.name as product_name,
    fp.product_type,
    fp.workflow_type,
    fp.requires_steps,
    CASE
        WHEN fp.steps_config IS NOT NULL THEN 'HAS_STEPS_CONFIG'
        ELSE 'NO_STEPS_CONFIG'
    END as has_steps,
    fp.display_order,
    fp.is_active,
    fp.price_on_site_base,
    fp.price_delivery_base
FROM france_products fp
JOIN sandwichs_category sc ON fp.category_id = sc.category_id
WHERE fp.restaurant_id = 1
ORDER BY fp.display_order;

-- 4. ANALYSE DÉTAILLÉE DES STEPS_CONFIG (seulement pour ceux qui en ont)
WITH sandwichs_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%SANDWICH%' OR slug ILIKE '%sandwich%')
    LIMIT 1
)
SELECT
    'ANALYSE STEPS_CONFIG' as section,
    fp.id as product_id,
    fp.name as product_name,
    fp.steps_config::text as steps_config_raw,
    CASE
        WHEN fp.steps_config->'steps' IS NOT NULL
        THEN json_array_length(fp.steps_config->'steps')
        ELSE 0
    END as nb_steps,
    (
        SELECT string_agg(
            'Step ' || (step->>'step') || ': ' ||
            CASE WHEN (step->>'required')::boolean THEN 'OBLIGATOIRE' ELSE 'FACULTATIF' END ||
            ' (' || (step->>'prompt') || ') - Groups: [' ||
            (SELECT string_agg(grp::text, ', ') FROM json_array_elements(step->'option_groups') grp) || ']',
            ' | '
        )
        FROM json_array_elements(fp.steps_config->'steps') as step
    ) as steps_summary
FROM france_products fp
JOIN sandwichs_category sc ON fp.category_id = sc.category_id
WHERE fp.restaurant_id = 1
  AND fp.requires_steps = true
  AND fp.steps_config IS NOT NULL
ORDER BY fp.display_order;

-- 5. OPTIONS PAR PRODUIT SANDWICHS (focus sur ceux avec steps)
WITH sandwichs_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%SANDWICH%' OR slug ILIKE '%sandwich%')
    LIMIT 1
),
sandwichs_with_steps AS (
    SELECT fp.id as product_id, fp.name as product_name
    FROM france_products fp
    JOIN sandwichs_category sc ON fp.category_id = sc.category_id
    WHERE fp.restaurant_id = 1
      AND fp.is_active = true
      AND fp.requires_steps = true
)
SELECT
    'OPTIONS DÉTAILLÉES' as section,
    sws.product_name,
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
JOIN sandwichs_with_steps sws ON fpo.product_id = sws.product_id
ORDER BY sws.product_name, fpo.group_order, fpo.display_order;

-- 6. COMPARAISON STEPS_CONFIG vs IS_REQUIRED (LE TEST CRUCIAL)
WITH sandwichs_category AS (
    SELECT id as category_id
    FROM france_menu_categories
    WHERE restaurant_id = 1
      AND (name ILIKE '%SANDWICH%' OR slug ILIKE '%sandwich%')
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
    JOIN sandwichs_category sc ON fp.category_id = sc.category_id
    CROSS JOIN LATERAL json_array_elements(fp.steps_config->'steps') as step_data(step_info)
    WHERE fp.restaurant_id = 1
      AND fp.requires_steps = true
      AND fp.steps_config IS NOT NULL
)
SELECT
    'INCOHÉRENCES DÉTECTÉES' as section,
    sa.product_name,
    sa.step_number,
    sa.option_group_name::text as option_group,
    sa.step_required as step_dit_obligatoire,
    COALESCE(bool_and(fpo.is_required), false) as toutes_options_obligatoires,
    COALESCE(bool_or(fpo.is_required), false) as au_moins_une_option_obligatoire,
    CASE
        WHEN sa.step_required = true AND COALESCE(bool_and(fpo.is_required), false) = false
        THEN '🔥 BUG DÉTECTÉ: Step obligatoire mais options facultatives!'
        WHEN sa.step_required = false AND COALESCE(bool_or(fpo.is_required), false) = true
        THEN '⚠️ INCOHÉRENCE: Step facultatif mais options obligatoires'
        WHEN sa.step_required = COALESCE(bool_and(fpo.is_required), false)
        THEN '✅ COHÉRENT'
        ELSE '❓ MIXTE'
    END as diagnostic,
    COUNT(fpo.id) as nb_options_dans_groupe
FROM steps_analysis sa
LEFT JOIN france_product_options fpo ON sa.product_id = fpo.product_id
    AND fpo.option_group = sa.option_group_name::text
GROUP BY sa.product_name, sa.step_number, sa.option_group_name, sa.step_required
ORDER BY sa.product_name, sa.step_number::integer;

-- 7. STATISTIQUES RÉSUMÉ
SELECT
    'RÉSUMÉ STATISTIQUES' as section,
    COUNT(DISTINCT fp.id) as nb_produits_sandwichs,
    COUNT(DISTINCT CASE WHEN fp.requires_steps THEN fp.id END) as nb_produits_avec_steps,
    COUNT(DISTINCT CASE WHEN fp.product_type = 'composite' THEN fp.id END) as nb_produits_composite,
    COUNT(DISTINCT fpo.option_group) as nb_groupes_options,
    COUNT(fpo.id) as nb_options_total,
    COUNT(CASE WHEN fpo.is_required = true THEN 1 END) as nb_options_obligatoires,
    COUNT(CASE WHEN fpo.is_required = false THEN 1 END) as nb_options_facultatives
FROM france_products fp
JOIN france_menu_categories fmc ON fp.category_id = fmc.id
LEFT JOIN france_product_options fpo ON fp.id = fpo.product_id
WHERE fp.restaurant_id = 1
  AND fmc.restaurant_id = 1
  AND (fmc.name ILIKE '%SANDWICH%' OR fmc.slug ILIKE '%sandwich%')
  AND fp.is_active = true;