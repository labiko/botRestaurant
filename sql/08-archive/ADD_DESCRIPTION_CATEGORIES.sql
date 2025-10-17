-- ========================================================================
-- SCRIPT: Ajout colonne description aux catégories
-- Table: france_menu_categories
-- Date: 2025-10-17
--
-- OBJECTIF:
-- 1. Ajouter colonne description pour les catégories
-- 2. Ajouter la description pour SALADES
-- ========================================================================

BEGIN;

-- 1. AJOUTER LA COLONNE DESCRIPTION
ALTER TABLE france_menu_categories
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. AJOUTER LA DESCRIPTION POUR SALADES
UPDATE france_menu_categories
SET description = 'servies avec un pain maison & sauce vinaigrette'
WHERE name = 'SALADES'
  AND restaurant_id = 1;

-- Vérification finale
SELECT
  id,
  name AS "Catégorie",
  icon AS "Icône",
  description AS "Description",
  CASE
    WHEN description IS NOT NULL THEN '✅ Description ajoutée'
    ELSE '⚠️ Pas de description'
  END AS "Statut"
FROM france_menu_categories
WHERE restaurant_id = 1
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- - Colonne description créée ✅
-- - SALADES avec description "servies avec..." ✅
-- ========================================================================
