-- ===============================================
-- AJOUT COMPTE RESTAURANT SIMPLE
-- ===============================================
-- UUID Restaurant: ec783e85-89ac-4678-a5c9-4c435cb8761f

-- Ajouter un compte admin pour ce restaurant
INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
VALUES (
    'ec783e85-89ac-4678-a5c9-4c435cb8761f',
    'admin@restaurant.com',
    'demo123',
    'Admin Restaurant',
    'admin'
);

-- ===============================================
-- COMPTES DE TEST SUPPLÉMENTAIRES (optionnel)
-- ===============================================

-- Compte manager
INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
VALUES (
    'ec783e85-89ac-4678-a5c9-4c435cb8761f',
    'manager@restaurant.com', 
    'demo123',
    'Manager Restaurant',
    'manager'
);

-- Compte staff
INSERT INTO restaurant_users (restaurant_id, email, password_hash, nom, role) 
VALUES (
    'ec783e85-89ac-4678-a5c9-4c435cb8761f',
    'staff@restaurant.com',
    'demo123', 
    'Staff Restaurant',
    'staff'
);

-- ===============================================
-- VÉRIFICATION
-- ===============================================

-- Vérifier que les comptes sont créés
SELECT 
    ru.id,
    ru.email,
    ru.nom,
    ru.role,
    r.nom as restaurant_nom
FROM restaurant_users ru
JOIN restaurants r ON ru.restaurant_id = r.id
WHERE ru.restaurant_id = 'ec783e85-89ac-4678-a5c9-4c435cb8761f';