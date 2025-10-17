-- ========================================================================
-- SCRIPT DE CORRECTION - AJOUT COMPOSITIONS BURGERS PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- PRODUIT: BURGERS composite (ID: 658)
--
-- OBJECTIF: Ajouter les compositions manquantes aux options du groupe "Plats"
-- PROBLÈME: Les compositions des anciens burgers n'ont pas été transférées
-- ========================================================================

BEGIN;

-- ========================================================================
-- MISE À JOUR DES COMPOSITIONS
-- ========================================================================

-- 1. CHEESEBURGER
UPDATE france_product_options
SET composition = 'Steak 45g, fromage, cornichon'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'CHEESEBURGER';

-- 2. DOUBLE CHEESEBURGER
UPDATE france_product_options
SET composition = '2 Steaks 45g, fromage, cornichons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'DOUBLE CHEESEBURGER';

-- 3. BIG CHEESE
UPDATE france_product_options
SET composition = '2 Steaks 45g, cheddar, salade, oignons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'BIG CHEESE';

-- 4. LE FISH
UPDATE france_product_options
SET composition = 'Filet de poisson pané, fromage, cornichons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'LE FISH';

-- 5. LE CHICKEN
UPDATE france_product_options
SET composition = 'Galette de poulet pané, fromage, cornichons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'LE CHICKEN';

-- 6. LE TOWER
UPDATE france_product_options
SET composition = 'Galette de poulet pané, crusty, fromage, cornichons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'LE TOWER';

-- 7. GÉANT
UPDATE france_product_options
SET composition = 'Steak 90g, salade'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'GÉANT';

-- 8. 180
UPDATE france_product_options
SET composition = '2 Steaks 90g, cheddar, tomates, oignons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = '180';

-- 9. LE BACON
UPDATE france_product_options
SET composition = '2 Steaks 90g, fromage, œuf, bacon, cornichons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = 'LE BACON';

-- 10. 270
UPDATE france_product_options
SET composition = '3 Steaks 90g, salade, tomates, cornichons'
WHERE product_id = 658
AND option_group = 'Plats'
AND option_name = '270';

-- ========================================================================
-- VÉRIFICATIONS POST-CORRECTION
-- ========================================================================

-- Vérifier que toutes les compositions sont ajoutées
SELECT
    option_name AS "Burger",
    composition AS "Composition",
    CASE WHEN composition IS NULL OR composition = '' THEN '❌ MANQUANT' ELSE '✅ OK' END AS "Status"
FROM france_product_options
WHERE product_id = 658
AND option_group = 'Plats'
ORDER BY display_order;

-- Compter les burgers avec composition
SELECT
    COUNT(*) AS "Burgers avec composition",
    COUNT(*) FILTER (WHERE composition IS NOT NULL AND composition != '') AS "Compositions OK",
    COUNT(*) FILTER (WHERE composition IS NULL OR composition = '') AS "Compositions manquantes"
FROM france_product_options
WHERE product_id = 658
AND option_group = 'Plats';

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;
