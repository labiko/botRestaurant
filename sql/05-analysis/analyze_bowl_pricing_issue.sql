-- =========================================
-- ANALYSER LE PROBLÈME DE PRIX SUPPLÉMENTS BOWL
-- =========================================

-- 1. Vérifier les suppléments avec prix actuel
SELECT
  po.option_name,
  po.price_modifier,
  po.display_order,
  CASE
    WHEN po.option_name LIKE '%(+3€)%' THEN '✅ Prix affiché dans nom'
    ELSE '❌ Prix pas affiché dans nom'
  END as prix_visible_nom
FROM france_product_options po
WHERE po.product_id = 238
  AND po.option_group = 'Suppléments BOWL'
ORDER BY po.display_order;

-- 2. Vérifier le prix de base du BOWL
SELECT
  p.name,
  p.base_price,
  p.price_delivery_base,
  'Prix de base avant suppléments' as note
FROM france_products p
WHERE p.id = 238;

-- 3. Analyser comment le bot calcule le prix total
-- Le prix total = prix de base + somme des price_modifier sélectionnés

-- 4. Tester un calcul : BOWL + 3 suppléments
SELECT
  'SIMULATION PRIX' as type,
  9.00 as prix_base_bowl,
  3.00 as prix_supplement_1,
  3.00 as prix_supplement_2,
  3.00 as prix_supplement_3,
  (9.00 + 3.00 + 3.00 + 3.00) as prix_total_attendu,
  '18€ pour BOWL + 3 suppléments' as resultat_attendu;

-- 5. Vérifier si le problème vient du bot universel
-- Le bot doit additionner automatiquement les price_modifier

-- 6. Vérifier la configuration du workflow
SELECT
  p.name,
  p.workflow_type,
  p.requires_steps,
  CASE
    WHEN p.workflow_type = 'composite_workflow' AND p.requires_steps = true THEN '✅ Configuration bot correcte'
    ELSE '❌ Configuration bot incorrecte'
  END as diagnostic_workflow
FROM france_products p
WHERE p.id = 238;

-- 7. Diagnostic : Pourquoi les +3€ ne s'ajoutent pas ?
SELECT
  'DIAGNOSTIC PRIX SUPPLÉMENTS' as probleme,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_product_options
      WHERE product_id = 238
        AND option_group = 'Suppléments BOWL'
        AND price_modifier = 3.00
    ) THEN '✅ price_modifier = 3€ configuré'
    ELSE '❌ price_modifier mal configuré'
  END as diagnostic_price_modifier,

  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_products
      WHERE id = 238
        AND workflow_type = 'composite_workflow'
    ) THEN '✅ Type composite_workflow OK'
    ELSE '❌ Type workflow incorrect'
  END as diagnostic_type,

  'Le bot universel doit calculer : base_price + SUM(price_modifier sélectionnés)' as logique_attendue;

-- 8. Solution possible : Vérifier si le bot affiche bien les prix
-- Les prix doivent apparaître dans l'affichage du bot comme "+3€"