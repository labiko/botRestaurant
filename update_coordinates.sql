-- Mise à jour des coordonnées livreur pour test
-- Coordonnées de Conakry centre (approximatives)

UPDATE delivery_users 
SET 
  latitude = 9.6412,
  longitude = -13.5784,
  coordinates_updated_at = NOW(),
  accuracy = 50
WHERE telephone = '+33667326357';

-- Vérifier la mise à jour
SELECT id, nom, telephone, latitude, longitude, coordinates_updated_at 
FROM delivery_users 
WHERE telephone = '+33667326357';