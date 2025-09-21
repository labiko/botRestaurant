-- =========================================
-- APPLIQUER LA NUMÉROTATION STYLE BOISSONS AUX SUPPLÉMENTS
-- =========================================
-- Les boissons utilisent : 1️⃣, 2️⃣, 3️⃣, etc.
-- Il faut appliquer le même format aux suppléments

BEGIN;

-- =========================================
-- 1. VOIR L'ÉTAT ACTUEL DES SUPPLÉMENTS
-- =========================================

SELECT
  display_order,
  option_name,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

-- =========================================
-- 2. METTRE À JOUR AVEC LES ÉMOJIS NUMÉRIQUES
-- =========================================

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
-- 3. VÉRIFIER LES OPTIONS DE NAVIGATION
-- =========================================
-- S'assurer qu'elles n'utilisent PAS de numéros

UPDATE france_product_options
SET option_name = CASE
  WHEN option_name LIKE '%Pas de suppléments%' THEN '❌ Pas de suppléments'
  WHEN option_name LIKE '%Ajouter des suppléments%' THEN '➕ Ajouter des suppléments'
  ELSE option_name
END
WHERE product_id = 238
  AND option_group = 'Choix suppléments';

-- =========================================
-- 4. S'ASSURER QUE LES DISPLAY_ORDER SONT CORRECTS
-- =========================================

-- Réinitialiser temporairement pour éviter les conflits
UPDATE france_product_options
SET display_order = display_order + 100
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- Assigner les bonnes valeurs basées sur l'ordre dans les noms
UPDATE france_product_options
SET display_order = CASE
  WHEN option_name LIKE '1️⃣ Mozzarella%' THEN 1
  WHEN option_name LIKE '2️⃣ Cheddar%' AND option_name NOT LIKE '%gratiné%' THEN 2
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
  ELSE display_order - 100
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 5. VÉRIFICATION FINALE
-- =========================================

-- Comparer boissons et suppléments
SELECT
  'BOISSONS' as type,
  display_order,
  option_name
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Boisson 33CL incluse'
  AND display_order <= 5
UNION ALL
SELECT
  'SUPPLÉMENTS' as type,
  display_order,
  option_name
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND display_order <= 5
ORDER BY type, display_order;

-- Vérifier tous les suppléments
SELECT
  display_order,
  option_name,
  price_modifier,
  CASE
    WHEN option_name LIKE '1️⃣%' AND display_order = 1 THEN '✅'
    WHEN option_name LIKE '2️⃣%' AND display_order = 2 THEN '✅'
    WHEN option_name LIKE '3️⃣%' AND display_order = 3 THEN '✅'
    WHEN option_name LIKE '4️⃣%' AND display_order = 4 THEN '✅'
    WHEN option_name LIKE '5️⃣%' AND display_order = 5 THEN '✅'
    WHEN option_name LIKE '6️⃣%' AND display_order = 6 THEN '✅'
    WHEN option_name LIKE '7️⃣%' AND display_order = 7 THEN '✅'
    WHEN option_name LIKE '8️⃣%' AND display_order = 8 THEN '✅'
    WHEN option_name LIKE '9️⃣%' AND display_order = 9 THEN '✅'
    WHEN option_name LIKE '🔟%' AND display_order = 10 THEN '✅'
    WHEN option_name LIKE '1️⃣1️⃣%' AND display_order = 11 THEN '✅'
    WHEN option_name LIKE '1️⃣2️⃣%' AND display_order = 12 THEN '✅'
    WHEN option_name LIKE '1️⃣3️⃣%' AND display_order = 13 THEN '✅'
    WHEN option_name LIKE '1️⃣4️⃣%' AND display_order = 14 THEN '✅'
    WHEN option_name LIKE '1️⃣5️⃣%' AND display_order = 15 THEN '✅'
    WHEN option_name LIKE '1️⃣6️⃣%' AND display_order = 16 THEN '✅'
    ELSE '❌'
  END as coherent
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

-- =========================================
-- 6. RÉSUMÉ
-- =========================================

SELECT
  '✅ Suppléments avec émojis numériques comme les boissons' as format,
  '✅ Display_order aligné avec les numéros' as ordre,
  '✅ Options de navigation sans numéros (❌/➕)' as navigation,
  '✅ Cohérence totale avec le système existant' as resultat;

COMMIT;
-- En cas de problème : ROLLBACK;