-- =========================================
-- ANALYSE COHÉRENCE WORKFLOW-EDIT vs BASE DE DONNÉES (CORRIGÉ)
-- =========================================

-- =========================================
-- 1. CONFIGURATION WORKFLOW (steps_config) - CORRIGÉ
-- =========================================

SELECT
  id,
  name,
  steps_config::text as "Configuration JSON",
  CHAR_LENGTH(steps_config::text) as "Taille JSON"
FROM france_products
WHERE id = 579;

-- =========================================
-- 2. OPTIONS COMPOSITES EXISTANTES - DÉTAILLÉES
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
-- 3. ANALYSE PAR GROUPE D'OPTIONS
-- =========================================

SELECT
  group_order as "Groupe ID",
  option_group as "Nom Groupe",
  COUNT(*) as "Nb Options",
  STRING_AGG(name || ' (' || price_modifier || '€)', ', ' ORDER BY display_order) as "Options Détaillées"
FROM france_composite_items
WHERE product_id = 579
GROUP BY group_order, option_group
ORDER BY group_order;

-- =========================================
-- 4. DIAGNOSTIC PRIX MANQUANT
-- =========================================

SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  CASE
    WHEN price_on_site_base IS NULL THEN '❌ PRIX SUR SITE MANQUANT'
    ELSE '✅ Prix sur site OK'
  END as "Diagnostic Prix"
FROM france_products
WHERE id = 579;

-- =========================================
-- 5. DONNÉES COMPLÈTES POUR API CHARGEMENT
-- =========================================

SELECT
  p.id,
  p.name,
  COALESCE(p.price_on_site_base, p.price_delivery_base - 1, 10.00) as "Prix Sur Site Calculé",
  p.price_delivery_base,
  p.steps_config,
  c.name as "category_name",
  r.name as "restaurant_name",
  r.id as "restaurant_id"
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE p.id = 579;

-- =========================================
-- 6. STRUCTURE JSON POUR CHARGEMENT INTERFACE
-- =========================================

SELECT
  json_build_object(
    'product', json_build_object(
      'id', p.id,
      'name', p.name,
      'price_on_site_base', COALESCE(p.price_on_site_base, p.price_delivery_base - 1, 10.00),
      'price_delivery_base', p.price_delivery_base,
      'category', json_build_object('name', c.name),
      'restaurant_id', r.id
    ),
    'steps_config', p.steps_config,
    'options_by_group', json_object_agg(
      COALESCE(fci.option_group, 'Groupe par défaut'),
      options_array
    )
  ) as "Structure API Complète"
FROM france_products p
LEFT JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_restaurants r ON p.restaurant_id = r.id
LEFT JOIN (
  SELECT
    product_id,
    option_group,
    json_agg(
      json_build_object(
        'name', name,
        'price_modifier', price_modifier,
        'display_order', display_order,
        'emoji', ''
      ) ORDER BY display_order
    ) as options_array
  FROM france_composite_items
  WHERE product_id = 579
  GROUP BY product_id, option_group
) fci ON p.id = fci.product_id
WHERE p.id = 579
GROUP BY p.id, p.name, p.price_on_site_base, p.price_delivery_base, p.steps_config, c.name, r.id;

-- =========================================
-- 7. COMPARAISON INTERFACE vs RÉALITÉ
-- =========================================

SELECT
  '🔍 DIAGNOSTIC FINAL' as "ANALYSE",

  -- Vérifier existence options
  CASE
    WHEN EXISTS (SELECT 1 FROM france_composite_items WHERE product_id = 579)
    THEN '✅ Le produit 579 a ' || (SELECT COUNT(*) FROM france_composite_items WHERE product_id = 579) || ' options en base'
    ELSE '❌ Aucune option trouvée pour le produit 579'
  END as "STATUT OPTIONS",

  -- Analyser les groupes
  CASE
    WHEN (SELECT COUNT(DISTINCT option_group) FROM france_composite_items WHERE product_id = 579) > 0
    THEN '✅ ' || (SELECT COUNT(DISTINCT option_group) FROM france_composite_items WHERE product_id = 579) || ' groupes d''options détectés'
    ELSE '❌ Aucun groupe d''options'
  END as "GROUPES DÉTECTÉS",

  -- Status workflow
  CASE
    WHEN (SELECT workflow_type FROM france_products WHERE id = 579) = 'universal_workflow_v2'
    THEN '✅ Type workflow Universal V2 confirmé'
    ELSE '❌ Type workflow incorrect'
  END as "TYPE WORKFLOW";

-- =========================================
-- 8. ACTION CORRECTIVE PROPOSÉE
-- =========================================

SELECT
  '⚠️ ACTIONS CORRECTIVES REQUISES' as "TITRE",
  '1. Corriger le prix_on_site_base manquant (actuellement NULL)' as "ACTION 1",
  '2. Remplacer les données de test dans workflow-edit par les vraies données' as "ACTION 2",
  '3. Créer l''API endpoint /api/products/[id]/workflow-config' as "ACTION 3",
  '4. Mapper correctement les groupes d''options de la base vers l''interface' as "ACTION 4";