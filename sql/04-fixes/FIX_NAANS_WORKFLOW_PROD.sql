-- ========================================================================
-- SCRIPT: Correction URGENTE - Restauration NAANS en produit SIMPLE
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: NAANS (ID: 662)
-- Date: 2025-10-17
--
-- PROBLÈME: Le workflow-edit a transformé NAANS en produit composite
-- SOLUTION: Restaurer comme produit SIMPLE avec seulement le groupe Plats
-- ========================================================================

BEGIN;

-- 1. RÉINITIALISER LE PRODUIT EN MODE SIMPLE
UPDATE france_products
SET
  workflow_type = 'simple',
  steps_config = NULL,
  price_on_site_base = 0.00,
  price_delivery_base = 0.00
WHERE id = 662
  AND restaurant_id = 1;

-- 2. SUPPRIMER TOUS LES GROUPES SAUF "Plats"
DELETE FROM france_product_options fpo
USING france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 662
  AND fp.restaurant_id = 1
  AND fp.name = 'NAANS'
  AND fpo.option_group != 'Plats';

-- 3. VÉRIFIER QUE LES 4 PLATS SONT CORRECTS
-- (Le script UPDATE_NAANS_PROD.sql les a déjà mis à jour avec les bonnes compositions et prix)

-- Vérification finale
SELECT
  'Produit' as type,
  name,
  workflow_type,
  price_on_site_base,
  price_delivery_base,
  steps_config
FROM france_products
WHERE id = 662;

SELECT
  'Options' as type,
  option_group,
  option_name,
  price_modifier,
  composition
FROM france_product_options
WHERE product_id = 662
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- - Produit workflow_type = 'simple' ✅
-- - steps_config = NULL ✅
-- - Seulement le groupe "Plats" avec 4 options ✅
-- - Bot affiche directement les 4 NAANS au choix ✅
-- ========================================================================
