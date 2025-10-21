-- ========================================================================
-- CORRECTION BUG QUATTRO - 2 PIZZAS PERDUES
-- DATE: 2025-10-21
-- ========================================================================
-- Produit: QUATTRO (id=780) - Plan B Melun (restaurant_id=22)
-- Problème: Step 1 et Step 2 utilisent le même option_group "Pizzas"
--           → Step 2 écrase Step 1 → Seule la 2ème pizza apparaît
-- Solution: Renommer les groupes pour les différencier
--           - Step 1: "Première Pizza"
--           - Step 2: "Deuxième Pizza"
-- ========================================================================

BEGIN;

-- 1️⃣ MISE À JOUR DU STEPS_CONFIG DU PRODUIT
UPDATE france_products
SET
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre première pizza",
        "option_groups": ["Première Pizza"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre deuxième pizza",
        "option_groups": ["Deuxième Pizza"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 780
  AND restaurant_id = 22
  AND name = 'QUATTRO';

-- 2️⃣ DUPLIQUER LES OPTIONS POUR "Première Pizza"
-- Créer une copie de toutes les pizzas avec le nouveau groupe
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
)
SELECT
  product_id,
  'Première Pizza' as option_group,  -- ← Nouveau nom
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = 780
  AND option_group = 'Pizzas'
ORDER BY display_order;

-- 3️⃣ RENOMMER LES OPTIONS EXISTANTES POUR "Deuxième Pizza"
UPDATE france_product_options
SET
  option_group = 'Deuxième Pizza'
WHERE product_id = 780
  AND option_group = 'Pizzas';

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier le steps_config mis à jour
SELECT
  id,
  name,
  steps_config
FROM france_products
WHERE id = 780;

-- Vérifier les groupes d'options
SELECT
  option_group,
  COUNT(*) as nb_pizzas
FROM france_product_options
WHERE product_id = 780
GROUP BY option_group
ORDER BY option_group;

-- Vérifier quelques pizzas de chaque groupe
SELECT
  option_group,
  option_name,
  icon,
  display_order
FROM france_product_options
WHERE product_id = 780
  AND option_name IN ('MARGUERITA', 'CHICKEN', 'PRONTO', 'TARTIFLETTE')
ORDER BY option_group, option_name;

-- Compter le total d'options (devrait être 62 = 31 x 2)
SELECT
  COUNT(*) as total_options
FROM france_product_options
WHERE product_id = 780;

-- Transaction validée automatiquement en cas de succès
COMMIT;

-- En cas d'erreur : ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- - steps_config mis à jour avec groupes différents
-- - 31 options "Première Pizza" (tomates 🍅 + crème 🥛)
-- - 31 options "Deuxième Pizza" (tomates 🍅 + crème 🥛)
-- - Total : 62 options pour le produit QUATTRO
--
-- APRÈS CETTE CORRECTION :
-- Step 1 : Choix pizza 1 → Stocké dans workflowData.selections["Première Pizza"]
-- Step 2 : Choix pizza 2 → Stocké dans workflowData.selections["Deuxième Pizza"]
-- Résultat : LES DEUX PIZZAS APPARAISSENT dans le panier ! ✅
-- ========================================================================
