-- ========================================================================
-- SCRIPT: Correction des icônes MENU MIDI COMPLET
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: 📋 MENU MIDI COMPLET (ID: 403)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Corriger les icônes génériques/incorrectes détectées dans les groupes d'options
-- ========================================================================

BEGIN;

-- =====================================================================
-- PARTIE 1 : CORRECTIONS OBLIGATOIRES - Groupe choix_plat
-- =====================================================================

-- 1. SALADE AU CHOIX : 🍽️ → 🥗
UPDATE france_product_options
SET icon = '🥗'
WHERE product_id = 403
  AND option_group = 'choix_plat'
  AND option_name = 'SALADE AU CHOIX'
  AND icon = '🍽️';

-- 2. PÂTES : 🍽️ → 🍝
UPDATE france_product_options
SET icon = '🍝'
WHERE product_id = 403
  AND option_group = 'choix_plat'
  AND option_name = 'PÂTES'
  AND icon = '🍽️';

-- =====================================================================
-- PARTIE 2 : CORRECTIONS RECOMMANDÉES - Groupe boissons_choix
-- =====================================================================

-- 3. OASIS TROPICAL : 🧡 → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE product_id = 403
  AND option_group = 'boissons_choix'
  AND option_name = 'OASIS TROPICAL'
  AND icon = '🧡';

-- 4. COCA ZERO : ⚫ → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE product_id = 403
  AND option_group = 'boissons_choix'
  AND option_name = 'COCA ZERO'
  AND icon = '⚫';

-- =====================================================================
-- PARTIE 3 : AMÉLIORATIONS OPTIONNELLES - Groupe desserts_choix
-- (Remplacer 🍰 générique par icônes spécifiques)
-- =====================================================================

-- 5. SALADE DE FRUITS : 🍰 → 🍓
UPDATE france_product_options
SET icon = '🍓'
WHERE product_id = 403
  AND option_group = 'desserts_choix'
  AND option_name = 'SALADE DE FRUITS'
  AND icon = '🍰';

-- 6. YAOURT AUX FRUITS : 🍰 → 🥛
UPDATE france_product_options
SET icon = '🥛'
WHERE product_id = 403
  AND option_group = 'desserts_choix'
  AND option_name = 'YAOURT AUX FRUITS'
  AND icon = '🍰';

-- 7. BROWNIES : 🍰 → 🍫
UPDATE france_product_options
SET icon = '🍫'
WHERE product_id = 403
  AND option_group = 'desserts_choix'
  AND option_name = 'BROWNIES'
  AND icon = '🍰';

-- 8. TIRAMISU : 🍰 → ☕
UPDATE france_product_options
SET icon = '☕'
WHERE product_id = 403
  AND option_group = 'desserts_choix'
  AND option_name = 'TIRAMISU'
  AND icon = '🍰';

-- Vérification finale
SELECT
  'RÉSUMÉ PAR GROUPE' as section,
  option_group,
  COUNT(*) as nb_options,
  COUNT(DISTINCT icon) as nb_icones_distinctes,
  STRING_AGG(DISTINCT icon, ', ') as icones_utilisees
FROM france_product_options
WHERE product_id = 403
GROUP BY option_group
ORDER BY
  CASE option_group
    WHEN 'choix_plat' THEN 1
    WHEN 'salades_choix' THEN 2
    WHEN 'paninis_choix' THEN 3
    WHEN 'accompagnement_panini' THEN 4
    WHEN 'pates_choix' THEN 5
    WHEN 'pizzas_choix' THEN 6
    WHEN 'boissons_choix' THEN 7
    WHEN 'desserts_choix' THEN 8
  END;

SELECT
  'DÉTAIL CHOIX PLAT' as section,
  option_name,
  icon
FROM france_product_options
WHERE product_id = 403
  AND option_group = 'choix_plat'
ORDER BY display_order;

SELECT
  'DÉTAIL BOISSONS' as section,
  option_name,
  icon
FROM france_product_options
WHERE product_id = 403
  AND option_group = 'boissons_choix'
ORDER BY display_order;

SELECT
  'DÉTAIL DESSERTS' as section,
  option_name,
  icon
FROM france_product_options
WHERE product_id = 403
  AND option_group = 'desserts_choix'
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ choix_plat : 0 icônes 🍽️ restantes (remplacées par 🥗, 🍝)
-- ✅ boissons_choix : 0 icônes incorrectes (🧡, ⚫ → 🥤)
-- ✅ desserts_choix : Icônes spécifiques (🍓, 🥛, 🍫, ☕)
-- ========================================================================
