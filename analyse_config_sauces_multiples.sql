-- 🔍 ANALYSE CONFIGURATION SAUCES - Sélection multiple

BEGIN;

-- 1. Configuration actuelle des sauces TACOS
SELECT 'CONFIG SAUCES TACOS' as verification;
SELECT 
    po.option_group,
    po.option_name,
    po.is_required,
    po.group_order,
    po.max_selections,  -- ⚠️ CLEF: max_selections détermine le nombre max
    po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' 
  AND p.restaurant_id = 1
  AND po.option_group = 'sauce'
ORDER BY po.display_order;

-- 2. Vérifier le paramètre max_selections pour toutes les sauces
SELECT 'MAX_SELECTIONS SAUCES' as verification;
SELECT 
    option_name as sauce,
    max_selections,
    CASE 
        WHEN max_selections = 1 THEN '❌ Une seule sauce'
        WHEN max_selections = 2 THEN '✅ Deux sauces max'
        WHEN max_selections > 2 THEN '⚠️ Plus de 2 sauces'
        ELSE '❓ Non défini'
    END as statut
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' 
  AND p.restaurant_id = 1
  AND po.option_group = 'sauce';

-- 3. Comparer avec d'autres groupes (viande, supplement)
SELECT 'COMPARAISON MAX_SELECTIONS' as verification;
SELECT 
    option_group,
    MAX(max_selections) as max_selections,
    COUNT(*) as nb_options,
    CASE 
        WHEN MAX(max_selections) = 1 THEN 'Sélection unique'
        WHEN MAX(max_selections) = 2 THEN 'Jusqu\'à 2 choix'
        WHEN MAX(max_selections) > 2 THEN 'Choix multiples'
        ELSE 'Non défini'
    END as type_selection
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
GROUP BY option_group
ORDER BY MIN(group_order);

-- 4. Script de correction pour permettre 2 sauces
SELECT 'SCRIPT CORRECTION (si nécessaire)' as verification;
SELECT 
    'UPDATE france_product_options SET max_selections = 2 WHERE product_id = ' || p.id || 
    ' AND option_group = ''sauce'';' as correction_sql
FROM france_products p
WHERE p.name = 'TACOS' AND p.restaurant_id = 1;

ROLLBACK;