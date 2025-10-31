-- Vérifier à quel restaurant appartiennent les produits 851-856
SELECT
  p.id,
  p.name as produit,
  p.restaurant_id,
  r.name as restaurant,
  r.phone
FROM france_products p
JOIN france_restaurants r ON r.id = p.restaurant_id
WHERE p.id IN (851, 852, 853, 854, 855, 856)
ORDER BY p.id;
