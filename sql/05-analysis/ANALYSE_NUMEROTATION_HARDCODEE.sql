-- =========================================
-- ANALYSE - NUMÉROTATION HARDCODÉE
-- =========================================
-- Date: 2025-10-11
-- Objectif: Détecter toutes les options avec emoji numéros (1️⃣, 2️⃣, 3️⃣, etc.)
-- Problème: Double numérotation (bot + hardcodée)
-- =========================================

-- =========================================
-- ÉTAPE 1: STATISTIQUES GLOBALES
-- =========================================

-- Compter les options avec emoji numéros
SELECT
  '📊 ANALYSE NUMÉROTATION' as analyse,
  COUNT(*) as total_options,
  COUNT(CASE WHEN option_name ~ '[0-9️⃣]' THEN 1 END) as avec_numero_emoji,
  COUNT(CASE WHEN option_name ~ '^[0-9️⃣]+' THEN 1 END) as commence_par_numero,
  ROUND(100.0 * COUNT(CASE WHEN option_name ~ '[0-9️⃣]' THEN 1 END) / NULLIF(COUNT(*), 0), 2) as pourcentage
FROM france_product_options;

-- =========================================
-- ÉTAPE 2: PRODUITS CONCERNÉS
-- =========================================

-- Lister tous les produits avec numérotation hardcodée
SELECT
  r.name as restaurant_name,
  p.name as product_name,
  p.id as product_id,
  po.option_group,
  COUNT(*) as nb_options,
  COUNT(CASE WHEN po.option_name ~ '[0-9️⃣]' THEN 1 END) as nb_avec_numero
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '[0-9️⃣]'
GROUP BY r.name, p.name, p.id, po.option_group
ORDER BY r.name, p.name, po.option_group;

-- =========================================
-- ÉTAPE 3: EXEMPLES CONCRETS
-- =========================================

-- Voir 50 exemples d'options avec numérotation
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name,
  po.icon,
  po.display_order,
  '⚠️ Numéro hardcodé' as probleme
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '[0-9️⃣]'
ORDER BY r.name, p.name, po.option_group, po.display_order
LIMIT 50;

-- =========================================
-- ÉTAPE 4: DÉTAIL PAR RESTAURANT
-- =========================================

-- Compter par restaurant
SELECT
  r.name as restaurant_name,
  r.id as restaurant_id,
  COUNT(DISTINCT p.id) as produits_concernes,
  COUNT(DISTINCT po.option_group) as groupes_concernes,
  COUNT(*) as total_options_numerotees
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '[0-9️⃣]'
GROUP BY r.name, r.id
ORDER BY total_options_numerotees DESC;

-- =========================================
-- ÉTAPE 5: PAR TYPE D'EMOJI NUMÉRO
-- =========================================

-- Identifier les différents types de numérotation
SELECT
  'Emoji encerclés (1️⃣-9️⃣)' as type_numero,
  COUNT(*) as nb_occurrences
FROM france_product_options
WHERE option_name ~ '[1-9]️⃣'
UNION ALL
SELECT
  'Chiffres standards (1-9)',
  COUNT(*)
FROM france_product_options
WHERE option_name ~ '^[1-9][\s.]'
UNION ALL
SELECT
  'Emoji cercle blanc (①-⑨)',
  COUNT(*)
FROM france_product_options
WHERE option_name ~ '[①②③④⑤⑥⑦⑧⑨]'
UNION ALL
SELECT
  'Emoji cercle noir (⓵-⓽)',
  COUNT(*)
FROM france_product_options
WHERE option_name ~ '[⓵⓶⓷⓸⓹⓺⓻⓼⓽]';

-- =========================================
-- ÉTAPE 6: GROUPES D'OPTIONS CONCERNÉS
-- =========================================

-- Quels groupes d'options sont affectés
SELECT
  option_group,
  COUNT(*) as nb_options_numerotees,
  COUNT(DISTINCT product_id) as nb_produits_concernes,
  STRING_AGG(DISTINCT option_name, ' | ' ORDER BY option_name) as exemples
FROM france_product_options
WHERE option_name ~ '[0-9️⃣①②③④⑤⑥⑦⑧⑨⓵⓶⓷⓸⓹⓺⓻⓼⓽]'
GROUP BY option_group
ORDER BY nb_options_numerotees DESC
LIMIT 20;

-- =========================================
-- ÉTAPE 7: LISTE COMPLÈTE PRODUCT_IDS
-- =========================================

-- Product IDs à nettoyer
SELECT
  '⚠️ PRODUITS À NETTOYER' as action,
  ARRAY_AGG(DISTINCT product_id ORDER BY product_id) as product_ids
FROM france_product_options
WHERE option_name ~ '[0-9️⃣①②③④⑤⑥⑦⑧⑨⓵⓶⓷⓸⓹⓺⓻⓼⓽]';
