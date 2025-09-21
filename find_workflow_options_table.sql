-- =========================================
-- TROUVER LA VRAIE TABLE DES OPTIONS WORKFLOW
-- =========================================

-- =========================================
-- 1. RECHERCHE TOUTES LES TABLES AVEC "OPTION" DANS LE NOM
-- =========================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE '%option%' OR table_name LIKE '%composite%' OR table_name LIKE '%item%')
ORDER BY table_name;

-- =========================================
-- 2. ANALYSE DU STEPS_CONFIG - EXTRAIRE LES GROUPES
-- =========================================

SELECT
  id,
  name,
  jsonb_array_elements(steps_config->'steps') as step_detail
FROM france_products
WHERE id = 579;

-- =========================================
-- 3. EXTRAIRE LES NOMS DES GROUPES D'OPTIONS
-- =========================================

WITH step_groups AS (
  SELECT
    jsonb_array_elements(
      jsonb_array_elements(steps_config->'steps')->'option_groups'
    )::text as group_name
  FROM france_products
  WHERE id = 579
)
SELECT DISTINCT
  replace(group_name, '"', '') as "Groupe d'options requis"
FROM step_groups;

-- =========================================
-- 4. RECHERCHE DANS TOUTES LES TABLES POSSIBLES
-- =========================================

-- Chercher les tables qui pourraient contenir ces groupes
SELECT
  'france_menu_items' as table_name,
  COUNT(*) as total_rows,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'france_menu_items' AND column_name = 'option_group') as has_option_group_column
WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'france_menu_items');

-- =========================================
-- 5. DIAGNOSTIC SIMPLE - QUE FAUT-IL RÉPARER ?
-- =========================================

SELECT
  '🔍 DIAGNOSTIC FINAL' as analyse,

  '❌ france_composite_items n''est pas la bonne table (structure différente)' as probleme_1,

  '❌ price_on_site_base est NULL - doit être calculé ou fixé' as probleme_2,

  '✅ steps_config existe avec 6 étapes configurées' as point_positif,

  '⚠️ Il faut trouver où sont stockées les options par groupe ou les créer' as action_requise;

-- =========================================
-- 6. SOLUTION TEMPORAIRE - CALCULER LE PRIX MANQUANT
-- =========================================

SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  CASE
    WHEN price_on_site_base IS NULL AND price_delivery_base IS NOT NULL
    THEN price_delivery_base - 1.0
    ELSE price_on_site_base
  END as "Prix sur site calculé (livraison - 1€)"
FROM france_products
WHERE id = 579;

-- =========================================
-- 7. STRUCTURE ATTENDUE POUR L'INTERFACE
-- =========================================

SELECT
  'Interface workflow-edit doit charger:' as element,
  '1. Nom produit: FORMULE PIZZA COMPLÈTE' as donnee_1,
  '2. Prix sur site: 18€ (calculé depuis 19€ livraison)' as donnee_2,
  '3. Prix livraison: 19€' as donnee_3,
  '4. 6 étapes depuis steps_config JSON' as donnee_4,
  '5. Options par groupe - À CRÉER ou TROUVER' as donnee_5;