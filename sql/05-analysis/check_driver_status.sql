-- Vérifier le statut du livreur
SELECT id, nom, telephone, is_online, status, updated_at 
FROM delivery_users 
WHERE telephone = '+33667326357';

-- Si le statut est bloqué, le réinitialiser
UPDATE delivery_users 
SET 
  is_online = false,
  status = 'actif',
  updated_at = NOW()
WHERE telephone = '+33667326357';

-- Vérifier après mise à jour
SELECT id, nom, telephone, is_online, status, updated_at 
FROM delivery_users 
WHERE telephone = '+33667326357';