-- Script pour ajouter les colonnes de configuration des modes de livraison
-- Option A : Colonnes Booléennes

-- Ajouter les colonnes avec valeurs par défaut à true pour la rétrocompatibilité
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS allow_dine_in BOOLEAN DEFAULT true;

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS allow_takeaway BOOLEAN DEFAULT true;

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS allow_delivery BOOLEAN DEFAULT true;

-- Commenter pour confirmer les changements
COMMENT ON COLUMN restaurants.allow_dine_in IS 'Autorise les commandes sur place (manger au restaurant)';
COMMENT ON COLUMN restaurants.allow_takeaway IS 'Autorise les commandes à emporter (récupérer et partir)';
COMMENT ON COLUMN restaurants.allow_delivery IS 'Autorise les commandes en livraison (livraison à domicile)';

-- Vérifier que tous les restaurants existants ont tous les modes activés
UPDATE restaurants 
SET 
  allow_dine_in = COALESCE(allow_dine_in, true),
  allow_takeaway = COALESCE(allow_takeaway, true),
  allow_delivery = COALESCE(allow_delivery, true)
WHERE allow_dine_in IS NULL 
   OR allow_takeaway IS NULL 
   OR allow_delivery IS NULL;