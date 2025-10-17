-- ========================================================================
-- SCRIPT DE CORRECTION - COMPOSITIONS SANDWICHS MANQUANTES
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- PRODUIT: SANDWICHS (ID: 663)
--
-- PROBLÈME: Les compositions des sandwichs sont vides (NULL)
-- SOLUTION: Ajouter les compositions manquantes
-- ========================================================================

BEGIN;

-- Mettre à jour les compositions des 11 sandwichs
UPDATE france_product_options
SET composition = 'Émincés de kebab, fromage'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'LE GREC';

UPDATE france_product_options
SET composition = 'Escalope de poulet, fromage'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'L''ESCALOPE';

UPDATE france_product_options
SET composition = 'Émincés de kebab & de poulet'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'LE BUFFALO';

UPDATE france_product_options
SET composition = 'Escalope, galette de P.D.T, cheddar, fromage raclette'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'FOREST';

UPDATE france_product_options
SET composition = 'Poulet mariné au tandoori, fromage'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'LE TANDOORI';

UPDATE france_product_options
SET composition = 'Escalope de poulet, fromage, boursin'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'LE BOURSIN';

UPDATE france_product_options
SET composition = 'Escalope, cordon bleu, cheddar, crudités'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'ROYAL';

UPDATE france_product_options
SET composition = '3 Steaks de 45g, œuf, fromage'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'AMÉRICAIN';

UPDATE france_product_options
SET composition = 'Escalope de poulet, sauce gruyère, fromage râpé'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'DU CHEF';

UPDATE france_product_options
SET composition = 'Steak de 45g, cordon bleu, fromage'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'LE RADICAL';

UPDATE france_product_options
SET composition = '2 steaks, œufs, galette de P.D.T, cheddar, raclette'
WHERE product_id = 663
  AND option_group = 'Plats'
  AND option_name = 'RACLETTE';

-- Vérification
SELECT
    option_name AS "Sandwich",
    composition AS "Composition",
    CASE WHEN composition IS NULL OR composition = '' THEN '❌ VIDE' ELSE '✅ OK' END AS "Statut"
FROM france_product_options
WHERE product_id = 663
  AND option_group = 'Plats'
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU: 11 compositions ajoutées
-- ========================================================================
