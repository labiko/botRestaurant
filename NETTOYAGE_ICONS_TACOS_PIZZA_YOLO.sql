-- =========================================
-- NETTOYAGE ICÔNES DUPLIQUÉES - TACOS PIZZA YOLO
-- =========================================
-- Date: 2025-10-11
-- Produit: TACOS (ID 201)
-- Problème: Les icônes sont dans la colonne 'icon' ET au début de 'option_name'
-- Solution: Supprimer les emojis du début de option_name
-- =========================================

BEGIN;

-- =========================================
-- ÉTAPE 1: VÉRIFICATION AVANT NETTOYAGE
-- =========================================

-- Compter les options avec emoji dans le nom
SELECT
  '⚠️ AVANT NETTOYAGE' as etape,
  COUNT(*) as total_options,
  COUNT(CASE WHEN option_name ~ '^[^\w\s]+' THEN 1 END) as avec_emoji_dans_nom
FROM france_product_options
WHERE product_id = 201;

-- Exemples avant nettoyage
SELECT
  option_group,
  option_name as ancien_nom,
  icon
FROM france_product_options
WHERE product_id = 201
  AND option_name ~ '^[^\w\s]+'
ORDER BY group_order, display_order
LIMIT 10;

-- =========================================
-- ÉTAPE 2: NETTOYAGE DES option_name
-- =========================================

-- Supprimer les emojis/symboles du début de option_name
-- Garde uniquement le texte après le premier espace
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
WHERE product_id = 201
  AND option_name ~ '^[^\w\s]+\s+'; -- Seulement si commence par emoji + espace

-- =========================================
-- ÉTAPE 3: VÉRIFICATIONS APRÈS NETTOYAGE
-- =========================================

-- Vérifier qu'il n'y a plus d'emoji dans option_name
SELECT
  '✅ APRÈS NETTOYAGE' as etape,
  COUNT(*) as total_options,
  COUNT(CASE WHEN option_name ~ '^[^\w\s]+' THEN 1 END) as avec_emoji_restants
FROM france_product_options
WHERE product_id = 201;

-- Voir les résultats par groupe
SELECT
  option_group,
  option_name as nouveau_nom,
  icon,
  display_order
FROM france_product_options
WHERE product_id = 201
ORDER BY group_order, display_order;

-- Statistiques par groupe
SELECT
  option_group,
  group_order,
  COUNT(*) as nb_options,
  COUNT(CASE WHEN icon IS NOT NULL THEN 1 END) as avec_icon
FROM france_product_options
WHERE product_id = 201
GROUP BY option_group, group_order
ORDER BY group_order;

COMMIT;

-- =========================================
-- RÉSULTAT ATTENDU
-- =========================================
-- AVANT:
--   option_name = "🥩 Viande Hachée", icon = "🥩"
--   Affichage: "🥩 🥩 Viande Hachée" (dupliqué)
--
-- APRÈS:
--   option_name = "Viande Hachée", icon = "🥩"
--   Affichage: "🥩 Viande Hachée" (correct)
-- =========================================
