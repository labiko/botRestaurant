-- PIZZA YOLO 77 - INSERTION COMPLÈTE EN BASE
-- Généré automatiquement à partir du menu réel

-- ÉTAPE 1: Créer le restaurant Pizza Yolo 77
INSERT INTO restaurants (
    nom, adresse, latitude, longitude, phone_whatsapp,
    email, telephone, description, currency,
    tarif_km, seuil_gratuite, minimum_livraison, rayon_livraison_km,
    allow_dine_in, allow_takeaway, allow_delivery,
    allow_pay_now, allow_pay_later, status,
    horaires
) VALUES (
    'Pizza Yolo 77',
    '251 Avenue Philippe Bur, 77550 Moissy-Cramayel',
    48.7406, 2.6054,
    '01.64.88.06.06',
    'pizzayolo77@demo.com',
    '01.64.88.06.06',
    'Restaurant familial avec pizzas, burgers, sandwichs et pâtes. Livraison 7j/7.',
    'EUR',
    3, 25, 15, 10,
    true, true, true,
    false, true,
    'active',
    '{"lundi":{"ouverture":"11:00","fermeture":"00:00"},"mardi":{"ouverture":"11:00","fermeture":"00:00"},"mercredi":{"ouverture":"11:00","fermeture":"00:00"},"jeudi":{"ouverture":"11:00","fermeture":"00:00"},"vendredi":{"ouverture":"11:00","fermeture":"00:00"},"samedi":{"ouverture":"11:00","fermeture":"00:00"},"dimanche":{"ouverture":"11:00","fermeture":"00:00"}}'
);

-- ÉTAPE 2: Récupérer l'ID du restaurant créé (remplacer [restaurant_id] par l'ID réel)
-- SELECT id FROM restaurants WHERE nom = 'Pizza Yolo 77';

-- ÉTAPE 3: Insertion de tous les produits du menu
-- IMPORTANT: Remplacer [restaurant_id] par l'UUID réel du restaurant

INSERT INTO menus (restaurant_id, nom_plat, description, prix, categorie, disponible, ordre_affichage) VALUES

-- PIZZAS CLASSIQUES (1-12)
('[restaurant_id]', 'Classica', 'Base tomate, mozzarella, origan', 12, 'plat', true, 1),
('[restaurant_id]', 'Reine', 'Base tomate, mozzarella, jambon, champignons', 14, 'plat', true, 2),
('[restaurant_id]', 'Diva', 'Base tomate, mozzarella, chorizo, poivrons, oignons', 15, 'plat', true, 3),
('[restaurant_id]', 'Calzone Saumon', 'Chausson, crème fraîche, saumon, épinards', 16, 'plat', true, 4),
('[restaurant_id]', 'Napolitaine', 'Base tomate, mozzarella, anchois, câpres, olives', 14, 'plat', true, 5),
('[restaurant_id]', 'Torino', 'Base tomate, mozzarella, jambon, champignons, artichauts', 15, 'plat', true, 6),
('[restaurant_id]', 'Orientale', 'Base tomate, mozzarella, merguez, poivrons, oignons', 15, 'plat', true, 7),
('[restaurant_id]', 'Végétarienne', 'Base tomate, mozzarella, légumes grillés', 14, 'plat', true, 8),
('[restaurant_id]', 'Fruits de Mer', 'Base tomate, mozzarella, fruits de mer', 17, 'plat', true, 9),
('[restaurant_id]', 'Campione', 'Base tomate, mozzarella, jambon, champignons, œuf', 15, 'plat', true, 10),
('[restaurant_id]', '4 Saisons', 'Base tomate, mozzarella, jambon, champignons, artichauts, olives', 16, 'plat', true, 11),
('[restaurant_id]', 'Royale', 'Base tomate, mozzarella, jambon, champignons, œuf', 15, 'plat', true, 12),

-- PIZZAS AMÉRICAINES (13-22)
('[restaurant_id]', 'New York', 'Base tomate, mozzarella, pepperoni, champignons', 16, 'plat', true, 13),
('[restaurant_id]', 'Miami', 'Base tomate, mozzarella, jambon, ananas', 15, 'plat', true, 14),
('[restaurant_id]', 'Barbecue', 'Base barbecue, mozzarella, poulet, oignons', 16, 'plat', true, 15),
('[restaurant_id]', 'Chicken', 'Base tomate, mozzarella, poulet, poivrons', 15, 'plat', true, 16),
('[restaurant_id]', '4 Fromages', 'Base crème, 4 fromages', 15, 'plat', true, 17),
('[restaurant_id]', 'Floride', 'Base tomate, mozzarella, thon, oignons, câpres', 15, 'plat', true, 18),
('[restaurant_id]', 'Hawaïenne', 'Base tomate, mozzarella, jambon, ananas, noix de coco', 16, 'plat', true, 19),
('[restaurant_id]', 'Nevada', 'Base tomate, mozzarella, bœuf haché, oignons, œuf', 16, 'plat', true, 20),
('[restaurant_id]', 'Mexico', 'Base tomate, mozzarella, chorizo, poivrons, piments', 16, 'plat', true, 21),
('[restaurant_id]', 'Texas', 'Base barbecue, mozzarella, bœuf, bacon, oignons', 17, 'plat', true, 22),

-- PIZZAS SPÉCIALITÉS (23-31)
('[restaurant_id]', 'Chèvre Miel', 'Base crème, mozzarella, chèvre, miel, noix', 16, 'plat', true, 23),
('[restaurant_id]', 'Rihan', 'Spécialité maison', 17, 'plat', true, 24),
('[restaurant_id]', 'Boursin', 'Base boursin, mozzarella, lardons, pommes de terre', 16, 'plat', true, 25),
('[restaurant_id]', 'Anduano', 'Spécialité maison', 17, 'plat', true, 26),
('[restaurant_id]', 'Samouraï', 'Base samouraï, mozzarella, poulet, oignons', 16, 'plat', true, 27),
('[restaurant_id]', 'Tartiflette', 'Base crème, mozzarella, pommes de terre, lardons, reblochon', 17, 'plat', true, 28),
('[restaurant_id]', 'Montagnarde', 'Base crème, mozzarella, pommes de terre, reblochon', 16, 'plat', true, 29),
('[restaurant_id]', 'Poivre', 'Base crème, mozzarella, bœuf, poivre vert', 17, 'plat', true, 30),
('[restaurant_id]', 'Hot Spicy', 'Base tomate piquante, mozzarella, chorizo, piments', 16, 'plat', true, 31),

-- BURGERS CLASSIQUES - Simple & Menu (32-45)
('[restaurant_id]', 'Cheeseburger', 'Burger classique avec fromage', 7, 'plat', true, 32),
('[restaurant_id]', 'Menu Cheeseburger', 'Burger + frites + boisson', 9, 'plat', true, 33),
('[restaurant_id]', 'Cheeseburger Bacon', 'Burger avec fromage et bacon', 8, 'plat', true, 34),
('[restaurant_id]', 'Menu Cheeseburger Bacon', 'Burger bacon + frites + boisson', 10, 'plat', true, 35),
('[restaurant_id]', 'Big Cheese', 'Double fromage', 9, 'plat', true, 36),
('[restaurant_id]', 'Menu Big Cheese', 'Big Cheese + frites + boisson', 11, 'plat', true, 37),
('[restaurant_id]', 'Le Fish', 'Burger au poisson', 8, 'plat', true, 38),
('[restaurant_id]', 'Menu Le Fish', 'Fish burger + frites + boisson', 10, 'plat', true, 39),
('[restaurant_id]', 'Le Chicken', 'Burger au poulet', 9, 'plat', true, 40),
('[restaurant_id]', 'Menu Le Chicken', 'Chicken burger + frites + boisson', 11, 'plat', true, 41),
('[restaurant_id]', 'Le Veggie', 'Burger végétarien', 8, 'plat', true, 42),
('[restaurant_id]', 'Menu Le Veggie', 'Veggie burger + frites + boisson', 10, 'plat', true, 43),
('[restaurant_id]', 'Texas Burger', 'Burger style Texas', 9, 'plat', true, 44),
('[restaurant_id]', 'Menu Texas Burger', 'Texas burger + frites + boisson', 11, 'plat', true, 45),

-- BURGERS GOURMETS - Simple & Menu (46-55)
('[restaurant_id]', 'L''Américain', 'Burger gourmand américain', 11, 'plat', true, 46),
('[restaurant_id]', 'Menu L''Américain', 'Américain + frites + boisson', 13, 'plat', true, 47),
('[restaurant_id]', 'Le Savoyard', 'Burger aux saveurs de Savoie', 10, 'plat', true, 48),
('[restaurant_id]', 'Menu Le Savoyard', 'Savoyard + frites + boisson', 12, 'plat', true, 49),
('[restaurant_id]', 'Le BBQ', 'Burger sauce barbecue', 10, 'plat', true, 50),
('[restaurant_id]', 'Menu Le BBQ', 'BBQ burger + frites + boisson', 11, 'plat', true, 51),
('[restaurant_id]', 'Le Big Chef', 'Burger du chef', 12, 'plat', true, 52),
('[restaurant_id]', 'Menu Le Big Chef', 'Big Chef + frites + boisson', 13, 'plat', true, 53),
('[restaurant_id]', 'L''Avocado', 'Burger à l''avocat', 11, 'plat', true, 54),
('[restaurant_id]', 'Menu L''Avocado', 'Avocado + frites + boisson', 12, 'plat', true, 55),

-- BURGERS SMASH (56-61)
('[restaurant_id]', 'Smash Classic', 'Burger smash classique', 8, 'plat', true, 56),
('[restaurant_id]', 'L''Original', 'Le burger original', 6, 'plat', true, 57),
('[restaurant_id]', 'Smash Signature', 'Burger signature', 10, 'plat', true, 58),
('[restaurant_id]', 'Menu Smash Signature', 'Signature + frites + boisson', 12, 'plat', true, 59),
('[restaurant_id]', 'Smash Bacon', 'Smash avec bacon', 9, 'plat', true, 60),
('[restaurant_id]', 'Menu Smash Bacon', 'Smash bacon + frites + boisson', 11, 'plat', true, 61),
('[restaurant_id]', 'Le Smash Moelleux', 'Smash tendre et moelleux', 10, 'plat', true, 62),
('[restaurant_id]', 'Menu Le Smash Moelleux', 'Smash moelleux + frites + boisson', 12, 'plat', true, 63),
('[restaurant_id]', 'Chicken Crazy', 'Smash poulet fou', 9, 'plat', true, 64),
('[restaurant_id]', 'Menu Chicken Crazy', 'Chicken crazy + frites + boisson', 11, 'plat', true, 65),

-- SANDWICHS - Simple & Menu (66-87)
('[restaurant_id]', 'Le Grec', 'Sandwich grec traditionnel', 6, 'plat', true, 66),
('[restaurant_id]', 'Menu Le Grec', 'Grec + frites + boisson', 9, 'plat', true, 67),
('[restaurant_id]', 'L''Escalope', 'Sandwich à l''escalope', 6, 'plat', true, 68),
('[restaurant_id]', 'Menu L''Escalope', 'Escalope + frites + boisson', 9, 'plat', true, 69),
('[restaurant_id]', 'Le Buffalo', 'Sandwich buffalo épicé', 9, 'plat', true, 70),
('[restaurant_id]', 'Menu Le Buffalo', 'Buffalo + frites + boisson', 10, 'plat', true, 71),
('[restaurant_id]', 'Forest', 'Sandwich forestier', 10, 'plat', true, 72),
('[restaurant_id]', 'Menu Forest', 'Forest + frites + boisson', 11, 'plat', true, 73),
('[restaurant_id]', 'Le Tunisien', 'Sandwich tunisien', 6, 'plat', true, 74),
('[restaurant_id]', 'Menu Le Tunisien', 'Tunisien + frites + boisson', 9, 'plat', true, 75),
('[restaurant_id]', 'Le Chicken Sandwich', 'Sandwich au poulet', 6, 'plat', true, 76),
('[restaurant_id]', 'Menu Le Chicken Sandwich', 'Chicken + frites + boisson', 9, 'plat', true, 77),
('[restaurant_id]', 'Le Saumon', 'Sandwich au saumon', 10, 'plat', true, 78),
('[restaurant_id]', 'Menu Le Saumon', 'Saumon + frites + boisson', 11, 'plat', true, 79),
('[restaurant_id]', 'Américain Sandwich', 'Sandwich américain', 6, 'plat', true, 80),
('[restaurant_id]', 'Menu Américain Sandwich', 'Américain + frites + boisson', 9, 'plat', true, 81),
('[restaurant_id]', 'Du Chef', 'Sandwich du chef', 6, 'plat', true, 82),
('[restaurant_id]', 'Menu Du Chef', 'Du chef + frites + boisson', 9, 'plat', true, 83),
('[restaurant_id]', 'Le Radical', 'Sandwich radical', 6, 'plat', true, 84),
('[restaurant_id]', 'Menu Le Radical', 'Radical + frites + boisson', 9, 'plat', true, 85),
('[restaurant_id]', 'Raclette', 'Sandwich raclette', 10, 'plat', true, 86),
('[restaurant_id]', 'Menu Raclette', 'Raclette + frites + boisson', 11, 'plat', true, 87),

-- TACOS (88-90)
('[restaurant_id]', 'Tacos Menu 1', 'Tacos simple', 7, 'plat', true, 88),
('[restaurant_id]', 'Tacos Menu 1 Complet', 'Tacos + boisson', 9, 'plat', true, 89),
('[restaurant_id]', 'Tacos Menu 2', 'Tacos double', 10, 'plat', true, 90),
('[restaurant_id]', 'Tacos Viandes', 'Tacos aux viandes', 11, 'plat', true, 91),

-- PÂTES (92-96)
('[restaurant_id]', 'Pâtes Bolognaise', 'Pâtes sauce bolognaise', 8, 'plat', true, 92),
('[restaurant_id]', 'Pâtes Carbonara', 'Pâtes sauce carbonara', 8, 'plat', true, 93),
('[restaurant_id]', 'Pâtes 3 Fromages', 'Pâtes aux trois fromages', 8, 'plat', true, 94),
('[restaurant_id]', 'Pâtes Saumon', 'Pâtes au saumon', 8, 'plat', true, 95),
('[restaurant_id]', 'Pâtes Poulet', 'Pâtes au poulet', 8, 'plat', true, 96),

-- ACCOMPAGNEMENTS - Normal & Grande (97-106)
('[restaurant_id]', 'Tenders', 'Tenders de poulet', 5, 'accompagnement', true, 97),
('[restaurant_id]', 'Tenders Grande', 'Grande portion tenders', 7, 'accompagnement', true, 98),
('[restaurant_id]', 'Nuggets', 'Nuggets de poulet', 6, 'accompagnement', true, 99),
('[restaurant_id]', 'Nuggets Grande', 'Grande portion nuggets', 9, 'accompagnement', true, 100),
('[restaurant_id]', 'Wings', 'Ailes de poulet', 7, 'accompagnement', true, 101),
('[restaurant_id]', 'Wings Grande', 'Grande portion wings', 10, 'accompagnement', true, 102),
('[restaurant_id]', 'Onion Rings', 'Rondelles d''oignons', 5, 'accompagnement', true, 103),
('[restaurant_id]', 'Onion Rings Grande', 'Grande portion onion rings', 7, 'accompagnement', true, 104),
('[restaurant_id]', 'Potatoes', 'Pommes de terre', 4, 'accompagnement', true, 105),
('[restaurant_id]', 'Potatoes Grande', 'Grande portion potatoes', 6, 'accompagnement', true, 106),

-- ASSIETTES & PLATS (107-112)
('[restaurant_id]', 'Les Calorie', 'Assiette légère', 10, 'plat', true, 107),
('[restaurant_id]', 'Les Calorie Grande', 'Grande assiette légère', 11, 'plat', true, 108),
('[restaurant_id]', 'Chicken Crispy', 'Poulet croustillant', 11, 'plat', true, 109),
('[restaurant_id]', 'Chicken Crispy Grande', 'Grande portion chicken crispy', 12, 'plat', true, 110),
('[restaurant_id]', 'Assiette Grec', 'Assiette grecque', 10, 'plat', true, 111),
('[restaurant_id]', 'Assiette Grec Grande', 'Grande assiette grecque', 11, 'plat', true, 112),
('[restaurant_id]', 'Bowl', 'Bowl santé', 8, 'plat', true, 113),
('[restaurant_id]', 'Bowl Grande', 'Grand bowl santé', 9, 'plat', true, 114),

-- NAANS - Simple & Menu (115-120)
('[restaurant_id]', 'Naan Tenders', 'Naan aux tenders', 7, 'plat', true, 115),
('[restaurant_id]', 'Menu Naan Tenders', 'Naan tenders + boisson', 10, 'plat', true, 116),
('[restaurant_id]', 'Naan Steak', 'Naan au steak', 7, 'plat', true, 117),
('[restaurant_id]', 'Menu Naan Steak', 'Naan steak + boisson', 10, 'plat', true, 118),
('[restaurant_id]', 'Naan Poulet', 'Naan au poulet', 7, 'plat', true, 119),
('[restaurant_id]', 'Menu Naan Poulet', 'Naan poulet + boisson', 10, 'plat', true, 120),

-- SALADES (121-123)
('[restaurant_id]', 'Salade Caesar', 'Salade César classique', 9, 'entree', true, 121),
('[restaurant_id]', 'Salade Grecque', 'Salade grecque traditionnelle', 8, 'entree', true, 122),
('[restaurant_id]', 'Salade Saumon', 'Salade au saumon fumé', 12, 'entree', true, 123);

-- ÉTAPE 4: Vérification
-- SELECT COUNT(*) FROM menus WHERE restaurant_id = '[restaurant_id]';
-- Devrait retourner 123 produits

-- ÉTAPE 5: Vérifier le restaurant créé
-- SELECT * FROM restaurants WHERE nom = 'Pizza Yolo 77';