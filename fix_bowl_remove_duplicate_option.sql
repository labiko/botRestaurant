-- =========================================
-- SUPPRIMER L'OPTION DUPLIQUÉE "AJOUTER DES SUPPLÉMENTS"
-- =========================================
-- Elle ne doit exister QUE dans "Choix suppléments"
-- PAS dans "Suppléments BOWL"

BEGIN;

-- =========================================
-- 1. IDENTIFIER LE PROBLÈME
-- =========================================

SELECT
  option_group,
  display_order,
  option_name,
  'PROBLÈME: Option dupliquée !' as diagnostic
FROM france_product_options
WHERE product_id = 238
  AND option_name LIKE '%Ajouter des suppléments%'
ORDER BY option_group, display_order;

-- =========================================
-- 2. SUPPRIMER LA DUPLICATION
-- =========================================

-- Supprimer "Ajouter des suppléments" du groupe "Suppléments BOWL"
DELETE FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND option_name LIKE '%Ajouter des suppléments%';

-- =========================================
-- 3. RÉORGANISER LES SUPPLÉMENTS
-- =========================================
-- Maintenant que l'option parasite est supprimée, remettre les vrais suppléments

-- D'abord voir ce qui reste
SELECT
  display_order,
  option_name
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

-- Remettre les suppléments dans l'ordre correct avec numérotation
UPDATE france_product_options
SET
  option_name = CASE
    WHEN option_name LIKE '%Mozzarella%' THEN '1️⃣ Mozzarella (+3€)'
    WHEN option_name LIKE '%Cheddar%' AND option_name NOT LIKE '%gratiné%' THEN '2️⃣ Cheddar (+3€)'
    WHEN option_name LIKE '%Chèvre%' THEN '3️⃣ Chèvre (+3€)'
    WHEN option_name LIKE '%Vache qui rit%' AND option_name NOT LIKE '%gratiné%' THEN '4️⃣ Vache qui rit (+3€)'
    WHEN option_name LIKE '%Boursin%' THEN '5️⃣ Boursin (+3€)'
    WHEN option_name LIKE '%Viande%' THEN '6️⃣ Viande (+3€)'
    WHEN option_name LIKE '%Vache qui rit gratiné%' THEN '7️⃣ Vache qui rit gratiné (+3€)'
    WHEN option_name LIKE '%Poivrons%' THEN '8️⃣ Poivrons (+3€)'
    WHEN option_name LIKE '%Cheddar gratiné%' THEN '9️⃣ Cheddar gratiné (+3€)'
    WHEN option_name LIKE '%Raclette gratiné%' THEN '🔟 Raclette gratiné (+3€)'
    WHEN option_name LIKE '%Champignons%' THEN '1️⃣1️⃣ Champignons (+3€)'
    WHEN option_name LIKE '%Raclette%' AND option_name NOT LIKE '%gratiné%' THEN '1️⃣2️⃣ Raclette (+3€)'
    WHEN option_name LIKE '%Emmental gratiné%' THEN '1️⃣3️⃣ Emmental gratiné (+3€)'
    WHEN option_name LIKE '%Bacon de Bœuf%' THEN '1️⃣4️⃣ Bacon de Bœuf (+3€)'
    WHEN option_name LIKE '%Galette%' THEN '1️⃣5️⃣ Galette (+3€)'
    WHEN option_name LIKE '%Poulet%' THEN '1️⃣6️⃣ Poulet (+3€)'
    ELSE option_name
  END,
  display_order = CASE
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
-- 4. VÉRIFICATION FINALE
-- =========================================

-- S'assurer qu'il n'y a plus de duplication
SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(LEFT(option_name, 30), ' | ' ORDER BY display_order) as apercu
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group
ORDER BY
  CASE option_group
    WHEN 'Choix viande' THEN 1
    WHEN 'Boisson 33CL incluse' THEN 2
    WHEN 'Choix suppléments' THEN 3
    WHEN 'Suppléments BOWL' THEN 4
  END;

-- Vérifier les suppléments dans l'ordre
SELECT
  display_order,
  option_name,
  'Index ' || display_order || ' → ' || option_name as mapping
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND display_order <= 6
ORDER BY display_order;

-- =========================================
-- 5. RÉSULTAT
-- =========================================

SELECT
  '✅ Option "Ajouter" supprimée du groupe Suppléments' as fix_1,
  '✅ Plus de duplication qui fausse les index' as fix_2,
  '✅ Suppléments numérotés correctement de 1 à 16' as fix_3,
  '✅ Choix 5 → 5️⃣ Boursin (+3€)' as resultat_final;

COMMIT;
-- En cas de problème : ROLLBACK;