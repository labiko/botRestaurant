-- Debug queries pour analyser le problème de distance

-- 1. Vérifier les données des commandes de livraison
SELECT 
    id,
    numero_commande,
    mode,
    adresse_livraison,
    latitude_livraison,
    longitude_livraison,
    distance_km,
    created_at
FROM commandes 
WHERE mode = 'livraison' 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Vérifier les données du restaurant
SELECT 
    id,
    nom,
    latitude,
    longitude,
    adresse
FROM restaurants 
WHERE id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90';

-- 3. Vérifier l'utilisateur restaurant
SELECT 
    id,
    restaurant_id,
    email,
    nom,
    is_active
FROM restaurant_users 
WHERE email = 'adminbrasserie@restaurant.com';

-- 4. Vérifier si les coordonnées existent pour toutes les commandes
SELECT 
    COUNT(*) as total_commandes,
    COUNT(latitude_livraison) as avec_latitude,
    COUNT(longitude_livraison) as avec_longitude,
    COUNT(distance_km) as avec_distance
FROM commandes 
WHERE mode = 'livraison';

-- 5. Commande spécifique avec détails complets
SELECT 
    c.*,
    r.nom as restaurant_nom,
    r.latitude as restaurant_lat,
    r.longitude as restaurant_lng
FROM commandes c
LEFT JOIN restaurants r ON c.restaurant_id = r.id
WHERE c.numero_commande = '2408-0006';