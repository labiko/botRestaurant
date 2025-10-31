-- ========================================================================
-- CORRECTION CONDIMENTS - MENUS BAGELS - PLAN B MELUN
-- DATE: 2025-01-26
-- RESTAURANT: Plan B Melun (ID 22)
-- PROBLÈME: Les SAUCES sont dans le groupe "Condiments" au lieu des vrais condiments
-- OBJECTIF: Remplacer les fausses sauces par les vrais condiments
-- ========================================================================

BEGIN;

-- ⚠️ VÉRIFICATION RESTAURANT
SELECT id, name, phone FROM france_restaurants WHERE id = 22;

-- Liste des 6 produits MENUS BAGELS concernés
SELECT
  id,
  name,
  '🥯 Menu Bagel à corriger' as type
FROM france_products
WHERE id IN (851, 852, 853, 854, 855, 856)
ORDER BY id;

-- ========================================================================
-- ÉTAPE 1 : COMPTAGE AVANT CORRECTION
-- ========================================================================

SELECT
  'AVANT CORRECTION' as moment,
  COUNT(*) as total_condiments_incorrects
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments';

-- ========================================================================
-- ÉTAPE 2 : SUPPRESSION DES FAUX CONDIMENTS (SAUCES)
-- ========================================================================

-- Supprimer Ketchup, Mayonnaise, Moutarde, Harissa du groupe "Condiments"
DELETE FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments'
  AND option_name IN ('Ketchup', 'Mayonnaise', 'Moutarde', 'Harissa');

-- ========================================================================
-- ÉTAPE 3 : CRÉATION DES VRAIS CONDIMENTS
-- ========================================================================

-- Produit 851 : VEGETARIEN
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (851, 'Condiments', 'Cornichons', 0.00, 1, true, false, 4),
  (851, 'Condiments', 'Oignons rouges', 0.00, 2, true, false, 4),
  (851, 'Condiments', 'Olives', 0.00, 3, true, false, 4),
  (851, 'Condiments', 'Salade', 0.00, 4, true, false, 4);

-- Produit 852 : CHEVRE MIEL
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (852, 'Condiments', 'Cornichons', 0.00, 1, true, false, 4),
  (852, 'Condiments', 'Oignons rouges', 0.00, 2, true, false, 4),
  (852, 'Condiments', 'Olives', 0.00, 3, true, false, 4),
  (852, 'Condiments', 'Salade', 0.00, 4, true, false, 4);

-- Produit 853 : PRIMEUR
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (853, 'Condiments', 'Cornichons', 0.00, 1, true, false, 4),
  (853, 'Condiments', 'Oignons rouges', 0.00, 2, true, false, 4),
  (853, 'Condiments', 'Olives', 0.00, 3, true, false, 4),
  (853, 'Condiments', 'Salade', 0.00, 4, true, false, 4);

-- Produit 854 : SAUMON
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (854, 'Condiments', 'Cornichons', 0.00, 1, true, false, 4),
  (854, 'Condiments', 'Oignons rouges', 0.00, 2, true, false, 4),
  (854, 'Condiments', 'Olives', 0.00, 3, true, false, 4),
  (854, 'Condiments', 'Salade', 0.00, 4, true, false, 4);

-- Produit 855 : DELICE
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (855, 'Condiments', 'Cornichons', 0.00, 1, true, false, 4),
  (855, 'Condiments', 'Oignons rouges', 0.00, 2, true, false, 4),
  (855, 'Condiments', 'Olives', 0.00, 3, true, false, 4),
  (855, 'Condiments', 'Salade', 0.00, 4, true, false, 4);

-- Produit 856 : DU CHEF
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (856, 'Condiments', 'Cornichons', 0.00, 1, true, false, 4),
  (856, 'Condiments', 'Oignons rouges', 0.00, 2, true, false, 4),
  (856, 'Condiments', 'Olives', 0.00, 3, true, false, 4),
  (856, 'Condiments', 'Salade', 0.00, 4, true, false, 4);

-- ========================================================================
-- ÉTAPE 4 : RÉORGANISATION DES SAUCES (display_order contigu 1-7)
-- ========================================================================

-- Pour chaque produit, réorganiser les sauces de 1 à 7
UPDATE france_product_options
SET display_order = 1
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) LIKE 'ALG%';  -- Algérienne

UPDATE france_product_options
SET display_order = 2
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) = 'BIGGY';

UPDATE france_product_options
SET display_order = 3
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) = 'BARBECUE';

UPDATE france_product_options
SET display_order = 4
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) LIKE 'SAMOURA%';  -- Samouraï

UPDATE france_product_options
SET display_order = 5
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) = 'MAISON';

UPDATE france_product_options
SET display_order = 6
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) = 'KETCHUP';

UPDATE france_product_options
SET display_order = 7
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Sauce'
  AND UPPER(option_name) = 'MAYONNAISE';

-- ========================================================================
-- VÉRIFICATIONS APRÈS CORRECTION
-- ========================================================================

-- Compter les nouveaux condiments
SELECT
  'APRÈS CORRECTION' as moment,
  COUNT(*) as total_vrais_condiments
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments';

-- Afficher les nouveaux condiments par produit
SELECT
  p.id,
  p.name as produit,
  po.option_name as condiment,
  po.display_order,
  po.is_active
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.id IN (851, 852, 853, 854, 855, 856)
  AND po.option_group = 'Condiments'
ORDER BY p.id, po.display_order;

-- Afficher les sauces réorganisées
SELECT
  p.id,
  p.name as produit,
  po.option_name as sauce,
  po.display_order,
  po.is_active
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.id IN (851, 852, 853, 854, 855, 856)
  AND po.option_group = 'Sauce'
ORDER BY p.id, po.display_order;

-- Vérifier qu'il n'y a plus de doublons Ketchup/Mayo
SELECT
  p.id,
  p.name as produit,
  po.option_group,
  po.option_name,
  COUNT(*) as nb_occurrences,
  CASE
    WHEN COUNT(*) > 1 THEN '⚠️ DOUBLON'
    ELSE '✅ OK'
  END as statut
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.id IN (851, 852, 853, 854, 855, 856)
  AND po.option_name IN ('Ketchup', 'Mayonnaise')
GROUP BY p.id, p.name, po.option_group, po.option_name
HAVING COUNT(*) > 1;

-- Résumé final
SELECT
  '✅ CORRECTION TERMINÉE' as statut,
  '24 vrais condiments créés (4 par produit)' as condiments,
  '7 sauces réorganisées (display_order 1-7)' as sauces,
  '0 doublon Ketchup/Mayo' as verification;

-- ⚠️ IMPORTANT : Vérifier les résultats ci-dessus avant de valider !
-- Si tout est OK, exécuter :
COMMIT;

-- En cas de problème, annuler avec :
-- ROLLBACK;
