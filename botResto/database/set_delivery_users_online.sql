-- ===============================================
-- METTRE LES LIVREURS EN LIGNE
-- ===============================================
-- Restaurant ID: a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90 (Brasserie de Savigny)

-- Mettre tous les livreurs de ce restaurant en ligne
UPDATE public.delivery_users 
SET is_online = true 
WHERE restaurant_id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90' 
  AND status = 'actif';

-- Vérifier le résultat
SELECT 
    id,
    nom,
    telephone,
    is_online,
    rating,
    total_deliveries
FROM delivery_users 
WHERE restaurant_id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
ORDER BY rating DESC;