-- ========================================================================
-- NETTOYAGE SAUCES - PLAN B MELUN
-- DATE: 2025-01-26
-- RESTAURANT: Plan B Melun (ID 22)
-- OBJECTIF: Réduire liste sauces de 24 à 7 sauces principales
-- ========================================================================

BEGIN;

-- ⚠️ VÉRIFICATION RESTAURANT
SELECT id, name, phone FROM france_restaurants WHERE id = 22;

-- ========================================================================
-- COMPTAGE AVANT SUPPRESSION
-- ========================================================================

SELECT
  'AVANT SUPPRESSION' as moment,
  COUNT(*) as total_lignes_sauces,
  COUNT(DISTINCT UPPER(option_name)) as nb_sauces_uniques
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%';

-- ========================================================================
-- SUPPRESSION DES SAUCES NON-DÉSIRÉES
-- ========================================================================

-- 🗑️ SAUCES À SUPPRIMER (17 sauces)

DELETE FROM france_product_options
WHERE id IN (
  SELECT po.id
  FROM france_product_options po
  JOIN france_products p ON p.id = po.product_id
  WHERE p.restaurant_id = 22
    AND LOWER(po.option_group) LIKE '%sauce%'
    AND UPPER(po.option_name) NOT IN (
      -- ✅ SAUCES À GARDER (7 sauces)
      'MAYONNAISE',           -- Mayo
      'KETCHUP',              -- Ketchup
      'ALGERIENNE',           -- Algérienne (version majuscule)
      'ALGÉRIENNE',           -- Algérienne (version avec accent)
      'BIGGY',                -- Biggy (version courte)
      'BIGGY BURGER',         -- Biggy (version longue)
      'BARBECUE',             -- Barbecue
      'SAMOURAI',             -- Samouraï (version sans accent)
      'SAMOURAÏ',             -- Samouraï (version avec accent)
      'MAISON'                -- Sauce maison
    )
);

-- ========================================================================
-- VÉRIFICATIONS APRÈS SUPPRESSION
-- ========================================================================

-- Compter après suppression
SELECT
  'APRÈS SUPPRESSION' as moment,
  COUNT(*) as total_lignes_sauces,
  COUNT(DISTINCT UPPER(option_name)) as nb_sauces_uniques
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%';

-- Liste des sauces restantes
SELECT
  UPPER(po.option_name) as sauce_restante,
  COUNT(DISTINCT po.product_id) as nb_produits_utilisant,
  MAX(po.icon) as icone
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%'
GROUP BY UPPER(po.option_name)
ORDER BY nb_produits_utilisant DESC, sauce_restante;

-- Vérifier qu'aucune sauce indésirable ne reste
SELECT
  UPPER(po.option_name) as sauce_problematique,
  COUNT(*) as nb_occurrences
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22
  AND LOWER(po.option_group) LIKE '%sauce%'
  AND UPPER(po.option_name) NOT IN (
    'MAYONNAISE', 'KETCHUP', 'ALGERIENNE', 'ALGÉRIENNE',
    'BIGGY', 'BIGGY BURGER', 'BARBECUE', 'SAMOURAI', 'SAMOURAÏ', 'MAISON'
  )
GROUP BY UPPER(po.option_name);

-- ========================================================================
-- RÉSUMÉ SUPPRESSION
-- ========================================================================

SELECT
  '🗑️ SAUCES SUPPRIMÉES' as type,
  STRING_AGG(sauce, ', ') as liste
FROM (
  VALUES
    ('ANDALOUSE'), ('BLANCHE'), ('POIVRE'), ('CHILI THAI'),
    ('HARISSA'), ('FISH TO FISH'), ('MOUTARDE'), ('CURRY'),
    ('BURGER'), ('TARTARE'), ('SALEE'), ('SUCREE'),
    ('SUCREE SALEE'), ('COCKTAIL')
) AS sauces_supprimees(sauce)

UNION ALL

SELECT
  '✅ SAUCES CONSERVÉES' as type,
  STRING_AGG(sauce, ', ') as liste
FROM (
  VALUES
    ('MAYONNAISE'), ('KETCHUP'), ('ALGÉRIENNE'), ('BIGGY'),
    ('BARBECUE'), ('SAMOURAÏ'), ('MAISON')
) AS sauces_conservees(sauce);

-- ⚠️ IMPORTANT : Vérifier les résultats ci-dessus avant de valider !
-- Si tout est OK, exécuter :
COMMIT;

-- En cas de problème, annuler avec :
-- ROLLBACK;
