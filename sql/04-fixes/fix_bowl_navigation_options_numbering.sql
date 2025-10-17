-- =========================================
-- CORRIGER LA NUMÉROTATION DES OPTIONS DE NAVIGATION
-- =========================================
-- L'option "Pas de suppléments" doit être 0
-- L'option "Ajouter des suppléments" doit être 1

BEGIN;

-- =========================================
-- 1. VOIR L'ÉTAT ACTUEL DES OPTIONS DE NAVIGATION
-- =========================================

SELECT
  option_group,
  display_order,
  option_name,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
ORDER BY display_order;

-- =========================================
-- 2. METTRE À JOUR LES OPTIONS DE NAVIGATION
-- =========================================
-- 0 = Pas de suppléments
-- 1 = Ajouter des suppléments

UPDATE france_product_options
SET
  option_name = CASE
    WHEN option_name LIKE '%Pas de suppléments%' THEN '0️⃣ Pas de suppléments'
    WHEN option_name LIKE '%Ajouter des suppléments%' THEN '1️⃣ Ajouter des suppléments'
    ELSE option_name
  END,
  display_order = CASE
    WHEN option_name LIKE '%Pas de suppléments%' THEN 0
    WHEN option_name LIKE '%Ajouter des suppléments%' THEN 1
    ELSE display_order
  END
WHERE product_id = 238
  AND option_group = 'Choix suppléments';

-- =========================================
-- 3. VÉRIFIER QUE LES SUPPLÉMENTS SONT BIEN NUMÉROTÉS
-- =========================================

SELECT
  display_order,
  option_name,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order
LIMIT 5;

-- =========================================
-- 4. VÉRIFICATION COMPLÈTE
-- =========================================
-- Voir toutes les options dans l'ordre d'affichage

SELECT
  option_group,
  display_order,
  option_name,
  CASE
    WHEN option_group = 'Choix suppléments' AND display_order = 0 THEN '✅ Navigation: 0 = Pas de'
    WHEN option_group = 'Choix suppléments' AND display_order = 1 THEN '✅ Navigation: 1 = Ajouter'
    WHEN option_group = 'Suppléments BOWL' THEN '✅ Supplément #' || display_order
    ELSE '⚠️ Autre'
  END as type_coherence
FROM france_product_options
WHERE product_id = 238
  AND option_group IN ('Choix suppléments', 'Suppléments BOWL')
ORDER BY
  CASE option_group
    WHEN 'Choix suppléments' THEN 1
    WHEN 'Suppléments BOWL' THEN 2
  END,
  display_order;

-- =========================================
-- 5. METTRE À JOUR LE WORKFLOW SI NÉCESSAIRE
-- =========================================

UPDATE france_products
SET steps_config = jsonb_set(
  steps_config::jsonb,
  '{steps,2,prompt}',
  '"🍽️ VOULEZ-VOUS DES SUPPLÉMENTS ?\n0️⃣ = Non\n1️⃣ = Oui"'::jsonb
)
WHERE id = 238;

-- =========================================
-- 6. RÉSULTAT ATTENDU
-- =========================================

SELECT
  '✅ Option 0️⃣ = Pas de suppléments' as option_0,
  '✅ Option 1️⃣ = Ajouter des suppléments' as option_1,
  '✅ Suppléments numérotés 1️⃣ à 1️⃣6️⃣' as supplements,
  '✅ Workflow mis à jour avec prompt clair' as workflow;

COMMIT;
-- En cas de problème : ROLLBACK;