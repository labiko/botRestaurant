-- 🍕 CONFIGURATION FINALE DES MENUS PIZZA - CONFORME AUX SCÉNARIOS
-- Type composite avec workflow de sélection multiple
-- Administrable côté back-office via modification du JSON steps_config

BEGIN;

-- ============================================
-- 1. CONFIGURATION DU TYPE DE PRODUIT
-- ============================================
UPDATE france_products 
SET 
    product_type = 'composite',
    workflow_type = 'menu_pizza_selection',
    requires_steps = true,
    base_price = NULL
WHERE id IN (310, 311, 312, 313)
    AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 1 (ID: 310) - 3 PIZZAS JUNIORS - 25€
-- ============================================
UPDATE france_products 
SET 
    price_on_site_base = 25.00,
    price_delivery_base = 26.00,
    steps_config = '{
      "menu_config": {
        "name": "MENU 1",
        "price": 25.00,
        "components": [
          {
            "type": "pizza_selection",
            "title": "Choisissez 3 pizzas JUNIOR",
            "size": "junior",
            "quantity": 3,
            "selection_mode": "multiple",
            "display_prices": true,
            "instruction": "Tapez les 3 numéros séparés par des virgules\\nEx: 1,2,5 pour CLASSICA, REINE et TONINO"
          }
        ]
      }
    }'::json
WHERE id = 310 AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 2 (ID: 311) - 2 PIZZAS SÉNIOR + BOISSON - 25€
-- ============================================
UPDATE france_products 
SET 
    price_on_site_base = 25.00,
    price_delivery_base = 26.00,
    steps_config = '{
      "menu_config": {
        "name": "MENU 2",
        "price": 25.00,
        "components": [
          {
            "type": "pizza_selection",
            "title": "Choisissez 2 pizzas SÉNIOR",
            "size": "senior",
            "quantity": 2,
            "selection_mode": "multiple",
            "display_prices": true,
            "instruction": "Tapez les 2 numéros séparés par des virgules\\nEx: 1,8 pour CLASSICA et VÉGÉTARIENNE"
          },
          {
            "type": "beverage_selection",
            "title": "Choisissez votre boisson 1.5L",
            "quantity": 1,
            "selection_mode": "single",
            "options": [
              {"id": 1, "name": "🥤 COCA COLA 1.5L"},
              {"id": 2, "name": "⚫ COCA ZERO 1.5L"},
              {"id": 3, "name": "🧡 FANTA 1.5L"},
              {"id": 4, "name": "🍊 OASIS 1.5L"}
            ]
          }
        ]
      }
    }'::json
WHERE id = 311 AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 3 (ID: 312) - 1 PIZZA MEGA + ACCOMPAGNEMENT + BOISSON - 32€
-- ============================================
UPDATE france_products 
SET 
    price_on_site_base = 32.00,
    price_delivery_base = 33.00,
    steps_config = '{
      "menu_config": {
        "name": "MENU 3",
        "price": 32.00,
        "components": [
          {
            "type": "pizza_selection",
            "title": "Choisissez votre pizza MEGA",
            "size": "mega",
            "quantity": 1,
            "selection_mode": "single",
            "display_prices": true,
            "instruction": "Tapez le numéro de votre choix"
          },
          {
            "type": "side_selection",
            "title": "Choisissez votre accompagnement",
            "quantity": 1,
            "selection_mode": "single",
            "options": [
              {"id": 1, "name": "🍗 14 NUGGETS"},
              {"id": 2, "name": "🍗 12 WINGS"}
            ]
          },
          {
            "type": "beverage_selection",
            "title": "Choisissez votre boisson 1.5L",
            "quantity": 1,
            "selection_mode": "single",
            "options": [
              {"id": 1, "name": "🥤 COCA COLA 1.5L"},
              {"id": 2, "name": "⚫ COCA ZERO 1.5L"},
              {"id": 3, "name": "🧡 FANTA 1.5L"},
              {"id": 4, "name": "🍊 OASIS 1.5L"}
            ]
          }
        ]
      }
    }'::json
WHERE id = 312 AND restaurant_id = 1;

-- ============================================
-- 📋 MENU 4 (ID: 313) - 1 PIZZA SÉNIOR + 2 BOISSONS + ACCOMPAGNEMENT - 22€
-- ============================================
UPDATE france_products 
SET 
    price_on_site_base = 22.00,
    price_delivery_base = 23.00,
    steps_config = '{
      "menu_config": {
        "name": "MENU 4",
        "price": 22.00,
        "components": [
          {
            "type": "pizza_selection",
            "title": "Choisissez votre pizza SÉNIOR",
            "size": "senior",
            "quantity": 1,
            "selection_mode": "single",
            "display_prices": true,
            "instruction": "Tapez le numéro de votre choix"
          },
          {
            "type": "beverage_selection",
            "title": "Choisissez votre 1ère boisson 33CL",
            "quantity": 1,
            "selection_mode": "single",
            "options": [
              {"id": 1, "name": "🥤 COCA COLA"},
              {"id": 2, "name": "⚫ COCA ZERO"},
              {"id": 3, "name": "🍋 7UP"},
              {"id": 4, "name": "🍒 7UP CHERRY"},
              {"id": 5, "name": "🌴 7UP TROPICAL"},
              {"id": 6, "name": "🍑 ICE TEA"},
              {"id": 7, "name": "🍓 MIRANDA FRAISE"},
              {"id": 8, "name": "🥭 MIRANDA TROPICAL"},
              {"id": 9, "name": "🍊 OASIS TROPICAL"},
              {"id": 10, "name": "💧 EAU MINÉRALE"},
              {"id": 11, "name": "💎 PERRIER"},
              {"id": 12, "name": "🌺 TROPICO"}
            ]
          },
          {
            "type": "beverage_selection",
            "title": "Choisissez votre 2ème boisson 33CL",
            "quantity": 1,
            "selection_mode": "single",
            "options": [
              {"id": 1, "name": "🥤 COCA COLA"},
              {"id": 2, "name": "⚫ COCA ZERO"},
              {"id": 3, "name": "🍋 7UP"},
              {"id": 4, "name": "🍒 7UP CHERRY"},
              {"id": 5, "name": "🌴 7UP TROPICAL"},
              {"id": 6, "name": "🍑 ICE TEA"},
              {"id": 7, "name": "🍓 MIRANDA FRAISE"},
              {"id": 8, "name": "🥭 MIRANDA TROPICAL"},
              {"id": 9, "name": "🍊 OASIS TROPICAL"},
              {"id": 10, "name": "💧 EAU MINÉRALE"},
              {"id": 11, "name": "💎 PERRIER"},
              {"id": 12, "name": "🌺 TROPICO"}
            ]
          },
          {
            "type": "side_selection",
            "title": "Choisissez votre accompagnement",
            "quantity": 1,
            "selection_mode": "single",
            "options": [
              {"id": 1, "name": "🍗 6 WINGS"},
              {"id": 2, "name": "🍗 8 NUGGETS"}
            ]
          }
        ]
      }
    }'::json
WHERE id = 313 AND restaurant_id = 1;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.price_on_site_base,
    p.price_delivery_base,
    jsonb_pretty(p.steps_config::jsonb) as config
FROM france_products p
WHERE p.id IN (310, 311, 312, 313)
    AND p.restaurant_id = 1
ORDER BY p.id;

COMMIT;

-- ============================================
-- NOTES D'ADMINISTRATION BACK-OFFICE
-- ============================================
-- 
-- STRUCTURE ADMINISTRABLE :
-- 
-- 1. MODIFICATION DES PIZZAS DISPONIBLES :
--    - Le bot récupère dynamiquement la liste des pizzas depuis la catégorie "Pizzas"
--    - Pour ajouter/retirer une pizza : modifier dans la table france_products
-- 
-- 2. MODIFICATION DES OPTIONS DE BOISSONS :
--    - Éditer le JSON steps_config → menu_config → components → options
--    - Ajouter/supprimer/modifier les options dans le tableau
-- 
-- 3. MODIFICATION DES PRIX :
--    - price_on_site_base : Prix sur place
--    - price_delivery_base : Prix livraison
--    - Le prix du menu est fixe, peu importe les choix
-- 
-- 4. STRUCTURE DU JSON :
--    - selection_mode: "multiple" pour sélection avec virgules (1,3,5)
--    - selection_mode: "single" pour choix unique
--    - display_prices: true pour afficher les prix des pizzas
--    - size: "junior"/"senior"/"mega" pour forcer la taille
-- 
-- 5. WORKFLOW :
--    - workflow_type = 'menu_pizza_selection' déclenche le traitement spécial
--    - Le bot suit l'ordre des components dans le JSON