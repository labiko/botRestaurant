-- =========================================
-- ANALYSE COHÉRENCE WORKFLOW-EDIT vs BASE DE DONNÉES
-- =========================================
-- Vérifier les données réelles du produit ID 579 vs interface

-- =========================================
-- 1. INFORMATIONS PRODUIT DE BASE
-- =========================================

SELECT
  p.id,
  p.name as "Nom Produit",
  p.price_on_site_base as "Prix Sur Site",
  p.price_delivery_base as "Prix Livraison",
  p.workflow_type as "Type Workflow",
  p.product_type as "Type Produit",
  c.name as "Nom Catégorie",
  r.name as "Restaurant"
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.id = 579;

-- =========================================
-- 2. CONFIGURATION WORKFLOW (steps_config)
-- =========================================

SELECT
  id,
  name,
  steps_config,
  LENGTH(steps_config) as "Taille JSON"
FROM france_products
WHERE id = 579;

-- =========================================
-- 3. OPTIONS COMPOSITES EXISTANTES
-- =========================================

SELECT
  fci.id,
  fci.name as "Nom Option",
  fci.price_modifier as "Modif Prix",
  fci.display_order as "Ordre Affichage",
  fci.group_order as "Ordre Groupe",
  fci.option_group as "Groupe"
FROM france_composite_items fci
WHERE fci.product_id = 579
ORDER BY fci.group_order, fci.display_order;

-- =========================================
-- 4. COMPARAISON AVEC DONNÉES INTERFACE
-- =========================================

-- Interface affiche :
-- Plats principaux : Pizza Margherita (0€), Burger Classic (+2€), Salade César (-1€)
-- Suppléments : Fromage extra (+1€), Bacon (+2€), Sauce spéciale (+0.5€)

-- Vérifier si ces données correspondent à la réalité :

SELECT
  'DÉCALAGE DÉTECTÉ' as "DIAGNOSTIC",
  'Interface affiche des données de test, pas les vraies données en base' as "PROBLÈME",
  'Nous devons charger les vraies options depuis france_composite_items' as "SOLUTION";

-- =========================================
-- 5. RECHERCHE DES VRAIES OPTIONS PAR GROUPE
-- =========================================

-- Grouper les options par group_order pour comprendre la vraie structure
SELECT
  group_order as "Groupe ID",
  option_group as "Nom Groupe",
  COUNT(*) as "Nb Options",
  STRING_AGG(name || ' (' || price_modifier || '€)', ', ') as "Options Détaillées"
FROM france_composite_items
WHERE product_id = 579
GROUP BY group_order, option_group
ORDER BY group_order;

-- =========================================
-- 6. VÉRIFIER LES AUTRES PRODUITS UNIVERSAL V2
-- =========================================

-- Pour comparaison, voir d'autres produits Universal V2
SELECT
  p.id,
  p.name,
  p.workflow_type,
  COUNT(fci.id) as "Nb Options"
FROM france_products p
LEFT JOIN france_composite_items fci ON p.id = fci.product_id
WHERE p.workflow_type = 'universal_workflow_v2'
GROUP BY p.id, p.name, p.workflow_type
ORDER BY p.id;

-- =========================================
-- 7. DIAGNOSTIC FINAL
-- =========================================

SELECT
  '🔍 DIAGNOSTIC COHÉRENCE' as "ANALYSE",
  CASE
    WHEN EXISTS (SELECT 1 FROM france_composite_items WHERE product_id = 579)
    THEN '✅ Produit 579 a des options en base'
    ELSE '❌ Produit 579 SANS options en base'
  END as "STATUT OPTIONS",

  CASE
    WHEN (SELECT workflow_type FROM france_products WHERE id = 579) = 'universal_workflow_v2'
    THEN '✅ Type workflow correct'
    ELSE '❌ Type workflow incorrect'
  END as "STATUT WORKFLOW",

  '⚠️ Interface workflow-edit doit charger les VRAIES données, pas des données de test' as "ACTION REQUISE";

-- =========================================
-- 8. SCRIPT POUR CORRIGER LE CHARGEMENT
-- =========================================

-- Structure SQL nécessaire pour l'API de chargement :
/*
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.steps_config,
  c.name as category_name,
  r.name as restaurant_name,

  -- Options groupées en JSON pour faciliter le chargement
  COALESCE(
    json_agg(
      json_build_object(
        'group_order', fci.group_order,
        'option_group', fci.option_group,
        'name', fci.name,
        'price_modifier', fci.price_modifier,
        'display_order', fci.display_order,
        'emoji', '' -- À définir selon les options
      ) ORDER BY fci.group_order, fci.display_order
    ) FILTER (WHERE fci.id IS NOT NULL),
    '[]'::json
  ) as options_data

FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
LEFT JOIN france_composite_items fci ON p.id = fci.product_id
WHERE p.id = 579
GROUP BY p.id, p.name, p.price_on_site_base, p.price_delivery_base, p.steps_config, c.name, r.name;
*/