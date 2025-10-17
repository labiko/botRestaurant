-- ========================================================================
-- REQUÊTES SELECT POUR VISUALISER LES BOISSONS AVANT NETTOYAGE
-- ========================================================================

-- 1️⃣ Vue globale : Statistiques boissons
SELECT
  COUNT(*) as total_boissons,
  COUNT(CASE WHEN option_name ~ '[1-5]️⃣' THEN 1 END) as avec_numeros_emoji,
  COUNT(CASE WHEN option_name !~ '[1-5]️⃣' THEN 1 END) as sans_numeros
FROM france_product_options
WHERE option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%';

-- ========================================================================

-- 2️⃣ Répartition par groupe de boissons
SELECT
  option_group,
  COUNT(*) as nb_options,
  COUNT(CASE WHEN option_name ~ '[1-5]️⃣' THEN 1 END) as avec_numeros
FROM france_product_options
WHERE option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%'
GROUP BY option_group
ORDER BY nb_options DESC;

-- ========================================================================

-- 3️⃣ Exemples : Boisson 1.5L incluse
SELECT
  id,
  option_name,
  option_group,
  display_order,
  product_id
FROM france_product_options
WHERE option_group = 'Boisson 1.5L incluse'
  AND option_name ~ '[1-5]️⃣'
ORDER BY product_id, display_order
LIMIT 20;

-- ========================================================================

-- 4️⃣ Exemples : Boisson 33CL incluse
SELECT
  id,
  option_name,
  option_group,
  display_order,
  product_id
FROM france_product_options
WHERE option_group = 'Boisson 33CL incluse'
  AND option_name ~ '[1-5]️⃣'
ORDER BY product_id, display_order
LIMIT 20;

-- ========================================================================

-- 5️⃣ Prévisualiser le résultat APRÈS nettoyage
SELECT
  id,
  option_name AS "AVANT",
  CASE
    WHEN option_name LIKE '1️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '2️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '3️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '4️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '5️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '1️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '2️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '3️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '4️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '5️⃣%' THEN SUBSTRING(option_name FROM 3)
    ELSE option_name
  END AS "APRÈS",
  option_group,
  display_order
FROM france_product_options
WHERE option_name ~ '[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%')
ORDER BY option_group, display_order
LIMIT 50;

-- ========================================================================

-- 6️⃣ Voir tous les emojis numérotés utilisés
SELECT
  SUBSTRING(option_name FROM 1 FOR 2) as emoji_numero,
  COUNT(*) as nb_occurrences
FROM france_product_options
WHERE option_name ~ '^[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%')
GROUP BY SUBSTRING(option_name FROM 1 FOR 2)
ORDER BY emoji_numero;

-- ========================================================================

-- 7️⃣ Liste complète de toutes les boissons avec numéros
SELECT
  id,
  option_name,
  option_group,
  display_order,
  product_id,
  is_active
FROM france_product_options
WHERE option_name ~ '[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%')
ORDER BY option_group, product_id, display_order;
