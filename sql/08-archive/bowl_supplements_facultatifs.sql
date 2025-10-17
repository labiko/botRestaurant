-- 🔧 BOWL SUPPLÉMENTS FACULTATIFS
-- Rendre l'étape suppléments optionnelle/sautée

BEGIN;

-- 1. Modifier steps_config pour rendre l'étape 3 (suppléments) vraiment facultative
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
            "prompt": "Suppléments (+3€ chacun) - Tapez 0 pour passer :",
            "required": false,
            "option_groups": ["Suppléments"],
            "max_selections": 10,
            "allow_skip": true
        }
    ]
}'::json
WHERE id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
);

-- 2. S'assurer que toutes les options suppléments sont bien is_required = false
UPDATE france_product_options 
SET is_required = false
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) AND option_group = 'Suppléments';

-- 3. Vérification
SELECT 
    'CONFIGURATION SUPPLÉMENTS' as verif,
    COUNT(*) as nb_supplements,
    COUNT(CASE WHEN is_required = false THEN 1 END) as nb_facultatifs,
    COUNT(CASE WHEN is_required = true THEN 1 END) as nb_obligatoires
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL' AND fpo.option_group = 'Suppléments';

-- 4. Vérifier le steps_config mis à jour
SELECT 
    'STEPS CONFIG BOWL' as info,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'bowls' AND p.name = 'BOWL';

COMMIT;