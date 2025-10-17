-- 🔧 BOWL SUPPLÉMENTS COMME TACOS
-- Configurer BOWL avec le même système que TACOS : "Pas de suppléments" + "Ajouter des suppléments"

BEGIN;

-- 1. Nettoyer d'abord tous les suppléments existants de BOWL
DELETE FROM france_product_options
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) AND option_group = 'Suppléments';

-- 2. Ajouter le système TACOS : 2 options principales pour les suppléments
DO $$
DECLARE
    bowl_product_id INTEGER;
BEGIN
    SELECT p.id INTO bowl_product_id
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL';

    -- Option 1: Pas de suppléments (comme TACOS)
    INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order, is_active) VALUES
    (bowl_product_id, 'Suppléments', 'Pas de suppléments', 0.00, false, 10, 1, 3, true);

    -- Option 2: Ajouter des suppléments (comme TACOS)
    INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order, is_active) VALUES
    (bowl_product_id, 'Suppléments', 'Ajouter des suppléments', 0.00, false, 10, 2, 3, true);

END $$;

-- 3. Remettre steps_config avec les 3 étapes mais système TACOS
UPDATE france_products 
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre viande :",
            "required": true,
            "option_groups": ["Choix viande"],
            "max_selections": 1
        },
        {
            "step": 2,
            "type": "options_selection", 
            "prompt": "Choisissez votre boisson (incluse) :",
            "required": true,
            "option_groups": ["Boisson 33CL incluse"],
            "max_selections": 1
        },
        {
            "step": 3,
            "type": "options_selection",
            "prompt": "SUPPLÉMENTS :",
            "required": true,
            "option_groups": ["Suppléments"],
            "max_selections": 1
        }
    ]
}'::json
WHERE id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
);

-- 4. Vérification de la configuration BOWL comme TACOS
SELECT 
    'BOWL SYSTÈME TACOS' as verif,
    p.name,
    COUNT(CASE WHEN fpo.option_group = 'Choix viande' THEN 1 END) as nb_viandes,
    COUNT(CASE WHEN fpo.option_group = 'Boisson 33CL incluse' THEN 1 END) as nb_boissons,
    COUNT(CASE WHEN fpo.option_group = 'Suppléments' THEN 1 END) as nb_options_supplements
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
GROUP BY p.id, p.name;

-- 5. Voir les options suppléments exactes
SELECT 
    'OPTIONS SUPPLÉMENTS BOWL' as info,
    fpo.display_order,
    fpo.option_name,
    fpo.price_modifier
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL' AND fpo.option_group = 'Suppléments'
ORDER BY fpo.display_order;

COMMIT;