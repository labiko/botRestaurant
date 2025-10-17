-- =========================================
-- ANALYSE SIMPLE DES DONNÉES WORKFLOW
-- =========================================

-- =========================================
-- 1. STRUCTURE DE france_product_options
-- =========================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'france_product_options'
ORDER BY ordinal_position;

-- =========================================
-- 2. TOUTES LES OPTIONS DU PRODUIT 579
-- =========================================

SELECT
  id,
  name,
  price_modifier,
  display_order
FROM france_product_options
WHERE product_id = 579
ORDER BY display_order, id;

-- =========================================
-- 3. STATISTIQUES DES OPTIONS
-- =========================================

SELECT
  COUNT(*) as "Total options",
  COUNT(DISTINCT name) as "Noms distincts",
  MIN(price_modifier) as "Prix min",
  MAX(price_modifier) as "Prix max",
  ROUND(AVG(price_modifier), 2) as "Prix moyen"
FROM france_product_options
WHERE product_id = 579;

-- =========================================
-- 4. RÉPARTITION PAR PRIX
-- =========================================

SELECT
  price_modifier as "Prix modificateur",
  COUNT(*) as "Nombre d'options"
FROM france_product_options
WHERE product_id = 579
GROUP BY price_modifier
ORDER BY price_modifier;

-- =========================================
-- 5. ANALYSE DES NOMS (DÉTECTER LES PATTERNS)
-- =========================================

SELECT
  CASE
    WHEN name LIKE 'Option %' THEN 'Options génériques'
    WHEN name LIKE 'Supplément %' THEN 'Suppléments génériques'
    WHEN name ILIKE '%salade%' THEN 'Salades'
    WHEN name ILIKE '%pizza%' THEN 'Pizzas'
    WHEN name ILIKE '%boisson%' THEN 'Boissons'
    WHEN name ILIKE '%dessert%' THEN 'Desserts'
    WHEN name ILIKE '%fromage%' THEN 'Fromages'
    ELSE 'Autres'
  END as "Type détecté",
  COUNT(*) as "Nombre"
FROM france_product_options
WHERE product_id = 579
GROUP BY
  CASE
    WHEN name LIKE 'Option %' THEN 'Options génériques'
    WHEN name LIKE 'Supplément %' THEN 'Suppléments génériques'
    WHEN name ILIKE '%salade%' THEN 'Salades'
    WHEN name ILIKE '%pizza%' THEN 'Pizzas'
    WHEN name ILIKE '%boisson%' THEN 'Boissons'
    WHEN name ILIKE '%dessert%' THEN 'Desserts'
    WHEN name ILIKE '%fromage%' THEN 'Fromages'
    ELSE 'Autres'
  END
ORDER BY "Nombre" DESC;

-- =========================================
-- 6. LISTE DÉTAILLÉE DES 20 PREMIÈRES OPTIONS
-- =========================================

SELECT
  ROW_NUMBER() OVER (ORDER BY id) as "Numéro",
  name as "Nom",
  price_modifier as "Prix",
  CASE
    WHEN price_modifier = 0 THEN 'Gratuit'
    WHEN price_modifier > 0 THEN '+' || price_modifier || '€'
    ELSE price_modifier || '€'
  END as "Affichage prix"
FROM france_product_options
WHERE product_id = 579
ORDER BY id
LIMIT 20;

-- =========================================
-- 7. DIAGNOSTIC POUR L'INTERFACE
-- =========================================

SELECT
  '🔍 DIAGNOSTIC INTERFACE D''ÉDITION' as diagnostic,

  CASE
    WHEN (SELECT COUNT(*) FROM france_product_options WHERE product_id = 579) > 15
    THEN '⚠️ Beaucoup d''options (' || (SELECT COUNT(*) FROM france_product_options WHERE product_id = 579) || ') - Probablement des données de test'
    ELSE '✅ Nombre raisonnable d''options'
  END as statut_quantite,

  CASE
    WHEN (SELECT COUNT(*) FROM france_product_options WHERE product_id = 579 AND name LIKE 'Supplément %') > 10
    THEN '❌ Beaucoup de "Supplément X" génériques détectés'
    ELSE '✅ Pas de données génériques excessives'
  END as statut_qualite,

  'SOLUTION: Remplacer les données génériques par de vraies options par groupe' as recommandation;

-- =========================================
-- 8. GROUPES REQUIS PAR LE WORKFLOW (INFO)
-- =========================================

SELECT
  'GROUPES REQUIS SELON LE WORKFLOW' as info,
  'Entrées Edition, Tailles pizza, Bases pizza, Garnitures extra, Boissons formule, Desserts' as groupes_requis,
  'Il faut mapper les options actuelles vers ces 6 groupes' as action_necessaire;