-- ========================================================================
-- SCRIPT: Restauration des compositions GOURMETS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: GOURMETS (ID: 660)
-- Date: 2025-10-17
--
-- OBJECTIF: Restaurer les compositions écrasées à NULL
-- ========================================================================

BEGIN;

-- 1. L'AMÉRICAIN
UPDATE france_product_options fpo
SET composition = 'Pain brioché, 2 steaks façon bouchère 150 g, bacon, œuf, cornichon, cheddar, sauce au choix'
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 660
  AND fp.restaurant_id = 1
  AND fp.name = 'GOURMETS'
  AND fpo.option_group = 'Plats'
  AND fpo.option_name = 'L''AMERICAIN';

-- 2. LE SAVOYARD
UPDATE france_product_options fpo
SET composition = 'Pain brioché, steak façon bouchère 150 g, galette de P.D.T, fromage raclette, cornichons, salade, tomate, oignons, sauce au choix'
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 660
  AND fp.restaurant_id = 1
  AND fp.name = 'GOURMETS'
  AND fpo.option_group = 'Plats'
  AND fpo.option_name = 'LE SAVOYARD';

-- 3. LE BBQ
UPDATE france_product_options fpo
SET composition = 'Pain brioché, steak façon bouchère 150 g, bacon, cheddar, oignons, cornichons, salade, sauce au choix'
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 660
  AND fp.restaurant_id = 1
  AND fp.name = 'GOURMETS'
  AND fpo.option_group = 'Plats'
  AND fpo.option_name = 'LE BBQ';

-- 4. LE BIG CHEF
UPDATE france_product_options fpo
SET composition = 'Pain brioché, steak façon bouchère 150 g, salade, tomates, oignons, cheddar, bacon, œuf'
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 660
  AND fp.restaurant_id = 1
  AND fp.name = 'GOURMETS'
  AND fpo.option_group = 'Plats'
  AND fpo.option_name = 'LE BIG CHEF';

-- 5. L'AVOCADO
UPDATE france_product_options fpo
SET composition = 'Pain brioché, 1 steak façon bouchère 150 g, cheddar, avocat, salade, tomate, sauce au choix'
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 660
  AND fp.restaurant_id = 1
  AND fp.name = 'GOURMETS'
  AND fpo.option_group = 'Plats'
  AND fpo.option_name = 'L''AVOCADO';

-- Vérification
SELECT
  option_name AS "Gourmet",
  price_modifier AS "Prix (€)",
  LEFT(composition, 50) || '...' AS "Composition (aperçu)"
FROM france_product_options
WHERE product_id = 660
  AND option_group = 'Plats'
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU: 5 compositions restaurées
-- ========================================================================
