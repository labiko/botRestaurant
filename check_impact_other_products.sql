-- =========================================
-- VÉRIFIER L'IMPACT SUR LES AUTRES PRODUITS
-- =========================================

-- 1. Vérifier si d'autres produits utilisent les groupes qu'on va modifier
SELECT DISTINCT
  p.id,
  p.name as product_name,
  po.option_group
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE po.option_group IN ('Suppléments', 'Choix suppléments', 'Suppléments BOWL')
  AND p.id != 238  -- Exclure le BOWL
ORDER BY p.name, po.option_group;

-- 2. Vérifier tous les produits qui utilisent "Suppléments"
SELECT
  p.id,
  p.name,
  p.restaurant_id,
  COUNT(po.id) as nb_options_supplements
FROM france_products p
JOIN france_product_options po ON p.id = po.product_id
WHERE po.option_group = 'Suppléments'
GROUP BY p.id, p.name, p.restaurant_id
ORDER BY p.name;

-- 3. Vérifier si le groupe "Suppléments BOWL" existe déjà
SELECT
  p.id,
  p.name,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE po.option_group = 'Suppléments BOWL'
GROUP BY p.id, p.name;

-- 4. Vérifier si le groupe "Choix suppléments" existe déjà
SELECT
  p.id,
  p.name,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE po.option_group = 'Choix suppléments'
GROUP BY p.id, p.name;

-- 5. Résumé de l'impact : ce qui sera affecté
SELECT
  'IMPACT ANALYSIS' as type,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_product_options po
      JOIN france_products p ON po.product_id = p.id
      WHERE po.option_group = 'Suppléments' AND p.id != 238
    ) THEN '⚠️ ATTENTION: D''autres produits utilisent "Suppléments"'
    ELSE '✅ OK: Seul BOWL utilise "Suppléments"'
  END as diagnostic_supplements,

  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_product_options po
      WHERE po.option_group = 'Suppléments BOWL'
    ) THEN '⚠️ CONFLIT: "Suppléments BOWL" existe déjà'
    ELSE '✅ OK: "Suppléments BOWL" est nouveau'
  END as diagnostic_supplements_bowl,

  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_product_options po
      WHERE po.option_group = 'Choix suppléments'
    ) THEN '⚠️ CONFLIT: "Choix suppléments" existe déjà'
    ELSE '✅ OK: "Choix suppléments" est nouveau'
  END as diagnostic_choix_supplements;