-- PIZZA YOLO 77 - INSERTION AVEC BONNES CATÉGORIES
-- Version corrigée avec catégories spécifiques

-- Supprimer tous les anciens produits Pizza Yolo 77 (si nécessaire)
-- DELETE FROM menus WHERE restaurant_id IN (SELECT id FROM restaurants WHERE nom = 'Pizza Yolo 77');

-- Récupérer l'ID du restaurant Pizza Yolo 77
-- SELECT id FROM restaurants WHERE nom = 'Pizza Yolo 77';
-- Remplacer [restaurant_id] par l'UUID réel

INSERT INTO menus (restaurant_id, nom_plat, description, prix, categorie, disponible, ordre_affichage) VALUES

-- 🍕 PIZZAS (31 pizzas)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Classica', 'Base tomate, mozzarella, origan', 12, 'pizza', true, 1),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Reine', 'Base tomate, mozzarella, jambon, champignons', 14, 'pizza', true, 2),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Diva', 'Base tomate, mozzarella, chorizo, poivrons, oignons', 15, 'pizza', true, 3),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Calzone Saumon', 'Chausson, crème fraîche, saumon, épinards', 16, 'pizza', true, 4),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Napolitaine', 'Base tomate, mozzarella, anchois, câpres, olives', 14, 'pizza', true, 5),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Torino', 'Base tomate, mozzarella, jambon, champignons, artichauts', 15, 'pizza', true, 6),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Orientale', 'Base tomate, mozzarella, merguez, poivrons, oignons', 15, 'pizza', true, 7),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Végétarienne', 'Base tomate, mozzarella, légumes grillés', 14, 'pizza', true, 8),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Fruits de Mer', 'Base tomate, mozzarella, fruits de mer', 17, 'pizza', true, 9),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Campione', 'Base tomate, mozzarella, jambon, champignons, œuf', 15, 'pizza', true, 10),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', '4 Saisons', 'Base tomate, mozzarella, jambon, champignons, artichauts, olives', 16, 'pizza', true, 11),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Royale', 'Base tomate, mozzarella, jambon, champignons, œuf', 15, 'pizza', true, 12),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'New York', 'Base tomate, mozzarella, pepperoni, champignons', 16, 'pizza', true, 13),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Miami', 'Base tomate, mozzarella, jambon, ananas', 15, 'pizza', true, 14),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Barbecue', 'Base barbecue, mozzarella, poulet, oignons', 16, 'pizza', true, 15),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Chicken', 'Base tomate, mozzarella, poulet, poivrons', 15, 'pizza', true, 16),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', '4 Fromages', 'Base crème, 4 fromages', 15, 'pizza', true, 17),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Floride', 'Base tomate, mozzarella, thon, oignons, câpres', 15, 'pizza', true, 18),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Hawaïenne', 'Base tomate, mozzarella, jambon, ananas, noix de coco', 16, 'pizza', true, 19),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Nevada', 'Base tomate, mozzarella, bœuf haché, oignons, œuf', 16, 'pizza', true, 20),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Mexico', 'Base tomate, mozzarella, chorizo, poivrons, piments', 16, 'pizza', true, 21),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Texas', 'Base barbecue, mozzarella, bœuf, bacon, oignons', 17, 'pizza', true, 22),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Chèvre Miel', 'Base crème, mozzarella, chèvre, miel, noix', 16, 'pizza', true, 23),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Rihan', 'Spécialité maison', 17, 'pizza', true, 24),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Boursin', 'Base boursin, mozzarella, lardons, pommes de terre', 16, 'pizza', true, 25),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Anduano', 'Spécialité maison', 17, 'pizza', true, 26),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Samouraï', 'Base samouraï, mozzarella, poulet, oignons', 16, 'pizza', true, 27),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tartiflette', 'Base crème, mozzarella, pommes de terre, lardons, reblochon', 17, 'pizza', true, 28),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Montagnarde', 'Base crème, mozzarella, pommes de terre, reblochon', 16, 'pizza', true, 29),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Poivre', 'Base crème, mozzarella, bœuf, poivre vert', 17, 'pizza', true, 30),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Hot Spicy', 'Base tomate piquante, mozzarella, chorizo, piments', 16, 'pizza', true, 31),

-- 🍔 BURGERS (30 burgers - simples et menus)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Cheeseburger', 'Burger classique avec fromage', 7, 'burger', true, 32),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Cheeseburger', 'Burger + frites + boisson', 9, 'burger', true, 33),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Cheeseburger Bacon', 'Burger avec fromage et bacon', 8, 'burger', true, 34),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Cheeseburger Bacon', 'Burger bacon + frites + boisson', 10, 'burger', true, 35),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Big Cheese', 'Double fromage', 9, 'burger', true, 36),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Big Cheese', 'Big Cheese + frites + boisson', 11, 'burger', true, 37),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Fish', 'Burger au poisson', 8, 'burger', true, 38),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Fish', 'Fish burger + frites + boisson', 10, 'burger', true, 39),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Chicken', 'Burger au poulet', 9, 'burger', true, 40),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Chicken', 'Chicken burger + frites + boisson', 11, 'burger', true, 41),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Veggie', 'Burger végétarien', 8, 'burger', true, 42),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Veggie', 'Veggie burger + frites + boisson', 10, 'burger', true, 43),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Texas Burger', 'Burger style Texas', 9, 'burger', true, 44),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Texas Burger', 'Texas burger + frites + boisson', 11, 'burger', true, 45),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'L''Américain', 'Burger gourmand américain', 11, 'burger', true, 46),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu L''Américain', 'Américain + frites + boisson', 13, 'burger', true, 47),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Savoyard', 'Burger aux saveurs de Savoie', 10, 'burger', true, 48),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Savoyard', 'Savoyard + frites + boisson', 12, 'burger', true, 49),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le BBQ', 'Burger sauce barbecue', 10, 'burger', true, 50),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le BBQ', 'BBQ burger + frites + boisson', 11, 'burger', true, 51),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Big Chef', 'Burger du chef', 12, 'burger', true, 52),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Big Chef', 'Big Chef + frites + boisson', 13, 'burger', true, 53),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'L''Avocado', 'Burger à l''avocat', 11, 'burger', true, 54),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu L''Avocado', 'Avocado + frites + boisson', 12, 'burger', true, 55),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Smash Classic', 'Burger smash classique', 8, 'burger', true, 56),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'L''Original', 'Le burger original', 6, 'burger', true, 57),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Smash Signature', 'Burger signature', 10, 'burger', true, 58),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Smash Signature', 'Signature + frites + boisson', 12, 'burger', true, 59),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Smash Bacon', 'Smash avec bacon', 9, 'burger', true, 60),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Smash Bacon', 'Smash bacon + frites + boisson', 11, 'burger', true, 61),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Smash Moelleux', 'Smash tendre et moelleux', 10, 'burger', true, 62),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Smash Moelleux', 'Smash moelleux + frites + boisson', 12, 'burger', true, 63),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Chicken Crazy', 'Smash poulet fou', 9, 'burger', true, 64),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Chicken Crazy', 'Chicken crazy + frites + boisson', 11, 'burger', true, 65),

-- 🥪 SANDWICHS (22 sandwichs - simples et menus)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Grec', 'Sandwich grec traditionnel', 6, 'sandwich', true, 66),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Grec', 'Grec + frites + boisson', 9, 'sandwich', true, 67),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'L''Escalope', 'Sandwich à l''escalope', 6, 'sandwich', true, 68),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu L''Escalope', 'Escalope + frites + boisson', 9, 'sandwich', true, 69),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Buffalo', 'Sandwich buffalo épicé', 9, 'sandwich', true, 70),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Buffalo', 'Buffalo + frites + boisson', 10, 'sandwich', true, 71),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Forest', 'Sandwich forestier', 10, 'sandwich', true, 72),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Forest', 'Forest + frites + boisson', 11, 'sandwich', true, 73),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Tunisien', 'Sandwich tunisien', 6, 'sandwich', true, 74),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Tunisien', 'Tunisien + frites + boisson', 9, 'sandwich', true, 75),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Chicken Sandwich', 'Sandwich au poulet', 6, 'sandwich', true, 76),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Chicken Sandwich', 'Chicken + frites + boisson', 9, 'sandwich', true, 77),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Saumon', 'Sandwich au saumon', 10, 'sandwich', true, 78),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Saumon', 'Saumon + frites + boisson', 11, 'sandwich', true, 79),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Américain Sandwich', 'Sandwich américain', 6, 'sandwich', true, 80),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Américain Sandwich', 'Américain + frites + boisson', 9, 'sandwich', true, 81),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Du Chef', 'Sandwich du chef', 6, 'sandwich', true, 82),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Du Chef', 'Du chef + frites + boisson', 9, 'sandwich', true, 83),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Le Radical', 'Sandwich radical', 6, 'sandwich', true, 84),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Le Radical', 'Radical + frites + boisson', 9, 'sandwich', true, 85),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Raclette', 'Sandwich raclette', 10, 'sandwich', true, 86),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Raclette', 'Raclette + frites + boisson', 11, 'sandwich', true, 87),

-- 🌮 TACOS (4 tacos)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tacos Menu 1', 'Tacos simple', 7, 'taco', true, 88),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tacos Menu 1 Complet', 'Tacos + boisson', 9, 'taco', true, 89),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tacos Menu 2', 'Tacos double', 10, 'taco', true, 90),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tacos Viandes', 'Tacos aux viandes', 11, 'taco', true, 91),

-- 🍝 PÂTES (5 pâtes)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Pâtes Bolognaise', 'Pâtes sauce bolognaise', 8, 'pates', true, 92),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Pâtes Carbonara', 'Pâtes sauce carbonara', 8, 'pates', true, 93),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Pâtes 3 Fromages', 'Pâtes aux trois fromages', 8, 'pates', true, 94),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Pâtes Saumon', 'Pâtes au saumon', 8, 'pates', true, 95),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Pâtes Poulet', 'Pâtes au poulet', 8, 'pates', true, 96),

-- 🥗 SALADES (3 salades)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Salade Caesar', 'Salade César classique', 9, 'salade', true, 97),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Salade Grecque', 'Salade grecque traditionnelle', 8, 'salade', true, 98),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Salade Saumon', 'Salade au saumon fumé', 12, 'salade', true, 99),

-- 🍽️ ASSIETTES (8 assiettes)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Les Calorie', 'Assiette légère', 10, 'assiette', true, 100),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Les Calorie Grande', 'Grande assiette légère', 11, 'assiette', true, 101),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Chicken Crispy', 'Poulet croustillant', 11, 'assiette', true, 102),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Chicken Crispy Grande', 'Grande portion chicken crispy', 12, 'assiette', true, 103),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Assiette Grec', 'Assiette grecque', 10, 'assiette', true, 104),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Assiette Grec Grande', 'Grande assiette grecque', 11, 'assiette', true, 105),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Bowl', 'Bowl santé', 8, 'assiette', true, 106),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Bowl Grande', 'Grand bowl santé', 9, 'assiette', true, 107),

-- 🥙 NAANS (6 naans)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Naan Tenders', 'Naan aux tenders', 7, 'naan', true, 108),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Naan Tenders', 'Naan tenders + boisson', 10, 'naan', true, 109),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Naan Steak', 'Naan au steak', 7, 'naan', true, 110),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Naan Steak', 'Naan steak + boisson', 10, 'naan', true, 111),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Naan Poulet', 'Naan au poulet', 7, 'naan', true, 112),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Menu Naan Poulet', 'Naan poulet + boisson', 10, 'naan', true, 113),

-- 🍟 ACCOMPAGNEMENTS (10 accompagnements)
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tenders', 'Tenders de poulet', 5, 'accompagnement', true, 114),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Tenders Grande', 'Grande portion tenders', 7, 'accompagnement', true, 115),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Nuggets', 'Nuggets de poulet', 6, 'accompagnement', true, 116),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Nuggets Grande', 'Grande portion nuggets', 9, 'accompagnement', true, 117),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Wings', 'Ailes de poulet', 7, 'accompagnement', true, 118),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Wings Grande', 'Grande portion wings', 10, 'accompagnement', true, 119),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Onion Rings', 'Rondelles d''oignons', 5, 'accompagnement', true, 120),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Onion Rings Grande', 'Grande portion onion rings', 7, 'accompagnement', true, 121),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Potatoes', 'Pommes de terre', 4, 'accompagnement', true, 122),
('b4f2f614-5152-48fd-9acd-35b17d9c1d9a', 'Potatoes Grande', 'Grande portion potatoes', 6, 'accompagnement', true, 123);

-- Vérification finale
SELECT 
    categorie, 
    COUNT(*) as nombre_produits,
    MIN(prix) as prix_min,
    MAX(prix) as prix_max
FROM menus 
WHERE restaurant_id = 'b4f2f614-5152-48fd-9acd-35b17d9c1d9a'
GROUP BY categorie 
ORDER BY 
    CASE categorie 
        WHEN 'pizza' THEN 1
        WHEN 'burger' THEN 2
        WHEN 'sandwich' THEN 3
        WHEN 'taco' THEN 4
        WHEN 'pates' THEN 5
        WHEN 'salade' THEN 6
        WHEN 'assiette' THEN 7
        WHEN 'naan' THEN 8
        WHEN 'accompagnement' THEN 9
        ELSE 10
    END;