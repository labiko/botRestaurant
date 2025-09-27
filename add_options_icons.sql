-- ================================================
-- PHASE 2B - AJOUT ICÔNES POUR OPTIONS WORKFLOW
-- ================================================
-- Ajout colonne icon pour france_product_options (Thiep/Yassa)

BEGIN;

-- Ajouter colonne icon à france_product_options
ALTER TABLE france_product_options
ADD COLUMN icon VARCHAR(10) DEFAULT NULL;

-- Test: Ajouter icônes pour Thiep et Yassa
UPDATE france_product_options
SET icon = '🍛'
WHERE LOWER(option_name) LIKE '%thiep%';

UPDATE france_product_options
SET icon = '🍖'
WHERE LOWER(option_name) LIKE '%yassa%';

-- Vérification
SELECT
  id,
  option_name,
  icon,
  CASE
    WHEN icon IS NOT NULL THEN 'AVEC icône: ' || icon
    ELSE 'SANS icône'
  END as status
FROM france_product_options
WHERE LOWER(option_name) LIKE '%thiep%' OR LOWER(option_name) LIKE '%yassa%'
ORDER BY option_name;

COMMIT;

-- Résultat attendu:
-- AVANT: 1. Thiep
-- APRÈS: 1. 🍛 Thiep
--
-- AVANT: 2. Yassa (+2€)
-- APRÈS: 2. 🍖 Yassa (+2€)