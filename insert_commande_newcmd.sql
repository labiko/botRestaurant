-- Script SQL simple pour insérer la commande du fichier newcmd.txt
BEGIN;

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
  notes,
  order_number,
  created_at,
  updated_at,
  delivery_address_id,
  delivery_validation_code,
  date_validation_code,
  driver_id,
  estimated_delivery_time,
  driver_assignment_status,
  delivery_started_at,
  assignment_timeout_at
) VALUES (
  1, -- restaurant_id
  '33620951645', -- phone_number
  NULL, -- customer_name
  '[{
    "quantity": 1,
    "productId": 201,
    "unitPrice": 10,
    "totalPrice": 10,
    "productName": "TACOS MENU XL",
    "configuration": {
      "size": [
        {
          "id": 154,
          "size_name": "MENU XL",
          "product_id": 201,
          "variant_name": "MENU XL",
          "variant_type": "size",
          "display_order": 3,
          "price_on_site": 10,
          "includes_drink": true,
          "price_delivery": 11,
          "has_drink_included": true
        }
      ],
      "sauce": [
        {
          "id": 344,
          "is_active": true,
          "product_id": 201,
          "group_order": 2,
          "is_required": true,
          "option_name": "Harissa",
          "option_group": "sauce",
          "display_order": 4,
          "max_selections": 2,
          "price_modifier": 0
        },
        {
          "id": 345,
          "is_active": true,
          "product_id": 201,
          "group_order": 2,
          "is_required": true,
          "option_name": "Samurai",
          "option_group": "sauce",
          "display_order": 5,
          "max_selections": 2,
          "price_modifier": 0
        }
      ],
      "viande": [
        {
          "id": 322,
          "is_active": true,
          "product_id": 201,
          "group_order": 1,
          "is_required": true,
          "option_name": "Tenders",
          "option_group": "viande",
          "display_order": 4,
          "max_selections": 1,
          "price_modifier": 0
        }
      ],
      "extras_choice": [
        {
          "id": 596,
          "is_active": true,
          "product_id": 201,
          "group_order": 3,
          "is_required": false,
          "option_name": "Pas de suppléments",
          "option_group": "extras_choice",
          "display_order": 2,
          "max_selections": 1,
          "price_modifier": 0
        }
      ]
    },
    "productDescription": "TACOS MENU XL ( - Harissa, Samurai - Tenders - Pas de suppléments)"
  }]'::jsonb, -- items
  10.00, -- total_amount
  'livraison', -- delivery_mode
  '23 Pl. du Colombier, 77127 Lieusaint', -- delivery_address
  NULL, -- payment_mode
  NULL, -- payment_method
  'pending', -- status
  NULL, -- notes
  '0609-0002', -- order_number
  now(), -- created_at
  now(), -- updated_at
  5, -- delivery_address_id
  '5121', -- delivery_validation_code
  NULL, -- date_validation_code
  NULL, -- driver_id
  NULL, -- estimated_delivery_time
  'none', -- driver_assignment_status
  NULL, -- delivery_started_at
  NULL -- assignment_timeout_at
);

-- Vérification
SELECT 
  id,
  order_number,
  phone_number,
  total_amount,
  delivery_mode,
  status,
  created_at
FROM france_orders 
WHERE order_number = '0609-0002';

COMMIT;