-- =========================================
-- ANALYSE GLOBALE - ICÔNES DUPLIQUÉES
-- =========================================
-- Date: 2025-10-11
-- Objectif: Détecter TOUS les produits avec icônes dupliquées
-- (icon + emoji dans option_name)
-- =========================================

-- =========================================
-- ÉTAPE 1: VUE D'ENSEMBLE GLOBALE
-- =========================================

-- Statistiques globales tous restaurants
SELECT
  '🌍 STATISTIQUES GLOBALES' as analyse,
  COUNT(DISTINCT product_id) as nb_produits_total,
  COUNT(*) as nb_options_total,
  COUNT(CASE WHEN option_name ~ '^[^\w\s]+\s+' THEN 1 END) as options_avec_emoji_duplique,
  ROUND(100.0 * COUNT(CASE WHEN option_name ~ '^[^\w\s]+\s+' THEN 1 END) / COUNT(*), 2) as pourcentage_duplication
FROM france_product_options;

-- =========================================
-- ÉTAPE 2: PRODUITS CONCERNÉS PAR RESTAURANT
-- =========================================

-- Lister tous les produits avec duplication d'icônes
SELECT
  r.name as restaurant_name,
  p.name as product_name,
  p.id as product_id,
  COUNT(*) as nb_options,
  COUNT(CASE WHEN po.option_name ~ '^[^\w\s]+\s+' THEN 1 END) as nb_options_dupliquees
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+'
GROUP BY r.name, p.name, p.id
ORDER BY r.name, p.name;

-- =========================================
-- ÉTAPE 3: DÉTAIL PAR RESTAURANT
-- =========================================

-- Compter les produits affectés par restaurant
SELECT
  r.name as restaurant_name,
  r.id as restaurant_id,
  COUNT(DISTINCT p.id) as produits_avec_duplication,
  COUNT(*) as total_options_dupliquees
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+'
GROUP BY r.name, r.id
ORDER BY total_options_dupliquees DESC;

-- =========================================
-- ÉTAPE 4: EXEMPLES DE DUPLICATION
-- =========================================

-- Voir des exemples concrets de chaque restaurant
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name,
  po.icon,
  '❌ DUPLIQUÉ' as statut
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+'
ORDER BY r.name, p.name, po.group_order, po.display_order
LIMIT 50;

-- =========================================
-- ÉTAPE 5: LISTE DES PRODUITS À NETTOYER
-- =========================================

-- Générer la liste complète des product_id à corriger
SELECT
  '⚠️ PRODUITS À NETTOYER' as action,
  ARRAY_AGG(DISTINCT product_id ORDER BY product_id) as product_ids,
  COUNT(DISTINCT product_id) as nb_produits
FROM france_product_options
WHERE option_name ~ '^[^\w\s]+\s+';

-- =========================================
-- ÉTAPE 6: GROUPES D'OPTIONS CONCERNÉS
-- =========================================

-- Voir quels types de groupes sont affectés
SELECT
  option_group,
  COUNT(*) as nb_options_dupliquees,
  COUNT(DISTINCT product_id) as nb_produits_concernes
FROM france_product_options
WHERE option_name ~ '^[^\w\s]+\s+'
GROUP BY option_group
ORDER BY nb_options_dupliquees DESC;
