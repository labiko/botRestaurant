-- Réinitialiser le statut du livreur
UPDATE delivery_users 
SET 
  is_online = false,
  status = 'actif',
  updated_at = NOW()
WHERE telephone = '+33667326357';