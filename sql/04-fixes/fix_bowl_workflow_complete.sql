-- =========================================
-- CORRECTION COMPLÈTE WORKFLOW BOWL
-- =========================================
-- Objectif: Créer les vrais suppléments BOWL et corriger le workflow
-- Modèle: Copier les suppléments TACOS (16 extras à +3€)

BEGIN;

-- =========================================
-- 1. CRÉER LES VRAIS SUPPLÉMENTS BOWL
-- =========================================

-- D'abord, supprimer les faux suppléments actuels
DELETE FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments';

-- Créer le nouveau groupe "Suppléments BOWL" avec les 16 extras des tacos
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order) VALUES
(238, 'Suppléments BOWL', '1️⃣ Mozzarella', 3.00, 1),
(238, 'Suppléments BOWL', '2️⃣ Cheddar', 3.00, 2),
(238, 'Suppléments BOWL', '3️⃣ Chèvre', 3.00, 3),
(238, 'Suppléments BOWL', '4️⃣ Vache qui rit', 3.00, 4),
(238, 'Suppléments BOWL', '5️⃣ Boursin', 3.00, 5),
(238, 'Suppléments BOWL', '6️⃣ Viande', 3.00, 6),
(238, 'Suppléments BOWL', '7️⃣ Vache qui rit gratiné', 3.00, 7),
(238, 'Suppléments BOWL', '8️⃣ Poivrons', 3.00, 8),
(238, 'Suppléments BOWL', '9️⃣ Cheddar gratiné', 3.00, 9),
(238, 'Suppléments BOWL', '🔟 Raclette gratiné', 3.00, 10),
(238, 'Suppléments BOWL', '1️⃣1️⃣ Champignons', 3.00, 11),
(238, 'Suppléments BOWL', '1️⃣2️⃣ Raclette', 3.00, 12),
(238, 'Suppléments BOWL', '1️⃣3️⃣ Emmental gratiné', 3.00, 13),
(238, 'Suppléments BOWL', '1️⃣4️⃣ Bacon de Bœuf', 3.00, 14),
(238, 'Suppléments BOWL', '1️⃣5️⃣ Galette', 3.00, 15),
(238, 'Suppléments BOWL', '1️⃣6️⃣ Poulet', 3.00, 16);

-- Créer aussi le groupe de choix (Pas de suppléments / Ajouter suppléments)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order) VALUES
(238, 'Choix suppléments', '1️⃣ Pas de suppléments', 0.00, 1),
(238, 'Choix suppléments', '2️⃣ Ajouter des suppléments', 0.00, 2);

-- =========================================
-- 2. CORRIGER LE WORKFLOW BOWL (4 ÉTAPES)
-- =========================================

-- Nouveau workflow avec 4 étapes :
-- 1. Choix viande
-- 2. Boisson 33CL incluse
-- 3. Choix suppléments (optionnel)
-- 4. Sélection suppléments (si choix 2)

UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "Choisissez votre viande :",
      "required": true,
      "option_groups": ["Choix viande"],
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "Choisissez votre boisson (incluse) :",
      "required": true,
      "option_groups": ["Boisson 33CL incluse"],
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "SUPPLÉMENTS :",
      "required": false,
      "option_groups": ["Choix suppléments"],
      "max_selections": 1,
      "conditional_next": {
        "condition": "option_selected",
        "option_name": "2️⃣ Ajouter des suppléments",
        "next_step": 4,
        "else_step": "complete"
      }
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "Choisissez vos suppléments (10 maximum) :",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 3. VÉRIFICATIONS
-- =========================================

-- Vérifier le produit BOWL mis à jour
SELECT
  p.id,
  p.name,
  p.workflow_type,
  p.requires_steps,
  p.steps_config::text as nouvelle_config
FROM france_products p
WHERE p.id = 238;

-- Vérifier les nouveaux groupes d'options
SELECT
  po.option_group,
  COUNT(*) as nb_options,
  STRING_AGG(po.option_name, ' | ' ORDER BY po.display_order) as options
FROM france_product_options po
WHERE po.product_id = 238
GROUP BY po.option_group
ORDER BY po.option_group;

-- Vérifier tous les suppléments BOWL
SELECT
  po.option_name,
  po.price_modifier,
  po.display_order
FROM france_product_options po
WHERE po.product_id = 238
  AND po.option_group = 'Suppléments BOWL'
ORDER BY po.display_order;

-- =========================================
-- 4. RÉSULTAT ATTENDU DANS LE BOT
-- =========================================

-- 🤖 COMPORTEMENT ATTENDU :
-- Step 1: Choix viande (obligatoire)
-- Step 2: Boisson incluse (obligatoire)
-- Step 3: "Pas de suppléments" OU "Ajouter des suppléments" (optionnel)
-- Step 4: Si "Ajouter", affiche les 16 suppléments (sélection multiple max 10)

-- =========================================
-- VALIDATION AVANT COMMIT
-- =========================================

-- S'assurer qu'on a bien tout :
-- - 6 viandes
-- - 12 boissons
-- - 2 choix suppléments
-- - 16 suppléments BOWL
-- = Total: 36 options pour le BOWL

SELECT
  'VALIDATION' as status,
  COUNT(*) as total_options,
  CASE
    WHEN COUNT(*) = 36 THEN '✅ CORRECT: 36 options créées'
    ELSE '❌ ERREUR: ' || COUNT(*) || ' options au lieu de 36'
  END as diagnostic
FROM france_product_options
WHERE product_id = 238;

COMMIT;
-- En cas de problème : ROLLBACK;