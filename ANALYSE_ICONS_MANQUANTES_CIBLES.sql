-- =========================================
-- ANALYSE - ICÔNES MANQUANTES (RESTAURANTS CIBLÉS)
-- =========================================
-- Date: 2025-10-11
-- Objectif: Identifier toutes les options sans icône
-- Restaurants: O'CV Moissy (16), Bh Tacos one (18), Pizza Yolo 77 (1)
-- =========================================

-- =========================================
-- ÉTAPE 1: STATISTIQUES GLOBALES
-- =========================================

-- Compter les options avec/sans icône pour les 3 restaurants
SELECT
  '📊 STATISTIQUES ICÔNES (RESTAURANTS CIBLÉS)' as analyse,
  COUNT(*) as total_options,
  COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as sans_icon,
  ROUND(100.0 * COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) / COUNT(*), 2) as pourcentage_sans_icon
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id IN (16, 18, 1);

-- =========================================
-- ÉTAPE 2: PAR RESTAURANT
-- =========================================

-- Statistiques par restaurant
SELECT
  r.name as restaurant_name,
  COUNT(*) as total_options,
  COUNT(CASE WHEN po.icon IS NOT NULL AND po.icon != '' THEN 1 END) as avec_icon,
  COUNT(CASE WHEN po.icon IS NULL OR po.icon = '' THEN 1 END) as sans_icon,
  ROUND(100.0 * COUNT(CASE WHEN po.icon IS NULL OR po.icon = '' THEN 1 END) / COUNT(*), 2) as pourcentage_sans_icon
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE r.id IN (16, 18, 1)
GROUP BY r.name
ORDER BY sans_icon DESC;

-- =========================================
-- ÉTAPE 3: PAR GROUPE D'OPTIONS
-- =========================================

-- Compter par option_group (uniquement options sans icône)
SELECT
  r.name as restaurant_name,
  po.option_group,
  COUNT(*) as total_sans_icon,
  STRING_AGG(DISTINCT po.option_name, ' | ' ORDER BY po.option_name) FILTER (WHERE po.icon IS NULL OR po.icon = '') as exemples_sans_icon
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE r.id IN (16, 18, 1)
  AND (po.icon IS NULL OR po.icon = '')
GROUP BY r.name, po.option_group
ORDER BY r.name, total_sans_icon DESC;

-- =========================================
-- ÉTAPE 4: PAR PRODUIT
-- =========================================

-- Options sans icône regroupées par produit
SELECT
  r.name as restaurant_name,
  p.name as produit,
  COUNT(*) as nb_options_sans_icon,
  STRING_AGG(DISTINCT po.option_group, ' | ' ORDER BY po.option_group) as groupes_concernes
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE r.id IN (16, 18, 1)
  AND (po.icon IS NULL OR po.icon = '')
GROUP BY r.name, p.name
ORDER BY r.name, nb_options_sans_icon DESC;

-- =========================================
-- ÉTAPE 5: EXEMPLES DÉTAILLÉS
-- =========================================

-- Voir 50 exemples d'options sans icône
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
WHERE r.id IN (16, 18, 1)
  AND (po.icon IS NULL OR po.icon = '')
ORDER BY r.name, p.name, po.option_group, po.display_order
LIMIT 50;

-- =========================================
-- ÉTAPE 6: LISTE PRODUCT_IDS CONCERNÉS
-- =========================================

-- Product IDs avec options sans icône (par restaurant)
SELECT
  r.name as restaurant_name,
  ARRAY_AGG(DISTINCT p.id ORDER BY p.id) as product_ids_concernes,
  COUNT(DISTINCT p.id) as nb_produits
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE r.id IN (16, 18, 1)
  AND (po.icon IS NULL OR po.icon = '')
GROUP BY r.name
ORDER BY r.name;
