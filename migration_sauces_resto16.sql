-- =========================================
-- MIGRATION SAUCES : TACOS RESTO 16 (ID 554)
-- =========================================
-- Généré le: 10/10/2025
-- Objectif: Remplacer "sauces1" par les 8 vraies sauces
-- Source: Sauces de Pizza Yolo
-- =========================================

BEGIN;

-- =========================================
-- 1. SUPPRIMER LA SAUCE DE TEST
-- =========================================

DELETE FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Sauces';

-- =========================================
-- 2. INSÉRER LES 8 VRAIES SAUCES
-- =========================================

-- Sauce 1: Algérienne
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '🌶️ Algérienne',
  0.00,
  1,
  5,
  'Sauces',
  false,
  true,
  1,
  '🌶️',
  NULL
);

-- Sauce 2: Andalouse
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '🧡 Andalouse',
  0.00,
  2,
  5,
  'Sauces',
  false,
  true,
  1,
  '🧡',
  NULL
);

-- Sauce 3: Samurai
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '🔥 Samurai',
  0.00,
  3,
  5,
  'Sauces',
  false,
  true,
  1,
  '🔥',
  NULL
);

-- Sauce 4: Ketchup
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '🍅 Ketchup',
  0.00,
  4,
  5,
  'Sauces',
  false,
  true,
  1,
  '🍅',
  NULL
);

-- Sauce 5: Biggy
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '💛 Biggy',
  0.00,
  5,
  5,
  'Sauces',
  false,
  true,
  1,
  '💛',
  NULL
);

-- Sauce 6: Blanche
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '⚪ Blanche',
  0.00,
  6,
  5,
  'Sauces',
  false,
  true,
  1,
  '⚪',
  NULL
);

-- Sauce 7: Mayo
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '🥚 Mayo',
  0.00,
  7,
  5,
  'Sauces',
  false,
  true,
  1,
  '🥚',
  NULL
);

-- Sauce 8: Harissa
INSERT INTO france_product_options (
  product_id,
  option_name,
  price_modifier,
  display_order,
  group_order,
  option_group,
  is_required,
  is_active,
  max_selections,
  icon,
  composition
) VALUES (
  554,
  '🔴 Harissa',
  0.00,
  8,
  5,
  'Sauces',
  false,
  true,
  1,
  '🔴',
  NULL
);

-- =========================================
-- 3. MISE À JOUR DU steps_config (max_selections: 2)
-- =========================================

UPDATE france_products
SET
  steps_config = '{"steps":[{"step":1,"type":"options_selection","prompt":"votre plat","option_groups":["Plats"],"required":true,"max_selections":1},{"step":2,"type":"options_selection","prompt":"votre viande","option_groups":["Viandes"],"required":true,"max_selections":3,"conditional_max":{"based_on_step":1,"extract_number_from_name":true}},{"step":3,"type":"options_selection","prompt":"EXTRAS","option_groups":["Extras"],"required":false,"max_selections":3},{"step":4,"type":"options_selection","prompt":"votre condiments","option_groups":["Condiments"],"required":false,"max_selections":3},{"step":5,"type":"options_selection","prompt":"🌶️ Choisissez vos sauces (2 maximum)","option_groups":["Sauces"],"required":false,"max_selections":2}]}'
WHERE id = 554;

-- =========================================
-- 4. VÉRIFICATIONS FINALES
-- =========================================

-- Vérifier le produit
SELECT
  id,
  name,
  workflow_type,
  steps_config::text
FROM france_products
WHERE id = 554;

-- Vérifier les sauces
SELECT
  id,
  option_name,
  option_group,
  group_order,
  display_order,
  price_modifier,
  icon
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Sauces'
ORDER BY display_order;

-- Compter les sauces
SELECT
  '✅ Sauces migrées' as status,
  COUNT(*) as nb_sauces
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Sauces';

-- Voir tous les groupes
SELECT
  DISTINCT option_group,
  group_order,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = 554
GROUP BY option_group, group_order
ORDER BY group_order;

COMMIT;

-- ✅ Migration des sauces terminée pour TACOS Resto 16
-- ✅ 8 sauces ajoutées avec emojis
-- ✅ max_selections: 2 dans le workflow
-- ✅ group_order: 5 (après Condiments)
