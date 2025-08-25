SELECT id, numero_commande, mode, adresse_livraison, latitude_livraison, longitude_livraison, distance_km, created_at FROM commandes WHERE mode = 'livraison' ORDER BY created_at DESC LIMIT 3;
