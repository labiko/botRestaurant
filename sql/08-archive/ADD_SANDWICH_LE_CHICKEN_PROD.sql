-- ========================================================================
-- SCRIPT: Ajout nouveau sandwich LE CHICKEN
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: SANDWICHS (ID: 663)
-- Date: 2025-10-17
--
-- OBJECTIF: Ajouter LE CHICKEN à 9€
-- ========================================================================

BEGIN;

-- Insérer le nouveau sandwich
INSERT INTO france_product_options (
    product_id,
    option_group,
    option_name,
    price_modifier,
    composition,
    display_order,
    icon,
    is_active
)
SELECT
    663,                                    -- product_id (SANDWICHS)
    'Plats',                                -- option_group
    'LE CHICKEN',                           -- option_name
    9.00,                                   -- price_modifier (9€)
    'Poulet mariné au curry, fromage',     -- composition
    12,                                     -- display_order (après les 11 existants)
    '🐔',                                   -- icon
    true                                    -- is_active
FROM france_products
WHERE id = 663
  AND restaurant_id = 1
  AND name = 'SANDWICHS';

-- Vérification
SELECT
    fpo.option_name AS "Sandwich",
    fpo.price_modifier AS "Prix (€)",
    fpo.composition AS "Composition",
    fpo.icon AS "Icône",
    fpo.display_order AS "Ordre"
FROM france_product_options fpo
JOIN france_products fp ON fpo.product_id = fp.id
WHERE fp.id = 663
  AND fp.restaurant_id = 1
  AND fpo.option_group = 'Plats'
  AND fpo.option_name = 'LE CHICKEN';

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- - LE CHICKEN: 9.00€
-- - Composition: Poulet mariné au curry, fromage
-- - Icône: 🐔
-- - Display order: 12
-- ========================================================================
