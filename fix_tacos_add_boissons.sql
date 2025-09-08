-- 🔧 CORRECTION TACOS : Ajout des options boisson manquantes
-- Résout le problème identifié : workflow TACOS sans étape boisson

BEGIN;

-- 1. Vérification avant insertion - État actuel
SELECT 
    'ÉTAT ACTUEL TACOS' as section,
    po.group_order,
    po.option_group,
    COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
GROUP BY po.group_order, po.option_group
ORDER BY po.group_order;

-- 2. Insertion des options boisson pour TACOS (group_order = 5)
-- UTILISE LES VRAIES BOISSONS 33CL DE LA BASE DE DONNÉES
INSERT INTO france_product_options (
    product_id, 
    option_group, 
    option_name, 
    group_order, 
    display_order, 
    is_required,
    max_selections,
    price_modifier
) VALUES 
-- Toutes les boissons 33CL disponibles dans le restaurant
(201, 'boisson', '⿡ 7 UP 33CL', 5, 1, true, 1, 0.00),
(201, 'boisson', '⿢ 7UP CHERRY 33CL', 5, 2, true, 1, 0.00),
(201, 'boisson', '⿣ 7UP TROPICAL 33CL', 5, 3, true, 1, 0.00),
(201, 'boisson', '⿤ COCA COLA 33CL', 5, 4, true, 1, 0.00),
(201, 'boisson', '⿥ COCA ZERO 33CL', 5, 5, true, 1, 0.00),
(201, 'boisson', '⿦ EAU MINÉRALE 33CL', 5, 6, true, 1, 0.00),
(201, 'boisson', '⿧ ICE TEA 33CL', 5, 7, true, 1, 0.00),
(201, 'boisson', '⿨ MIRANDA FRAISE 33CL', 5, 8, true, 1, 0.00),
(201, 'boisson', '⿩ MIRANDA TROPICAL 33CL', 5, 9, true, 1, 0.00),
(201, 'boisson', '⿪ OASIS TROPICAL 33CL', 5, 10, true, 1, 0.00),
(201, 'boisson', '⿫ PERRIER 33CL', 5, 11, true, 1, 0.00),
(201, 'boisson', '⿬ TROPICO 33CL', 5, 12, true, 1, 0.00);

-- 3. Vérification après insertion
SELECT 
    'WORKFLOW TACOS COMPLET' as section,
    po.group_order,
    po.option_group,
    COUNT(*) as nb_options,
    BOOL_OR(po.is_required) as is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
GROUP BY po.group_order, po.option_group
ORDER BY po.group_order;

-- 4. Vérification spécifique des boissons ajoutées
SELECT 
    'BOISSONS TACOS AJOUTÉES' as section,
    po.option_name,
    po.group_order,
    po.display_order,
    po.is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos' AND po.option_group = 'boisson'
ORDER BY po.display_order;

-- 5. Test final : Workflow complet attendu
SELECT 
    'RÉSULTAT FINAL ATTENDU' as section,
    'Le workflow TACOS devrait maintenant avoir 5 étapes :' as message
UNION ALL
SELECT '', '1. viande (obligatoire)'
UNION ALL
SELECT '', '2. sauce (obligatoire)'
UNION ALL
SELECT '', '3. extras_choice (facultatif)'
UNION ALL
SELECT '', '4. extras (facultatif)'
UNION ALL
SELECT '', '5. boisson (obligatoire) ← NOUVELLEMENT AJOUTÉ';

COMMIT;

-- 📝 NOTES POST-INSTALLATION :
-- ✅ Les TACOS auront maintenant une étape boisson obligatoire
-- ✅ Utilise les caractères ⿡⿢⿣ pour la numérotation (compatible avec le code existant)
-- ✅ group_order = 5 pour s'exécuter après les extras
-- ✅ is_required = true car les menus TACOS incluent toujours une boisson
-- ✅ price_adjustment = 0 car le prix boisson est déjà inclus dans le menu