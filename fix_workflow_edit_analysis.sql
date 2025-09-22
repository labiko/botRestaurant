-- =========================================
-- ANALYSE COHÉRENCE WORKFLOW-EDIT - VERSION FINALE CORRIGÉE
-- =========================================

-- =========================================
-- 1. VÉRIFIER EXISTENCE DES TABLES ET COLONNES
-- =========================================

-- Vérifier la structure de la table france_composite_items
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'france_composite_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =========================================
-- 2. INFORMATIONS PRODUIT DE BASE
-- =========================================

SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.workflow_type,
  p.product_type,
  c.name as category_name,
  r.name as restaurant_name
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.id = 579;

-- =========================================
-- 3. CONFIGURATION WORKFLOW
-- =========================================

SELECT
  id,
  name,
  steps_config
FROM france_products
WHERE id = 579;

-- =========================================
-- 4. OPTIONS COMPOSITES - VERSION SIMPLE
-- =========================================

-- D'abord, vérifier si la table existe et a des données
SELECT COUNT(*) as "Nombre total d'options pour produit 579"
FROM france_composite_items
WHERE product_id = 579;

-- Ensuite, lister les options si elles existent
SELECT *
FROM france_composite_items
WHERE product_id = 579
ORDER BY group_order, display_order
LIMIT 20;

-- =========================================
-- 5. DIAGNOSTIC SIMPLE
-- =========================================

SELECT
  'Produit 579 - FORMULE PIZZA COMPLÈTE' as "PRODUIT",

  CASE
    WHEN (SELECT price_on_site_base FROM france_products WHERE id = 579) IS NULL
    THEN '❌ Prix sur site manquant (NULL)'
    ELSE '✅ Prix sur site: ' || (SELECT price_on_site_base FROM france_products WHERE id = 579) || '€'
  END as "PRIX SUR SITE",

  CASE
    WHEN (SELECT COUNT(*) FROM france_composite_items WHERE product_id = 579) > 0
    THEN '✅ ' || (SELECT COUNT(*) FROM france_composite_items WHERE product_id = 579) || ' options trouvées'
    ELSE '❌ Aucune option trouvée'
  END as "OPTIONS",

  CASE
    WHEN (SELECT workflow_type FROM france_products WHERE id = 579) = 'universal_workflow_v2'
    THEN '✅ Type Universal V2 confirmé'
    ELSE '❌ Type workflow incorrect'
  END as "WORKFLOW TYPE";

-- =========================================
-- 6. LISTER TOUS LES PRODUITS UNIVERSAL V2
-- =========================================

SELECT
  p.id,
  p.name,
  p.workflow_type,
  COALESCE((SELECT COUNT(*) FROM france_composite_items fci WHERE fci.product_id = p.id), 0) as nb_options
FROM france_products p
WHERE p.workflow_type = 'universal_workflow_v2'
ORDER BY p.id;

-- =========================================
-- 7. RECHERCHE ALTERNATIVE DES OPTIONS
-- =========================================

-- Si france_composite_items ne contient pas les données,
-- vérifier dans d'autres tables possibles
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE column_name LIKE '%product_id%'
  AND table_schema = 'public'
ORDER BY table_name;

-- =========================================
-- 8. ANALYSE DU STEPS_CONFIG JSON
-- =========================================

SELECT
  id,
  name,
  steps_config::text as config_text,
  CASE
    WHEN steps_config IS NULL THEN '❌ Pas de configuration workflow'
    WHEN steps_config::text = '{}' THEN '⚠️ Configuration vide'
    ELSE '✅ Configuration présente'
  END as "STATUS CONFIG"
FROM france_products
WHERE id = 579;