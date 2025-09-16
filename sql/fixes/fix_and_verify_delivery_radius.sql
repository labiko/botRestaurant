-- 🔧 AJOUT DES COORDONNÉES MANQUANTES + VÉRIFICATION

-- 1. D'abord, ajouter les colonnes latitude et longitude si elles n'existent pas
ALTER TABLE france_restaurants 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- 2. Mettre à jour avec les coordonnées du centre-ville de Moissy-Cramayel
UPDATE france_restaurants 
SET 
    latitude = 48.627536,   -- Centre-ville Moissy-Cramayel (Place de la Mairie)
    longitude = 2.593758    -- Centre-ville Moissy-Cramayel
WHERE id = 1 AND (latitude IS NULL OR longitude IS NULL);

-- 3. Vérifier la configuration du restaurant
SELECT 
    id,
    name,
    delivery_zone_km,
    latitude,
    longitude,
    CASE 
        WHEN latitude IS NULL OR longitude IS NULL THEN '❌ Coordonnées manquantes'
        WHEN delivery_zone_km IS NULL THEN 'Utilise défaut 5km'
        ELSE '✅ Configuration OK'
    END AS config_status
FROM france_restaurants 
WHERE id = 1;

-- 4. Test avec l'adresse de Bercy (coordonnées Paris)
-- Si votre restaurant est à Conakry et l'adresse test à Paris, la distance sera énorme
WITH resto AS (
    SELECT 
        name,
        latitude as lat1, 
        longitude as lng1, 
        COALESCE(delivery_zone_km, 5) as zone_km
    FROM france_restaurants WHERE id = 1
),
test_addr AS (
    SELECT 
        '76 All. de Bercy, 75012 Paris' as address,
        48.8404 as lat2,  -- Coordonnées Paris Bercy
        2.3777 as lng2
)
SELECT 
    r.name as restaurant,
    t.address,
    r.zone_km as "Rayon_Autorisé_KM",
    ROUND(r.lat1::numeric, 6) as "Restaurant_Lat",
    ROUND(r.lng1::numeric, 6) as "Restaurant_Lng",
    ROUND(t.lat2::numeric, 6) as "Adresse_Lat", 
    ROUND(t.lng2::numeric, 6) as "Adresse_Lng",
    
    -- Calcul distance Haversine
    ROUND(
        6371 * acos(
            cos(radians(r.lat1)) * cos(radians(t.lat2)) * 
            cos(radians(t.lng2) - radians(r.lng1)) + 
            sin(radians(r.lat1)) * sin(radians(t.lat2))
        )::numeric, 2
    ) as "Distance_KM",
    
    -- Validation
    CASE 
        WHEN 6371 * acos(
            cos(radians(r.lat1)) * cos(radians(t.lat2)) * 
            cos(radians(t.lng2) - radians(r.lng1)) + 
            sin(radians(r.lat1)) * sin(radians(t.lat2))
        ) <= r.zone_km THEN '✅ DANS LA ZONE'
        ELSE '❌ HORS ZONE'
    END as "Résultat_Validation"
    
FROM resto r, test_addr t;

-- 5. Test avec une adresse proche de Moissy-Cramayel
-- Avenue Jean Jaurès, Moissy-Cramayel (environ 1.2km du centre)
WITH resto AS (
    SELECT latitude as lat1, longitude as lng1, delivery_zone_km
    FROM france_restaurants WHERE id = 1
),
test_local AS (
    SELECT 
        'Avenue Jean Jaurès, Moissy-Cramayel' as address,
        48.621456 as lat2,    -- Avenue Jean Jaurès (~1.2km du centre)
        2.586734 as lng2
)
SELECT 
    test_local.address,
    ROUND(
        6371 * acos(
            cos(radians(resto.lat1)) * cos(radians(test_local.lat2)) * 
            cos(radians(test_local.lng2) - radians(resto.lng1)) + 
            sin(radians(resto.lat1)) * sin(radians(test_local.lat2))
        )::numeric, 2
    ) as "Distance_KM",
    CASE 
        WHEN 6371 * acos(
            cos(radians(resto.lat1)) * cos(radians(test_local.lat2)) * 
            cos(radians(test_local.lng2) - radians(resto.lng1)) + 
            sin(radians(resto.lat1)) * sin(radians(test_local.lat2))
        ) <= resto.delivery_zone_km THEN 'DANS ZONE ✅'
        ELSE 'HORS ZONE ❌'
    END as "Résultat"
FROM resto, test_local;