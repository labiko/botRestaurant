-- =========================================
-- RESTRUCTURER LE WORKFLOW BOWL COMME LES TACOS
-- =========================================
-- Ajouter un step pour demander si on veut des suppléments
-- PUIS afficher la liste uniquement si on choisit "Ajouter"

BEGIN;

-- =========================================
-- 1. REMETTRE "PAS DE SUPPLÉMENTS" DANS LE BON GROUPE
-- =========================================

-- Remettre l'option dans "Choix suppléments"
UPDATE france_product_options
SET option_group = 'Choix suppléments'
WHERE product_id = 238
  AND option_name LIKE '%Pas de suppléments%';

-- =========================================
-- 2. RESTRUCTURER LES OPTIONS DE CHOIX
-- =========================================
-- Comme les tacos : 1. Ajouter / 2. Pas de suppléments

UPDATE france_product_options
SET
  option_name = CASE
    WHEN option_name LIKE '%Ajouter%' THEN '1️⃣ Ajouter des suppléments'
    WHEN option_name LIKE '%Pas de%' THEN '2️⃣ Pas de suppléments'
    ELSE option_name
  END,
  display_order = CASE
    WHEN option_name LIKE '%Ajouter%' THEN 1
    WHEN option_name LIKE '%Pas de%' THEN 2
    ELSE display_order
  END
WHERE product_id = 238
  AND option_group = 'Choix suppléments';

-- Si l'option "Ajouter" n'existe pas, la créer
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active
)
SELECT
  238,
  'Choix suppléments',
  '1️⃣ Ajouter des suppléments',
  0.00,
  1,
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM france_product_options
  WHERE product_id = 238
    AND option_group = 'Choix suppléments'
    AND option_name LIKE '%Ajouter%'
);

-- =========================================
-- 3. S'ASSURER QUE LES SUPPLÉMENTS SONT BIEN NUMÉROTÉS
-- =========================================

-- Les suppléments gardent leur numérotation 1-16
UPDATE france_product_options
SET display_order = CASE
  WHEN option_name LIKE '%Mozzarella%' THEN 1
  WHEN option_name LIKE '%Cheddar%' AND option_name NOT LIKE '%gratiné%' THEN 2
  WHEN option_name LIKE '%Chèvre%' THEN 3
  WHEN option_name LIKE '%Vache qui rit%' AND option_name NOT LIKE '%gratiné%' THEN 4
  WHEN option_name LIKE '%Boursin%' THEN 5
  WHEN option_name LIKE '%Viande%' THEN 6
  WHEN option_name LIKE '%Vache qui rit gratiné%' THEN 7
  WHEN option_name LIKE '%Poivrons%' THEN 8
  WHEN option_name LIKE '%Cheddar gratiné%' THEN 9
  WHEN option_name LIKE '%Raclette gratiné%' THEN 10
  WHEN option_name LIKE '%Champignons%' THEN 11
  WHEN option_name LIKE '%Raclette%' AND option_name NOT LIKE '%gratiné%' THEN 12
  WHEN option_name LIKE '%Emmental gratiné%' THEN 13
  WHEN option_name LIKE '%Bacon de Bœuf%' THEN 14
  WHEN option_name LIKE '%Galette%' THEN 15
  WHEN option_name LIKE '%Poulet%' THEN 16
  ELSE display_order
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 4. METTRE À JOUR LE WORKFLOW AVEC STEP CONDITIONNEL
-- =========================================

UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "🥩 CHOIX VIANDE :",
      "required": true,
      "option_groups": ["Choix viande"],
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "🥤 BOISSON 33CL INCLUSE :",
      "required": true,
      "option_groups": ["Boisson 33CL incluse"],
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "➕ SUPPLÉMENTS\n\n1️⃣ Ajouter des suppléments\n2️⃣ Pas de suppléments\n\n💡 Pour choisir: tapez le numéro\n\n00 - Finaliser cette étape\n000 - Ajouter au panier et continuer\n0000 - Recommencer la configuration\n\n❌ Tapez \"annuler\" pour arrêter",
      "required": false,
      "option_groups": ["Choix suppléments"],
      "max_selections": 1,
      "conditional_next": {
        "condition": "option_selected",
        "option_name": "1️⃣ Ajouter des suppléments",
        "next_step": 4,
        "else_step": "complete"
      }
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "🧀 CHOISISSEZ VOS SUPPLÉMENTS (+3€ chacun)\n\n💡 Tapez les numéros séparés par des virgules (max 10)\nEx: 3,5,8 = Chèvre, Boursin, Poivrons",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10,
      "allow_multiple": true
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 5. VÉRIFICATION FINALE
-- =========================================

-- Vérifier les options de choix (step 3)
SELECT
  'STEP 3 - CHOIX' as etape,
  display_order,
  option_name
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
ORDER BY display_order;

-- Vérifier les suppléments (step 4)
SELECT
  'STEP 4 - SUPPLÉMENTS' as etape,
  display_order,
  option_name,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND display_order <= 5
ORDER BY display_order;

-- Résumé
SELECT
  '✅ Step 3: Demande si on veut des suppléments (1=Oui, 2=Non)' as nouveau_step_3,
  '✅ Step 4: Liste des suppléments SI choix 1' as nouveau_step_4,
  '✅ Même système que les tacos' as coherence,
  '✅ Plus de confusion avec l''option 0' as resultat;

COMMIT;
-- En cas de problème : ROLLBACK;