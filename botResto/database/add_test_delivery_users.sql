-- ===============================================
-- AJOUTER DES LIVREURS DE TEST
-- ===============================================
-- Restaurant ID: a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90 (Brasserie de Savigny)

-- Ajouter des livreurs pour ce restaurant
INSERT INTO public.delivery_users (
    telephone, 
    nom, 
    code_acces, 
    status, 
    is_online, 
    rating, 
    total_deliveries, 
    total_earnings,
    restaurant_id
) VALUES 
(
    '224623001001', 
    'Mamadou Diallo', 
    '123456', 
    'actif', 
    true, 
    4.8, 
    156, 
    2500000,
    'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
),
(
    '224623001002', 
    'Fatoumata Camara', 
    '789012', 
    'actif', 
    true, 
    4.9, 
    203, 
    3200000,
    'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
),
(
    '224623001003', 
    'Ibrahima Bah', 
    '345678', 
    'actif', 
    false, 
    4.2, 
    89, 
    1800000,
    'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
),
(
    '224623001004', 
    'Aminata Touré', 
    '901234', 
    'actif', 
    true, 
    4.7, 
    134, 
    2100000,
    'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
),
(
    '224623001005', 
    'Sekou Konaté', 
    '567890', 
    'actif', 
    true, 
    4.6, 
    98, 
    1650000,
    'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
);

-- Vérifier les livreurs ajoutés
SELECT 
    du.id,
    du.nom,
    du.telephone,
    du.is_online,
    du.rating,
    du.total_deliveries,
    r.nom as restaurant_nom
FROM delivery_users du
JOIN restaurants r ON du.restaurant_id = r.id
WHERE du.restaurant_id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90'
ORDER BY du.rating DESC;