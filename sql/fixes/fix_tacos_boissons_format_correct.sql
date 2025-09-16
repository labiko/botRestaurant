-- 🔧 CORRECTION TACOS - Format d'affichage des boissons style universel
-- Corrige les problèmes identifiés : format et visibilité des boissons

BEGIN;

-- 1. Supprimer les anciennes options boisson mal formatées
DELETE FROM france_product_options 
WHERE product_id = 201 
  AND option_group = 'boisson'
  AND option_name LIKE '%⿡%';

-- 2. Insertion avec le BON FORMAT universel (style du screenshot)
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
-- Format universel : emoji + *nom* + taille (comme dans l'image tc1.png)
(201, 'boisson', '🥤 *MIRANDA TROPICAL* 33CL', 5, 1, true, 1, 0.00),
(201, 'boisson', '🥤 *MIRANDA FRAISE* 33CL', 5, 2, true, 1, 0.00),
(201, 'boisson', '🧡 *OASIS TROPICAL* 33CL', 5, 3, true, 1, 0.00),
(201, 'boisson', '🥤 *TROPICO* 33CL', 5, 4, true, 1, 0.00),
(201, 'boisson', '🧊 *ICE TEA* 33CL', 5, 5, true, 1, 0.00),
(201, 'boisson', '🥤 *7 UP* 33CL', 5, 6, true, 1, 0.00),
(201, 'boisson', '🥤 *7UP TROPICAL* 33CL', 5, 7, true, 1, 0.00),
(201, 'boisson', '🥤 *7UP CHERRY* 33CL', 5, 8, true, 1, 0.00),
(201, 'boisson', '🥤 *COCA COLA* 33CL', 5, 9, true, 1, 0.00),
(201, 'boisson', '⚫ *COCA ZERO* 33CL', 5, 10, true, 1, 0.00),
(201, 'boisson', '🥤 *EAU MINÉRALE* 33CL', 5, 11, true, 1, 0.00),
(201, 'boisson', '🫧 *PERRIER* 33CL', 5, 12, true, 1, 0.00);

-- 3. Vérification complète - Toutes les boissons ajoutées
SELECT 
    'VÉRIFICATION BOISSONS TACOS' as section,
    po.display_order,
    po.option_name,
    po.is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos' AND po.option_group = 'boisson'
ORDER BY po.display_order;

-- 4. Workflow complet après correction
SELECT 
    'WORKFLOW TACOS FINAL' as section,
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

-- 5. Test d'affichage final attendu
SELECT 
    'FORMAT ATTENDU MAINTENANT' as section,
    'Le bot devrait afficher :' as message
UNION ALL
SELECT '', '🔧 Configuration: TACOS MENU M'
UNION ALL
SELECT '', '📋 BOISSON (obligatoire)'
UNION ALL
SELECT '', ''
UNION ALL
SELECT '', '1. 🥤 *MIRANDA TROPICAL* 33CL'
UNION ALL
SELECT '', '2. 🥤 *MIRANDA FRAISE* 33CL'
UNION ALL
SELECT '', '3. 🧡 *OASIS TROPICAL* 33CL'
UNION ALL
SELECT '', '... (12 boissons au total)'
UNION ALL
SELECT '', ''
UNION ALL
SELECT '', '💡 Pour choisir votre boisson: tapez les numéros';

COMMIT;

-- 📝 NOTES IMPORTANTES :
-- ✅ Format universel : emoji + *nom en gras* + taille
-- ✅ 12 boissons complètes (toutes les 33CL disponibles)
-- ✅ Suppression des caractères ⿡⿢⿣ problématiques
-- ✅ Compatible avec le template existing
-- ✅ Style identique au screenshot tc1.png