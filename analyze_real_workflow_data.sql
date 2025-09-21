-- =========================================
-- ANALYSE COMPLÈTE DES VRAIES DONNÉES WORKFLOW
-- =========================================
-- Comprendre les données réelles du produit 579 pour l'édition

-- =========================================
-- 1. INFORMATIONS PRODUIT COMPLÈTES
-- =========================================

SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.workflow_type,
  p.product_type,
  c.name as category_name,
  r.name as restaurant_name,
  r.id as restaurant_id
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.id = 579;

-- =========================================
-- 2. CONFIGURATION STEPS_CONFIG DÉTAILLÉE
-- =========================================

SELECT
  id,
  name,
  steps_config,
  jsonb_pretty(steps_config) as "Configuration formatée"
FROM france_products
WHERE id = 579;

-- =========================================
-- 3. EXTRACTION DES ÉTAPES ET GROUPES
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
-- 4. LISTE TOUS LES GROUPES REQUIS
-- =========================================

SELECT DISTINCT
  trim(both '"' from group_name::text) as "Groupes requis par le workflow"
FROM france_products,
     jsonb_array_elements(steps_config->'steps') as step_data,
     jsonb_array_elements(step_data->'option_groups') as group_name
WHERE id = 579
ORDER BY 1;

-- =========================================
-- 5. ANALYSE DE france_product_options
-- =========================================

-- Vérifier ce qu'il y a dans france_product_options pour le produit 579
SELECT
  id,
  product_id,
  *
FROM france_product_options
WHERE product_id = 579
ORDER BY id
LIMIT 30;

-- Compter par colonnes pour comprendre la structure
SELECT
  COUNT(*) as "Total options produit 579",
  COUNT(DISTINCT name) as "Noms distincts",
  COUNT(DISTINCT price_modifier) as "Prix distincts",
  MIN(price_modifier) as "Prix min",
  MAX(price_modifier) as "Prix max"
FROM france_product_options
WHERE product_id = 579;

-- =========================================
-- 6. RECHERCHE AUTRES TABLES D'OPTIONS
-- =========================================

-- Vérifier si des options sont dans d'autres tables
-- Table france_composite_items (on sait qu'elle a une structure différente)
SELECT COUNT(*) as "Dans france_composite_items"
FROM france_composite_items
WHERE composite_product_id = 579;

-- Chercher dans toutes les tables avec "option" dans le nom
SELECT
  schemaname,
  tablename,
  'SELECT COUNT(*) FROM ' || schemaname || '.' || tablename || ' WHERE product_id = 579;' as query_to_run
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename LIKE '%option%' OR tablename LIKE '%item%' OR tablename LIKE '%component%')
ORDER BY tablename;

-- =========================================
-- 7. ANALYSE DES 20+ SUPPLÉMENTS
-- =========================================

-- Si les données viennent de france_product_options, analyser la distribution
SELECT
  CASE
    WHEN price_modifier = 0 THEN 'Prix 0€ (gratuit)'
    WHEN price_modifier > 0 AND price_modifier <= 1 THEN 'Prix 0.1-1€'
    WHEN price_modifier > 1 AND price_modifier <= 3 THEN 'Prix 1.1-3€'
    WHEN price_modifier > 3 THEN 'Prix > 3€'
    ELSE 'Autre'
  END as "Catégorie Prix",
  COUNT(*) as "Nombre"
FROM france_product_options
WHERE product_id = 579
GROUP BY
  CASE
    WHEN price_modifier = 0 THEN 'Prix 0€ (gratuit)'
    WHEN price_modifier > 0 AND price_modifier <= 1 THEN 'Prix 0.1-1€'
    WHEN price_modifier > 1 AND price_modifier <= 3 THEN 'Prix 1.1-3€'
    WHEN price_modifier > 3 THEN 'Prix > 3€'
    ELSE 'Autre'
  END
ORDER BY "Nombre" DESC;

-- =========================================
-- 8. COMPARAISON AVEC D'AUTRES PRODUITS UNIVERSAL V2
-- =========================================

SELECT
  p.id,
  p.name,
  COALESCE((SELECT COUNT(*) FROM france_product_options fpo WHERE fpo.product_id = p.id), 0) as "Nb options",
  jsonb_array_length(p.steps_config->'steps') as "Nb étapes"
FROM france_products p
WHERE p.workflow_type = 'universal_workflow_v2'
ORDER BY p.id;

-- =========================================
-- 9. DIAGNOSTIC POUR L'INTERFACE D'ÉDITION
-- =========================================

SELECT
  '🔍 DIAGNOSTIC INTERFACE D''ÉDITION' as analyse,

  CASE
    WHEN (SELECT COUNT(*) FROM france_product_options WHERE product_id = 579) > 20
    THEN '⚠️ Plus de 20 options détectées - Vérifier si c''est normal'
    ELSE '✅ Nombre d''options raisonnable'
  END as statut_options,

  CASE
    WHEN (SELECT jsonb_array_length(steps_config->'steps') FROM france_products WHERE id = 579) = 6
    THEN '✅ 6 étapes configurées'
    ELSE '❌ Nombre d''étapes anormal'
  END as statut_etapes,

  'Interface doit permettre: 1) Édition textes/prix, 2) Ajout options par groupe, 3) Respect structure workflow' as recommandations;

-- =========================================
-- 10. STRUCTURE POUR INTERFACE D'ÉDITION
-- =========================================

SELECT
  'DONNÉES NÉCESSAIRES POUR L''INTERFACE' as section,
  '1. Charger steps_config pour les 6 étapes' as etape_1,
  '2. Grouper les options par groupe (Entrées, Tailles, Bases, etc.)' as etape_2,
  '3. Permettre ajout/suppression dans chaque groupe' as etape_3,
  '4. Conserver la structure globale (6 étapes fixes)' as etape_4;