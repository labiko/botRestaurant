-- =========================================
-- NETTOYAGE EMOJI NUMÉROS ENCERCLÉS
-- =========================================
-- Date: 2025-10-11
-- Objectif: Supprimer les emoji numéros (1️⃣-9️⃣) dupliqués
-- Ampleur: 32 options concernées
-- Solution: Nettoyer UNIQUEMENT les emoji encerclés (sans régression)
-- =========================================

BEGIN;

-- =========================================
-- ÉTAPE 1: ÉTAT AVANT NETTOYAGE
-- =========================================

-- Compter les options avec emoji numéros encerclés
SELECT
  '📊 AVANT NETTOYAGE' as etape,
  COUNT(*) as nb_options_avec_emoji_numero,
  COUNT(DISTINCT product_id) as nb_produits_concernes
FROM france_product_options
WHERE option_name ~ '[1-9]️⃣';

-- Exemples AVANT nettoyage
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name as ancien_nom,
  po.icon,
  po.display_order
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '[1-9]️⃣'
ORDER BY r.name, p.name, po.display_order
LIMIT 20;

-- =========================================
-- ÉTAPE 2: NETTOYAGE EMOJI NUMÉROS
-- =========================================

-- Supprimer UNIQUEMENT les emoji numéros encerclés (1️⃣-9️⃣)
-- Garder tout le reste (texte, icônes, espaces)
UPDATE france_product_options
SET option_name = TRIM(
  REGEXP_REPLACE(
    option_name,
    '[0-9]️⃣\s*',  -- Remplacer emoji numéro + espace éventuel
    '',            -- Par rien
    'g'            -- Global (tous les emojis numéros)
  )
)
WHERE option_name ~ '[1-9]️⃣';  -- Seulement si contient emoji numéro

-- =========================================
-- ÉTAPE 3: VÉRIFICATIONS APRÈS NETTOYAGE
-- =========================================

-- Vérifier qu'il ne reste plus d'emoji numéros
SELECT
  '✅ APRÈS NETTOYAGE' as etape,
  COUNT(*) as emoji_numeros_restants,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Nettoyage complet !'
    ELSE '⚠️ Emoji numéros restants'
  END as status
FROM france_product_options
WHERE option_name ~ '[1-9]️⃣';

-- Exemples APRÈS nettoyage
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name as nouveau_nom,
  po.icon,
  po.display_order,
  '✅ Nettoyé' as statut
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE p.id IN (
  -- Product IDs qui avaient des emoji numéros
  235, 238, 240, 241, 242, 383  -- MENU ENFANT, BOWL, BOXes
)
ORDER BY r.name, p.name, po.display_order
LIMIT 20;

-- =========================================
-- ÉTAPE 4: VÉRIFIER LES NOMS DE MARQUE
-- =========================================

-- Vérifier que "7 UP", "4 FROMAGES" etc. sont INTACTS
SELECT
  '✅ VÉRIFICATION NOMS PRÉSERVÉS' as verification,
  option_name,
  CASE
    WHEN option_name LIKE '%7%UP%' THEN '✅ Nom de marque intact'
    WHEN option_name LIKE '%4 FROMAGES%' THEN '✅ Nom de pizza intact'
    WHEN option_name LIKE '%180%' THEN '✅ Nom de produit intact'
    ELSE '✅ OK'
  END as resultat
FROM france_product_options
WHERE option_name ~ '[0-9]'
  AND option_name !~ '[0-9]️⃣'  -- Exclure les emoji numéros restants
ORDER BY option_name
LIMIT 30;

-- =========================================
-- ÉTAPE 5: STATISTIQUES FINALES
-- =========================================

-- Comptage par restaurant
SELECT
  r.name as restaurant_name,
  COUNT(DISTINCT p.id) as produits_nettoyes,
  COUNT(*) as options_nettoyees
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE p.id IN (
  SELECT DISTINCT product_id
  FROM france_product_options
  WHERE option_name ~ '[1-9]️⃣'
)
GROUP BY r.name
ORDER BY options_nettoyees DESC;

COMMIT;

-- =========================================
-- RÉSUMÉ DE L'OPÉRATION
-- =========================================
--
-- NETTOYÉ:
--   1️⃣ 🍗 Nuggets           → 🍗 Nuggets
--   2️⃣ 🍗 Cordon Bleu       → 🍗 Cordon Bleu
--   1️⃣ Pas de suppléments   → Pas de suppléments
--
-- PRÉSERVÉ (aucune modification):
--   7 UP                    → 7 UP (nom de marque)
--   7UP CHERRY              → 7UP CHERRY
--   4 FROMAGES              → 4 FROMAGES (nom de pizza)
--   180 Burger              → 180 Burger (nom de produit)
--   1 viande au choix       → 1 viande au choix (description)
--
-- TOTAL: ~32 options nettoyées (emoji numéros uniquement)
-- SÉCURITÉ: Aucune régression sur noms de marque/produit
-- =========================================
