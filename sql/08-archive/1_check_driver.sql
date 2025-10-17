-- Vérifier le statut actuel du livreur
SELECT id, nom, telephone, is_online, status, updated_at 
FROM delivery_users 
WHERE telephone = '+33667326357';