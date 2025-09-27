-- ================================================
-- AJOUT COLONNE ICON AUX PRODUITS
-- ================================================

BEGIN;

-- Ajouter colonne icon à la table france_products
ALTER TABLE france_products
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT '🍽️';

-- Créer index pour optimiser les requêtes sur les icônes
CREATE INDEX IF NOT EXISTS idx_france_products_icon ON france_products(icon);

-- Vérifier la structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'france_products'
  AND column_name = 'icon';

SELECT '✅ Colonne icon ajoutée aux produits !' as status;

COMMIT;