-- ========================================================================
-- SCRIPT: Correction icônes de TOUS les produits MENU
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- PROBLÈME:
-- Plusieurs produits MENU n'ont pas d'icône définie
--
-- SOLUTION:
-- Ajouter les icônes appropriées à tous les produits MENU
-- ========================================================================

BEGIN;

-- 1. MENU PIZZA (Menu 1, 2, 3, 4) → 📋
UPDATE france_products
SET icon = '📋'
WHERE id IN (310, 311, 312, 313)
  AND restaurant_id = 1
  AND (icon IS NULL OR icon = '');

-- 2. MENU FAMILY → 👨‍👩‍👧‍👦
UPDATE france_products
SET icon = '👨‍👩‍👧‍👦'
WHERE id = 383
  AND restaurant_id = 1
  AND name = 'MENU FAMILY'
  AND (icon IS NULL OR icon = '');

-- 3. MENU MIDI COMPLET → 📋
UPDATE france_products
SET icon = '📋'
WHERE id = 403
  AND restaurant_id = 1
  AND name = '📋 MENU MIDI COMPLET'
  AND (icon IS NULL OR icon = '');

-- =====================================================================
-- VÉRIFICATION FINALE
-- =====================================================================

SELECT
  'PRODUITS MENU CORRIGÉS' as section,
  id,
  name,
  icon,
  category_id
FROM france_products
WHERE id IN (310, 311, 312, 313, 235, 383, 403)
  AND restaurant_id = 1
ORDER BY category_id, id;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ MENU 1, 2, 3, 4 → 📋
-- ✅ MENU ENFANT → 🧒 (déjà corrigé)
-- ✅ MENU FAMILY → 👨‍👩‍👧‍👦
-- ✅ MENU MIDI COMPLET → 📋
-- ✅ Total: 7 produits avec icônes
-- ========================================================================
