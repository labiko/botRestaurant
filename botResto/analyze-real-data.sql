-- ========================================
-- ANALYSE DES DONNÉES RÉELLES EN BASE
-- Pour comprendre la structure exacte des adresses et GPS
-- ========================================

-- 1. VOIR TOUTES LES VARIANTES D'ADRESSES (texte, GPS, mixte)
SELECT
    o.id,
    o.order_number,
    o.delivery_mode,
    -- Adresse texte
    LENGTH(COALESCE(o.delivery_address, '')) as longueur_adresse,
    SUBSTRING(o.delivery_address, 1, 50) as debut_adresse,
    -- GPS
    o.delivery_latitude,
    o.delivery_longitude,
    o.delivery_address_type,
    -- Analyse
    CASE
        WHEN o.delivery_address IS NOT NULL AND o.delivery_address != ''
             AND o.delivery_latitude IS NOT NULL THEN '✅ COMPLET (Adresse + GPS)'
        WHEN o.delivery_address IS NOT NULL AND o.delivery_address != '' THEN '📝 Adresse texte seule'
        WHEN o.delivery_latitude IS NOT NULL THEN '📍 GPS seul'
        ELSE '❌ Aucune localisation'
    END as type_localisation
FROM france_orders o
WHERE o.created_at >= NOW() - INTERVAL '30 days'
ORDER BY o.created_at DESC
LIMIT 30;

-- ========================================

-- 2. EXEMPLES CONCRETS PAR TYPE
-- Commandes avec adresse texte uniquement
SELECT 'AVEC ADRESSE TEXTE' as type, o.id, o.order_number, o.delivery_address
FROM france_orders o
WHERE o.delivery_address IS NOT NULL
    AND o.delivery_address != ''
    AND o.delivery_latitude IS NULL
    AND o.delivery_mode = 'livraison'
LIMIT 3

UNION ALL

-- Commandes avec GPS uniquement
SELECT 'AVEC GPS SEUL' as type, o.id, o.order_number,
       'LAT: ' || o.delivery_latitude || ', LON: ' || o.delivery_longitude as localisation
FROM france_orders o
WHERE (o.delivery_address IS NULL OR o.delivery_address = '')
    AND o.delivery_latitude IS NOT NULL
    AND o.delivery_mode = 'livraison'
LIMIT 3

UNION ALL

-- Commandes avec les deux
SELECT 'ADRESSE + GPS' as type, o.id, o.order_number,
       o.delivery_address || ' [GPS: ' || o.delivery_latitude || ',' || o.delivery_longitude || ']'
FROM france_orders o
WHERE o.delivery_address IS NOT NULL
    AND o.delivery_address != ''
    AND o.delivery_latitude IS NOT NULL
    AND o.delivery_mode = 'livraison'
LIMIT 3;

-- ========================================

-- 3. STRUCTURE JSON DES ITEMS POUR LE TICKET
SELECT
    o.id,
    o.order_number,
    item->>'productName' as nom_produit,
    item->>'categoryName' as categorie,
    (item->>'quantity')::int as quantite,
    (item->>'unitPrice')::numeric as prix_unitaire,
    (item->>'totalPrice')::numeric as prix_total,
    item->'configuration' as config_json,
    -- Configuration détaillée
    item->'configuration'->'size'->0->>'size_name' as taille,
    item->'configuration'->'viande' as viandes,
    item->'configuration'->'sauce' as sauces,
    item->'configuration'->'boisson' as boissons
FROM france_orders o,
     jsonb_array_elements(o.items) as item
WHERE o.id IN (
    SELECT id FROM france_orders
    WHERE items IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
);

-- ========================================

-- 4. FORMAT COMPLET POUR TICKET D'IMPRESSION
WITH recent_order AS (
    SELECT * FROM france_orders
    WHERE delivery_mode = 'livraison'
        AND items IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT
    o.id,
    o.order_number,
    o.customer_name,
    o.phone_number,
    o.delivery_mode,
    -- Localisation formatée pour le ticket
    CASE
        WHEN o.delivery_address IS NOT NULL AND o.delivery_address != '' THEN
            o.delivery_address
        WHEN o.delivery_latitude IS NOT NULL THEN
            '📍 GPS: ' || ROUND(o.delivery_latitude::numeric, 6) || ', ' || ROUND(o.delivery_longitude::numeric, 6)
        ELSE 'Pas d''adresse'
    END as adresse_pour_ticket,
    o.total_amount,
    o.notes,
    o.additional_notes,
    -- Items formatés
    (
        SELECT string_agg(
            format('- %sx %s: %s€',
                item->>'quantity',
                item->>'productName',
                item->>'totalPrice'
            ), E'\n'
        )
        FROM jsonb_array_elements(o.items) as item
    ) as items_formates
FROM recent_order o;

-- ========================================
-- NOTES:
-- 1. delivery_address = adresse texte saisie
-- 2. delivery_latitude/longitude = coordonnées GPS
-- 3. delivery_address_type = 'text' ou 'geolocation'
-- 4. Les items sont en JSON avec configuration complète
-- ========================================