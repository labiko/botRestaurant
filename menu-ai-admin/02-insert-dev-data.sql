-- 📊 INSERTION DONNÉES DE TEST - ENVIRONNEMENT DEV
-- ==================================================
-- Script d'insertion des données pour Menu AI Modifier
-- Basé sur les données Pizza Yolo 77 existantes

BEGIN;

-- ========================================
-- 🏪 RESTAURANT PIZZA YOLO 77
-- ========================================

INSERT INTO public.france_restaurants (
  id, name, slug, whatsapp_number,
  delivery_zone_km, min_order_amount, delivery_fee,
  is_active, business_hours,
  latitude, longitude
) VALUES (
  1,
  'Pizza Yolo 77',
  'pizza-yolo-77',
  '33753058254',
  15,
  25.00,
  3.00,
  true,
  '{
    "lundi": {"ouvert": true, "heures": "11:00-23:00"},
    "mardi": {"ouvert": true, "heures": "11:00-23:00"},
    "mercredi": {"ouvert": true, "heures": "11:00-23:00"},
    "jeudi": {"ouvert": true, "heures": "11:00-23:00"},
    "vendredi": {"ouvert": true, "heures": "11:00-00:00"},
    "samedi": {"ouvert": true, "heures": "11:00-00:00"},
    "dimanche": {"ouvert": true, "heures": "12:00-23:00"}
  }',
  48.8566,
  2.3522
);

-- ========================================
-- 📂 CATÉGORIES DE MENU
-- ========================================

INSERT INTO public.france_menu_categories (
  id, restaurant_id, name, slug, icon, display_order, is_active
) VALUES
(1, 1, 'PIZZAS', 'pizzas', '🍕', 1, true),
(2, 1, 'BURGERS', 'burgers', '🍔', 2, true),
(3, 1, 'SANDWICHS', 'sandwichs', '🥪', 3, true),
(4, 1, 'SALADES', 'salades', '🥗', 4, true),
(5, 1, 'BOISSONS', 'boissons', '🥤', 5, true),
(6, 1, 'DESSERTS', 'desserts', '🍰', 6, true),
(7, 1, 'ACCOMPAGNEMENTS', 'accompagnements', '🍟', 7, true);

-- ========================================
-- 🍕 PRODUITS PIZZAS
-- ========================================

-- Pizza Margherita (simple)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  1, 1, 1, 'PIZZA MARGHERITA', 'La classique pizza italienne',
  'simple', 12.50, 13.50,
  'Base tomate, mozzarella, basilic frais, huile d''olive',
  1, true,
  null, false, '{}'
);

-- Pizza Pepperoni (simple)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  2, 1, 1, 'PIZZA PEPPERONI', 'Pizza américaine classique',
  'simple', 14.50, 15.50,
  'Base tomate, mozzarella, pepperoni, origan',
  2, true,
  null, false, '{}'
);

-- Pizza 4 Fromages (simple)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  3, 1, 1, 'PIZZA 4 FROMAGES', 'Pour les amateurs de fromage',
  'simple', 16.00, 17.00,
  'Base crème, mozzarella, chèvre, roquefort, emmental',
  3, true,
  null, false, '{}'
);

-- Pizza Personnalisée (composite avec workflow)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  4, 1, 1, 'PIZZA PERSONNALISÉE', 'Créez votre pizza sur mesure',
  'composite', 13.00, 14.00,
  'Base au choix, garnitures personnalisables',
  4, true,
  'pizza_custom', true, '{
    "steps": [
      {
        "step_id": "base_choice",
        "title": "Choisissez votre base",
        "type": "single_choice",
        "options": [
          {"id": "tomate", "label": "Base tomate", "price": 0},
          {"id": "creme", "label": "Base crème", "price": 0},
          {"id": "bbq", "label": "Base BBQ", "price": 1}
        ]
      },
      {
        "step_id": "meat_choice",
        "title": "Choisissez vos viandes",
        "type": "multiple_choice",
        "max_selections": 3,
        "options": [
          {"id": "pepperoni", "label": "Pepperoni", "price": 2},
          {"id": "jambon", "label": "Jambon", "price": 2},
          {"id": "chorizo", "label": "Chorizo", "price": 2.5},
          {"id": "poulet", "label": "Poulet", "price": 2.5}
        ]
      }
    ]
  }'
);

-- ========================================
-- 🍔 PRODUITS BURGERS
-- ========================================

-- L'Américain (simple)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  5, 1, 2, 'L''AMÉRICAIN', 'Le burger généreux',
  'simple', 13.50, 14.50,
  'Pain brioche, 2 steaks façon bouchère 150g, bacon, œufs, cornichons',
  1, true,
  null, false, '{}'
);

-- Le Chicken Burger (simple)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  6, 1, 2, 'LE CHICKEN', 'Galette de poulet croustillante',
  'simple', 6.50, 7.50,
  'Galette de poulet panné, fromage, cornichon',
  2, true,
  null, false, '{}'
);

-- Burger Menu (composite)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  7, 1, 2, 'MENU BURGER', 'Burger + accompagnement + boisson',
  'composite', 16.50, 17.50,
  'Burger au choix, frites ou salade, boisson 33cl',
  3, true,
  'menu_burger', true, '{
    "steps": [
      {
        "step_id": "burger_choice",
        "title": "Choisissez votre burger",
        "type": "single_choice",
        "options": [
          {"id": "americain", "label": "L''Américain", "price": 0},
          {"id": "chicken", "label": "Le Chicken", "price": -7}
        ]
      },
      {
        "step_id": "side_choice",
        "title": "Choisissez votre accompagnement",
        "type": "single_choice",
        "options": [
          {"id": "frites", "label": "Frites", "price": 0},
          {"id": "salade", "label": "Salade verte", "price": 0}
        ]
      },
      {
        "step_id": "drink_choice",
        "title": "Choisissez votre boisson",
        "type": "single_choice",
        "options": [
          {"id": "coca", "label": "Coca Cola 33cl", "price": 0},
          {"id": "fanta", "label": "Fanta Orange 33cl", "price": 0},
          {"id": "sprite", "label": "Sprite 33cl", "price": 0},
          {"id": "eau", "label": "Eau 50cl", "price": 0}
        ]
      }
    ]
  }'
);

-- ========================================
-- 🥪 PRODUITS SANDWICHS
-- ========================================

-- Sandwich Jambon Beurre
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  8, 1, 3, 'JAMBON BEURRE', 'Le classique français',
  'simple', 4.50, 5.50,
  'Baguette fraîche, jambon de Paris, beurre',
  1, true,
  null, false, '{}'
);

-- Sandwich Poulet Crudités
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  9, 1, 3, 'POULET CRUDITÉS', 'Sandwich équilibré',
  'simple', 6.00, 7.00,
  'Pain complet, blanc de poulet, salade, tomates, concombre',
  2, true,
  null, false, '{}'
);

-- ========================================
-- 🥗 PRODUITS SALADES
-- ========================================

-- Salade César
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  10, 1, 4, 'SALADE CÉSAR', 'La salade mythique',
  'simple', 9.50, 10.50,
  'Salade romaine, poulet grillé, parmesan, croûtons, sauce César',
  1, true,
  null, false, '{}'
);

-- ========================================
-- 🥤 PRODUITS BOISSONS
-- ========================================

-- Coca Cola 33cl
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  11, 1, 5, 'COCA COLA 33CL', 'La boisson pétillante emblématique',
  'simple', 2.50, 3.50,
  'Canette Coca Cola 33cl',
  1, true,
  null, false, '{}'
);

-- Fanta Orange 33cl
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  12, 1, 5, 'FANTA ORANGE 33CL', 'Boisson pétillante à l''orange',
  'simple', 2.50, 3.50,
  'Canette Fanta Orange 33cl',
  2, true,
  null, false, '{}'
);

-- Eau minérale 50cl
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  13, 1, 5, 'EAU MINÉRALE 50CL', 'Eau plate naturelle',
  'simple', 1.50, 2.50,
  'Bouteille eau minérale 50cl',
  3, true,
  null, false, '{}'
);

-- ========================================
-- 🍰 PRODUITS DESSERTS
-- ========================================

-- Tiramisu
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  14, 1, 6, 'TIRAMISU', 'Dessert italien traditionnel',
  'simple', 5.50, 6.50,
  'Mascarpone, café, cacao, biscuits à la cuillère',
  1, true,
  null, false, '{}'
);

-- ========================================
-- 🍟 PRODUITS ACCOMPAGNEMENTS
-- ========================================

-- Frites
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config
) VALUES (
  15, 1, 7, 'FRITES', 'Pommes de terre frites croustillantes',
  'simple', 3.50, 4.50,
  'Pommes de terre fraîches, cuites dans l''huile de tournesol',
  1, true,
  null, false, '{}'
);

-- ========================================
-- 🔧 COMPOSANTS POUR PRODUITS COMPOSITES
-- ========================================

-- Composants pour Menu Burger (ID 7)
INSERT INTO public.france_composite_items (
  composite_product_id, component_name, quantity, unit
) VALUES
(7, 'Burger principal', 1, 'pièce'),
(7, 'Accompagnement', 1, 'portion'),
(7, 'Boisson', 1, 'canette');

-- ========================================
-- 📏 TAILLES DE PRODUITS (france_product_sizes)
-- ========================================

-- Tailles pour Pizza Margherita (ID 1)
INSERT INTO public.france_product_sizes (
  product_id, size_name, price_on_site, price_delivery,
  includes_drink, display_order, is_active
) VALUES
(1, 'Petite (26cm)', 12.50, 13.50, false, 1, true),
(1, 'Moyenne (30cm)', 15.50, 16.50, false, 2, true),
(1, 'Grande (34cm)', 18.50, 19.50, false, 3, true),
(1, 'Familiale (40cm)', 22.50, 23.50, false, 4, true);

-- Tailles pour Pizza Pepperoni (ID 2)
INSERT INTO public.france_product_sizes (
  product_id, size_name, price_on_site, price_delivery,
  includes_drink, display_order, is_active
) VALUES
(2, 'Petite (26cm)', 14.50, 15.50, false, 1, true),
(2, 'Moyenne (30cm)', 17.50, 18.50, false, 2, true),
(2, 'Grande (34cm)', 20.50, 21.50, false, 3, true),
(2, 'Familiale (40cm)', 24.50, 25.50, false, 4, true);

-- Tailles pour Pizza 4 Fromages (ID 3)
INSERT INTO public.france_product_sizes (
  product_id, size_name, price_on_site, price_delivery,
  includes_drink, display_order, is_active
) VALUES
(3, 'Petite (26cm)', 16.00, 17.00, false, 1, true),
(3, 'Moyenne (30cm)', 19.00, 20.00, false, 2, true),
(3, 'Grande (34cm)', 22.00, 23.00, false, 3, true),
(3, 'Familiale (40cm)', 26.00, 27.00, false, 4, true);

-- Tailles pour boissons avec variantes
INSERT INTO public.france_product_sizes (
  product_id, size_name, price_on_site, price_delivery,
  includes_drink, display_order, is_active
) VALUES
(11, '33cl', 2.50, 3.50, true, 1, true),
(11, '50cl', 3.50, 4.50, true, 2, true),
(11, '1.5L', 5.50, 6.50, true, 3, true),
(12, '33cl', 2.50, 3.50, true, 1, true),
(12, '50cl', 3.50, 4.50, true, 2, true),
(12, '1.5L', 5.50, 6.50, true, 3, true);

-- ========================================
-- 🎯 VARIANTES DE PRODUITS (france_product_variants)
-- ========================================

-- Variantes pour L'Américain (ID 5) - Avec ou sans œuf
INSERT INTO public.france_product_variants (
  product_id, variant_name, price_on_site, price_delivery,
  quantity, unit, is_menu, includes_description, display_order, is_active
) VALUES
(5, 'Avec œuf (classique)', 13.50, 14.50, 1, 'pièce', false, 'Version classique avec œuf', 1, true),
(5, 'Sans œuf', 12.50, 13.50, 1, 'pièce', false, 'Version sans œuf', 2, true),
(5, 'Double viande', 16.50, 17.50, 1, 'pièce', false, 'Avec 2 steaks supplémentaires', 3, true);

-- Variantes pour Le Chicken (ID 6) - Épicé ou non
INSERT INTO public.france_product_variants (
  product_id, variant_name, price_on_site, price_delivery,
  quantity, unit, is_menu, includes_description, display_order, is_active
) VALUES
(6, 'Classique', 6.50, 7.50, 1, 'pièce', false, 'Poulet nature', 1, true),
(6, 'Épicé', 6.50, 7.50, 1, 'pièce', false, 'Poulet sauce piquante', 2, true),
(6, 'Double cheese', 7.50, 8.50, 1, 'pièce', false, 'Avec fromage supplémentaire', 3, true);

-- Variantes pour Frites (ID 15) - Différentes préparations
INSERT INTO public.france_product_variants (
  product_id, variant_name, price_on_site, price_delivery,
  quantity, unit, is_menu, includes_description, display_order, is_active
) VALUES
(15, 'Frites nature', 3.50, 4.50, 1, 'portion', false, 'Frites classiques', 1, true),
(15, 'Frites cheddar', 4.50, 5.50, 1, 'portion', false, 'Avec sauce cheddar', 2, true),
(15, 'Frites bacon', 5.50, 6.50, 1, 'portion', false, 'Avec morceaux de bacon', 3, true);

-- ========================================
-- ⚙️ OPTIONS INTERACTIVES (france_product_options)
-- ========================================

-- Options pour Pizza Personnalisée (ID 4) - Base
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(4, 'base', 'Base tomate', 0.00, true, 1, 1, 1, 2, '{}'),
(4, 'base', 'Base crème', 0.00, true, 1, 2, 1, 2, '{}'),
(4, 'base', 'Base BBQ', 1.00, true, 1, 3, 1, 2, '{}'),
(4, 'base', 'Base pesto', 1.50, true, 1, 4, 1, 2, '{}');

-- Options pour Pizza Personnalisée (ID 4) - Fromages
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(4, 'fromages', 'Mozzarella', 0.00, true, 1, 1, 2, 3, '{}'),
(4, 'fromages', 'Chèvre', 2.00, false, 3, 2, 2, 3, '{}'),
(4, 'fromages', 'Roquefort', 2.50, false, 3, 3, 2, 3, '{}'),
(4, 'fromages', 'Emmental', 1.50, false, 3, 4, 2, 3, '{}'),
(4, 'fromages', 'Parmesan', 2.00, false, 3, 5, 2, 3, '{}');

-- Options pour Pizza Personnalisée (ID 4) - Viandes
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(4, 'viandes', 'Jambon', 2.00, false, 3, 1, 3, 4, '{}'),
(4, 'viandes', 'Pepperoni', 2.50, false, 3, 2, 3, 4, '{}'),
(4, 'viandes', 'Chorizo', 3.00, false, 3, 3, 3, 4, '{}'),
(4, 'viandes', 'Poulet', 2.50, false, 3, 4, 3, 4, '{}'),
(4, 'viandes', 'Bacon', 2.50, false, 3, 5, 3, 4, '{}'),
(4, 'viandes', 'Merguez', 3.00, false, 3, 6, 3, 4, '{}');

-- Options pour Pizza Personnalisée (ID 4) - Légumes
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(4, 'legumes', 'Champignons', 1.50, false, 5, 1, 4, null, '{}'),
(4, 'legumes', 'Poivrons', 1.50, false, 5, 2, 4, null, '{}'),
(4, 'legumes', 'Oignons', 1.00, false, 5, 3, 4, null, '{}'),
(4, 'legumes', 'Olives noires', 1.50, false, 5, 4, 4, null, '{}'),
(4, 'legumes', 'Olives vertes', 1.50, false, 5, 5, 4, null, '{}'),
(4, 'legumes', 'Tomates cerises', 2.00, false, 5, 6, 4, null, '{}'),
(4, 'legumes', 'Roquette', 1.50, false, 5, 7, 4, null, '{}'),
(4, 'legumes', 'Aubergines', 2.00, false, 5, 8, 4, null, '{}');

-- Options pour Menu Burger (ID 7) - Choix burger
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(7, 'burger_choice', 'L''Américain', 0.00, true, 1, 1, 1, 2, '{}'),
(7, 'burger_choice', 'Le Chicken', -7.00, true, 1, 2, 1, 2, '{}');

-- Options pour Menu Burger (ID 7) - Accompagnements
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(7, 'accompagnement', 'Frites', 0.00, true, 1, 1, 2, 3, '{}'),
(7, 'accompagnement', 'Salade verte', 0.00, true, 1, 2, 2, 3, '{}'),
(7, 'accompagnement', 'Frites cheddar', 1.00, true, 1, 3, 2, 3, '{}');

-- Options pour Menu Burger (ID 7) - Boissons
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order,
  next_group_order, conditional_next_group
) VALUES
(7, 'boisson', 'Coca Cola 33cl', 0.00, true, 1, 1, 3, null, '{}'),
(7, 'boisson', 'Fanta Orange 33cl', 0.00, true, 1, 2, 3, null, '{}'),
(7, 'boisson', 'Sprite 33cl', 0.00, true, 1, 3, 3, null, '{}'),
(7, 'boisson', 'Eau 50cl', 0.00, true, 1, 4, 3, null, '{}'),
(7, 'boisson', 'Coca Cola 50cl', 1.00, true, 1, 5, 3, null, '{}');

-- ========================================
-- 🏭 CONFIGURATION RESTAURANT
-- ========================================

-- Numéro WhatsApp
INSERT INTO public.france_whatsapp_numbers (
  restaurant_id, phone_number, instance_id, api_token, is_active
) VALUES (
  1, '33753058254', '7105313693', 'token_placeholder', true
);

-- Modes de service activés
INSERT INTO public.france_restaurant_service_modes (
  restaurant_id, service_mode, is_enabled, config
) VALUES
(1, 'sur_place', true, '{"available": true}'),
(1, 'a_emporter', true, '{"available": true}'),
(1, 'livraison', true, '{"available": true, "radius_km": 15, "min_order": 25}');

-- Fonctionnalités activées
INSERT INTO public.france_restaurant_features (
  restaurant_id, feature_name, is_enabled, config
) VALUES
(1, 'menu_ai_modifier', true, '{"version": "1.0.0"}'),
(1, 'paiement_differe', true, '{"modes": ["fin_repas", "recuperation", "livraison"]}'),
(1, 'commande_vocale', false, '{}'),
(1, 'loyalty_program', false, '{}');

-- ========================================
-- 🤖 WORKFLOWS DE BASE
-- ========================================

-- Workflow pour pizza personnalisée
INSERT INTO public.workflow_definitions (
  restaurant_id, workflow_id, name, trigger_conditions, steps, is_active
) VALUES (
  1,
  'pizza_custom',
  'Configuration Pizza Personnalisée',
  '{"product_type": "composite", "workflow_type": "pizza_custom"}',
  '[
    {
      "step_id": "base_choice",
      "step_type": "single_selection",
      "title": "Choisissez votre base",
      "required": true,
      "options": [
        {"id": "tomate", "name": "Base tomate", "price_modifier": 0},
        {"id": "creme", "name": "Base crème", "price_modifier": 0},
        {"id": "bbq", "name": "Base BBQ", "price_modifier": 1}
      ]
    },
    {
      "step_id": "meat_choice",
      "step_type": "multiple_selection",
      "title": "Choisissez vos viandes",
      "required": false,
      "max_selections": 3,
      "options": [
        {"id": "pepperoni", "name": "Pepperoni", "price_modifier": 2},
        {"id": "jambon", "name": "Jambon", "price_modifier": 2},
        {"id": "chorizo", "name": "Chorizo", "price_modifier": 2.5},
        {"id": "poulet", "name": "Poulet", "price_modifier": 2.5}
      ]
    }
  ]',
  true
);

-- Workflow pour menu burger
INSERT INTO public.workflow_definitions (
  restaurant_id, workflow_id, name, trigger_conditions, steps, is_active
) VALUES (
  1,
  'menu_burger',
  'Configuration Menu Burger',
  '{"product_type": "composite", "workflow_type": "menu_burger"}',
  '[
    {
      "step_id": "burger_choice",
      "step_type": "single_selection",
      "title": "Choisissez votre burger",
      "required": true,
      "options": [
        {"id": "americain", "name": "L''Américain", "price_modifier": 0},
        {"id": "chicken", "name": "Le Chicken", "price_modifier": -7}
      ]
    },
    {
      "step_id": "side_choice",
      "step_type": "single_selection",
      "title": "Choisissez votre accompagnement",
      "required": true,
      "options": [
        {"id": "frites", "name": "Frites", "price_modifier": 0},
        {"id": "salade", "name": "Salade verte", "price_modifier": 0}
      ]
    },
    {
      "step_id": "drink_choice",
      "step_type": "single_selection",
      "title": "Choisissez votre boisson",
      "required": true,
      "options": [
        {"id": "coca", "name": "Coca Cola 33cl", "price_modifier": 0},
        {"id": "fanta", "name": "Fanta Orange 33cl", "price_modifier": 0},
        {"id": "sprite", "name": "Sprite 33cl", "price_modifier": 0},
        {"id": "eau", "name": "Eau 50cl", "price_modifier": 0}
      ]
    }
  ]',
  true
);

-- ========================================
-- 📊 EXEMPLES D'ADRESSES CLIENTS
-- ========================================

INSERT INTO public.france_customer_addresses (
  phone_number, whatsapp_name, address_label, full_address,
  latitude, longitude, is_default, is_active
) VALUES
('33753058254', 'Client Test', 'Domicile', '123 Rue de la Paix, 77000 Melun, France', 48.5384, 2.6606, true, true),
('33612345678', 'Marie Dupont', 'Travail', '456 Avenue de la République, 77100 Meaux, France', 48.9606, 2.8789, true, true);

-- ========================================
-- 🚛 LIVREURS DE TEST
-- ========================================

INSERT INTO public.france_delivery_drivers (
  restaurant_id, first_name, last_name, phone_number,
  is_active, is_online, password
) VALUES
(1, 'Mohamed', 'Traore', '33765432109', true, false, '000000'),
(1, 'Karim', 'Diallo', '33756789012', true, true, '000000');

-- ========================================
-- 📈 MISE À JOUR DES SÉQUENCES
-- ========================================

-- Réinitialiser les séquences pour éviter les conflits d'ID
SELECT setval('france_restaurants_id_seq', 1, true);
SELECT setval('france_menu_categories_id_seq', 7, true);
SELECT setval('france_products_id_seq', 15, true);
SELECT setval('france_composite_items_id_seq', 3, true);
SELECT setval('france_product_sizes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM france_product_sizes), true);
SELECT setval('france_product_variants_id_seq', (SELECT COALESCE(MAX(id), 0) FROM france_product_variants), true);
SELECT setval('france_product_options_id_seq', (SELECT COALESCE(MAX(id), 0) FROM france_product_options), true);
SELECT setval('workflow_definitions_id_seq', 2, true);
SELECT setval('france_delivery_drivers_id_seq', 2, true);
SELECT setval('france_customer_addresses_id_seq', 2, true);

COMMIT;

-- ========================================
-- ✅ DONNÉES COMPLÈTES INSÉRÉES AVEC SUCCÈS
-- ========================================
-- 🏪 Restaurant: Pizza Yolo 77 configuré
-- 📂 Catégories: 7 créées (Pizzas, Burgers, Sandwichs, Salades, Boissons, Desserts, Accompagnements)
-- 🍕 Produits: 15 créés (simples + composites avec workflows)
-- 📏 Tailles: 18 tailles configurées (pizzas 4 tailles + boissons 3 tailles)
-- 🎯 Variantes: 9 variantes créées (L'Américain, Le Chicken, Frites)
-- ⚙️ Options: 35+ options interactives (Pizza personnalisée + Menu Burger)
-- 🤖 Workflows: 2 configurés (pizza_custom + menu_burger)
-- 🚛 Livreurs: 2 créés avec authentification
-- 📍 Adresses: 2 exemples clients
-- 🔧 Fonctionnalités: Menu AI Modifier activé
--
-- 🎯 BASE COMPLÈTE POUR MENU AI MODIFIER !
--
-- 📊 DONNÉES DISPONIBLES POUR L'IA:
-- - Produits simples: PIZZA MARGHERITA, PEPPERONI, L'AMÉRICAIN, LE CHICKEN, etc.
-- - Produits composites: PIZZA PERSONNALISÉE, MENU BURGER
-- - Tailles multiples pour pizzas (26cm à 40cm)
-- - Options interactives (bases, fromages, viandes, légumes)
-- - Workflows complets avec étapes configurées
--
-- 🧪 COMMANDES DE TEST RECOMMANDÉES:
-- 1. "Duplique L'AMÉRICAIN en MINI AMÉRICAIN à 8€"
-- 2. "Ajouter Coca Cherry 33CL - 2.50€ dans BOISSONS"
-- 3. "Changer prix AMERICAIN de 13.50€ à 14€"
-- 4. "Duplique PIZZA MARGHERITA en MINI MARGHERITA à 9€"
-- 5. "Ajouter Ice Tea Pêche 50cl - 3€ dans BOISSONS"
--
-- 💡 L'IA pourra analyser:
-- - Les structures de produits existantes
-- - Les patterns de prix (base + 1€ livraison)
-- - Les workflows et configurations
-- - Les relations entre catégories et produits