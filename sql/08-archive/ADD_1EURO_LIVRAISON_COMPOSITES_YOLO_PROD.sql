-- ========================================================================
-- SCRIPT: Ajout +1€ prix livraison - PRODUITS COMPOSITES
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-01-17
--
-- OBJECTIF: Ajouter price_delivery_base = 1.00€ sur 7 produits composites
-- CORRECTION RÉGRESSION: Migration workflow V2 avait cassé le mode livraison
-- ========================================================================

BEGIN;

-- 1. TACOS (ID: 201)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 201
  AND restaurant_id = 1
  AND name = 'TACOS';

-- 2. BURGERS (ID: 658)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 658
  AND restaurant_id = 1
  AND name = 'BURGERS';

-- 3. GOURMETS (ID: 660)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 660
  AND restaurant_id = 1
  AND name = 'GOURMETS';

-- 4. SMASHS (ID: 661)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 661
  AND restaurant_id = 1
  AND name = 'SMASHS';

-- 5. NAANS (ID: 662)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 662
  AND restaurant_id = 1
  AND name = 'NAANS';

-- 6. PANINI (ID: 664)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 664
  AND restaurant_id = 1
  AND name = 'PANINI';

-- 7. ASSIETTES (ID: 665)
UPDATE france_products
SET price_delivery_base = 1.00
WHERE id = 665
  AND restaurant_id = 1
  AND name = 'ASSIETTES';

-- Vérification
SELECT
    id,
    name,
    price_on_site_base AS "Base sur place",
    price_delivery_base AS "Base livraison (+1€)",
    CASE
        WHEN price_delivery_base = 1.00 THEN '✅ OK'
        ELSE '❌ À corriger'
    END AS "Statut"
FROM france_products
WHERE id IN (201, 658, 660, 661, 662, 664, 665)
  AND restaurant_id = 1
ORDER BY id;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU: 7 produits avec price_delivery_base = 1.00€
-- SANDWICHS (663) déjà à 1.00€ - Pas de modification nécessaire
--
-- LOGIQUE PRIX APRÈS CETTE MISE À JOUR:
-- - Sur place : price_on_site_base (0€) + price_modifier (8€) = 8€
-- - Livraison : price_delivery_base (1€) + price_modifier (8€) = 9€
-- ========================================================================
