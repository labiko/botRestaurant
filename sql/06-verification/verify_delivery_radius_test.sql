-- 🔍 VÉRIFICATION CONFIGURATION ET CALCUL DISTANCE
-- Test : Adresse "76 All. de Bercy, 75012 Paris" vs rayon 3km du restaurant

-- 1. Vérifier la configuration du restaurant
SELECT 
    id,
    name,
    delivery_zone_km,
    latitude AS restaurant_lat,
    longitude AS restaurant_lng,
    CASE 
        WHEN delivery_zone_km IS NULL THEN 'Utilise défaut 5km'
        ELSE 'Configuration OK'
    END AS config_status
FROM france_restaurants 
WHERE id = 1;

-- 2. Coordonnées de l'adresse test (à obtenir via Google Places)
-- "76 All. de Bercy, 75012 Paris" 
-- Coordonnées approximatives : 48.8404, 2.3777

-- 3. Calculer la distance avec la formule Haversine
WITH restaurant_config AS (
    SELECT 
        id,
        name,
        COALESCE(delivery_zone_km, 5) as zone_km,
        latitude as rest_lat,
        longitude as rest_lng
    FROM france_restaurants 
    WHERE id = 1
),
test_address AS (
    SELECT 
        48.8404 as addr_lat,  -- Latitude approximative Allée de Bercy
        2.3777 as addr_lng    -- Longitude approximative Allée de Bercy
)
SELECT 
    r.name,
    r.zone_km as "Rayon_Autorisé_KM",
    r.rest_lat as "Restaurant_Latitude",
    r.rest_lng as "Restaurant_Longitude", 
    a.addr_lat as "Adresse_Latitude",
    a.addr_lng as "Adresse_Longitude",
    
    -- Calcul distance Haversine
    ROUND(
        6371 * acos(
            cos(radians(r.rest_lat)) * 
            cos(radians(a.addr_lat)) * 
            cos(radians(a.addr_lng) - radians(r.rest_lng)) + 
            sin(radians(r.rest_lat)) * 
            sin(radians(a.addr_lat))
        )::numeric, 2
    ) as "Distance_Calculée_KM",
    
    -- Validation
    CASE 
        WHEN 6371 * acos(
            cos(radians(r.rest_lat)) * 
            cos(radians(a.addr_lat)) * 
            cos(radians(a.addr_lng) - radians(r.rest_lng)) + 
            sin(radians(r.rest_lat)) * 
            sin(radians(a.addr_lat))
        ) <= r.zone_km THEN '✅ DANS LA ZONE'
        ELSE '❌ HORS ZONE'
    END as "Statut_Validation",
    
    -- Écart
    ROUND((
        6371 * acos(
            cos(radians(r.rest_lat)) * 
            cos(radians(a.addr_lat)) * 
            cos(radians(a.addr_lng) - radians(r.rest_lng)) + 
            sin(radians(r.rest_lat)) * 
            sin(radians(a.addr_lat))
        ) - r.zone_km
    )::numeric, 2) as "Ecart_KM"
    
FROM restaurant_config r, test_address a;

-- 4. Vérifier les coordonnées exactes si l'adresse a déjà été validée par Google Places
SELECT 
    full_address,
    latitude,
    longitude,
    created_at
FROM france_customer_addresses 
WHERE full_address ILIKE '%bercy%' 
   OR full_address ILIKE '%75012%'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Alternative : Calculer avec des coordonnées plus précises
-- Si vous avez les vraies coordonnées de Google Places, remplacez ici :
/*
WITH test_precise AS (
    SELECT 
        48.840123 as lat,  -- Remplacer par la vraie latitude
        2.377456 as lng    -- Remplacer par la vraie longitude
)
SELECT 
    ROUND(
        6371 * acos(
            cos(radians((SELECT latitude FROM france_restaurants WHERE id = 1))) * 
            cos(radians(t.lat)) * 
            cos(radians(t.lng) - radians((SELECT longitude FROM france_restaurants WHERE id = 1))) + 
            sin(radians((SELECT latitude FROM france_restaurants WHERE id = 1))) * 
            sin(radians(t.lat))
        )::numeric, 2
    ) as distance_precise_km
FROM test_precise t;
*/