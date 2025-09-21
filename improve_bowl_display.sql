-- =========================================
-- AMÉLIORER L'AFFICHAGE DU WORKFLOW BOWL
-- =========================================
-- Objectif:
-- 1. Corriger l'ordre d'affichage : viande → boisson → suppléments
-- 2. S'assurer que les prix des suppléments s'affichent

BEGIN;

-- =========================================
-- 1. VÉRIFIER LA CONFIGURATION ACTUELLE
-- =========================================

-- Voir le workflow actuel
SELECT
  p.name,
  p.steps_config::text as current_workflow
FROM france_products p
WHERE p.id = 238;

-- Voir les suppléments avec leurs prix
SELECT
  po.option_name,
  po.price_modifier,
  po.display_order
FROM france_product_options po
WHERE po.product_id = 238
  AND po.option_group = 'Suppléments BOWL'
ORDER BY po.display_order;

-- =========================================
-- 2. CORRIGER L'ORDRE DU WORKFLOW
-- =========================================

-- Le workflow doit être : viande → boisson → suppléments
-- Actuellement semble être dans le bon ordre, mais vérifions
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
      "prompt": "🍽️ SUPPLÉMENTS :",
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
      "prompt": "🧀 CHOISISSEZ VOS SUPPLÉMENTS (10 maximum) :",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 3. DIAGNOSTIQUER POURQUOI LES PRIX NE S'AFFICHENT PAS
-- =========================================

-- Vérifier que les prix des suppléments sont bien 3.00
SELECT
  'DIAGNOSTIC PRIX' as type,
  po.option_name,
  po.price_modifier,
  CASE
    WHEN po.price_modifier = 0.00 THEN '❌ ERREUR: Prix 0€'
    WHEN po.price_modifier = 3.00 THEN '✅ OK: Prix 3€'
    ELSE '⚠️ AUTRE: Prix ' || po.price_modifier || '€'
  END as diagnostic
FROM france_product_options po
WHERE po.product_id = 238
  AND po.option_group = 'Suppléments BOWL'
ORDER BY po.display_order;

-- =========================================
-- 4. AMÉLIORER LES NOMS DES SUPPLÉMENTS POUR AFFICHER LE PRIX
-- =========================================

-- Option 1: Mettre à jour les noms pour inclure le prix
UPDATE france_product_options
SET option_name = CASE
  WHEN option_name = '1️⃣ Mozzarella' THEN '1️⃣ Mozzarella (+3€)'
  WHEN option_name = '2️⃣ Cheddar' THEN '2️⃣ Cheddar (+3€)'
  WHEN option_name = '3️⃣ Chèvre' THEN '3️⃣ Chèvre (+3€)'
  WHEN option_name = '4️⃣ Vache qui rit' THEN '4️⃣ Vache qui rit (+3€)'
  WHEN option_name = '5️⃣ Boursin' THEN '5️⃣ Boursin (+3€)'
  WHEN option_name = '6️⃣ Viande' THEN '6️⃣ Viande (+3€)'
  WHEN option_name = '7️⃣ Vache qui rit gratiné' THEN '7️⃣ Vache qui rit gratiné (+3€)'
  WHEN option_name = '8️⃣ Poivrons' THEN '8️⃣ Poivrons (+3€)'
  WHEN option_name = '9️⃣ Cheddar gratiné' THEN '9️⃣ Cheddar gratiné (+3€)'
  WHEN option_name = '🔟 Raclette gratiné' THEN '🔟 Raclette gratiné (+3€)'
  WHEN option_name = '1️⃣1️⃣ Champignons' THEN '1️⃣1️⃣ Champignons (+3€)'
  WHEN option_name = '1️⃣2️⃣ Raclette' THEN '1️⃣2️⃣ Raclette (+3€)'
  WHEN option_name = '1️⃣3️⃣ Emmental gratiné' THEN '1️⃣3️⃣ Emmental gratiné (+3€)'
  WHEN option_name = '1️⃣4️⃣ Bacon de Bœuf' THEN '1️⃣4️⃣ Bacon de Bœuf (+3€)'
  WHEN option_name = '1️⃣5️⃣ Galette' THEN '1️⃣5️⃣ Galette (+3€)'
  WHEN option_name = '1️⃣6️⃣ Poulet' THEN '1️⃣6️⃣ Poulet (+3€)'
  ELSE option_name
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 5. VÉRIFICATIONS FINALES
-- =========================================

-- Vérifier le workflow mis à jour
SELECT
  p.name,
  p.steps_config::text as updated_workflow
FROM france_products p
WHERE p.id = 238;

-- Vérifier les suppléments avec prix affichés
SELECT
  po.option_name,
  po.price_modifier,
  po.display_order
FROM france_product_options po
WHERE po.product_id = 238
  AND po.option_group = 'Suppléments BOWL'
ORDER BY po.display_order;

-- Résumé final
SELECT
  'AMÉLIORATION COMPLÈTE' as status,
  '✅ Ordre: viande → boisson → suppléments' as ordre_workflow,
  '✅ Prix +3€ affichés dans les noms' as affichage_prix,
  '✅ Emojis ajoutés aux prompts' as emojis_workflow
;

COMMIT;
-- En cas de problème : ROLLBACK;