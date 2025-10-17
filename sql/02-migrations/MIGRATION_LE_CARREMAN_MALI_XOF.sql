-- ========================================================================
-- MIGRATION : Le Carreman - Passage à la devise XOF (franc CFA - Mali)
-- DATE: 2025-01-XX
-- ENVIRONNEMENT: DEV
-- RESTAURANT: Le Carreman (id=17)
-- ========================================================================
-- OBJECTIF:
-- 1. Changer la devise de GNF vers XOF (franc CFA pour le Mali)
-- 2. Mettre à jour tous les prix avec des valeurs raisonnables pour la démo Mali
-- ========================================================================

BEGIN;

-- ========================================================================
-- ÉTAPE 1 : MISE À JOUR DU RESTAURANT
-- ========================================================================

-- Changement de la devise et des frais
UPDATE france_restaurants
SET
    currency = 'XOF',
    delivery_fee = 1000,        -- 1000 FCFA de livraison
    min_order_amount = 2000,    -- Montant minimum 2000 FCFA
    updated_at = NOW()
WHERE id = 17 AND slug = 'le-carreman';

-- ========================================================================
-- ÉTAPE 2 : MISE À JOUR DES PRIX DES PRODUITS
-- ========================================================================

-- ========================================================================
-- CONVERSION AUTOMATIQUE : Multiplication par 655 (taux EUR → FCFA)
-- Puis arrondi à des valeurs arrondies pour le marché malien
-- ========================================================================

-- BOISSONS 33CL (actuellement 1.5 EUR = 982 FCFA)
-- Arrondi à 1000 FCFA sur place, 1250 FCFA livraison
UPDATE france_products
SET
    price_on_site_base = 1000,
    price_delivery_base = 1250,
    updated_at = NOW()
WHERE restaurant_id = 17
  AND id IN (431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442);

-- BOISSONS 1L5 (actuellement 0 EUR - à définir)
-- Prix proposé : 2000 FCFA sur place, 2500 FCFA livraison
UPDATE france_products
SET
    price_on_site_base = 2000,
    price_delivery_base = 2500,
    updated_at = NOW()
WHERE restaurant_id = 17
  AND id IN (443, 444, 445, 446);

-- DESSERTS (actuellement 2-3.5 EUR = 1310-2290 FCFA)
-- Arrondis : 1500, 2000, 2500 FCFA
UPDATE france_products SET price_on_site_base = 1500, price_delivery_base = 1500, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (423, 424);  -- 2 EUR

UPDATE france_products SET price_on_site_base = 2000, price_delivery_base = 2000, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (425, 426, 427);  -- 2.5 EUR

UPDATE france_products SET price_on_site_base = 2500, price_delivery_base = 2500, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (428, 429);  -- 3 EUR

UPDATE france_products SET price_on_site_base = 3000, price_delivery_base = 3000, updated_at = NOW()
WHERE restaurant_id = 17 AND id = 430;  -- 3.5 EUR (FINGER)

-- SALADES (actuellement 4-7.5 EUR = 2620-4910 FCFA)
-- Arrondis : 3000 et 5000 FCFA
UPDATE france_products SET price_on_site_base = 3000, price_delivery_base = 3500, updated_at = NOW()
WHERE restaurant_id = 17 AND id = 447;  -- 4 EUR (VERTE v9)

UPDATE france_products SET price_on_site_base = 5000, price_delivery_base = 5500, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (448, 449, 450, 451, 452);  -- 7.5 EUR

-- SANDWICHS (actuellement 8-10 EUR = 5240-6550 FCFA)
-- Arrondis pour le Mali : 5000-7000 FCFA

-- 8 EUR → 5000 FCFA sur place, 5500 FCFA livraison
UPDATE france_products SET price_on_site_base = 5000, price_delivery_base = 5500, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (412, 413, 416);  -- LE GREC, L'ESCALOPE, LE TANDOORI

-- 8.5 EUR → 5500 FCFA sur place, 6000 FCFA livraison
UPDATE france_products SET price_on_site_base = 5500, price_delivery_base = 6000, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (414, 417, 419, 420, 421);  -- LE BUFFALO, LE BOURSIN, AMÉRICAIN, DU CHEF, LE RADICAL

-- 9.5 EUR → 6000 FCFA sur place, 6500 FCFA livraison
UPDATE france_products SET price_on_site_base = 6000, price_delivery_base = 6500, updated_at = NOW()
WHERE restaurant_id = 17 AND id IN (418, 422);  -- ROYAL, RACLETTE

-- 10 EUR → 7000 FCFA sur place, 7500 FCFA livraison
UPDATE france_products SET price_on_site_base = 7000, price_delivery_base = 7500, updated_at = NOW()
WHERE restaurant_id = 17 AND id = 415;  -- FOREST

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier le restaurant
SELECT
    id,
    name,
    slug,
    currency,
    delivery_fee,
    min_order_amount
FROM france_restaurants
WHERE id = 17;

-- Vérifier les produits par catégorie de prix
SELECT
    'BOISSONS 33CL' as categorie,
    COUNT(*) as nombre,
    MIN(price_on_site_base) as prix_min,
    MAX(price_on_site_base) as prix_max
FROM france_products
WHERE restaurant_id = 17
  AND price_on_site_base = 500

UNION ALL

SELECT
    'BOISSONS 1L5' as categorie,
    COUNT(*) as nombre,
    MIN(price_on_site_base) as prix_min,
    MAX(price_on_site_base) as prix_max
FROM france_products
WHERE restaurant_id = 17
  AND price_on_site_base = 1200

UNION ALL

SELECT
    'DESSERTS' as categorie,
    COUNT(*) as nombre,
    MIN(price_on_site_base) as prix_min,
    MAX(price_on_site_base) as prix_max
FROM france_products
WHERE restaurant_id = 17
  AND price_on_site_base BETWEEN 1000 AND 2000

UNION ALL

SELECT
    'SALADES' as categorie,
    COUNT(*) as nombre,
    MIN(price_on_site_base) as prix_min,
    MAX(price_on_site_base) as prix_max
FROM france_products
WHERE restaurant_id = 17
  AND price_on_site_base BETWEEN 2000 AND 3500
  AND name LIKE '%v9%' OR name IN ('ROMAINE', 'CREVETTE AVOCAT', 'NIÇOISE', 'CHÈVRE CHAUD', 'CESAR')

UNION ALL

SELECT
    'SANDWICHS' as categorie,
    COUNT(*) as nombre,
    MIN(price_on_site_base) as prix_min,
    MAX(price_on_site_base) as prix_max
FROM france_products
WHERE restaurant_id = 17
  AND price_on_site_base BETWEEN 3500 AND 4500
  AND product_type = 'composite';

-- Liste complète des produits avec leurs nouveaux prix
SELECT
    id,
    name,
    product_type,
    price_on_site_base as prix_sur_place_fcfa,
    price_delivery_base as prix_livraison_fcfa,
    (price_delivery_base - price_on_site_base) as difference_livraison
FROM france_products
WHERE restaurant_id = 17
ORDER BY price_on_site_base, name;

-- Résumé final
SELECT
    'TOTAL PRODUITS' as info,
    COUNT(*) as valeur
FROM france_products
WHERE restaurant_id = 17

UNION ALL

SELECT
    'PRIX MIN (FCFA)',
    MIN(price_on_site_base)
FROM france_products
WHERE restaurant_id = 17

UNION ALL

SELECT
    'PRIX MAX (FCFA)',
    MAX(price_on_site_base)
FROM france_products
WHERE restaurant_id = 17;

-- ========================================================================
-- Si tout est correct, exécuter COMMIT;
-- En cas de problème, exécuter ROLLBACK;
-- ========================================================================

COMMIT;
