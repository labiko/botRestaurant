-- ========================================================================
-- SCRIPT: Correction icône produit MENU ENFANT
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- PROBLÈME:
-- Le produit MENU ENFANT n'a pas d'icône définie, le bot affiche 📋 par défaut
--
-- SOLUTION:
-- Ajouter l'icône 🧒 au produit MENU ENFANT
-- ========================================================================

BEGIN;

-- Mise à jour icône produit MENU ENFANT
UPDATE france_products
SET icon = '🧒'
WHERE id = 235
  AND restaurant_id = 1
  AND name = 'MENU ENFANT'
  AND (icon IS NULL OR icon = '');

-- Vérification
SELECT
  id,
  name,
  icon,
  category_id,
  workflow_type
FROM france_products
WHERE id = 235
  AND restaurant_id = 1;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ MENU ENFANT (ID: 235) → icône 🧒
-- ========================================================================
