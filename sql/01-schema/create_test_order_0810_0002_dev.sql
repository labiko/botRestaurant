-- ========================================================================
-- CRÉER COMMANDE 0810-0002 EN DEV
-- Restaurant: Pizza Yolo 77 (id=16)
-- ========================================================================

BEGIN;

-- Insérer une nouvelle commande de test
INSERT INTO france_orders (
  restaurant_id,
  phone_number,
  customer_name,
  items,
  total_amount,
  delivery_mode,
  delivery_address,
  payment_mode,
  payment_method,
  status,
  order_number,
  customer_country_code,
  audio_played,
  driver_assignment_status
)
VALUES (
  16, -- Restaurant Pizza Yolo 77
  '33620951645', -- Numéro client test
  'Client Test', -- Nom client
  '[{
    "quantity": 1,
    "productId": 554,
    "unitPrice": 7,
    "totalPrice": 7,
    "productName": "TACOS",
    "categoryName": "TACOS",
    "configuration": {
      "Plats": [{
        "id": 3164,
        "icon": "🥩",
        "name": "1 Viande",
        "composition": null,
        "option_name": "1 Viande",
        "is_available": true,
        "display_order": 1,
        "price_modifier": 7
      }],
      "Extras": [{
        "id": 3174,
        "icon": "🥓",
        "name": "Pomme de terre",
        "composition": null,
        "option_name": "Pomme de terre",
        "is_available": true,
        "display_order": 5,
        "price_modifier": 0
      }],
      "Viandes": [{
        "id": 3173,
        "icon": "🍗",
        "name": "Chicken Curry",
        "composition": null,
        "option_name": "Chicken Curry",
        "is_available": true,
        "display_order": 8,
        "price_modifier": 0
      }],
      "Condiments": [{
        "id": 3754,
        "icon": "🥗",
        "name": "Salades",
        "composition": null,
        "option_name": "Salades",
        "is_available": true,
        "display_order": 1,
        "price_modifier": 0
      }, {
        "id": 3756,
        "icon": "🧄",
        "name": "Oignons",
        "composition": null,
        "option_name": "Oignons",
        "is_available": true,
        "display_order": 3,
        "price_modifier": 0
      }]
    },
    "productDescription": "TACOS (1 Viande - Pomme de terre - Chicken Curry - Salades, Oignons)"
  }]'::jsonb, -- Items en JSONB
  8.00, -- Total avec frais livraison (+1€)
  'livraison', -- Mode livraison
  '37 Rue de Paris, 75001 Paris', -- Adresse de test
  'livraison', -- Paiement à la livraison
  'cash', -- Méthode de paiement
  'pending', -- Status initial (nouvelle commande)
  '0810-0002', -- Numéro fixe
  '33', -- Code pays France
  false, -- Audio non joué
  'none' -- Pas d'assignation en cours
);

-- Afficher le résultat
SELECT
  id,
  order_number,
  status,
  delivery_mode,
  total_amount,
  delivery_address,
  driver_assignment_status,
  created_at
FROM france_orders
WHERE order_number = '0810-0002';

COMMIT;
