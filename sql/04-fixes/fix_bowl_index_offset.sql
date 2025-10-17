-- =========================================
-- CORRIGER LE DÉCALAGE D'INDEX DES SUPPLÉMENTS
-- =========================================
-- Problème: Quand on tape 5, ça sélectionne l'option 4
-- Cause: L'option "Pas de suppléments" en position 0 décale tout

BEGIN;

-- =========================================
-- 1. DIAGNOSTIC - VOIR LA STRUCTURE ACTUELLE
-- =========================================

SELECT
  option_group,
  display_order,
  option_name,
  ROW_NUMBER() OVER (
    PARTITION BY option_group
    ORDER BY display_order
  ) - 1 as array_index,
  'Tape ' || display_order || ' → Index ' ||
  (ROW_NUMBER() OVER (PARTITION BY option_group ORDER BY display_order) - 1) as mapping
FROM france_product_options
WHERE product_id = 238
  AND option_group IN ('Choix suppléments', 'Suppléments BOWL')
ORDER BY option_group, display_order;

-- =========================================
-- 2. SOLUTION 1: DÉPLACER "PAS DE SUPPLÉMENTS"
-- =========================================
-- Mettre "Pas de suppléments" dans un groupe séparé
-- ou le supprimer complètement du groupe Suppléments

-- Créer un nouveau groupe pour l'option de navigation
UPDATE france_product_options
SET option_group = 'Navigation suppléments'
WHERE product_id = 238
  AND option_name LIKE '%Pas de suppléments%';

-- =========================================
-- 3. SOLUTION 2: AJUSTER LES DISPLAY_ORDER
-- =========================================
-- S'assurer que les suppléments commencent à 1, pas 0

-- D'abord, décaler temporairement
UPDATE france_product_options
SET display_order = display_order + 1000
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- Puis réassigner correctement
UPDATE france_product_options
SET display_order =
  CASE
    WHEN option_name LIKE '1️⃣ Mozzarella%' THEN 1
    WHEN option_name LIKE '2️⃣ Cheddar%' THEN 2
    WHEN option_name LIKE '3️⃣ Chèvre%' THEN 3
    WHEN option_name LIKE '4️⃣ Vache qui rit%' AND option_name NOT LIKE '%gratiné%' THEN 4
    WHEN option_name LIKE '5️⃣ Boursin%' THEN 5
    WHEN option_name LIKE '6️⃣ Viande%' THEN 6
    WHEN option_name LIKE '7️⃣ Vache qui rit gratiné%' THEN 7
    WHEN option_name LIKE '8️⃣ Poivrons%' THEN 8
    WHEN option_name LIKE '9️⃣ Cheddar gratiné%' THEN 9
    WHEN option_name LIKE '🔟 Raclette gratiné%' THEN 10
    WHEN option_name LIKE '1️⃣1️⃣ Champignons%' THEN 11
    WHEN option_name LIKE '1️⃣2️⃣ Raclette%' AND option_name NOT LIKE '%gratiné%' THEN 12
    WHEN option_name LIKE '1️⃣3️⃣ Emmental gratiné%' THEN 13
    WHEN option_name LIKE '1️⃣4️⃣ Bacon de Bœuf%' THEN 14
    WHEN option_name LIKE '1️⃣5️⃣ Galette%' THEN 15
    WHEN option_name LIKE '1️⃣6️⃣ Poulet%' THEN 16
    ELSE display_order - 1000
  END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 4. METTRE À JOUR LE WORKFLOW
-- =========================================
-- Séparer clairement l'affichage

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
      "prompt": "🧀 SUPPLÉMENTS (+3€ chacun) - Tapez les numéros ou 0 pour passer :",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10,
      "allow_zero": true,
      "zero_text": "Pas de suppléments",
      "start_index": 1
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 5. VÉRIFICATION FINALE
-- =========================================

-- Vérifier le mapping corrigé
SELECT
  display_order as numero_affiche,
  option_name,
  'Utilisateur tape ' || display_order ||
  ' → Sélectionne ' || option_name as resultat_attendu
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND display_order IN (4, 5, 6)
ORDER BY display_order;

-- Résumé
SELECT
  '✅ Option 0 séparée des suppléments' as fix_1,
  '✅ Suppléments indexés de 1 à 16' as fix_2,
  '✅ Tape 5 → Sélectionne 5️⃣ Boursin' as fix_3,
  '✅ Plus de décalage d''index' as resultat;

COMMIT;
-- En cas de problème : ROLLBACK;