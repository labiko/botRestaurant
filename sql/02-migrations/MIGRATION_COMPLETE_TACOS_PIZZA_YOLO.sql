-- =========================================
-- MIGRATION COMPLÈTE : TACOS PIZZA YOLO (ID 201)
-- Configuration moderne comme Resto 16
-- =========================================
-- Date: 2025-10-10
-- Restaurant: Pizza Yolo 77 (ID 1)
-- Produit: TACOS (ID 201)
--
-- CHANGEMENTS:
-- ✅ workflow_type: composite_workflow → universal_workflow_v2
-- ✅ Ajout groupe "Taille" avec conditional_max
-- ✅ Ajout groupe "Condiments" (5 options gratuites)
-- ✅ Suppléments: 12 options à 3€
-- ✅ Sauces: 8 → 16 options
-- ✅ Réorganisation group_order (6 groupes)
-- ✅ Suppression france_product_sizes
-- ✅ Suppression extras_choice (oui/non suppléments)
-- =========================================

BEGIN;

-- =========================================
-- ÉTAPE 0: NETTOYAGE COMPLET (SÉCURISÉ)
-- =========================================

-- ⚠️ SÉCURITÉ: Vérifier qu'on ne supprime que le produit 201
SELECT
  '⚠️ ATTENTION: Suppression imminente' as warning,
  COUNT(*) as nb_options_a_supprimer
FROM france_product_options
WHERE product_id = 201;

-- Supprimer TOUTES les anciennes options du produit 201 UNIQUEMENT
DELETE FROM france_product_options
WHERE product_id = 201;

-- Supprimer les tailles du produit 201 UNIQUEMENT
DELETE FROM france_product_sizes
WHERE product_id = 201;

-- Vérification: Doit être 0
SELECT
  '✅ Nettoyage effectué' as status,
  COUNT(*) as options_restantes
FROM france_product_options
WHERE product_id = 201;

-- =========================================
-- ÉTAPE 1: CRÉER LE GROUPE "Taille" (3 OPTIONS)
-- =========================================

-- Option 1: MENU M - 1 VIANDE (7€/8€)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  max_selections,
  icon
) VALUES (
  201,
  'Taille',
  'MENU M - 1 VIANDE',
  7.00,  -- Prix sur place
  1,
  1,
  true,
  true,
  1,
  '🌯'
);

-- Option 2: MENU L - 2 VIANDES (8.50€/9.50€)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  max_selections,
  icon
) VALUES (
  201,
  'Taille',
  'MENU L - 2 VIANDES',
  8.50,
  2,
  1,
  true,
  true,
  1,
  '🌯'
);

-- Option 3: MENU XL - 3 VIANDES (10€/11€)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  max_selections,
  icon
) VALUES (
  201,
  'Taille',
  'MENU XL - 3 VIANDES',
  10.00,
  3,
  1,
  true,
  true,
  1,
  '🌯'
);

-- =========================================
-- ÉTAPE 2: CRÉER LE GROUPE "Viandes" (6 OPTIONS)
-- =========================================

INSERT INTO france_product_options (
  product_id, option_group, option_name, price_modifier,
  display_order, group_order, is_required, is_active, max_selections, icon
) VALUES
(201, 'Viandes', '🥩 Viande Hachée', 0, 1, 2, true, true, 1, '🥩'),
(201, 'Viandes', '🍗 Tenders', 0, 2, 2, true, true, 1, '🍗'),
(201, 'Viandes', '🧀 Cordon Bleu', 0, 3, 2, true, true, 1, '🧀'),
(201, 'Viandes', '🍗 Nuggets', 0, 4, 2, true, true, 1, '🍗'),
(201, 'Viandes', '🍖 Filet de Poulet', 0, 5, 2, true, true, 1, '🍖'),
(201, 'Viandes', '🌭 Merguez', 0, 6, 2, true, true, 1, '🌭');

-- =========================================
-- ÉTAPE 3: CRÉER LE GROUPE "Condiments" (5 OPTIONS)
-- =========================================

INSERT INTO france_product_options (
  product_id, option_group, option_name, price_modifier,
  display_order, group_order, is_required, is_active, max_selections, icon
) VALUES
(201, 'Condiments', '🥬 Salades', 0, 1, 3, false, true, 1, '🥬'),
(201, 'Condiments', '🍅 Tomate', 0, 2, 3, false, true, 1, '🍅'),
(201, 'Condiments', '🧅 Oignons', 0, 3, 3, false, true, 1, '🧅'),
(201, 'Condiments', '🫒 Olives', 0, 4, 3, false, true, 1, '🫒'),
(201, 'Condiments', '🥒 Cornichons', 0, 5, 3, false, true, 1, '🥒');

-- =========================================
-- ÉTAPE 4: CRÉER LE GROUPE "Suppléments" (12 OPTIONS PAYANTES 3€)
-- =========================================

INSERT INTO france_product_options (
  product_id, option_group, option_name, price_modifier,
  display_order, group_order, is_required, is_active, max_selections, icon
) VALUES
(201, 'Suppléments', '🧀 Emmental gratiné', 3.00, 1, 4, false, true, 1, '🧀'),
(201, 'Suppléments', '🧈 Boursin', 3.00, 2, 4, false, true, 1, '🧈'),
(201, 'Suppléments', '🧀 Cheddar', 3.00, 3, 4, false, true, 1, '🧀'),
(201, 'Suppléments', '🧀 Chèvre', 3.00, 4, 4, false, true, 1, '🧀'),
(201, 'Suppléments', '🥓 Bacon de Bœuf', 3.00, 5, 4, false, true, 1, '🥓'),
(201, 'Suppléments', '🫓 Galette', 3.00, 6, 4, false, true, 1, '🫓'),
(201, 'Suppléments', '🥩 Viande', 3.00, 7, 4, false, true, 1, '🥩'),
(201, 'Suppléments', '🧀 Raclette', 3.00, 8, 4, false, true, 1, '🧀'),
(201, 'Suppléments', '🫑 Poivrons', 3.00, 9, 4, false, true, 1, '🫑'),
(201, 'Suppléments', '🧀 Cheddar gratiné', 3.00, 10, 4, false, true, 1, '🧀'),
(201, 'Suppléments', '🍄 Champignons', 3.00, 11, 4, false, true, 1, '🍄'),
(201, 'Suppléments', '🍗 Poulet', 3.00, 12, 4, false, true, 1, '🍗');

-- =========================================
-- ÉTAPE 5: CRÉER LE GROUPE "Sauces" (16 OPTIONS)
-- =========================================
INSERT INTO france_product_options (
  product_id, option_group, option_name, price_modifier,
  display_order, group_order, is_required, is_active, max_selections, icon
) VALUES
(201, 'Sauces', '🥚 Mayonnaise', 0, 1, 5, false, true, 1, '🥚'),
(201, 'Sauces', '🍅 Ketchup', 0, 2, 5, false, true, 1, '🍅'),
(201, 'Sauces', '🌶️ Algérienne', 0, 3, 5, false, true, 1, '🌶️'),
(201, 'Sauces', '🌶️ Poivre', 0, 4, 5, false, true, 1, '🌶️'),
(201, 'Sauces', '🍛 Curry', 0, 5, 5, false, true, 1, '🍛'),
(201, 'Sauces', '🔥 Samouraï', 0, 6, 5, false, true, 1, '🔥'),
(201, 'Sauces', '🔴 Harissa', 0, 7, 5, false, true, 1, '🔴'),
(201, 'Sauces', '⚪ Blanche', 0, 8, 5, false, true, 1, '⚪'),
(201, 'Sauces', '💛 Biggy', 0, 9, 5, false, true, 1, '💛'),
(201, 'Sauces', '🍖 Barbecue (BBQ)', 0, 10, 5, false, true, 1, '🍖'),
(201, 'Sauces', '🌶️ Chili Thaï', 0, 11, 5, false, true, 1, '🌶️'),
(201, 'Sauces', '🧡 Andalouse', 0, 12, 5, false, true, 1, '🧡'),
(201, 'Sauces', '🟡 Moutarde', 0, 13, 5, false, true, 1, '🟡'),
(201, 'Sauces', '🧀 Fromagère', 0, 14, 5, false, true, 1, '🧀'),
(201, 'Sauces', '🍔 Burger', 0, 15, 5, false, true, 1, '🍔'),
(201, 'Sauces', '🍅 Tomate', 0, 16, 5, false, true, 1, '🍅');

-- =========================================
-- ÉTAPE 6: CRÉER LE GROUPE "Boisson" (12 OPTIONS)
-- =========================================

INSERT INTO france_product_options (
  product_id, option_group, option_name, price_modifier,
  display_order, group_order, is_required, is_active, max_selections, icon
) VALUES
(201, 'Boisson', '🥤 TROPICO 33CL', 0, 1, 6, true, true, 1, '🥤'),
(201, 'Boisson', '🥤 COCA COLA 33CL', 0, 2, 6, true, true, 1, '🥤'),
(201, 'Boisson', '🥤 MIRANDA FRAISE 33CL', 0, 3, 6, true, true, 1, '🥤'),
(201, 'Boisson', '⚫ COCA ZERO 33CL', 0, 4, 6, true, true, 1, '⚫'),
(201, 'Boisson', '🥤 7UP TROPICAL 33CL', 0, 5, 6, true, true, 1, '🥤'),
(201, 'Boisson', '🥤 MIRANDA TROPICAL 33CL', 0, 6, 6, true, true, 1, '🥤'),
(201, 'Boisson', '🥤 7 UP 33CL', 0, 7, 6, true, true, 1, '🥤'),
(201, 'Boisson', '🫧 PERRIER 33CL', 0, 8, 6, true, true, 1, '🫧'),
(201, 'Boisson', '🧡 OASIS TROPICAL 33CL', 0, 9, 6, true, true, 1, '🧡'),
(201, 'Boisson', '🧊 ICE TEA 33CL', 0, 10, 6, true, true, 1, '🧊'),
(201, 'Boisson', '🥤 EAU MINÉRALE 33CL', 0, 11, 6, true, true, 1, '🥤'),
(201, 'Boisson', '🥤 7UP CHERRY 33CL', 0, 12, 6, true, true, 1, '🥤');

-- =========================================
-- ÉTAPE 7: METTRE À JOUR LE PRODUIT (6 ÉTAPES)
-- =========================================

UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  price_on_site_base = 0.00,
  price_delivery_base = 0.00,
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "🌯 Choisissez votre formule TACOS",
        "option_groups": ["Taille"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "🥩 Choisissez vos viandes",
        "option_groups": ["Viandes"],
        "required": true,
        "max_selections": 3,
        "conditional_max": {
          "based_on_step": 1,
          "extract_number_from_name": true
        }
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "🥗 Choisissez vos condiments (facultatif)",
        "option_groups": ["Condiments"],
        "required": false,
        "max_selections": 5
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "🧀 Choisissez vos suppléments - 3€/unité (facultatif)",
        "option_groups": ["Suppléments"],
        "required": false,
        "max_selections": 5
      },
      {
        "step": 5,
        "type": "options_selection",
        "prompt": "🌶️ Choisissez vos sauces (2 maximum)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 6,
        "type": "options_selection",
        "prompt": "🥤 Choisissez votre boisson",
        "option_groups": ["Boisson"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'
WHERE id = 201;

-- =========================================
-- VÉRIFICATIONS FINALES
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

-- Vérifier tous les groupes
SELECT
  option_group,
  group_order,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = 201
GROUP BY option_group, group_order
ORDER BY group_order;

-- Vérifier les tailles (nouveau groupe)
SELECT
  id,
  option_name,
  price_modifier,
  display_order
FROM france_product_options
WHERE product_id = 201
  AND option_group = 'Taille'
ORDER BY display_order;

-- Vérifier les sauces (16 attendues)
SELECT
  COUNT(*) as nb_sauces
FROM france_product_options
WHERE product_id = 201
  AND option_group = 'Sauces';

-- Statistiques finales
SELECT
  '✅ Migration terminée' as status,
  COUNT(*) as total_options,
  COUNT(DISTINCT option_group) as nb_groupes
FROM france_product_options
WHERE product_id = 201;

COMMIT;

-- =========================================
-- RÉSUMÉ DE LA MIGRATION (NETTOYAGE COMPLET)
-- =========================================
-- ✅ SUPPRESSION COMPLÈTE de toutes les anciennes options (44 lignes)
-- ✅ SUPPRESSION france_product_sizes (3 lignes)
-- ✅ CRÉATION groupe "Taille" (3 options)
-- ✅ CRÉATION groupe "Viandes" (6 options)
-- ✅ CRÉATION groupe "Condiments" (5 options - gratuites)
-- ✅ CRÉATION groupe "Suppléments" (12 options payantes 3€)
-- ✅ CRÉATION groupe "Sauces" (16 options)
-- ✅ CRÉATION groupe "Boisson" (12 options)
-- ✅ workflow_type → universal_workflow_v2
-- ✅ steps_config avec conditional_max
-- ✅ 6 groupes, 6 étapes, 54 options total (3+6+5+12+16+12)
-- ⚠️ SÉCURITÉ: Tous les DELETE filtrent sur product_id = 201
-- ⚠️ SUPPRIMÉ: extras_choice (oui/non suppléments)
-- =========================================
