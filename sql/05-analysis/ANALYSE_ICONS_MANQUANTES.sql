-- =========================================
-- ANALYSE - ICÔNES MANQUANTES
-- =========================================
-- Date: 2025-10-11
-- Objectif: Identifier toutes les options sans icône
-- =========================================

-- =========================================
-- ÉTAPE 1: STATISTIQUES GLOBALES
-- =========================================

-- Compter les options avec/sans icône
SELECT
  '📊 STATISTIQUES ICÔNES' as analyse,
  COUNT(*) as total_options,
  COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as sans_icon,
  ROUND(100.0 * COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) / COUNT(*), 2) as pourcentage_sans_icon
FROM france_product_options;

-- =========================================
-- ÉTAPE 2: PAR GROUPE D'OPTIONS
-- =========================================

-- Compter par option_group
SELECT
  option_group,
  COUNT(*) as total_options,
  COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as sans_icon,
  STRING_AGG(DISTINCT option_name, ' | ' ORDER BY option_name) FILTER (WHERE icon IS NULL OR icon = '') as exemples_sans_icon
FROM france_product_options
WHERE icon IS NULL OR icon = ''
GROUP BY option_group
ORDER BY sans_icon DESC;

-- =========================================
-- ÉTAPE 3: PAR RESTAURANT
-- =========================================

-- Compter par restaurant
SELECT
  r.name as restaurant_name,
  COUNT(*) as total_options,
  COUNT(CASE WHEN po.icon IS NOT NULL AND po.icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN po.icon IS NULL OR po.icon = '' THEN 1 END) as sans_icon
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.icon IS NULL OR po.icon = ''
GROUP BY r.name
ORDER BY sans_icon DESC;

-- =========================================
-- ÉTAPE 4: EXEMPLES DÉTAILLÉS
-- =========================================

-- Voir 100 exemples d'options sans icône
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name,
  po.icon,
  po.display_order
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.icon IS NULL OR po.icon = ''
ORDER BY r.name, p.name, po.option_group, po.display_order
LIMIT 100;

-- =========================================
-- ÉTAPE 5: LISTE PRODUCT_IDS CONCERNÉS
-- =========================================

-- Product IDs avec options sans icône
SELECT
  '⚠️ PRODUITS À TRAITER' as action,
  ARRAY_AGG(DISTINCT product_id ORDER BY product_id) as product_ids
FROM france_product_options
WHERE icon IS NULL OR icon = '';
