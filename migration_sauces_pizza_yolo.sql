-- =========================================
-- MIGRATION SAUCES : TACOS PIZZA YOLO (ID 201)
-- =========================================
-- Généré le: 10/10/2025
-- Objectif: Migrer les 8 sauces avec workflow correct
-- Groupe: sauce → Sauces (group_order: 3)
-- =========================================

BEGIN;

-- =========================================
-- 1. MISE À JOUR DU PRODUIT (Ajout étape Sauces)
-- =========================================

UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{"steps":[{"step":1,"type":"options_selection","prompt":"🌯 Choisissez votre formule","option_groups":["Taille"],"required":true,"max_selections":1},{"step":2,"type":"options_selection","prompt":"🥩 Choisissez vos viandes","option_groups":["Viandes"],"required":true,"max_selections":3,"conditional_max":{"based_on_step":1,"extract_number_from_name":true}},{"step":3,"type":"options_selection","prompt":"🌶️ Choisissez vos sauces (2 maximum)","option_groups":["Sauces"],"required":true,"max_selections":2},{"step":4,"type":"options_selection","prompt":"➕ Voulez-vous des suppléments ?","option_groups":["extras_choice"],"required":true,"max_selections":1},{"step":5,"type":"options_selection","prompt":"🧀 Choisissez vos suppléments","option_groups":["extras"],"required":false,"max_selections":5},{"step":6,"type":"options_selection","prompt":"🥤 Choisissez votre boisson","option_groups":["boisson"],"required":true,"max_selections":1}]}'
WHERE id = 201;

-- =========================================
-- 2. MIGRATION DES SAUCES (sauce → Sauces)
-- =========================================

-- Sauce 1: Algérienne
UPDATE france_product_options
SET
  option_name = '🌶️ Algérienne',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 1,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 347;

-- Sauce 2: Andalouse
UPDATE france_product_options
SET
  option_name = '🧡 Andalouse',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 2,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 341;

-- Sauce 3: Samurai
UPDATE france_product_options
SET
  option_name = '🔥 Samurai',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 3,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 345;

-- Sauce 4: Ketchup
UPDATE france_product_options
SET
  option_name = '🍅 Ketchup',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 4,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 342;

-- Sauce 5: Biggy
UPDATE france_product_options
SET
  option_name = '💛 Biggy',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 5,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 346;

-- Sauce 6: Blanche
UPDATE france_product_options
SET
  option_name = '⚪ Blanche',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 6,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 348;

-- Sauce 7: Mayo
UPDATE france_product_options
SET
  option_name = '🥚 Mayo',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 7,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 343;

-- Sauce 8: Harissa
UPDATE france_product_options
SET
  option_name = '🔴 Harissa',
  option_group = 'Sauces',
  group_order = 3,
  display_order = 8,
  price_modifier = 0.00,
  is_active = true
WHERE product_id = 201
  AND id = 344;

-- =========================================
-- 3. MISE À JOUR DES GROUP_ORDER DES AUTRES GROUPES
-- =========================================

-- Groupe "Taille" → group_order: 1 (à créer après)
-- Groupe "viande" → "Viandes" : group_order: 2
UPDATE france_product_options
SET
  option_group = 'Viandes',
  group_order = 2
WHERE product_id = 201
  AND option_group = 'viande';

-- Groupe "Sauces" : group_order: 3 (déjà fait ci-dessus)

-- Groupe "extras_choice" : group_order: 4
UPDATE france_product_options
SET
  group_order = 4
WHERE product_id = 201
  AND option_group = 'extras_choice';

-- Groupe "extras" : group_order: 5
UPDATE france_product_options
SET
  group_order = 5
WHERE product_id = 201
  AND option_group = 'extras';

-- Groupe "boisson" : group_order: 6
UPDATE france_product_options
SET
  group_order = 6
WHERE product_id = 201
  AND option_group = 'boisson';

-- =========================================
-- 4. VÉRIFICATIONS FINALES
-- =========================================

-- Vérifier le produit
SELECT
  id,
  name,
  workflow_type,
  price_on_site_base,
  price_delivery_base
FROM france_products
WHERE id = 201;

-- Vérifier les groupes et leurs order
SELECT
  DISTINCT option_group,
  group_order,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = 201
GROUP BY option_group, group_order
ORDER BY group_order;

-- Vérifier les sauces
SELECT
  id,
  option_name,
  option_group,
  group_order,
  display_order,
  price_modifier
FROM france_product_options
WHERE product_id = 201
  AND option_group = 'Sauces'
ORDER BY display_order;

-- Statistiques finales
SELECT
  COUNT(*) as total_options,
  COUNT(DISTINCT option_group) as nb_groupes
FROM france_product_options
WHERE product_id = 201;

COMMIT;

-- ✅ Migration des sauces terminée
-- ✅ Groupe "sauce" → "Sauces" avec emojis
-- ✅ display_order corrigés (1-8)
-- ✅ group_order définis pour tous les groupes
-- ✅ workflow_type → universal_workflow_v2
-- ✅ steps_config avec étape Sauces intégrée
