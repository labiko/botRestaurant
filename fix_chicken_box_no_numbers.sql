-- Supprimer la numérotation manuelle dans steps_config du CHICKEN BOX
-- Le code ajoutera automatiquement 1. 2. 3. etc.
BEGIN;

UPDATE france_products 
SET steps_config = '{
  "steps": [
    {
      "type": "single_choice",
      "title": "Choisissez votre viande",
      "options": [
        "🍗 *Nuggets*",
        "🌭 *Merguez*", 
        "🍗 *Filet de Poulet*",
        "🍗 *Tenders*",
        "🍗 *Cordon Bleu*",
        "🥩 *Viande Hachée*"
      ],
      "price_modifier": 0.00
    },
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 1L5 (incluse)",
      "options": [
        "🥤 *COCA COLA 1L5*",
        "⚫ *COCA ZERO 1L5*",
        "🧡 *FANTA 1L5*", 
        "🧡 *OASIS 1L5*"
      ],
      "price_modifier": 0.00
    }
  ],
  "final_format": "25 Wings + 2 frites + {viande} + {boisson}"
}'::json
WHERE name = 'CHICKEN BOX' 
  AND restaurant_id = 1;

-- Vérification
SELECT name, steps_config FROM france_products 
WHERE name = 'CHICKEN BOX' AND restaurant_id = 1;

COMMIT;