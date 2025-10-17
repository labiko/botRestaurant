-- EXTENSION DES CATÉGORIES MENU POUR PIZZA YOLO 77
-- Script à exécuter pour ajouter les nouvelles catégories

-- ÉTAPE 1: Supprimer la contrainte existante sur les catégories
ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_categorie_check;

-- ÉTAPE 2: Ajouter la nouvelle contrainte avec toutes les catégories Pizza Yolo 77
ALTER TABLE menus ADD CONSTRAINT menus_categorie_check 
CHECK (categorie::text = ANY (ARRAY[
    'entree'::character varying,
    'plat'::character varying, 
    'dessert'::character varying,
    'boisson'::character varying,
    'accompagnement'::character varying,
    'pizza'::character varying,
    'burger'::character varying,
    'sandwich'::character varying,
    'taco'::character varying,
    'pates'::character varying,
    'salade'::character varying,
    'assiette'::character varying,
    'naan'::character varying
]::text[]));

-- ÉTAPE 3: Mettre à jour tous les produits Pizza Yolo 77 avec les bonnes catégories
UPDATE menus SET categorie = 'pizza' 
WHERE nom_plat IN (
    'Classica', 'Reine', 'Diva', 'Calzone Saumon', 'Napolitaine', 'Torino',
    'Orientale', 'Végétarienne', 'Fruits de Mer', 'Campione', '4 Saisons', 'Royale',
    'New York', 'Miami', 'Barbecue', 'Chicken', '4 Fromages', 'Floride',
    'Hawaïenne', 'Nevada', 'Mexico', 'Texas', 'Chèvre Miel', 'Rihan',
    'Boursin', 'Anduano', 'Samouraï', 'Tartiflette', 'Montagnarde', 'Poivre', 'Hot Spicy'
);

UPDATE menus SET categorie = 'burger' 
WHERE nom_plat LIKE '%Cheeseburger%' OR nom_plat LIKE '%Big Cheese%' OR nom_plat LIKE '%Fish%' 
   OR nom_plat LIKE '%Chicken%' OR nom_plat LIKE '%Veggie%' OR nom_plat LIKE '%Texas Burger%'
   OR nom_plat LIKE '%Américain%' OR nom_plat LIKE '%Savoyard%' OR nom_plat LIKE '%BBQ%'
   OR nom_plat LIKE '%Big Chef%' OR nom_plat LIKE '%Avocado%' OR nom_plat LIKE '%Smash%'
   OR nom_plat LIKE '%Original%' OR nom_plat LIKE '%Crazy%';

UPDATE menus SET categorie = 'sandwich' 
WHERE nom_plat LIKE '%Grec%' OR nom_plat LIKE '%Escalope%' OR nom_plat LIKE '%Buffalo%'
   OR nom_plat LIKE '%Forest%' OR nom_plat LIKE '%Tunisien%' OR nom_plat LIKE '%Chicken Sandwich%'
   OR nom_plat LIKE '%Saumon%' OR nom_plat LIKE '%Américain Sandwich%' OR nom_plat LIKE '%Du Chef%'
   OR nom_plat LIKE '%Radical%' OR nom_plat LIKE '%Raclette%';

UPDATE menus SET categorie = 'taco' 
WHERE nom_plat LIKE '%Tacos%';

UPDATE menus SET categorie = 'pates' 
WHERE nom_plat LIKE '%Pâtes%';

UPDATE menus SET categorie = 'salade' 
WHERE nom_plat LIKE '%Salade%';

UPDATE menus SET categorie = 'assiette' 
WHERE nom_plat LIKE '%Calorie%' OR nom_plat LIKE '%Chicken Crispy%' 
   OR nom_plat LIKE '%Assiette Grec%' OR nom_plat LIKE '%Bowl%';

UPDATE menus SET categorie = 'naan' 
WHERE nom_plat LIKE '%Naan%';

-- ÉTAPE 4: Vérification
SELECT categorie, COUNT(*) as nombre_produits 
FROM menus 
WHERE restaurant_id IN (SELECT id FROM restaurants WHERE nom = 'Pizza Yolo 77')
GROUP BY categorie 
ORDER BY categorie;