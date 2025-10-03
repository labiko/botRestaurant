-- ========================================
-- SQL pour vérifier les données complètes des commandes
-- avec adresses et coordonnées GPS
-- TABLES CORRECTES: france_orders, france_restaurants
-- ========================================

-- 1. VOIR LES 10 DERNIÈRES COMMANDES AVEC TOUTES LES INFOS
SELECT
    o.id,
    o.order_number,
    o.restaurant_id,
    r.name as restaurant_name,
    o.phone_number,
    o.customer_name,
    o.delivery_mode,
    o.delivery_address,
    o.delivery_latitude,
    o.delivery_longitude,
    o.delivery_address_type,
    o.total_amount,
    o.status,
    o.notes,
    o.created_at
FROM france_orders o
LEFT JOIN france_restaurants r ON r.id = o.restaurant_id
ORDER BY o.created_at DESC
LIMIT 10;

-- ========================================

-- 2. COMMANDES AVEC GPS MAIS SANS ADRESSE TEXTE
SELECT
    o.id,
    o.order_number,
    o.delivery_mode,
    o.delivery_address,
    o.delivery_latitude,
    o.delivery_longitude,
    CASE
        WHEN o.delivery_address IS NULL OR o.delivery_address = '' THEN '❌ Pas d''adresse texte'
        ELSE '✅ Adresse texte OK'
    END as adresse_status,
    CASE
        WHEN o.delivery_latitude IS NOT NULL AND o.delivery_longitude IS NOT NULL THEN '✅ GPS disponible'
        ELSE '❌ Pas de GPS'
    END as gps_status
FROM france_orders o
WHERE o.delivery_mode = 'livraison'
    AND o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- ========================================

-- 3. DÉTAILS D'UNE COMMANDE SPÉCIFIQUE (remplacer 190 par votre ID)
SELECT
    o.*,
    r.name as restaurant_name,
    r.whatsapp_number as restaurant_whatsapp
FROM france_orders o
LEFT JOIN france_restaurants r ON r.id = o.restaurant_id
WHERE o.id = 190;

-- ========================================

-- 4. ITEMS D'UNE COMMANDE (stockés en JSON dans la colonne items)
SELECT
    o.id,
    o.order_number,
    o.items,
    jsonb_array_length(o.items) as nombre_items,
    jsonb_pretty(o.items) as items_formattes
FROM france_orders o
WHERE o.id = 190;  -- Remplacer par votre order_id

-- 4b. Extraction des items JSON
SELECT
    o.id,
    o.order_number,
    item->>'productName' as product_name,
    item->>'quantity' as quantity,
    item->>'unitPrice' as unit_price,
    item->>'totalPrice' as total_price,
    item->>'configuration' as configuration
FROM france_orders o,
     jsonb_array_elements(o.items) as item
WHERE o.id = 190  -- Remplacer par votre order_id
ORDER BY o.id;

-- ========================================

-- 5. STATISTIQUES ADRESSES vs GPS
SELECT
    o.delivery_mode,
    COUNT(*) as total,
    SUM(CASE WHEN o.delivery_address IS NOT NULL AND o.delivery_address != '' THEN 1 ELSE 0 END) as avec_adresse_texte,
    SUM(CASE WHEN o.delivery_latitude IS NOT NULL THEN 1 ELSE 0 END) as avec_gps,
    SUM(CASE WHEN (o.delivery_address IS NULL OR o.delivery_address = '')
             AND o.delivery_latitude IS NOT NULL THEN 1 ELSE 0 END) as gps_uniquement
FROM france_orders o
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY o.delivery_mode;

-- ========================================

-- 6. COMMANDE LA PLUS RÉCENTE AVEC ITEMS DÉTAILLÉS
WITH latest_order AS (
    SELECT id, items FROM france_orders
    WHERE restaurant_id = 7  -- Pizza Yolo 77
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT
    o.id,
    o.order_number,
    o.customer_name,
    o.phone_number,
    o.delivery_mode,
    o.delivery_address,
    o.delivery_latitude,
    o.delivery_longitude,
    o.total_amount,
    o.status,
    jsonb_pretty(o.items) as items_detail
FROM france_orders o
WHERE o.id = (SELECT id FROM latest_order);

-- ========================================

-- 7. EXEMPLES DE COMMANDES AVEC GPS ET/OU ADRESSE
SELECT
    o.id,
    o.order_number,
    o.customer_name,
    o.delivery_mode,
    CASE
        WHEN o.delivery_address IS NOT NULL AND o.delivery_address != '' THEN
            'ADRESSE: ' || o.delivery_address
        WHEN o.delivery_latitude IS NOT NULL THEN
            'GPS: ' || o.delivery_latitude || ', ' || o.delivery_longitude
        ELSE 'Pas d''adresse'
    END as localisation,
    o.total_amount,
    o.created_at::date as date_commande
FROM france_orders o
WHERE o.delivery_mode = 'livraison'
ORDER BY o.created_at DESC
LIMIT 20;

-- ========================================
-- NOTES D'UTILISATION:
-- 1. Remplacez les IDs par vos valeurs réelles
-- 2. Les items sont stockés en JSON dans la colonne 'items'
-- 3. Les GPS sont dans delivery_latitude/longitude
-- 4. L'adresse texte est dans delivery_address
-- 5. Table principale: france_orders (pas orders)
-- ========================================