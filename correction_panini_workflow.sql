-- 🔧 CORRECTION WORKFLOW PANINI
-- Workflow attendu : Produit → Boisson 33CL → Panier (simple et direct)

BEGIN;

-- 1. Identifier tous les produits PANINI à corriger
SELECT
    'PRODUITS PANINI À CORRIGER' as info,
    p.id,
    p.name
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'panini' AND p.is_active = true;

-- 2. Mettre à jour tous les produits PANINI avec le bon steps_config
UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre boisson (incluse) :",
            "required": true,
            "option_groups": ["Boisson 33CL incluse"],
            "max_selections": 1
        }
    ]
}'::json,
workflow_type = 'composite_workflow',
product_type = 'composite',
requires_steps = true
WHERE id IN (
    SELECT p.id
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'panini' AND p.is_active = true
);

-- 3. S'assurer que tous les PANINI ont des options boisson
DO $$
DECLARE
    panini_record RECORD;
BEGIN
    FOR panini_record IN
        SELECT p.id, p.name
        FROM france_products p
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.slug = 'panini' AND p.is_active = true
    LOOP
        -- Supprimer les anciennes options s'il y en a
        DELETE FROM france_product_options
        WHERE product_id = panini_record.id;

        -- Ajouter les 12 boissons 33CL (reprendre de BOWL)
        INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order, is_active) VALUES
        (panini_record.id, 'Boisson 33CL incluse', '1️⃣ 🥤 Coca Cola 33CL', 0.00, true, 1, 1, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '2️⃣ ⚫ Coca Cola Zéro 33CL', 0.00, true, 1, 2, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '3️⃣ 🍊 Fanta Orange 33CL', 0.00, true, 1, 3, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '4️⃣ 🍋 Fanta Citron 33CL', 0.00, true, 1, 4, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '5️⃣ 🥤 Sprite 33CL', 0.00, true, 1, 5, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '6️⃣ 🍊 Orangina 33CL', 0.00, true, 1, 6, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '7️⃣ 🧊 Ice Tea Pêche 33CL', 0.00, true, 1, 7, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '8️⃣ 🧊 Ice Tea Citron 33CL', 0.00, true, 1, 8, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '9️⃣ 🌴 Tropico 33CL', 0.00, true, 1, 9, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '🔟 🥤 Pepsi 33CL', 0.00, true, 1, 10, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '1️⃣1️⃣ ⚫ Pepsi Max 33CL', 0.00, true, 1, 11, 1, true),
        (panini_record.id, 'Boisson 33CL incluse', '1️⃣2️⃣ 💧 Eau minérale 50CL', 0.00, true, 1, 12, 1, true);

        RAISE NOTICE 'Options boisson ajoutées pour PANINI: %', panini_record.name;
    END LOOP;
END $$;

-- 4. Vérification finale
SELECT
    'VÉRIFICATION PANINI CORRIGÉ' as resultat,
    p.name,
    p.workflow_type,
    p.requires_steps,
    COUNT(fpo.id) as nb_options_boisson
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id AND fpo.option_group = 'Boisson 33CL incluse'
WHERE c.slug = 'panini' AND p.is_active = true
GROUP BY p.id, p.name, p.workflow_type, p.requires_steps
ORDER BY p.name;

-- 5. Vérifier le steps_config final
SELECT
    'STEPS CONFIG FINAL' as info,
    p.name,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'panini' AND p.is_active = true
LIMIT 1;

COMMIT;