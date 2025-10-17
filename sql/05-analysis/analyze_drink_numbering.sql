-- =========================================
-- ANALYSER LA NUMÉROTATION DES BOISSONS
-- =========================================
-- Comprendre comment les boissons sont numérotées
-- pour appliquer le même principe aux suppléments

BEGIN;

-- =========================================
-- 1. VOIR LES BOISSONS DU BOWL
-- =========================================

SELECT
  option_group,
  display_order,
  option_name,
  price_modifier,
  is_active
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Boisson 33CL incluse'
ORDER BY display_order;

-- =========================================
-- 2. VOIR TOUTES LES OPTIONS DU BOWL PAR GROUPE
-- =========================================

SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(option_name, ' | ' ORDER BY display_order) as liste_options
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group
ORDER BY option_group;

-- =========================================
-- 3. ANALYSER LA STRUCTURE DÉTAILLÉE
-- =========================================

SELECT
  option_group,
  display_order,
  option_name,
  price_modifier,
  CASE
    WHEN option_name ~ '^\d+\.' THEN 'Format: N.'
    WHEN option_name ~ '^[0-9️⃣]+' THEN 'Format: Emoji'
    WHEN option_name ~ '^[❌➕]' THEN 'Format: Icône'
    ELSE 'Format: Texte'
  END as format_numerotation
FROM france_product_options
WHERE product_id = 238
ORDER BY
  CASE option_group
    WHEN 'Choix viande' THEN 1
    WHEN 'Boisson 33CL incluse' THEN 2
    WHEN 'Choix suppléments' THEN 3
    WHEN 'Suppléments BOWL' THEN 4
    ELSE 5
  END,
  display_order;

-- =========================================
-- 4. VOIR UN AUTRE PRODUIT POUR COMPARAISON
-- =========================================
-- Voyons un tacos par exemple

SELECT
  p.name as product_name,
  po.option_group,
  po.display_order,
  po.option_name,
  po.price_modifier
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.name LIKE '%TACOS%'
  AND po.option_group LIKE '%Boisson%'
ORDER BY po.display_order
LIMIT 10;

-- =========================================
-- 5. ANALYSER LE WORKFLOW ACTUEL
-- =========================================

SELECT
  id,
  name,
  steps_config::text as workflow_config
FROM france_products
WHERE id = 238;

-- =========================================
-- 6. DIAGNOSTIC DU PROBLÈME
-- =========================================

-- Voir si les suppléments ont des numéros dans le nom
SELECT
  option_name,
  display_order,
  -- Extraire le numéro s'il existe
  CASE
    WHEN option_name ~ '^\d+\.' THEN
      SUBSTRING(option_name FROM '^(\d+)\.')::INTEGER
    ELSE NULL
  END as numero_extrait,
  -- Vérifier la cohérence
  CASE
    WHEN option_name ~ '^\d+\.' AND
         SUBSTRING(option_name FROM '^(\d+)\.')::INTEGER = display_order
    THEN '✅ Cohérent'
    WHEN option_name ~ '^\d+\.' AND
         SUBSTRING(option_name FROM '^(\d+)\.')::INTEGER != display_order
    THEN '❌ INCOHÉRENT!'
    ELSE '⚠️ Pas de numéro'
  END as coherence
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

COMMIT;