-- Script de migration automatique des données existantes vers le nouveau système
-- Ce script migre tous les restaurants existants vers le système de configuration flexible

-- Étape 1: Migrer tous les restaurants existants vers le système par distance
-- (conserve le comportement actuel)
INSERT INTO restaurant_delivery_config (
  restaurant_id, 
  delivery_type, 
  price_per_km, 
  round_up_distance,
  free_delivery_threshold,
  max_delivery_radius_km,
  is_active
)
SELECT 
  id,
  'distance_based',
  COALESCE(tarif_km, 3000), -- Default 3000 GNF/km si NULL
  true, -- Toujours arrondir à l'entier supérieur (comportement actuel)
  COALESCE(seuil_gratuite, 0), -- Seuil de gratuité ou 0
  COALESCE(rayon_livraison_km, 25.00), -- Rayon max ou 25km par défaut
  true -- Configuration active
FROM restaurants 
WHERE id NOT IN (SELECT restaurant_id FROM restaurant_delivery_config)
ON CONFLICT (restaurant_id) DO NOTHING;

-- Étape 2: Vérification du nombre de restaurants migrés
SELECT 
  COUNT(*) as restaurants_total,
  (SELECT COUNT(*) FROM restaurant_delivery_config WHERE is_active = true) as restaurants_avec_config,
  (SELECT COUNT(*) FROM restaurant_delivery_config WHERE delivery_type = 'distance_based') as restaurants_par_distance,
  (SELECT COUNT(*) FROM restaurant_delivery_config WHERE delivery_type = 'fixed') as restaurants_prix_fixe
FROM restaurants;

-- Étape 3: Afficher un échantillon des configurations créées
SELECT 
  r.nom as restaurant_name,
  rdc.delivery_type,
  rdc.price_per_km,
  rdc.fixed_amount,
  rdc.free_delivery_threshold,
  rdc.max_delivery_radius_km,
  rdc.is_active
FROM restaurant_delivery_config rdc
JOIN restaurants r ON r.id = rdc.restaurant_id
ORDER BY r.nom
LIMIT 10;

-- Étape 4: Créer une vue pour faciliter les requêtes de compatibilité
CREATE OR REPLACE VIEW restaurant_delivery_info AS
SELECT 
  r.id,
  r.nom,
  r.latitude,
  r.longitude,
  r.statut,
  -- Nouvelles données de config
  COALESCE(rdc.delivery_type, 'distance_based') as delivery_type,
  COALESCE(rdc.fixed_amount, 0) as fixed_amount,
  COALESCE(rdc.price_per_km, r.tarif_km, 3000) as price_per_km,
  COALESCE(rdc.round_up_distance, true) as round_up_distance,
  COALESCE(rdc.free_delivery_threshold, r.seuil_gratuite, 0) as free_delivery_threshold,
  COALESCE(rdc.max_delivery_radius_km, r.rayon_livraison_km, 25.00) as max_delivery_radius_km,
  COALESCE(rdc.is_active, false) as has_custom_config,
  -- Anciennes données pour compatibilité
  r.tarif_km as legacy_tarif_km,
  r.seuil_gratuite as legacy_seuil_gratuite,
  r.rayon_livraison_km as legacy_rayon_livraison_km
FROM restaurants r
LEFT JOIN restaurant_delivery_config rdc ON r.id = rdc.restaurant_id AND rdc.is_active = true;

-- Étape 5: Commentaire de documentation
COMMENT ON VIEW restaurant_delivery_info IS 'Vue combinée pour accéder aux données de livraison avec fallback vers les anciennes données';

-- Étape 6: Test de la migration
-- Vérifier qu'aucun restaurant n'a été oublié
SELECT 
  'Restaurants sans config' as check_type,
  COUNT(*) as count
FROM restaurants r 
WHERE r.id NOT IN (SELECT restaurant_id FROM restaurant_delivery_config WHERE is_active = true)

UNION ALL

SELECT 
  'Restaurants avec config' as check_type,
  COUNT(*) as count
FROM restaurant_delivery_config 
WHERE is_active = true;

-- Message de fin
SELECT 'Migration terminée avec succès!' as status;