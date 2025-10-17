-- =========================================
-- ANALYSE FINALE - VRAIES DONNÉES WORKFLOW
-- =========================================

-- =========================================
-- 1. CORRIGER LE PRIX MANQUANT D'ABORD
-- =========================================

UPDATE france_products
SET price_on_site_base = 18.00
WHERE id = 579 AND price_on_site_base IS NULL;

-- =========================================
-- 2. ANALYSER LA VRAIE TABLE D'OPTIONS
-- =========================================

-- Structure de france_product_options
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'france_product_options'
ORDER BY ordinal_position;

-- =========================================
-- 3. OPTIONS RÉELLES DU PRODUIT 579
-- =========================================

SELECT *
FROM france_product_options
WHERE product_id = 579
ORDER BY id
LIMIT 20;

-- =========================================
-- 4. COMPTER LES OPTIONS PAR PRODUIT
-- =========================================

SELECT
  product_id,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = 579
GROUP BY product_id;

-- =========================================
-- 5. DONNÉES COMPLÈTES POUR L'API
-- =========================================

SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.steps_config,
  c.name as category_name,
  r.name as restaurant_name,
  r.id as restaurant_id
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.id = 579;

-- =========================================
-- 6. GROUPES D'OPTIONS DEPUIS LE JSON
-- =========================================

SELECT
  (step_data->>'step')::int as step_number,
  step_data->>'prompt' as question,
  step_data->>'required' as obligatoire,
  step_data->>'max_selections' as max_choix,
  trim(both '"' from group_name::text) as groupe_options
FROM france_products,
     jsonb_array_elements(steps_config->'steps') as step_data,
     jsonb_array_elements(step_data->'option_groups') as group_name
WHERE id = 579
ORDER BY step_number;

-- =========================================
-- 7. STRUCTURE JSON FINALE POUR L'API
-- =========================================

SELECT
  json_build_object(
    'success', true,
    'product', json_build_object(
      'id', p.id,
      'name', p.name,
      'price_on_site_base', p.price_on_site_base,
      'price_delivery_base', p.price_delivery_base,
      'category', json_build_object('name', c.name),
      'restaurant_id', r.id
    ),
    'workflow_config', json_build_object(
      'steps_config', p.steps_config,
      'total_steps', jsonb_array_length(p.steps_config->'steps')
    ),
    'real_options', COALESCE(
      (SELECT json_agg(row_to_json(opt)) FROM france_product_options opt WHERE opt.product_id = p.id),
      '[]'::json
    )
  ) as "API Response Structure"
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.id = 579;