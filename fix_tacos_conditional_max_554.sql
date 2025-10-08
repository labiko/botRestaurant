-- =========================================
-- CORRECTION TACOS - Restaurant ID 16
-- Ajout conditional_max step 2 (Viandes)
-- =========================================

BEGIN;

UPDATE france_products
SET
  steps_config = '{"steps":[{"step":1,"type":"options_selection","prompt":"votre plat","option_groups":["Plats"],"required":true,"max_selections":1},{"step":2,"type":"options_selection","prompt":"votre viande","option_groups":["Viandes"],"required":true,"max_selections":3,"conditional_max":{"based_on_step":1,"extract_number_from_name":true}},{"step":3,"type":"options_selection","prompt":"Nouvelle question","option_groups":["Suppléments"],"required":false,"max_selections":3}]}'
WHERE id = 554;

-- Vérification
SELECT id, name, steps_config FROM france_products WHERE id = 554;

COMMIT;
