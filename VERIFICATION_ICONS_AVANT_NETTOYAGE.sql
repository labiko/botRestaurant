-- =========================================
-- VÉRIFICATION - Colonne icon avant nettoyage
-- =========================================
-- Date: 2025-10-11
-- Objectif: Vérifier si la colonne 'icon' est déjà remplie
-- AVANT de supprimer les emojis de option_name
-- =========================================

-- =========================================
-- ÉTAPE 1: VÉRIFIER COLONNE ICON
-- =========================================

-- Compter les options avec emoji dans option_name ET colonne icon vide/null
SELECT
  '⚠️ RISQUE DE PERTE' as alerte,
  COUNT(*) as options_sans_icon_mais_avec_emoji_dans_nom
FROM france_product_options
WHERE option_name ~ '^[^\w\s]+\s+'  -- Emoji au début de option_name
  AND (icon IS NULL OR icon = '');  -- Mais colonne icon vide

-- Si résultat > 0 → PROBLÈME : Il faut migrer AVANT de nettoyer !

-- =========================================
-- ÉTAPE 2: VÉRIFIER CORRESPONDANCE
-- =========================================

-- Vérifier que l'emoji dans option_name correspond à la colonne icon
SELECT
  option_name,
  icon,
  SUBSTRING(option_name FROM 1 FOR 2) as emoji_dans_nom,
  CASE
    WHEN SUBSTRING(option_name FROM 1 FOR 2) = icon THEN '✅ Correspond'
    WHEN icon IS NULL OR icon = '' THEN '⚠️ Icon manquante'
    ELSE '❌ Différent'
  END as correspondance
FROM france_product_options
WHERE option_name ~ '^[^\w\s]+\s+'
ORDER BY correspondance, option_name
LIMIT 50;

-- =========================================
-- ÉTAPE 3: STATISTIQUES GLOBALES
-- =========================================

-- Statistiques par type
SELECT
  CASE
    WHEN icon IS NOT NULL AND icon != '' AND option_name ~ '^[^\w\s]+\s+' THEN '✅ Icon OK (peut nettoyer)'
    WHEN (icon IS NULL OR icon = '') AND option_name ~ '^[^\w\s]+\s+' THEN '⚠️ Icon manquante (migration requise)'
    ELSE '➖ Pas concerné'
  END as statut,
  COUNT(*) as nb_options
FROM france_product_options
GROUP BY statut
ORDER BY statut;

-- =========================================
-- ÉTAPE 4: EXEMPLES PROBLÉMATIQUES
-- =========================================

-- Lister les options qui perdraient leur icône
SELECT
  r.name as restaurant,
  p.name as produit,
  po.option_group,
  po.option_name,
  po.icon,
  '⚠️ Icon sera perdue si nettoyage sans migration' as alerte
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE po.option_name ~ '^[^\w\s]+\s+'
  AND (po.icon IS NULL OR po.icon = '')
ORDER BY r.name, p.name
LIMIT 30;
