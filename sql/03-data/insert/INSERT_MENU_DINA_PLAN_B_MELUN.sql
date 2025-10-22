-- ========================================================================
-- INSERTION MENU DINA - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS DINA 🍕🥛
-- Produit: MENU DINA (28.50€)
-- Contenu: 3 Pizzas Senior au choix + 1 Coca Cola 1.5L
-- Workflow: 3 steps (Pizza 1 + Pizza 2 + Pizza 3)
-- Total pizzas: 31 (🍅 16 sauce tomate + 🥛 15 crème fraîche)
-- Total options: 93 (31 x 3 groupes)
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE MENUS DINA
INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  description,
  display_order,
  icon,
  is_active
) VALUES (
  22,
  'MENUS DINA',
  'menus-dina',
  'Nos menus avec 3 pizzas et boissons',
  4,
  '🍕🥛',
  true
);

-- 2️⃣ PRODUIT : MENU DINA (COMPOSITE)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-dina' AND restaurant_id = 22),
  'MENU DINA',
  '3 Pizzas Senior au choix + 1 Coca Cola 1.5L',
  'composite',
  28.50,
  28.50,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "votre première pizza",
        "option_groups": ["Première Pizza"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre deuxième pizza",
        "option_groups": ["Deuxième Pizza"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "votre troisième pizza",
        "option_groups": ["Troisième Pizza"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍕🥛',
  true,
  1
);

-- 3️⃣ OPTIONS - PIZZAS SAUCE TOMATE - PREMIÈRE PIZZA (16 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'MARGUERITA', 'Sauce tomate, mozzarella', 0.00, '🍅', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 0.00, '🍅', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 0.00, '🍅', 4, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 0.00, '🍅', 5, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 0.00, '🍅', 6, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍅', 7, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 0.00, '🍅', 8, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 0.00, '🍅', 9, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 0.00, '🍅', 10, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 0.00, '🍅', 11, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 0.00, '🍅', 12, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 0.00, '🍅', 13, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 0.00, '🍅', 14, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 0.00, '🍅', 15, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 0.00, '🍅', 16, true);

-- 4️⃣ OPTIONS - PIZZAS CRÈME FRAÎCHE - PREMIÈRE PIZZA (15 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 0.00, '🥛', 17, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 0.00, '🥛', 18, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'CHÈVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 0.00, '🥛', 19, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 0.00, '🥛', 20, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 0.00, '🥛', 21, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 0.00, '🥛', 22, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 0.00, '🥛', 23, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 0.00, '🥛', 24, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🥛', 25, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 0.00, '🥛', 26, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 0.00, '🥛', 27, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 0.00, '🥛', 28, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 0.00, '🥛', 29, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 0.00, '🥛', 30, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Première Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 0.00, '🥛', 31, true);

-- 5️⃣ OPTIONS - PIZZAS SAUCE TOMATE - DEUXIÈME PIZZA (16 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'MARGUERITA', 'Sauce tomate, mozzarella', 0.00, '🍅', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 0.00, '🍅', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 0.00, '🍅', 4, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 0.00, '🍅', 5, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 0.00, '🍅', 6, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍅', 7, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 0.00, '🍅', 8, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 0.00, '🍅', 9, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 0.00, '🍅', 10, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 0.00, '🍅', 11, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 0.00, '🍅', 12, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 0.00, '🍅', 13, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 0.00, '🍅', 14, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 0.00, '🍅', 15, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 0.00, '🍅', 16, true);

-- 6️⃣ OPTIONS - PIZZAS CRÈME FRAÎCHE - DEUXIÈME PIZZA (15 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 0.00, '🥛', 17, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 0.00, '🥛', 18, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'CHÈVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 0.00, '🥛', 19, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 0.00, '🥛', 20, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 0.00, '🥛', 21, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 0.00, '🥛', 22, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 0.00, '🥛', 23, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 0.00, '🥛', 24, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🥛', 25, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 0.00, '🥛', 26, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 0.00, '🥛', 27, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 0.00, '🥛', 28, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 0.00, '🥛', 29, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 0.00, '🥛', 30, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Deuxième Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 0.00, '🥛', 31, true);

-- 7️⃣ OPTIONS - PIZZAS SAUCE TOMATE - TROISIÈME PIZZA (16 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'MARGUERITA', 'Sauce tomate, mozzarella', 0.00, '🍅', 1, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 0.00, '🍅', 2, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 0.00, '🍅', 4, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 0.00, '🍅', 5, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 0.00, '🍅', 6, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍅', 7, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 0.00, '🍅', 8, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 0.00, '🍅', 9, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 0.00, '🍅', 10, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 0.00, '🍅', 11, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 0.00, '🍅', 12, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 0.00, '🍅', 13, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 0.00, '🍅', 14, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 0.00, '🍅', 15, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 0.00, '🍅', 16, true);

-- 8️⃣ OPTIONS - PIZZAS CRÈME FRAÎCHE - TROISIÈME PIZZA (15 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 0.00, '🥛', 17, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 0.00, '🥛', 18, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'CHÈVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 0.00, '🥛', 19, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 0.00, '🥛', 20, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 0.00, '🥛', 21, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 0.00, '🥛', 22, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 0.00, '🥛', 23, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 0.00, '🥛', 24, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🥛', 25, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 0.00, '🥛', 26, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 0.00, '🥛', 27, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 0.00, '🥛', 28, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 0.00, '🥛', 29, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 0.00, '🥛', 30, true),
((SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22), 'Troisième Pizza', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 0.00, '🥛', 31, true);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'menus-dina';

-- Vérifier le produit créé
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.product_type,
  p.workflow_type,
  p.requires_steps,
  p.icon,
  c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 22 AND c.slug = 'menus-dina';

-- Compter les options par groupe
SELECT
  option_group,
  COUNT(*) as nb_pizzas
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22)
GROUP BY option_group
ORDER BY option_group;

-- Vérifier le total d'options (devrait être 93 = 31 x 3)
SELECT
  COUNT(*) as total_options
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22);

-- Vérifier quelques pizzas de chaque groupe
SELECT
  option_group,
  option_name,
  icon,
  display_order
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'MENU DINA' AND restaurant_id = 22)
  AND option_name IN ('MARGUERITA', 'CHICKEN', 'PRONTO', 'TARTIFLETTE')
ORDER BY option_group, option_name;

-- Transaction validée automatiquement en cas de succès
COMMIT;

-- En cas d'erreur : ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- - Catégorie MENUS DINA créée
-- - Produit MENU DINA créé (28.50€)
-- - steps_config avec 3 groupes différents
-- - 31 options "Première Pizza" (tomates 🍅 + crème 🥛)
-- - 31 options "Deuxième Pizza" (tomates 🍅 + crème 🥛)
-- - 31 options "Troisième Pizza" (tomates 🍅 + crème 🥛)
-- - Total : 93 options pour le produit MENU DINA
--
-- APRÈS CETTE INSERTION :
-- Step 1 : Choix pizza 1 → Stocké dans workflowData.selections["Première Pizza"]
-- Step 2 : Choix pizza 2 → Stocké dans workflowData.selections["Deuxième Pizza"]
-- Step 3 : Choix pizza 3 → Stocké dans workflowData.selections["Troisième Pizza"]
-- Résultat : LES TROIS PIZZAS APPARAISSENT dans le panier ! ✅
-- ========================================================================
