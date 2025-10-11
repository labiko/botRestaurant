-- =========================================
-- NETTOYAGE GLOBAL - ICÔNES DUPLIQUÉES
-- =========================================
-- Date: 2025-10-11
-- Objectif: Supprimer les emojis dupliqués dans option_name
-- Ampleur: ~60-70 produits, ~720+ options concernées
-- Restaurants: Le Carreman + Pizza Yolo 77
-- =========================================

BEGIN;

-- =========================================
-- ÉTAPE 1: ÉTAT AVANT NETTOYAGE
-- =========================================

-- Statistiques globales
SELECT
  '📊 AVANT NETTOYAGE' as etape,
  COUNT(DISTINCT product_id) as nb_produits_concernes,
  COUNT(*) as nb_options_dupliquees,
  COUNT(DISTINCT po.product_id) FILTER (WHERE r.name = 'Pizza Yolo 77') as produits_pizza_yolo,
  COUNT(DISTINCT po.product_id) FILTER (WHERE r.name = 'Le Carreman') as produits_carreman
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+';

-- Détail par restaurant
SELECT
  r.name as restaurant,
  COUNT(DISTINCT p.id) as nb_produits,
  COUNT(*) as nb_options_dupliquees
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+'
GROUP BY r.name
ORDER BY nb_options_dupliquees DESC;

-- Liste complète des product_ids concernés
SELECT
  '⚠️ LISTE COMPLÈTE PRODUCT_IDS' as info,
  ARRAY_AGG(DISTINCT product_id ORDER BY product_id) as product_ids_a_nettoyer
FROM france_product_options
WHERE option_name ~ '^[^\w\s]+\s+';

-- Exemples AVANT nettoyage (20 premiers)
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name as ancien_nom,
  po.icon
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+'
ORDER BY r.name, p.name, po.group_order, po.display_order
LIMIT 20;

-- =========================================
-- ÉTAPE 2: NETTOYAGE GLOBAL
-- =========================================

-- Supprimer les emojis du début de option_name
-- POUR TOUS LES PRODUITS (pas seulement TACOS)
UPDATE france_product_options
SET option_name = TRIM(
  CASE
    -- Si commence par emoji suivi d'un espace, prendre tout après l'espace
    WHEN option_name ~ '^[^\w\s]+\s+' THEN
      SUBSTRING(option_name FROM POSITION(' ' IN option_name) + 1)
    ELSE
      option_name
  END
)
WHERE option_name ~ '^[^\w\s]+\s+'; -- Filtre: seulement les options avec emoji + espace

-- =========================================
-- ÉTAPE 3: VÉRIFICATIONS APRÈS NETTOYAGE
-- =========================================

-- Statistiques après nettoyage
SELECT
  '✅ APRÈS NETTOYAGE' as etape,
  COUNT(DISTINCT product_id) as nb_produits_verifies,
  COUNT(CASE WHEN option_name ~ '^[^\w\s]+' THEN 1 END) as emojis_restants,
  CASE
    WHEN COUNT(CASE WHEN option_name ~ '^[^\w\s]+' THEN 1 END) = 0
    THEN '✅ Nettoyage complet !'
    ELSE '⚠️ Emojis restants détectés'
  END as status
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.id IN (
  SELECT DISTINCT product_id
  FROM france_product_options
  WHERE option_name ~ '^[^\w\s]+\s+'
);

-- Exemples APRÈS nettoyage (vérifier les 20 premiers)
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name as nouveau_nom,
  po.icon,
  '✅ Nettoyé' as statut
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE p.id IN (
  -- Product IDs qui avaient des doublons
  201,  -- TACOS Pizza Yolo
  419, 420, 415, 413, 417, 414, 412, 421, 416, 422, 418,  -- Burgers Le Carreman
  403, 364, 366, 187, 353, 359, 238, 357, 191, 226, 223,  -- Pizza Yolo produits
  358, 354, 348, 363, 227, 231, 367, 371, 346, 219, 365,
  369, 370, 351, 347, 360, 345, 355, 368, 222, 349, 362,
  230, 381, 189, 356, 352, 190, 221, 218, 220, 229, 228, 380, 188, 382
)
ORDER BY r.name, p.name, po.group_order, po.display_order
LIMIT 50;

-- Vérification par groupe d'options
SELECT
  option_group,
  COUNT(*) as nb_options_nettoyees,
  COUNT(DISTINCT product_id) as nb_produits_concernes,
  STRING_AGG(DISTINCT option_name, ', ' ORDER BY option_name) as exemples_noms_nettoyes
FROM france_product_options
WHERE product_id IN (
  201,  -- TACOS
  419, 420, 415, 413, 417, 414, 412, 421, 416, 422, 418,  -- Burgers Carreman
  403, 364, 366, 187, 353  -- Quelques pizzas Pizza Yolo
)
GROUP BY option_group
ORDER BY option_group;

-- =========================================
-- ÉTAPE 4: STATISTIQUES FINALES
-- =========================================

-- Comptage par restaurant
SELECT
  r.name as restaurant,
  r.id as restaurant_id,
  COUNT(DISTINCT p.id) as produits_nettoyes,
  COUNT(DISTINCT po.option_group) as groupes_options_nettoyes,
  COUNT(*) as total_options_nettoyees
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE p.id IN (
  SELECT DISTINCT product_id
  FROM france_product_options
  WHERE option_name ~ '^[^\w\s]+\s+'
)
GROUP BY r.name, r.id
ORDER BY total_options_nettoyees DESC;

COMMIT;

-- =========================================
-- RÉSUMÉ DE L'OPÉRATION
-- =========================================
--
-- AVANT:
--   option_name = "🥩 Viande Hachée", icon = "🥩"
--   Affichage: "1. 🥩 🥩 Viande Hachée" (DUPLIQUÉ ❌)
--
-- APRÈS:
--   option_name = "Viande Hachée", icon = "🥩"
--   Affichage: "1. 🥩 Viande Hachée" (CORRECT ✅)
--
-- PRODUITS NETTOYÉS:
--   - Le Carreman: 11 burgers (132 options)
--   - Pizza Yolo 77: 50+ produits (600+ options)
--
-- TOTAL: ~60-70 produits, ~720+ options nettoyées
-- =========================================
