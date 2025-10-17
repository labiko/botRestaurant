-- 🔧 BOWL SANS ÉTAPE SUPPLÉMENTS
-- Supprimer complètement l'étape suppléments de BOWL pour la rendre vraiment facultative

BEGIN;

-- 1. Option 1: Supprimer complètement les suppléments de BOWL
-- (L'utilisateur pourra toujours commander des suppléments à part)
DELETE FROM france_product_options
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
) AND option_group = 'Suppléments';

-- 2. Modifier steps_config pour avoir seulement 2 étapes (viande + boisson)
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
        }
    ]
}'::json
WHERE id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
);

-- 3. Vérification : BOWL sans suppléments
SELECT 
    'BOWL CONFIGURATION FINALE' as verif,
    p.name,
    p.price_on_site_base as prix_base,
    COUNT(CASE WHEN fpo.option_group = 'Choix viande' THEN 1 END) as nb_viandes,
    COUNT(CASE WHEN fpo.option_group = 'Boisson 33CL incluse' THEN 1 END) as nb_boissons,
    COUNT(CASE WHEN fpo.option_group = 'Suppléments' THEN 1 END) as nb_supplements
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
GROUP BY p.id, p.name, p.price_on_site_base;

-- 4. Vérifier le nouveau steps_config
SELECT 
    'STEPS CONFIG SIMPLIFIÉ' as info,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'bowls' AND p.name = 'BOWL';

COMMIT;