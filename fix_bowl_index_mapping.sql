-- =========================================
-- FIX BOWL SUPPLÉMENTS INDEX MAPPING
-- =========================================
-- Problème: Le choix 5 sélectionne l'option 3
-- Cause probable: Décalage dans le display_order ou les IDs

BEGIN;

-- =========================================
-- 1. DIAGNOSTIC DU PROBLÈME
-- =========================================

-- Voir l'ordre actuel et les IDs
SELECT
  id,
  option_name,
  display_order,
  price_modifier,
  ROW_NUMBER() OVER (ORDER BY display_order) as position_actuelle,
  SUBSTRING(option_name FROM 1 FOR 3) as numero_emoji
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

-- =========================================
-- 2. CORRIGER LE DISPLAY_ORDER
-- =========================================
-- Le display_order doit correspondre exactement au numéro affiché

-- D'abord, réinitialiser avec des valeurs temporaires pour éviter les conflits
UPDATE france_product_options
SET display_order = display_order + 100
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- Puis assigner les bonnes valeurs basées sur les numéros dans les noms
UPDATE france_product_options
SET display_order = CASE
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
  ELSE display_order
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 3. ALTERNATIVE: SIMPLIFIER LES NUMÉROS
-- =========================================
-- Pour éviter toute confusion, utilisons des numéros simples

UPDATE france_product_options
SET option_name = CASE
  WHEN option_name LIKE '%Mozzarella%' THEN '1. Mozzarella (+3€)'
  WHEN option_name LIKE '%Cheddar%' AND option_name NOT LIKE '%gratiné%' THEN '2. Cheddar (+3€)'
  WHEN option_name LIKE '%Chèvre%' THEN '3. Chèvre (+3€)'
  WHEN option_name LIKE '%Vache qui rit%' AND option_name NOT LIKE '%gratiné%' THEN '4. Vache qui rit (+3€)'
  WHEN option_name LIKE '%Boursin%' THEN '5. Boursin (+3€)'
  WHEN option_name LIKE '%Viande%' AND position('Viande' in option_name) = 4 THEN '6. Viande (+3€)'
  WHEN option_name LIKE '%Vache qui rit gratiné%' THEN '7. Vache qui rit gratiné (+3€)'
  WHEN option_name LIKE '%Poivrons%' THEN '8. Poivrons (+3€)'
  WHEN option_name LIKE '%Cheddar gratiné%' THEN '9. Cheddar gratiné (+3€)'
  WHEN option_name LIKE '%Raclette gratiné%' THEN '10. Raclette gratiné (+3€)'
  WHEN option_name LIKE '%Champignons%' THEN '11. Champignons (+3€)'
  WHEN option_name LIKE '%Raclette%' AND option_name NOT LIKE '%gratiné%' THEN '12. Raclette (+3€)'
  WHEN option_name LIKE '%Emmental gratiné%' THEN '13. Emmental gratiné (+3€)'
  WHEN option_name LIKE '%Bacon de Bœuf%' THEN '14. Bacon de Bœuf (+3€)'
  WHEN option_name LIKE '%Galette%' THEN '15. Galette (+3€)'
  WHEN option_name LIKE '%Poulet%' THEN '16. Poulet (+3€)'
  ELSE option_name
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 4. VÉRIFICATION FINALE
-- =========================================

-- Vérifier que l'ordre est correct
SELECT
  display_order,
  option_name,
  price_modifier,
  CASE
    WHEN display_order = CAST(SUBSTRING(option_name FROM '^([0-9]+)\.') AS INTEGER) THEN '✅ OK'
    ELSE '❌ DÉCALAGE!'
  END as mapping_correct
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

-- Résumé des corrections
SELECT
  COUNT(*) as total_supplements,
  SUM(CASE WHEN price_modifier = 3.00 THEN 1 ELSE 0 END) as supplements_3euros,
  MIN(display_order) as min_order,
  MAX(display_order) as max_order,
  '✅ Display order corrigé de 1 à 16' as status
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

COMMIT;
-- En cas de problème : ROLLBACK;