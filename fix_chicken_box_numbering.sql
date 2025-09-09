-- Corriger la numérotation dans steps_config du CHICKEN BOX
BEGIN;

UPDATE france_products 
SET steps_config = '{
  "steps": [
    {
      "type": "single_choice",
      "title": "Choisissez votre viande",
      "options": [
        "1. 🍗 *Nuggets*",
        "2. 🌭 *Merguez*", 
        "3. 🍗 *Filet de Poulet*",
        "4. 🍗 *Tenders*",
        "5. 🍗 *Cordon Bleu*",
        "6. 🥩 *Viande Hachée*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 1L5 (incluse)",
      "options": [
        "1. 🥤 *COCA COLA 1L5*",
        "2. ⚫ *COCA ZERO 1L5*",
        "3. 🧡 *FANTA 1L5*", 
        "4. 🧡 *OASIS 1L5*"
      ],
      "price_modifier": 0.00
    }
  ],
  "final_format": "25 Wings + 2 frites + {viande} + {boisson}"
}'::json
WHERE name = 'CHICKEN BOX' 
  AND restaurant_id = 1;

COMMIT;