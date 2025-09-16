-- ANALYSE DE CONFORMITÉ - POULET & SNACKS
-- Comparaison entre dataBrut.txt et base de données actuelle

-- =========================================
-- 1. ANALYSE DES ÉCARTS
-- =========================================

-- Données source (dataBrut.txt):
-- TENDERS: 1 pièce (1.50€), 5 pièces avec frites+boisson (9€)
-- NUGGETS: 4 pièces (3.50€), 10 pièces avec frites+boisson (9€)  
-- WINGS: 4 pièces (3.50€), 8 pièces avec frites+boisson (9€)
-- DONUTS POULET: 1 pièce (2€)
-- MOZZA STICK: 4 pièces (3.50€)
-- JALAPENOS: 4 pièces (3.50€)
-- ONION RINGS: 4 pièces (3.50€)
-- POTATOES: 1€

-- =========================================
-- 2. VÉRIFICATION DES PRODUITS CONFORMES
-- =========================================

SELECT 'PRODUITS CONFORMES AU dataBrut.txt' as analyse;

SELECT 
    p.name,
    p.composition,
    p.price_on_site_base as prix_base,
    p.product_type,
    CASE 
        WHEN p.name = '1 TENDER' AND p.price_on_site_base = 1.50 THEN '✅ CONFORME'
        WHEN p.name = '5 TENDERS' AND p.price_on_site_base = 9.00 THEN '✅ CONFORME (avec frites+boisson)'
        WHEN p.name = '4 NUGGETS' AND p.price_on_site_base = 3.50 THEN '✅ CONFORME'
        WHEN p.name = '10 NUGGETS' AND p.price_on_site_base = 9.00 THEN '✅ CONFORME (avec frites+boisson)'
        WHEN p.name = '4 WINGS' AND p.price_on_site_base = 3.50 THEN '✅ CONFORME'
        WHEN p.name = '8 WINGS' AND p.price_on_site_base = 9.00 THEN '✅ CONFORME (avec frites+boisson)'
        WHEN p.name = 'DONUT POULET' AND p.price_on_site_base = 2.00 THEN '✅ CONFORME'
        WHEN p.name = 'MOZZA STICK' AND p.price_on_site_base = 3.50 THEN '✅ CONFORME'
        WHEN p.name = 'JALAPENOS' AND p.price_on_site_base = 3.50 THEN '✅ CONFORME'
        WHEN p.name = 'ONION RINGS' AND p.price_on_site_base = 3.50 THEN '✅ CONFORME'
        WHEN p.name = 'POTATOES' AND p.price_on_site_base = 1.00 THEN '✅ CONFORME'
        ELSE '❌ NON CONFORME'
    END as statut_conformite
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE (c.name = '🍗 POULET & SNACKS' OR c.slug LIKE '%snack%' OR c.slug LIKE '%poulet%')
AND p.name IN ('1 TENDER', '5 TENDERS', '4 NUGGETS', '10 NUGGETS', '4 WINGS', '8 WINGS', 
               'DONUT POULET', 'MOZZA STICK', 'JALAPENOS', 'ONION RINGS', 'POTATOES')
ORDER BY p.display_order;

-- =========================================
-- 3. PRODUITS SUPPLÉMENTAIRES (NON DANS dataBrut.txt)
-- =========================================

SELECT 'PRODUITS SUPPLÉMENTAIRES EN BASE' as analyse;

SELECT 
    p.name,
    p.price_on_site_base as prix,
    p.product_type,
    '⚠️ NON PRÉSENT dans dataBrut.txt' as remarque
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE (c.name = '🍗 POULET & SNACKS' OR c.slug LIKE '%snack%' OR c.slug LIKE '%poulet%')
AND p.name NOT IN ('1 TENDER', '5 TENDERS', '4 NUGGETS', '10 NUGGETS', '4 WINGS', '8 WINGS', 
                   'DONUT POULET', 'MOZZA STICK', 'JALAPENOS', 'ONION RINGS', 'POTATOES')
ORDER BY p.display_order;

-- =========================================
-- 4. WORKFLOW RECOMMANDÉ POUR LE BOT
-- =========================================

/*
🤖 WORKFLOW RECOMMANDÉ POUR POULET & SNACKS:

1. PRODUITS SIMPLES (sans choix):
   - 1 TENDER (1.50€)
   - 4 NUGGETS (3.50€)
   - 4 WINGS (3.50€)
   - DONUT POULET (2€)
   - MOZZA STICK (3.50€)
   - JALAPENOS (3.50€)
   - ONION RINGS (3.50€)
   - POTATOES (1€)
   → Configuration: product_type = 'simple'
   → Workflow: Sélection directe → Ajout au panier

2. PRODUITS COMPOSITES (avec frites + boisson):
   - 5 TENDERS (9€) - servie avec frites et boisson
   - 10 NUGGETS (9€) - servie avec frites et boisson
   - 8 WINGS (9€) - servie avec frites et boisson
   → Configuration: product_type = 'composite'
   → workflow_type = 'composite_selection'
   → requires_steps = true
   → Workflow: Sélection → Choix boisson 33CL → Ajout au panier

3. WORKFLOW ÉTAPES:
   a) Client sélectionne un produit composite (ex: 5 TENDERS)
   b) Bot propose choix de boisson 33CL (12 options comme BURGERS)
   c) Frites automatiquement incluses
   d) Ajout au panier avec configuration complète

4. CONFIGURATION AUTOMATIQUE:
   SELECT configure_category_workflow('POULET-SNACKS', 'copy_from', 'BURGERS');
   
   Mais attention: Seuls les 3 produits composites (5 TENDERS, 10 NUGGETS, 8 WINGS)
   doivent avoir le workflow boisson. Les autres restent simples.

5. CORRECTION NÉCESSAIRE:
   - Certains produits en base ne correspondent pas au dataBrut.txt
   - Produits supplémentaires à supprimer ou justifier
   - Prix à vérifier pour conformité totale
*/

-- =========================================
-- 5. RÉSUMÉ DES ACTIONS
-- =========================================

SELECT 'RÉSUMÉ' as section,
       COUNT(*) as total_produits,
       COUNT(CASE WHEN p.product_type = 'simple' THEN 1 END) as produits_simples,
       COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) as produits_composites
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE (c.name = '🍗 POULET & SNACKS' OR c.slug LIKE '%snack%' OR c.slug LIKE '%poulet%');