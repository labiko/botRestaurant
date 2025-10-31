-- Vérification 1: Comptage total
SELECT
  'AVANT SUPPRESSION' as moment,
  COUNT(*) as total_lignes_sauces,
  COUNT(DISTINCT UPPER(option_name)) as nb_sauces_uniques
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%';

-- Vérification 2: Sauces à CONSERVER
SELECT
  UPPER(po.option_name) as sauce_a_garder,
  COUNT(*) as nb_lignes,
  COUNT(DISTINCT po.product_id) as nb_produits
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%'
  AND (
    UPPER(po.option_name) = 'MAYONNAISE'
    OR UPPER(po.option_name) = 'KETCHUP'
    OR UPPER(po.option_name) LIKE 'ALGER%'
    OR UPPER(po.option_name) LIKE 'BIGGY%'
    OR UPPER(po.option_name) = 'BARBECUE'
    OR UPPER(po.option_name) LIKE 'SAMOURA%'
    OR UPPER(po.option_name) = 'MAISON'
  )
GROUP BY UPPER(po.option_name)
ORDER BY nb_lignes DESC;

-- Vérification 3: Total à conserver
SELECT
  'SAUCES A CONSERVER' as type,
  COUNT(*) as total_lignes
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%'
  AND (
    UPPER(po.option_name) = 'MAYONNAISE'
    OR UPPER(po.option_name) = 'KETCHUP'
    OR UPPER(po.option_name) LIKE 'ALGER%'
    OR UPPER(po.option_name) LIKE 'BIGGY%'
    OR UPPER(po.option_name) = 'BARBECUE'
    OR UPPER(po.option_name) LIKE 'SAMOURA%'
    OR UPPER(po.option_name) = 'MAISON'
  );

-- Vérification 4: Total à supprimer
SELECT
  'SAUCES A SUPPRIMER' as type,
  COUNT(*) as total_lignes
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%'
  AND NOT (
    UPPER(po.option_name) = 'MAYONNAISE'
    OR UPPER(po.option_name) = 'KETCHUP'
    OR UPPER(po.option_name) LIKE 'ALGER%'
    OR UPPER(po.option_name) LIKE 'BIGGY%'
    OR UPPER(po.option_name) = 'BARBECUE'
    OR UPPER(po.option_name) LIKE 'SAMOURA%'
    OR UPPER(po.option_name) = 'MAISON'
  );

-- Vérification 5: Liste des sauces à SUPPRIMER
SELECT
  UPPER(po.option_name) as sauce_a_supprimer,
  COUNT(*) as nb_lignes,
  COUNT(DISTINCT po.product_id) as nb_produits
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%'
  AND NOT (
    UPPER(po.option_name) = 'MAYONNAISE'
    OR UPPER(po.option_name) = 'KETCHUP'
    OR UPPER(po.option_name) LIKE 'ALGER%'
    OR UPPER(po.option_name) LIKE 'BIGGY%'
    OR UPPER(po.option_name) = 'BARBECUE'
    OR UPPER(po.option_name) LIKE 'SAMOURA%'
    OR UPPER(po.option_name) = 'MAISON'
  )
GROUP BY UPPER(po.option_name)
ORDER BY nb_lignes DESC;
