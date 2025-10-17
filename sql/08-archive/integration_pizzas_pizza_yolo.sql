-- INTÉGRATION PIZZAS PIZZA YOLO 77
-- Script d'intégration des menus PIXA avec leurs tailles et prix exacts
-- ⚠️ DONNÉES EXACTES - AUCUNE MODIFICATION

-- ÉTAPE 1: Créer la catégorie Pizza si elle n'existe pas
INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active)
SELECT 
    r.id,
    'Pizzas',
    'pizzas',
    '🍕',
    1,
    true
FROM france_restaurants r
WHERE r.slug = 'pizza-yolo-77'
AND NOT EXISTS (
    SELECT 1 FROM france_menu_categories mc 
    WHERE mc.restaurant_id = r.id AND mc.slug = 'pizzas'
);

-- ÉTAPE 2: Insérer les pizzas avec product_type = 'modular'

-- Variables pour restaurant_id et category_id
DO $$
DECLARE
    restaurant_id_val INTEGER;
    category_id_val INTEGER;
    product_id_val INTEGER;
BEGIN
    -- Récupérer l'ID du restaurant
    SELECT id INTO restaurant_id_val FROM france_restaurants WHERE slug = 'pizza-yolo-77';
    
    -- Récupérer l'ID de la catégorie pizzas
    SELECT id INTO category_id_val FROM france_menu_categories 
    WHERE restaurant_id = restaurant_id_val AND slug = 'pizzas';

    -- PIZZAS NIVEAU 1 (9€/15€/20€)
    
    -- 🍕 CLASSICA
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 CLASSICA', 'SAUCE TOMATE, FROMAGE, ORIGAN', 'modular', 'SAUCE TOMATE, FROMAGE, ORIGAN', 1, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🍕 REINE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 REINE', 'SAUCE TOMATE, FROMAGE, JAMBON*, CHAMPIGNONS FRAIS', 'modular', 'SAUCE TOMATE, FROMAGE, JAMBON*, CHAMPIGNONS FRAIS', 2, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🍕 DIVA
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 DIVA', 'SAUCE TOMATE, FROMAGE, POULET, POMME DE TERRE, CHÈVRE', 'modular', 'SAUCE TOMATE, FROMAGE, POULET, POMME DE TERRE, CHÈVRE', 3, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🥟 CALZONE SOUFFLÉE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🥟 CALZONE SOUFFLÉE', 'SAUCE TOMATE, FROMAGE, JAMBON* OU THON OU POULET OU VIANDE', 'modular', 'SAUCE TOMATE, FROMAGE, JAMBON* OU THON OU POULET OU VIANDE', 4, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🍕 NAPOLITAINE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 NAPOLITAINE', 'SAUCE TOMATE, FROMAGE, ANCHOIS, CÂPRES, OLIVES', 'modular', 'SAUCE TOMATE, FROMAGE, ANCHOIS, CÂPRES, OLIVES', 5, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🍕 TONINO
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 TONINO', 'SAUCE TOMATE, FROMAGE, THON, POIVRONS, OLIVES', 'modular', 'SAUCE TOMATE, FROMAGE, THON, POIVRONS, OLIVES', 6, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🌶️ ORIENTALE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🌶️ ORIENTALE', 'SAUCE TOMATE, FROMAGE, MERGUEZ, CHAMPIGNONS FRAIS, OIGNONS, ŒUF', 'modular', 'SAUCE TOMATE, FROMAGE, MERGUEZ, CHAMPIGNONS FRAIS, OIGNONS, ŒUF', 7, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🥬 VÉGÉTARIENNE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🥬 VÉGÉTARIENNE', 'SAUCE TOMATE, FROMAGE, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES', 'modular', 'SAUCE TOMATE, FROMAGE, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES', 8, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🦐 FRUITS DE MER
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🦐 FRUITS DE MER', 'SAUCE TOMATE, FROMAGE, COCKTAIL DE FRUITS DE MER MARINÉ À L''AIL ET PERSIL, CITRON', 'modular', 'SAUCE TOMATE, FROMAGE, COCKTAIL DE FRUITS DE MER MARINÉ À L''AIL ET PERSIL, CITRON', 9, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🍕 CAMPIONE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 CAMPIONE', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, POIVRONS, TOMATES FRAÎCHES', 'modular', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, POIVRONS, TOMATES FRAÎCHES', 10, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 🍕 4 SAISONS
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍕 4 SAISONS', 'SAUCE TOMATE, FROMAGE, JAMBON*, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES', 'modular', 'SAUCE TOMATE, FROMAGE, JAMBON*, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES', 11, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- 👑 ROYALE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '👑 ROYALE', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, MERGUEZ, POIVRONS, ŒUF', 'modular', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, MERGUEZ, POIVRONS, ŒUF', 12, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 15.00, 2),
        (product_id_val, 'MEGA', 20.00, 3);

    -- PIZZAS NIVEAU 2 (9€/16€/21€)
    
    -- 🗽 NEW YORK
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🗽 NEW YORK', 'SAUCE TOMATE, FROMAGE, POULET, POIVRONS, OIGNONS, JAMBON*', 'modular', 'SAUCE TOMATE, FROMAGE, POULET, POIVRONS, OIGNONS, JAMBON*', 13, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🌴 MIAMI
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🌴 MIAMI', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, PEPPERONIE, ŒUF', 'modular', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, PEPPERONIE, ŒUF', 14, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🍖 BARBECUE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍖 BARBECUE', 'SAUCE BBQ, FROMAGE, VIANDE HACHÉE, POULET, OIGNONS', 'modular', 'SAUCE BBQ, FROMAGE, VIANDE HACHÉE, POULET, OIGNONS', 15, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🐔 CHICKEN
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🐔 CHICKEN', 'CRÈME FRAÎCHE, FROMAGE, POULET, POMME DE TERRE, CHAMPIGNONS FRAIS', 'modular', 'CRÈME FRAÎCHE, FROMAGE, POULET, POMME DE TERRE, CHAMPIGNONS FRAIS', 16, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🧀 4 FROMAGES
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🧀 4 FROMAGES', 'CRÈME FRAÎCHE OU SAUCE TOMATE, MOZZARELLA, BRIE, BLEU, PARMESAN', 'modular', 'CRÈME FRAÎCHE OU SAUCE TOMATE, MOZZARELLA, BRIE, BLEU, PARMESAN', 17, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🌺 FLORIDA
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🌺 FLORIDA', 'CRÈME FRAÎCHE, FROMAGE, JAMBON*, LARDONS, POMME DE TERRE, OIGNONS', 'modular', 'CRÈME FRAÎCHE, FROMAGE, JAMBON*, LARDONS, POMME DE TERRE, OIGNONS', 18, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🍍 HAWAIENNE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍍 HAWAIENNE', 'CRÈME FRAÎCHE, FROMAGE, ANANAS, JAMBON*', 'modular', 'CRÈME FRAÎCHE, FROMAGE, ANANAS, JAMBON*', 19, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🎰 NEVADA
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🎰 NEVADA', 'SAUCE TOMATE, FROMAGE, POITRINE FUMÉE, CHAMPIGNONS FRAIS, ŒUF', 'modular', 'SAUCE TOMATE, FROMAGE, POITRINE FUMÉE, CHAMPIGNONS FRAIS, ŒUF', 20, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🌮 MEXICO
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🌮 MEXICO', 'SAUCE CURRY, FROMAGE, POULET, POIVRONS, TOMATES FRAÎCHES', 'modular', 'SAUCE CURRY, FROMAGE, POULET, POIVRONS, TOMATES FRAÎCHES', 21, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🤠 TEXAS
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🤠 TEXAS', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, CHORIZO, OIGNONS', 'modular', 'SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, CHORIZO, OIGNONS', 22, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- 🍯 CHÈVRE MIEL
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍯 CHÈVRE MIEL', 'CRÈME FRAÎCHE, MOZZARELLA, FROMAGE DE CHÈVRE, MIEL DOUX', 'modular', 'CRÈME FRAÎCHE, MOZZARELLA, FROMAGE DE CHÈVRE, MIEL DOUX', 23, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 9.00, 1),
        (product_id_val, 'SENIOR', 16.00, 2),
        (product_id_val, 'MEGA', 21.00, 3);

    -- PIZZAS NIVEAU 3 (10€/17€/22€)
    
    -- 🐟 RIMINI
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🐟 RIMINI', 'CRÈME FRAÎCHE, FROMAGE, SAUMON FUMÉ, ŒUF DE LYMPS, CITRON', 'modular', 'CRÈME FRAÎCHE, FROMAGE, SAUMON FUMÉ, ŒUF DE LYMPS, CITRON', 24, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🧄 BOURSIN
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🧄 BOURSIN', 'CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE OU POULET, BOURSIN, OIGNONS', 'modular', 'CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE OU POULET, BOURSIN, OIGNONS', 25, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🇮🇹 ANDIAMO
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🇮🇹 ANDIAMO', 'CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE, POULET, MERGUEZ, POMMES DE TERRE', 'modular', 'CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE, POULET, MERGUEZ, POMMES DE TERRE', 26, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- ⚔️ SAMOURAÏ
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '⚔️ SAMOURAÏ', 'SAUCE SAMOURAÏ, FROMAGE, VIANDE HACHÉE, OIGNONS, POIVRONS', 'modular', 'SAUCE SAMOURAÏ, FROMAGE, VIANDE HACHÉE, OIGNONS, POIVRONS', 27, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🥓 4 JAMBONS
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🥓 4 JAMBONS', 'CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGES, JAMBON, LARDONS, PEPPERONI, BACON', 'modular', 'CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGES, JAMBON, LARDONS, PEPPERONI, BACON', 28, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🧀 TARTIFLETTE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🧀 TARTIFLETTE', 'CRÈME FRAÎCHE, FROMAGE, LARDONS, POMME DE TERRE, OIGNONS, FROMAGE À TARTIFLETTE', 'modular', 'CRÈME FRAÎCHE, FROMAGE, LARDONS, POMME DE TERRE, OIGNONS, FROMAGE À TARTIFLETTE', 29, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🏔️ MONTAGNARDE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🏔️ MONTAGNARDE', 'CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGE, BACON, ŒUF, FROMAGE À RACLETTE, OIGNONS', 'modular', 'CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGE, BACON, ŒUF, FROMAGE À RACLETTE, OIGNONS', 30, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🌶️ POIVRE
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🌶️ POIVRE', 'SAUCE POIVRE, FROMAGE, POULET, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES', 'modular', 'SAUCE POIVRE, FROMAGE, POULET, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES', 31, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🔥 HOT SPICY
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🔥 HOT SPICY', 'SAUCE SALSA, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, PIMENTS FRAIS', 'modular', 'SAUCE SALSA, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, PIMENTS FRAIS', 32, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🍛 TANDOORI
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍛 TANDOORI', 'SAUCE CURRY, FROMAGE, POULET TANDOORI À L''INDIENNE, OIGNONS, POIVRONS, MIEL', 'modular', 'SAUCE CURRY, FROMAGE, POULET TANDOORI À L''INDIENNE, OIGNONS, POIVRONS, MIEL', 33, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

    -- 🍔 BIG BURGER
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '🍔 BIG BURGER', 'SAUCE BURGER, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, OIGNONS ROUGES', 'modular', 'SAUCE BURGER, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, OIGNONS ROUGES', 34, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_product_sizes (product_id, size_name, price_on_site, display_order)
    VALUES 
        (product_id_val, 'JUNIOR', 10.00, 1),
        (product_id_val, 'SENIOR', 17.00, 2),
        (product_id_val, 'MEGA', 22.00, 3);

END $$;

-- ÉTAPE 3: Ajouter les suppléments spécifiques aux pizzas via france_product_options
-- Les suppléments sont liés directement aux pizzas, pas des produits séparés

DO $$
DECLARE
    pizza_record RECORD;
    option_group_order INTEGER := 1;
BEGIN
    -- Parcourir toutes les pizzas du restaurant Pizza Yolo 77
    FOR pizza_record IN 
        SELECT p.id, p.name
        FROM france_products p 
        JOIN france_restaurants r ON p.restaurant_id = r.id 
        JOIN france_menu_categories mc ON p.category_id = mc.id
        WHERE r.slug = 'pizza-yolo-77' 
        AND mc.slug = 'pizzas'
        AND p.product_type = 'modular'
    LOOP
        -- CHEESY CRUST - Prix différenciés par taille
        INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, is_active, group_order)
        VALUES 
            (pizza_record.id, 'CHEESY CRUST', 'CHEESY CRUST Junior (+2€)', 2.00, false, 1, 1, true, option_group_order),
            (pizza_record.id, 'CHEESY CRUST', 'CHEESY CRUST Sénior (+2,50€)', 2.50, false, 1, 2, true, option_group_order),
            (pizza_record.id, 'CHEESY CRUST', 'CHEESY CRUST Méga (+4€)', 4.00, false, 1, 3, true, option_group_order);
        
        -- FROMAGES & LÉGUMES - Prix différenciés par taille
        INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, is_active, group_order)
        VALUES 
            (pizza_record.id, 'FROMAGES & LÉGUMES', 'Fromages & Légumes Junior/Sénior (+1€)', 1.00, false, 1, 1, true, option_group_order + 1),
            (pizza_record.id, 'FROMAGES & LÉGUMES', 'Fromages & Légumes Méga (+2€)', 2.00, false, 1, 2, true, option_group_order + 1);
            
        -- VIANDES & CHARCUTERIE - Prix différenciés par taille
        INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, is_active, group_order)
        VALUES 
            (pizza_record.id, 'VIANDES & CHARCUTERIE', 'Viandes & Charcuterie Junior/Sénior (+2€)', 2.00, false, 1, 1, true, option_group_order + 2),
            (pizza_record.id, 'VIANDES & CHARCUTERIE', 'Viandes & Charcuterie Méga (+3€)', 3.00, false, 1, 2, true, option_group_order + 2);
            
    END LOOP;
END $$;

-- ÉTAPE 4: Créer catégorie Menus
INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active)
SELECT 
    r.id,
    'Menus',
    'menus',
    '📋',
    3,
    true
FROM france_restaurants r
WHERE r.slug = 'pizza-yolo-77'
AND NOT EXISTS (
    SELECT 1 FROM france_menu_categories mc 
    WHERE mc.restaurant_id = r.id AND mc.slug = 'menus'
);

-- ÉTAPE 5: Insérer les 4 menus composés avec product_type = 'composite'
-- ⚠️ RÈGLE IMPORTANTE: Pas d'offre 1=2 dans les menus - Prix fixes uniquement
DO $$
DECLARE
    restaurant_id_val INTEGER;
    category_id_val INTEGER;
    product_id_val INTEGER;
BEGIN
    -- Récupérer l'ID du restaurant
    SELECT id INTO restaurant_id_val FROM france_restaurants WHERE slug = 'pizza-yolo-77';
    
    -- Récupérer l'ID de la catégorie menus
    SELECT id INTO category_id_val FROM france_menu_categories 
    WHERE restaurant_id = restaurant_id_val AND slug = 'menus';

    -- 📋 MENU 1
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, price_on_site_base, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '📋 MENU 1', '3 PIZZAS JUNIORS AU CHOIX', 'composite', '3 PIZZAS JUNIORS AU CHOIX', 25.00, 1, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
    VALUES (product_id_val, '3 PIZZAS JUNIORS AU CHOIX', 3, 'pièces');

    -- 📋 MENU 2
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, price_on_site_base, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '📋 MENU 2', '2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5 L', 'composite', '2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5 L', 25.00, 2, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
    VALUES 
        (product_id_val, '2 PIZZAS SÉNIOR AU CHOIX', 2, 'pièces'),
        (product_id_val, '1 BOISSON 1.5 L', 1, 'pièce');

    -- 📋 MENU 3
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, price_on_site_base, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '📋 MENU 3', '1 PIZZAS MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5 L', 'composite', '1 PIZZAS MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5 L', 32.00, 3, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
    VALUES 
        (product_id_val, '1 PIZZAS MEGA AU CHOIX', 1, 'pièce'),
        (product_id_val, '14 NUGGETS OU 12 WINGS', 1, 'portion'),
        (product_id_val, '1 BOISSON 1.5 L', 1, 'pièce');

    -- 📋 MENU 4
    INSERT INTO france_products (restaurant_id, category_id, name, description, product_type, composition, price_on_site_base, display_order, is_active)
    VALUES (restaurant_id_val, category_id_val, '📋 MENU 4', '1 PIZZAS SÉNIOR AU CHOIX + 2 BOISSONS 33 CL + 6 WINGS OU 8 NUGGETS', 'composite', '1 PIZZAS SÉNIOR AU CHOIX + 2 BOISSONS 33 CL + 6 WINGS OU 8 NUGGETS', 22.00, 4, true)
    RETURNING id INTO product_id_val;
    
    INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
    VALUES 
        (product_id_val, '1 PIZZAS SÉNIOR AU CHOIX', 1, 'pièce'),
        (product_id_val, '2 BOISSONS 33 CL', 2, 'pièces'),
        (product_id_val, '6 WINGS OU 8 NUGGETS', 1, 'portion');

END $$;

-- ÉTAPE 6: Ajouter commentaires sur les offres spéciales pour documentation
-- ⚠️ OFFRES SPÉCIALES PIZZAS INDIVIDUELLES (à implémenter dans le bot):
-- - JUNIOR (9-10€) : PAS D'OFFRE
-- - SÉNIOR (15-17€) : 1 ACHETÉE = 2ème OFFERTE 🎁  
-- - MÉGA (20-22€) : 1 ACHETÉE = 2ème OFFERTE 🎁
-- - MENUS : AUCUNE OFFRE - Prix fixes

-- ÉTAPE 7: Vérification finale
SELECT 
  'Intégration terminée - Vérification:' as message,
  (SELECT COUNT(*) FROM france_products p 
   JOIN france_restaurants r ON p.restaurant_id = r.id 
   WHERE r.slug = 'pizza-yolo-77') as total_produits,
  (SELECT COUNT(*) FROM france_product_sizes ps 
   JOIN france_products p ON ps.product_id = p.id 
   JOIN france_restaurants r ON p.restaurant_id = r.id 
   WHERE r.slug = 'pizza-yolo-77') as total_tailles,
  (SELECT COUNT(*) FROM france_product_options po
   JOIN france_products p ON po.product_id = p.id 
   JOIN france_restaurants r ON p.restaurant_id = r.id 
   WHERE r.slug = 'pizza-yolo-77') as total_supplements,
  (SELECT COUNT(*) FROM france_menu_categories mc 
   JOIN france_restaurants r ON mc.restaurant_id = r.id 
   WHERE r.slug = 'pizza-yolo-77') as total_categories;