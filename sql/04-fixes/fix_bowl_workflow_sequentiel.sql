-- 🔄 CORRECTION BOWL WORKFLOW SÉQUENTIEL
-- Corriger pour que BOWL affiche les étapes une par une comme TACOS

BEGIN;

-- 1. Supprimer toutes les options BOWL actuelles pour recommencer proprement
DELETE FROM france_product_options
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
);

-- 2. Reconfigurer BOWL avec la bonne structure steps_config
UPDATE france_products 
SET 
    steps_config = '{
        "steps": [
            {
                "step": 1,
                "type": "options_selection",
                "prompt": "Choisissez votre viande :",
                "required": true,
                "option_groups": ["Choix de viande"],
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
    }'::json,
    workflow_type = 'composite_workflow',
    requires_steps = true,
    product_type = 'composite'
WHERE id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL'
);

-- 3. Récupérer l'ID du produit BOWL
DO $$
DECLARE
    bowl_product_id INTEGER;
BEGIN
    SELECT p.id INTO bowl_product_id
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'bowls' AND p.name = 'BOWL';

    -- 4. ÉTAPE 1: Insérer les viandes (option_group: "Choix de viande")
    INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order, is_active) VALUES
    (bowl_product_id, 'Choix de viande', 'Poulet', 0.00, true, 1, 1, 1, true),
    (bowl_product_id, 'Choix de viande', 'Bœuf', 0.00, true, 1, 2, 1, true),
    (bowl_product_id, 'Choix de viande', 'Agneau', 0.00, true, 1, 3, 1, true),
    (bowl_product_id, 'Choix de viande', 'Merguez', 0.00, true, 1, 4, 1, true),
    (bowl_product_id, 'Choix de viande', 'Mixte', 0.00, true, 1, 5, 1, true),
    (bowl_product_id, 'Choix de viande', 'Thon', 0.00, true, 1, 6, 1, true);

    -- 5. ÉTAPE 2: Insérer les boissons (option_group: "Boisson 33CL incluse")
    INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order, is_active) VALUES
    (bowl_product_id, 'Boisson 33CL incluse', 'Coca Cola 33CL', 0.00, true, 1, 1, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Coca Cola Zéro 33CL', 0.00, true, 1, 2, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Fanta Orange 33CL', 0.00, true, 1, 3, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Fanta Citron 33CL', 0.00, true, 1, 4, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Sprite 33CL', 0.00, true, 1, 5, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Orangina 33CL', 0.00, true, 1, 6, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Ice Tea Pêche 33CL', 0.00, true, 1, 7, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Ice Tea Citron 33CL', 0.00, true, 1, 8, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Tropico 33CL', 0.00, true, 1, 9, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Pepsi 33CL', 0.00, true, 1, 10, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Pepsi Max 33CL', 0.00, true, 1, 11, 2, true),
    (bowl_product_id, 'Boisson 33CL incluse', 'Eau minérale 50CL', 0.00, true, 1, 12, 2, true);

    -- 6. ÉTAPE 3: Insérer les suppléments (option_group: "Suppléments")
    INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order, is_active) VALUES
    (bowl_product_id, 'Suppléments', 'Double cheddar', 3.00, false, 10, 1, 3, true),
    (bowl_product_id, 'Suppléments', 'Double viande', 3.00, false, 10, 2, 3, true),
    (bowl_product_id, 'Suppléments', 'Oeuf', 3.00, false, 10, 3, 3, true),
    (bowl_product_id, 'Suppléments', 'Cornichons', 3.00, false, 10, 4, 3, true),
    (bowl_product_id, 'Suppléments', 'Sauce algérienne', 3.00, false, 10, 5, 3, true),
    (bowl_product_id, 'Suppléments', 'Sauce blanche', 3.00, false, 10, 6, 3, true),
    (bowl_product_id, 'Suppléments', 'Sauce barbecue', 3.00, false, 10, 7, 3, true),
    (bowl_product_id, 'Suppléments', 'Sauce harissa', 3.00, false, 10, 8, 3, true),
    (bowl_product_id, 'Suppléments', 'Salade', 3.00, false, 10, 9, 3, true),
    (bowl_product_id, 'Suppléments', 'Tomates', 3.00, false, 10, 10, 3, true),
    (bowl_product_id, 'Suppléments', 'Oignons', 3.00, false, 10, 11, 3, true),
    (bowl_product_id, 'Suppléments', 'Avocat', 3.00, false, 10, 12, 3, true),
    (bowl_product_id, 'Suppléments', 'Bacon', 3.00, false, 10, 13, 3, true),
    (bowl_product_id, 'Suppléments', 'Champignons', 3.00, false, 10, 14, 3, true),
    (bowl_product_id, 'Suppléments', 'Poivrons', 3.00, false, 10, 15, 3, true),
    (bowl_product_id, 'Suppléments', 'Jalapeños', 3.00, false, 10, 16, 3, true);

END $$;

-- 7. Vérification de la configuration finale
SELECT 
    'VÉRIFICATION BOWL WORKFLOW' as resultat,
    p.name,
    p.price_on_site_base as prix_base,
    COUNT(CASE WHEN fpo.option_group = 'Choix de viande' THEN 1 END) as nb_viandes,
    COUNT(CASE WHEN fpo.option_group = 'Boisson 33CL incluse' THEN 1 END) as nb_boissons,
    COUNT(CASE WHEN fpo.option_group = 'Suppléments' THEN 1 END) as nb_supplements
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
GROUP BY p.id, p.name, p.price_on_site_base;

-- 8. Vérifier les groupes d'options avec leurs ordres
SELECT 
    'GROUPES BOWL CORRECTS' as info,
    fpo.option_group,
    fpo.group_order,
    COUNT(*) as nb_options,
    MIN(fpo.display_order) as premier_ordre,
    MAX(fpo.display_order) as dernier_ordre
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'bowls' AND p.name = 'BOWL'
GROUP BY fpo.option_group, fpo.group_order
ORDER BY fpo.group_order;

COMMIT;