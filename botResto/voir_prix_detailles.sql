-- VOIR LES PRIX DÉTAILLÉS POUR COMPRENDRE LES DIFFÉRENCES
-- Pour décider quelle stratégie adopter

SELECT 
  'DÉTAIL DES PRIX PAR TAILLE' as section,
  s.id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.includes_drink,
  s.display_order,
  ROW_NUMBER() OVER (PARTITION BY s.size_name ORDER BY s.id) as occurrence_num
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;

-- ANALYSE DES ÉCARTS DE PRIX
WITH price_gaps AS (
  SELECT 
    size_name,
    MAX(price_on_site) - MIN(price_on_site) as ecart_price_on_site,
    MAX(price_delivery) - MIN(price_delivery) as ecart_price_delivery,
    MIN(price_on_site) as prix_min_sur_place,
    MAX(price_on_site) as prix_max_sur_place,
    MIN(price_delivery) as prix_min_livraison,
    MAX(price_delivery) as prix_max_livraison
  FROM france_product_sizes
  WHERE product_id = 201
  GROUP BY size_name
)
SELECT 
  'ÉCARTS DE PRIX' as section,
  size_name,
  prix_min_sur_place,
  prix_max_sur_place,
  ecart_price_on_site,
  prix_min_livraison,
  prix_max_livraison,
  ecart_price_delivery
FROM price_gaps
ORDER BY size_name;