-- ========================================================================
-- SCRIPT: Ajout +1€ prix livraison SANDWICHS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: SANDWICHS (ID: 663)
--
-- OBJECTIF: Prix livraison = Prix actuel + 1€
-- EXEMPLE: LE GREC 8€ sur place → 9€ en livraison
-- ========================================================================

BEGIN;

-- Ajouter +1€ sur le prix de base livraison du produit composite SANDWICHS
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 663
  AND restaurant_id = 1
  AND name = 'SANDWICHS';

-- Vérification
SELECT
    id,
    name,
    price_on_site_base AS "Prix base sur place",
    price_delivery_base AS "Prix base livraison (+1€)",
    '✅ Livraison = prix sandwich + 1€' AS "Résultat"
FROM france_products
WHERE id = 663;

-- Exemples de calcul
SELECT
    option_name AS "Sandwich",
    price_modifier AS "Prix sur place",
    (price_modifier + 1.00) AS "Prix livraison",
    '= ' || price_modifier || '€ + 1€' AS "Calcul"
FROM france_product_options
WHERE product_id = 663
  AND option_group = 'Plats'
ORDER BY display_order
LIMIT 5;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- - LE GREC: 8€ sur place → 9€ livraison
-- - L'ESCALOPE: 8€ sur place → 9€ livraison
-- - LE BUFFALO: 8.5€ sur place → 9.5€ livraison
-- - FOREST: 10€ sur place → 11€ livraison
-- - etc.
-- ========================================================================
