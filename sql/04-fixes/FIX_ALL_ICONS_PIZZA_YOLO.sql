-- ========================================================================
-- SCRIPT: Correction globale des icônes non adaptées
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Corriger toutes les icônes non adaptées identifiées dans les catégories et produits
-- ========================================================================

BEGIN;

-- =====================================================================
-- PARTIE 1 : CORRECTION ICÔNES CATÉGORIES
-- =====================================================================

-- 1. MENU MIDI : 👪 → 📋
UPDATE france_menu_categories
SET icon = '📋'
WHERE id = 38
  AND restaurant_id = 1
  AND name = 'MENU MIDI : PLAT + DESSERT + BOISSON'
  AND icon = '👪';

-- 2. MENU ENFANT : 🍽️ → 🧒
UPDATE france_menu_categories
SET icon = '🧒'
WHERE id = 19
  AND restaurant_id = 1
  AND name = 'MENU ENFANT'
  AND icon = '🍽️';

-- 3. CHICKEN BOX : 🍽️ → 🍗
UPDATE france_menu_categories
SET icon = '🍗'
WHERE id = 22
  AND restaurant_id = 1
  AND name = 'CHICKEN BOX'
  AND icon = '🍽️';

-- 4. SNACKS : 🍽️ → 🥨
UPDATE france_menu_categories
SET icon = '🥨'
WHERE id = 23
  AND restaurant_id = 1
  AND name = 'SNACKS'
  AND icon = '🍽️';

-- =====================================================================
-- PARTIE 2 : CORRECTION ICÔNES PRODUITS
-- =====================================================================

-- 1. TACOS : 🥗 → 🌮
UPDATE france_products
SET icon = '🌮'
WHERE id = 201
  AND restaurant_id = 1
  AND name = 'TACOS'
  AND icon = '🥗';

-- 2. SALADE DE FRUITS : 🥗 → 🍓
UPDATE france_products
SET icon = '🍓'
WHERE id = 170
  AND restaurant_id = 1
  AND name = 'SALADE DE FRUITS'
  AND icon = '🥗';

-- 3. YAOURT AUX FRUITS : 🌯 → 🥛
UPDATE france_products
SET icon = '🥛'
WHERE id = 171
  AND restaurant_id = 1
  AND name = 'YAOURT AUX FRUITS'
  AND icon = '🌯';

-- 4. TIRAMISU : 🥞 → ☕
UPDATE france_products
SET icon = '☕'
WHERE id = 176
  AND restaurant_id = 1
  AND name = 'TIRAMISU'
  AND icon = '🥞';

-- =====================================================================
-- VÉRIFICATIONS FINALES
-- =====================================================================

SELECT
  'CATÉGORIES CORRIGÉES' as section,
  id,
  name,
  icon
FROM france_menu_categories
WHERE id IN (19, 22, 23, 38)
  AND restaurant_id = 1
ORDER BY id;

SELECT
  'PRODUITS CORRIGÉS' as section,
  id,
  name,
  icon
FROM france_products
WHERE id IN (170, 171, 176, 201)
  AND restaurant_id = 1
ORDER BY id;

-- =====================================================================
-- PARTIE 3 : CORRECTION ICÔNES OPTIONS (france_product_options)
-- =====================================================================

-- 1. FROMAGES & LÉGUMES : 🥗 → 🥬 (légume feuille)
UPDATE france_product_options
SET icon = '🥬'
WHERE option_group = 'FROMAGES & LÉGUMES'
  AND icon = '🥗';

-- 2. COCA ZERO (Boisson) : ⚫ → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE option_group = 'Boisson'
  AND option_name LIKE '%COCA ZERO%'
  AND icon = '⚫';

-- 3. OASIS TROPICAL (Boisson) : 🧡 → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE option_group = 'Boisson'
  AND option_name LIKE '%OASIS TROPICAL%'
  AND icon = '🧡';

-- 4. COCA ZERO (Boisson 1.5L incluse) : ⚫ → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE option_group = 'Boisson 1.5L incluse'
  AND option_name LIKE '%COCA ZERO%'
  AND icon = '⚫';

-- 5. OASIS TROPICAL (Boisson 1.5L incluse) : 🧡 → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE option_group = 'Boisson 1.5L incluse'
  AND option_name LIKE '%OASIS TROPICAL%'
  AND icon = '🧡';

-- 6. COCA ZERO (Boisson 33CL incluse) : ⚫ → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE option_group = 'Boisson 33CL incluse'
  AND option_name LIKE '%COCA ZERO%'
  AND icon = '⚫';

-- 7. OASIS TROPICAL (Boisson 33CL incluse) : 🧡 → 🥤
UPDATE france_product_options
SET icon = '🥤'
WHERE option_group = 'Boisson 33CL incluse'
  AND option_name LIKE '%OASIS TROPICAL%'
  AND icon = '🧡';

-- 8. Taille : 🌯 → 📏
UPDATE france_product_options
SET icon = '📏'
WHERE option_group = 'Taille'
  AND icon = '🌯';

-- =====================================================================
-- VÉRIFICATIONS OPTIONS
-- =====================================================================

SELECT
  'OPTIONS CORRIGÉES - FROMAGES & LÉGUMES' as section,
  COUNT(*) as nb_corrections,
  '🥗 → 🥬' as changement
FROM france_product_options
WHERE option_group = 'FROMAGES & LÉGUMES'
  AND icon = '🥬';

SELECT
  'OPTIONS CORRIGÉES - BOISSONS' as section,
  option_group,
  COUNT(*) as nb_corrections
FROM france_product_options
WHERE (option_group LIKE '%Boisson%')
  AND icon = '🥤'
  AND (option_name LIKE '%COCA ZERO%' OR option_name LIKE '%OASIS TROPICAL%')
GROUP BY option_group;

SELECT
  'OPTIONS CORRIGÉES - TAILLE' as section,
  COUNT(*) as nb_corrections,
  '🌯 → 📏' as changement
FROM france_product_options
WHERE option_group = 'Taille'
  AND icon = '📏';

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ CATÉGORIES : 4 icônes corrigées (MENU MIDI, MENU ENFANT, CHICKEN BOX, SNACKS)
-- ✅ PRODUITS : 4 icônes corrigées (TACOS, SALADE DE FRUITS, YAOURT, TIRAMISU)
-- ✅ OPTIONS : ~80 icônes corrigées (FROMAGES & LÉGUMES, COCA ZERO, OASIS, TAILLE)
-- ✅ Total : ~88 corrections
-- ========================================================================
