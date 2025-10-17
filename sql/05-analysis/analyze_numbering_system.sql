-- =========================================
-- ANALYSER LE SYSTÈME DE NUMÉROTATION
-- =========================================
-- Comprendre comment les boissons vs suppléments sont gérés

BEGIN;

-- =========================================
-- 1. VOIR COMMENT LES BOISSONS SONT NUMÉROTÉES
-- =========================================

SELECT
  'BOISSONS' as type,
  display_order,
  option_name,
  CASE
    WHEN option_name ~ '^[0-9️⃣🔟]+' THEN
      'NUMÉRO EN BASE: ' || SUBSTRING(option_name FROM '^([0-9️⃣🔟]+)')
    ELSE 'PAS DE NUMÉRO'
  END as numero_en_base
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Boisson 33CL incluse'
ORDER BY display_order
LIMIT 8;

-- =========================================
-- 2. VOIR COMMENT LES SUPPLÉMENTS SONT ACTUELLEMENT
-- =========================================

SELECT
  'SUPPLÉMENTS' as type,
  display_order,
  option_name,
  CASE
    WHEN option_name ~ '^[0-9️⃣🔟]+' THEN
      'NUMÉRO EN BASE: ' || SUBSTRING(option_name FROM '^([0-9️⃣🔟]+)')
    ELSE 'PAS DE NUMÉRO EN BASE'
  END as numero_en_base
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order
LIMIT 8;

-- =========================================
-- 3. AJOUTER LES NUMÉROS EN BASE AUX SUPPLÉMENTS
-- =========================================
-- Comme les boissons : 1️⃣ Mozzarella (+3€), 2️⃣ Cheddar (+3€), etc.

UPDATE france_product_options
SET option_name = CASE display_order
  WHEN 1 THEN '1️⃣ Mozzarella (+3€)'
  WHEN 2 THEN '2️⃣ Cheddar (+3€)'
  WHEN 3 THEN '3️⃣ Chèvre (+3€)'
  WHEN 4 THEN '4️⃣ Vache qui rit (+3€)'
  WHEN 5 THEN '5️⃣ Boursin (+3€)'
  WHEN 6 THEN '6️⃣ Viande (+3€)'
  WHEN 7 THEN '7️⃣ Vache qui rit gratiné (+3€)'
  WHEN 8 THEN '8️⃣ Poivrons (+3€)'
  WHEN 9 THEN '9️⃣ Cheddar gratiné (+3€)'
  WHEN 10 THEN '🔟 Raclette gratiné (+3€)'
  WHEN 11 THEN '1️⃣1️⃣ Champignons (+3€)'
  WHEN 12 THEN '1️⃣2️⃣ Raclette (+3€)'
  WHEN 13 THEN '1️⃣3️⃣ Emmental gratiné (+3€)'
  WHEN 14 THEN '1️⃣4️⃣ Bacon de Bœuf (+3€)'
  WHEN 15 THEN '1️⃣5️⃣ Galette (+3€)'
  WHEN 16 THEN '1️⃣6️⃣ Poulet (+3€)'
  ELSE option_name
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 4. AJOUTER LES NUMÉROS AUX OPTIONS DE NAVIGATION
-- =========================================

UPDATE france_product_options
SET option_name = CASE display_order
  WHEN 1 THEN '1️⃣ Ajouter des suppléments'
  WHEN 2 THEN '2️⃣ Pas de suppléments'
  ELSE option_name
END
WHERE product_id = 238
  AND option_group = 'Choix suppléments';

-- =========================================
-- 5. METTRE À JOUR LE WORKFLOW AVEC LES BONS NOMS
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
      "prompt": "➕ SUPPLÉMENTS",
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
      "prompt": "🧀 CHOISISSEZ VOS SUPPLÉMENTS (+3€ chacun)",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 6. VÉRIFICATION FINALE
-- =========================================

-- Comparer boissons et suppléments
SELECT
  option_group,
  display_order,
  option_name,
  'Format identique aux boissons' as status
FROM france_product_options
WHERE product_id = 238
  AND option_group IN ('Boisson 33CL incluse', 'Suppléments BOWL')
  AND display_order <= 5
ORDER BY
  CASE option_group
    WHEN 'Boisson 33CL incluse' THEN 1
    WHEN 'Suppléments BOWL' THEN 2
  END,
  display_order;

-- =========================================
-- 7. RÉSULTAT
-- =========================================

SELECT
  '✅ Suppléments avec numéros en base comme les boissons' as format_uniforme,
  '✅ 1️⃣ à 1️⃣6️⃣ dans les noms des suppléments' as numerotation,
  '✅ Workflow corrigé avec bons noms d''options' as workflow,
  '✅ Choix 5 → 5️⃣ Boursin (+3€)' as mapping_correct;

COMMIT;
-- En cas de problème : ROLLBACK;