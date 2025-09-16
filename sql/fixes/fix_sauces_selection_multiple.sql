-- 🔧 CORRECTION GLOBALE - Permettre 2 sauces maximum pour TOUS LES PRODUITS
-- Application à tous les produits qui ont des sauces

BEGIN;

-- 1. Vérifier l'état actuel - Tous les produits avec sauces
SELECT 'AVANT CORRECTION - TOUS PRODUITS' as etape;
SELECT 
    p.name as produit,
    COUNT(po.id) as nb_sauces,
    MAX(po.max_selections) as max_actuel
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE po.option_group = 'sauce'
  AND p.restaurant_id = 1
GROUP BY p.id, p.name
ORDER BY p.name;

-- 2. CORRECTION GLOBALE: Permettre 2 sauces maximum pour TOUS les produits
UPDATE france_product_options 
SET max_selections = 2
WHERE option_group = 'sauce'
  AND product_id IN (
    SELECT id FROM france_products WHERE restaurant_id = 1
  );

-- 3. Vérification après correction - Tous les produits
SELECT 'APRÈS CORRECTION - TOUS PRODUITS' as etape;
SELECT 
    p.name as produit,
    COUNT(po.id) as nb_sauces,
    MAX(po.max_selections) as max_nouveau,
    CASE 
        WHEN MAX(po.max_selections) = 2 THEN '✅ 2 sauces possibles'
        ELSE '❌ Erreur'
    END as statut
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE po.option_group = 'sauce'
  AND p.restaurant_id = 1
GROUP BY p.id, p.name
ORDER BY p.name;

-- 4. Comptage final
SELECT 'RÉSUMÉ CORRECTION' as etape;
SELECT 
    COUNT(DISTINCT product_id) as nb_produits_modifiés,
    COUNT(*) as nb_lignes_modifiées
FROM france_product_options
WHERE option_group = 'sauce'
  AND max_selections = 2
  AND product_id IN (
    SELECT id FROM france_products WHERE restaurant_id = 1
  );

COMMIT;