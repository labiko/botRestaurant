-- ========================================================================
-- CORRECTION COMPLÈTE TROISIÈME PIZZA OFFERTE - OFFRE 1
-- DATE: 2025-10-21
-- ========================================================================
-- PROBLÈME IDENTIFIÉ :
--   - 29 pizzas actuellement (au lieu de 27 attendues)
--   - TARTIFLETTE ABSENTE (doit être présente avec price_modifier = 0.00)
--   - 3 pizzas EN TROP : 4 SAISONS, 4 FROMAGES, 4 JAMBONS
--
-- SOLUTION :
--   1. SUPPRIMER : 4 SAISONS, 4 FROMAGES, 4 JAMBONS
--   2. AJOUTER : TARTIFLETTE (price_modifier = 0.00, offerte)
--
-- RÉSULTAT : 29 - 3 + 1 = 27 pizzas ✅
-- ========================================================================

BEGIN;

-- ========================================================================
-- ÉTAPE 1 : VÉRIFICATIONS AVANT MODIFICATION
-- ========================================================================

-- Compter pizzas actuelles
SELECT
  COUNT(*) AS total_actuel,
  '29' AS attendu_avant_fix
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza';

-- Vérifier présence des 3 pizzas à supprimer
SELECT
  po.option_name,
  po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
  AND po.option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS')
ORDER BY po.option_name;

-- Vérifier absence de TARTIFLETTE
SELECT
  COUNT(*) AS tartiflette_count,
  '0 avant, 1 après' AS attendu
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
  AND po.option_name = 'TARTIFLETTE';

-- ========================================================================
-- ÉTAPE 2 : SUPPRESSION DES 3 PIZZAS EN TROP
-- ========================================================================

DELETE FROM france_product_options
WHERE product_id = (
    SELECT id FROM france_products
    WHERE name = '2 PIZZAS ACHETEES LA 3EME OFFERTE' AND restaurant_id = 22
  )
  AND option_group = 'Troisième Pizza'
  AND option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS');

-- Vérifier suppression
SELECT
  COUNT(*) AS supprimees,
  '0' AS attendu
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
  AND po.option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS');

-- ========================================================================
-- ÉTAPE 3 : AJOUT DE TARTIFLETTE (OFFERTE)
-- ========================================================================

-- Récupérer les données de TARTIFLETTE depuis "Première Pizza"
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  composition,
  price_modifier,
  icon,
  display_order,
  is_active
)
SELECT
  po.product_id,
  'Troisième Pizza' AS option_group,
  po.option_name,
  po.composition,
  0.00 AS price_modifier,  -- OFFERTE = 0€
  po.icon,
  po.display_order,
  true AS is_active
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Première Pizza'
  AND po.option_name = 'TARTIFLETTE';

-- ========================================================================
-- ÉTAPE 4 : VÉRIFICATIONS FINALES
-- ========================================================================

-- 1. Compter total (doit être 27)
SELECT
  COUNT(*) AS total_final,
  '27' AS attendu
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza';

-- 2. Vérifier TARTIFLETTE présente avec price_modifier = 0.00
SELECT
  po.option_name,
  po.price_modifier,
  po.icon,
  'DOIT être 0.00' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
  AND po.option_name = 'TARTIFLETTE';

-- 3. Vérifier que les 3 pizzas sont bien absentes
SELECT
  COUNT(*) AS pizzas_exclues_count,
  '0' AS attendu
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
  AND po.option_name IN ('4 SAISONS', '4 FROMAGES', '4 JAMBONS');

-- 4. Liste complète finale des 27 pizzas
SELECT
  po.option_name,
  po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND p.name = '2 PIZZAS ACHETEES LA 3EME OFFERTE'
  AND po.option_group = 'Troisième Pizza'
ORDER BY po.option_name;

COMMIT;

-- ========================================================================
-- RÉSULTAT FINAL ATTENDU :
-- ========================================================================
-- Total : 27 pizzas dans "Troisième Pizza OFFERTE"
--
-- INCLUSES (27 pizzas) :
-- REGINA, BARBECUE, NAPOLITAINE, TEXAS, TORINO, SPECIALE, CAMPIONE, CHICKEN,
-- SUPER, PAYSANNE, VEGETARIENNE, ORIENTALE, VENEZIA, INDIENNE, PRONTO, OSLO,
-- TARTIFLETTE ✅, SELSA, CHEVRE MIEL, TEXANE, MIA, BOURSIN, RACLETTE,
-- FERMIERE POULET, FERMIERE VIANDE HACHEE, GORGONZOLA, CAMPAGNARDE
--
-- EXCLUES (3 pizzas) :
-- 4 SAISONS ❌, 4 FROMAGES ❌, 4 JAMBONS ❌
-- ========================================================================
