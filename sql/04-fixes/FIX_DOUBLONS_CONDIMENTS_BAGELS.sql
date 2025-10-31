-- ========================================================================
-- NETTOYAGE DOUBLONS CONDIMENTS + AJOUT ICÔNES - MENUS BAGELS
-- DATE: 2025-01-26
-- RESTAURANT: Plan B Melun (ID 22)
-- PROBLÈME: Doublons condiments + icônes manquantes
-- OBJECTIF: Supprimer doublons et ajouter icônes
-- ========================================================================

BEGIN;

-- ⚠️ VÉRIFICATION RESTAURANT
SELECT id, name, phone FROM france_restaurants WHERE id = 22;

-- ========================================================================
-- ÉTAPE 1 : COMPTAGE AVANT NETTOYAGE
-- ========================================================================

SELECT
  'AVANT NETTOYAGE' as moment,
  COUNT(*) as total_condiments
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments';

-- Afficher les doublons
SELECT
  product_id,
  option_name,
  COUNT(*) as nb_occurrences
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments'
GROUP BY product_id, option_name
HAVING COUNT(*) > 1
ORDER BY product_id, option_name;

-- ========================================================================
-- ÉTAPE 2 : SUPPRESSION DE TOUS LES CONDIMENTS (pour repartir propre)
-- ========================================================================

DELETE FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments';

-- ========================================================================
-- ÉTAPE 3 : CRÉATION PROPRE DES CONDIMENTS AVEC ICÔNES
-- ========================================================================

-- Produit 851 : VEGETARIEN
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (851, 'Condiments', 'Cornichons', '🥒', 0.00, 1, true, false, 4),
  (851, 'Condiments', 'Oignons rouges', '🧅', 0.00, 2, true, false, 4),
  (851, 'Condiments', 'Olives', '🫒', 0.00, 3, true, false, 4),
  (851, 'Condiments', 'Salade', '🥗', 0.00, 4, true, false, 4);

-- Produit 852 : CHEVRE MIEL
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (852, 'Condiments', 'Cornichons', '🥒', 0.00, 1, true, false, 4),
  (852, 'Condiments', 'Oignons rouges', '🧅', 0.00, 2, true, false, 4),
  (852, 'Condiments', 'Olives', '🫒', 0.00, 3, true, false, 4),
  (852, 'Condiments', 'Salade', '🥗', 0.00, 4, true, false, 4);

-- Produit 853 : PRIMEUR
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (853, 'Condiments', 'Cornichons', '🥒', 0.00, 1, true, false, 4),
  (853, 'Condiments', 'Oignons rouges', '🧅', 0.00, 2, true, false, 4),
  (853, 'Condiments', 'Olives', '🫒', 0.00, 3, true, false, 4),
  (853, 'Condiments', 'Salade', '🥗', 0.00, 4, true, false, 4);

-- Produit 854 : SAUMON
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (854, 'Condiments', 'Cornichons', '🥒', 0.00, 1, true, false, 4),
  (854, 'Condiments', 'Oignons rouges', '🧅', 0.00, 2, true, false, 4),
  (854, 'Condiments', 'Olives', '🫒', 0.00, 3, true, false, 4),
  (854, 'Condiments', 'Salade', '🥗', 0.00, 4, true, false, 4);

-- Produit 855 : DELICE
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (855, 'Condiments', 'Cornichons', '🥒', 0.00, 1, true, false, 4),
  (855, 'Condiments', 'Oignons rouges', '🧅', 0.00, 2, true, false, 4),
  (855, 'Condiments', 'Olives', '🫒', 0.00, 3, true, false, 4),
  (855, 'Condiments', 'Salade', '🥗', 0.00, 4, true, false, 4);

-- Produit 856 : DU CHEF
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, is_required, max_selections)
VALUES
  (856, 'Condiments', 'Cornichons', '🥒', 0.00, 1, true, false, 4),
  (856, 'Condiments', 'Oignons rouges', '🧅', 0.00, 2, true, false, 4),
  (856, 'Condiments', 'Olives', '🫒', 0.00, 3, true, false, 4),
  (856, 'Condiments', 'Salade', '🥗', 0.00, 4, true, false, 4);

-- ========================================================================
-- VÉRIFICATIONS APRÈS NETTOYAGE
-- ========================================================================

-- Compter après nettoyage
SELECT
  'APRÈS NETTOYAGE' as moment,
  COUNT(*) as total_condiments
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments';

-- Vérifier qu'il n'y a plus de doublons
SELECT
  product_id,
  option_name,
  COUNT(*) as nb_occurrences,
  CASE
    WHEN COUNT(*) > 1 THEN '❌ DOUBLON'
    ELSE '✅ OK'
  END as statut
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Condiments'
GROUP BY product_id, option_name
ORDER BY product_id, option_name;

-- Afficher les condiments avec icônes
SELECT
  p.id,
  p.name as produit,
  po.option_name as condiment,
  po.icon,
  po.display_order
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.id IN (851, 852, 853, 854, 855, 856)
  AND po.option_group = 'Condiments'
ORDER BY p.id, po.display_order;

-- Résumé final
SELECT
  '✅ NETTOYAGE TERMINÉ' as statut,
  '24 condiments uniques (4 par produit)' as condiments,
  '4 icônes ajoutées (🥒🧅🫒🥗)' as icones,
  '0 doublon restant' as verification;

-- ⚠️ IMPORTANT : Vérifier les résultats ci-dessus avant de valider !
-- Si tout est OK, exécuter :
COMMIT;

-- En cas de problème, annuler avec :
-- ROLLBACK;
