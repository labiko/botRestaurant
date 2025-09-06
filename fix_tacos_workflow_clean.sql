-- 🧹 NETTOYAGE ET RÉORGANISATION WORKFLOW TACOS
-- Corriger les doublons et l'ordre des étapes

BEGIN;

-- 1. DIAGNOSTIC - Voir les doublons
SELECT 'DOUBLONS ACTUELS' as etape;
SELECT option_group, option_name, group_order, COUNT(*) as nb_doublons
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
GROUP BY option_group, option_name, group_order
HAVING COUNT(*) > 1;

-- 2. SUPPRIMER TOUS LES DOUBLONS DE SAUCES
DELETE FROM france_product_options
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY product_id, option_name, option_group ORDER BY id) as rn
        FROM france_product_options po
        WHERE product_id = (SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1)
          AND option_group = 'sauce'
    ) t
    WHERE rn > 1
);

-- 3. RÉORGANISER LES GROUP_ORDER CORRECTEMENT
-- Viandes restent à 1
UPDATE france_product_options 
SET group_order = 1
WHERE product_id = (SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1)
  AND option_group = 'viande';

-- Sauces passent à 2
UPDATE france_product_options 
SET group_order = 2, max_selections = 2
WHERE product_id = (SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1)
  AND option_group = 'sauce';

-- extras_choice passe à 3
UPDATE france_product_options 
SET group_order = 3, is_required = true
WHERE product_id = (SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1)
  AND option_group = 'extras_choice';

-- extras (suppléments + gratinés) passent à 4
UPDATE france_product_options 
SET group_order = 4, max_selections = 5
WHERE product_id = (SELECT id FROM france_products WHERE name = 'TACOS' AND restaurant_id = 1)
  AND option_group = 'extras';

-- 4. VÉRIFICATION FINALE
SELECT 'WORKFLOW FINAL PROPRE' as etape;
SELECT 
    group_order,
    option_group,
    CASE 
        WHEN option_group = 'viande' THEN '1️⃣ VIANDES'
        WHEN option_group = 'sauce' THEN '2️⃣ SAUCES (max 2)'
        WHEN option_group = 'extras_choice' THEN '3️⃣ VOULEZ-VOUS DES SUPPLÉMENTS?'
        WHEN option_group = 'extras' THEN '4️⃣ SUPPLÉMENTS & GRATINÉS'
    END as etape_description,
    COUNT(*) as nb_options,
    MAX(is_required::int) as obligatoire,
    MAX(max_selections) as max_choix
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
GROUP BY group_order, option_group
ORDER BY group_order;

COMMIT;