-- ========================================================================
-- INSERTION MENU QUATTRO - PLAN B MELUN
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: MENUS QUATTRO 🍕
-- Produit: QUATTRO (22.50€)
-- Contenu: 2 Pizzas Senior au choix + 1 Coca Cola 1.5L
-- Workflow: 2 steps (Pizza 1 + Pizza 2)
-- Total pizzas: 31 (🍅 16 sauce tomate + 🥛 15 crème fraîche)
-- ========================================================================

BEGIN;

-- 1️⃣ CRÉATION CATÉGORIE MENUS QUATTRO
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
  'MENUS QUATTRO',
  'menus-quattro',
  'Nos menus avec pizzas et boissons',
  3,
  '🍕🥛',
  true
);

-- 2️⃣ PRODUIT : QUATTRO (COMPOSITE)
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
  (SELECT id FROM france_menu_categories WHERE slug = 'menus-quattro' AND restaurant_id = 22),
  'QUATTRO',
  '2 Pizzas Senior au choix + 1 Coca Cola 1.5L',
  'composite',
  22.50,
  22.50,
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
      }
    ]
  }'::json,
  '🍕🥛',
  true,
  1
);

-- 3️⃣ OPTIONS - PIZZAS SAUCE TOMATE - PREMIÈRE PIZZA (16 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'MARGUERITA', 'Sauce tomate, mozzarella', 0.00, '🍅', 1, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'BARBECUE', 'Sauce tomate, mozzarella, viande hachée, olives', 0.00, '🍅', 2, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'TEXAS', 'Sauce tomate, mozzarella, viande hachée, oignons, chorizo', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'SPECIALE', 'Sauce tomate, mozzarella, merguez, jambon, champignons, chorizo, crème fraîche', 0.00, '🍅', 4, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'CHICKEN', 'Sauce tomate, mozzarella, poulet, poivrons, champignons', 0.00, '🍅', 5, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'SUPER', 'Sauce tomate, mozzarella, merguez, poulet, viande hachée', 0.00, '🍅', 6, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', '4 FROMAGES', 'Sauce tomate, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🍅', 7, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'ORIENTALE', 'Sauce tomate, mozzarella, merguez, poivrons, oignons, olives, oeuf', 0.00, '🍅', 8, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', '4 JAMBONS', 'Sauce tomate, mozzarella, jambon, chorizo, bacon, lardons', 0.00, '🍅', 9, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'REGINA', 'Sauce tomate, mozzarella, jambon, champignons', 0.00, '🍅', 10, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'NAPOLITAINE', 'Sauce tomate, mozzarella, anchois, olives', 0.00, '🍅', 11, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'TORINO', 'Sauce tomate, mozzarella, thon, poivrons, olives, oeuf', 0.00, '🍅', 12, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'CAMPIONE', 'Sauce tomate, mozzarella, viande hachée, champignons', 0.00, '🍅', 13, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', '4 SAISONS', 'Sauce tomate, mozzarella, jambon, champignons, poivrons, artichauts, olives', 0.00, '🍅', 14, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'PAYSANNE', 'Sauce tomate, mozzarella, lardons grillés, oeuf', 0.00, '🍅', 15, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Première Pizza', 'VEGETARIENNE', 'Sauce tomate, mozzarella, champignons, poivrons, oignons, artichauts', 0.00, '🍅', 16, true);

-- 4️⃣ OPTIONS - PIZZAS CRÈME FRAÎCHE (15 pizzas)
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'PRONTO', 'Crème fraîche, mozzarella, jambon, pommes de terre', 0.00, '🥛', 17, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'TARTIFLETTE', 'Crème fraîche, mozzarella, lardons, pommes de terre, oignons', 0.00, '🥛', 18, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'CHÈVRE MIEL', 'Crème fraîche, mozzarella, chèvre, miel', 0.00, '🥛', 19, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'VENEZIA', 'Sauce tomate, mozzarella, saumon fumé, crème fraîche', 0.00, '🥛', 20, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'INDIENNE', 'Sauce curry, mozzarella, viande hachée, poivrons, oignons', 0.00, '🥛', 21, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'OSLO', 'Crème fraîche, mozzarella, saumon, citron', 0.00, '🥛', 22, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'SELSA', 'Crème fraîche, mozzarella, viande hachée, oignons, pommes de terre', 0.00, '🥛', 23, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'TEXANE', 'Crème fraîche, mozzarella, poulet, champignons, oignons', 0.00, '🥛', 24, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'MIA', 'Crème fraîche, mozzarella, chèvre, brie, bleu, parmesan', 0.00, '🥛', 25, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'RACLETTE', 'Crème fraîche, mozzarella, raclette, jambon, champignons, olives', 0.00, '🥛', 26, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'BOURSIN', 'Crème fraîche, mozzarella, boursin, viande hachée, oignons', 0.00, '🥛', 27, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'FERMIERE POULET', 'Crème fraîche, mozzarella, poulet, pommes de terre', 0.00, '🥛', 28, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'FERMIERE VIANDE HACHEE', 'Crème fraîche, mozzarella, viande hachée, pommes de terre', 0.00, '🥛', 29, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'GORGONZOLA', 'Crème fraîche, mozzarella, gorgonzola, lardons', 0.00, '🥛', 30, true),
((SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22), 'Pizzas', 'CAMPAGNARDE', 'Crème fraîche, mozzarella, double poulet, champignons, oignons', 0.00, '🥛', 31, true);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT id, name, slug, display_order, icon
FROM france_menu_categories
WHERE restaurant_id = 22 AND slug = 'menus-quattro';

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
WHERE p.restaurant_id = 22 AND c.slug = 'menus-quattro';

-- Compter les options
SELECT
  option_group,
  COUNT(*) as nb_pizzas
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22)
GROUP BY option_group;

-- Vérifier quelques pizzas
SELECT
  option_name,
  composition,
  price_modifier,
  icon,
  display_order
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'QUATTRO' AND restaurant_id = 22)
ORDER BY display_order
LIMIT 10;

-- Transaction validée automatiquement en cas de succès
COMMIT;

-- En cas d'erreur : ROLLBACK;

-- ========================================================================
-- RÉSUMÉ :
-- ========================================================================
-- Catégorie : MENUS QUATTRO 🍕
-- Produit : QUATTRO (22.50€)
-- Contenu : 2 Pizzas Senior + 1 Coca Cola 1.5L
-- Workflow : universal_workflow_v2 avec 2 steps
--   - Step 1 : Choix première pizza (1 choix parmi 31)
--   - Step 2 : Choix deuxième pizza (1 choix parmi 31)
-- Total pizzas : 31
--   - 16 pizzas sauce tomate (icône 🍅)
--   - 15 pizzas crème fraîche (icône 🥛)
-- ========================================================================
