-- =========================================
-- RENOMMAGE: Suppléments → Extras
-- Product ID: 554 (TACOS - Restaurant 16)
-- =========================================

BEGIN;

-- 1. Mise à jour du steps_config
UPDATE france_products
SET
  steps_config = '{"steps":[{"step":1,"type":"options_selection","prompt":"votre plat","option_groups":["Plats"],"required":true,"max_selections":1},{"step":2,"type":"options_selection","prompt":"votre viande","option_groups":["Viandes"],"required":true,"max_selections":3,"conditional_max":{"based_on_step":1,"extract_number_from_name":true}},{"step":3,"type":"options_selection","prompt":"EXTRAS","option_groups":["Extras"],"required":false,"max_selections":3},{"step":4,"type":"options_selection","prompt":"votre condiments","option_groups":["Condiments"],"required":false,"max_selections":3}]}'
WHERE id = 554;

-- 2. Renommer le groupe d'options pour toutes les options du produit 554
UPDATE france_product_options
SET option_group = 'Extras'
WHERE product_id = 554
  AND option_group = 'Suppléments';

-- 3. Vérification du steps_config
SELECT id, name, steps_config FROM france_products WHERE id = 554;

-- 4. Vérification des options renommées
SELECT option_group, option_name, display_order
FROM france_product_options
WHERE product_id = 554
ORDER BY group_order, display_order;

COMMIT;
