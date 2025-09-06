-- 🔧 WORKFLOW TACOS UX OPTIMISÉ 
-- 1. Viandes (obligatoire) 2. Sauces (obligatoire) 3. "Suppléments?" OUI/NON

BEGIN;

-- ÉTAPE 1: Ajouter les sauces obligatoires (group_order = 1.5)
WITH tacos_product AS (
  SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1
)
INSERT INTO france_product_options (
  product_id, 
  option_group, 
  option_name, 
  is_required, 
  group_order, 
  max_selections, 
  price_modifier, 
  display_order
)
SELECT id, 'sauce', 'Andalouse', true, 1.5, 1, 0.00, 1 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Ketchup', true, 1.5, 1, 0.00, 2 FROM tacos_product
UNION ALL  
SELECT id, 'sauce', 'Mayo', true, 1.5, 1, 0.00, 3 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Harissa', true, 1.5, 1, 0.00, 4 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Samurai', true, 1.5, 1, 0.00, 5 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Biggy', true, 1.5, 1, 0.00, 6 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Algérienne', true, 1.5, 1, 0.00, 7 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Blanche', true, 1.5, 1, 0.00, 8 FROM tacos_product;

-- ÉTAPE 2: Créer l'étape "Suppléments?" (group_order = 2.5)
WITH tacos_product AS (
  SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1
)
INSERT INTO france_product_options (
  product_id, 
  option_group, 
  option_name, 
  is_required, 
  group_order, 
  max_selections, 
  price_modifier, 
  display_order
)
SELECT id, 'extras_choice', 'Ajouter des suppléments', false, 2.5, 1, 0.00, 1 FROM tacos_product
UNION ALL
SELECT id, 'extras_choice', 'Pas de suppléments', false, 2.5, 1, 0.00, 2 FROM tacos_product;

-- ÉTAPE 3: Regrouper suppléments + gratinés dans un seul groupe (group_order = 3)
UPDATE france_product_options 
SET option_group = 'extras', group_order = 3, is_required = false
WHERE product_id = (SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1)
  AND option_group IN ('supplement', 'gratine');

-- VÉRIFICATION FINALE - Workflow UX optimisé
SELECT 'WORKFLOW TACOS UX OPTIMISÉ' as verification;
SELECT 
    po.group_order,
    po.option_group,
    CASE 
        WHEN po.group_order = 1 THEN '1️⃣ VIANDES (obligatoire)'
        WHEN po.group_order = 1.5 THEN '2️⃣ SAUCES (obligatoire)'  
        WHEN po.group_order = 2.5 THEN '3️⃣ SUPPLÉMENTS? (choix oui/non)'
        WHEN po.group_order = 3 THEN '4️⃣ EXTRAS (si oui choisi)'
        ELSE 'Autre'
    END as etape_workflow,
    COUNT(*) as nb_options,
    MAX(po.is_required::int) as est_obligatoire
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
GROUP BY po.group_order, po.option_group
ORDER BY po.group_order;

-- DÉTAIL des étapes créées
SELECT 'DÉTAIL ÉTAPES UX' as verification;
SELECT 
    po.group_order,
    po.option_group,
    po.option_name,
    po.is_required,
    po.price_modifier
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
ORDER BY po.group_order, po.display_order;

COMMIT;