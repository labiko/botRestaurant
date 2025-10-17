-- 🔧 CORRECTION GROUP_ORDER BOWL
-- Corriger les group_order pour que le workflow soit séquentiel

BEGIN;

-- 1. Corriger les group_order pour BOWL
UPDATE france_product_options 
SET group_order = 1
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) AND option_group = 'Choix viande';

UPDATE france_product_options 
SET group_order = 2
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) AND option_group = 'Boisson 33CL incluse';

UPDATE france_product_options 
SET group_order = 3
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) AND option_group = 'Suppléments';

-- 2. Corriger les noms des groupes dans steps_config pour qu'ils correspondent exactement
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
            "prompt": "Suppléments (+3€ chacun) :",
            "required": false,
            "option_groups": ["Suppléments"],
            "max_selections": 10
        }
    ]
}'::json
WHERE id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
);

-- 3. Vérification des group_order corrigés
SELECT 
    'GROUP_ORDER CORRIGÉS' as verif,
    fpo.option_group,
    fpo.group_order,
    COUNT(*) as nb_options
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
GROUP BY fpo.option_group, fpo.group_order
ORDER BY fpo.group_order;

-- 4. Vérifier que les noms des groupes correspondent entre steps_config et options
SELECT 
    'CORRESPONDANCE GROUPES' as info,
    'Steps config contient: Choix viande, Boisson 33CL incluse, Suppléments' as steps_groups,
    STRING_AGG(DISTINCT fpo.option_group, ', ' ORDER BY fpo.option_group) as option_groups_reels
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL';

COMMIT;