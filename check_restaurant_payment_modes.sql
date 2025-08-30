-- Vérification des modes de paiement pour le restaurant Brasserie de Savigny
-- ID du restaurant: a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90

SELECT 
  id,
  nom,
  allow_pay_now,
  allow_pay_later,
  allow_dine_in,
  allow_takeaway,
  allow_delivery,
  statut
FROM restaurants 
WHERE id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90';

-- Si vous ne connaissez pas l'ID exact, recherche par nom:
-- SELECT 
--   id,
--   nom,
--   allow_pay_now,
--   allow_pay_later,
--   allow_dine_in,
--   allow_takeaway,
--   allow_delivery,
--   statut
-- FROM restaurants 
-- WHERE nom ILIKE '%Brasserie%Savigny%';