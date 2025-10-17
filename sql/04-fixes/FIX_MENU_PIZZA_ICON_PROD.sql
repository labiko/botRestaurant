-- ========================================================================
-- SCRIPT: Correction icône catégorie Menu Pizza
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- PROBLÈME:
-- La catégorie "Menu Pizza" a l'icône 📋 au lieu de 🍕
--
-- SOLUTION:
-- Remplacer 📋 par 🍕 pour la catégorie Menu Pizza
-- ========================================================================

BEGIN;

-- Correction icône catégorie Menu Pizza
UPDATE france_menu_categories
SET icon = '🍕'
WHERE id = 11
  AND restaurant_id = 1
  AND name = 'Menu Pizza'
  AND icon = '📋';

-- Vérification
SELECT
  id,
  name,
  icon,
  display_order
FROM france_menu_categories
WHERE id = 11
  AND restaurant_id = 1;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ Menu Pizza (ID: 11) → icône 🍕
-- ========================================================================
