-- =========================================
-- ANALYSE VRAIES DONNÉES WORKFLOW - VERSION CORRIGÉE
-- =========================================

-- =========================================
-- 1. CONFIGURATION STEPS_CONFIG (CORRIGÉ)
-- =========================================

SELECT
  id,
  name,
  steps_config::text as "Configuration JSON"
FROM france_products
WHERE id = 579;

-- =========================================
-- 2. EXTRACTION DES ÉTAPES ET GROUPES
-- =========================================

SELECT
  (step_data->>'step')::int as "Numéro Étape",
  step_data->>'prompt' as "Question",
  step_data->>'required' as "Obligatoire",
  step_data->>'max_selections' as "Max Choix",
  trim(both '"' from group_name::text) as "Groupe d'Options"
FROM france_products,
     jsonb_array_elements(steps_config->'steps') as step_data,
     jsonb_array_elements(step_data->'option_groups') as group_name
WHERE id = 579
ORDER BY (step_data->>'step')::int;

-- =========================================
-- 3. GROUPES REQUIS PAR LE WORKFLOW
-- =========================================

SELECT DISTINCT
  trim(both '"' from group_name::text) as "Groupes requis"
FROM france_products,
     jsonb_array_elements(steps_config->'steps') as step_data,
     jsonb_array_elements(step_data->'option_groups') as group_name
WHERE id = 579
ORDER BY 1;

-- =========================================
-- 4. ANALYSE france_product_options
-- =========================================

-- Structure de la table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'france_product_options'
ORDER BY ordinal_position;

-- Données pour le produit 579
SELECT *
FROM france_product_options
WHERE product_id = 579
ORDER BY id
LIMIT 30;

-- Statistiques
SELECT
  COUNT(*) as "Total options",
  COUNT(DISTINCT name) as "Noms distincts",
  MIN(price_modifier) as "Prix min",
  MAX(price_modifier) as "Prix max",
  AVG(price_modifier) as "Prix moyen"
FROM france_product_options
WHERE product_id = 579;

-- =========================================
-- 5. RÉPARTITION DES PRIX
-- =========================================

SELECT
  price_modifier,
  COUNT(*) as "Nombre d'options à ce prix"
FROM france_product_options
WHERE product_id = 579
GROUP BY price_modifier
ORDER BY price_modifier;

-- =========================================
-- 6. PROBLÈME DES 20+ SUPPLÉMENTS
-- =========================================

-- Lister toutes les options avec leurs détails
SELECT
  id,
  name,
  price_modifier,
  CASE
    WHEN name LIKE '%Supplément%' THEN 'Supplément générique'
    WHEN name LIKE '%salade%' OR name LIKE '%Salade%' THEN 'Salade'
    WHEN name LIKE '%boisson%' OR name LIKE '%Boisson%' THEN 'Boisson'
    WHEN name LIKE '%dessert%' OR name LIKE '%Dessert%' THEN 'Dessert'
    WHEN name LIKE '%pizza%' OR name LIKE '%Pizza%' THEN 'Pizza'
    ELSE 'Autre'
  END as "Type détecté"
FROM france_product_options
WHERE product_id = 579
ORDER BY price_modifier, name;

-- =========================================
-- 7. MAPPING GROUPES WORKFLOW VS OPTIONS RÉELLES
-- =========================================

-- Les groupes requis par le workflow sont :
-- "Entrées Edition", "Tailles pizza", "Bases pizza", "Garnitures extra", "Boissons formule", "Desserts"

-- Mais les options dans france_product_options ne semblent pas être organisées par groupe
-- Il faut comprendre comment faire le mapping

SELECT
  'DIAGNOSTIC MAPPING' as section,
  'Le workflow demande 6 groupes spécifiques' as constat_1,
  'Mais france_product_options ne contient pas de colonne group_name' as constat_2,
  'Les 20+ options sont probablement des données de test génériques' as constat_3,
  'Il faut soit créer une nouvelle table de mapping, soit modifier france_product_options' as solution;

-- =========================================
-- 8. VÉRIFIER SI UNE TABLE DE MAPPING EXISTE
-- =========================================

-- Chercher des tables qui pourraient faire le lien
SELECT
  table_name,
  string_agg(column_name, ', ') as columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE '%group%'
    OR column_name LIKE '%category%'
    OR table_name LIKE '%mapping%'
    OR table_name LIKE '%group%'
  )
GROUP BY table_name
ORDER BY table_name;

-- =========================================
-- 9. PROPOSITION STRUCTURE POUR L'ÉDITION
-- =========================================

SELECT
  '📋 RECOMMANDATIONS POUR L''INTERFACE D''ÉDITION' as section,

  '1. CONSERVER LA STRUCTURE WORKFLOW (6 étapes fixes)' as recommandation_1,

  '2. CRÉER UN MAPPING GROUP -> OPTIONS' as recommandation_2,

  '3. PERMETTRE AJOUT/SUPPRESSION PAR GROUPE :' as recommandation_3,
  '   - Entrées Edition (libre)' as groupe_1,
  '   - Tailles pizza (contrôlé)' as groupe_2,
  '   - Bases pizza (contrôlé)' as groupe_3,
  '   - Garnitures extra (libre)' as groupe_4,
  '   - Boissons formule (libre)' as groupe_5,
  '   - Desserts (libre)' as groupe_6,

  '4. INTERFACE AVEC ONGLETS PAR GROUPE' as recommandation_4,

  '5. VALIDATION : Groupes obligatoires ne peuvent pas être vides' as recommandation_5;