-- ================================================
-- UPDATE ICÔNES POUR OPTIONS MENU NANA
-- ================================================

BEGIN;

-- IMPORTANT: D'abord ajouter la colonne icon si elle n'existe pas
ALTER TABLE france_product_options
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT NULL;

-- Vérifier d'abord les options du MENU NANA (product_id = 453)
SELECT
  id,
  option_name,
  option_group
FROM france_product_options
WHERE product_id = 453
ORDER BY option_group, display_order;

-- Mettre à jour les icônes pour les plats principaux
UPDATE france_product_options
SET icon = '🍛'
WHERE product_id = 453
  AND LOWER(option_name) LIKE '%thiep%';

UPDATE france_product_options
SET icon = '🍖'
WHERE product_id = 453
  AND LOWER(option_name) LIKE '%yassa%';

UPDATE france_product_options
SET icon = '🍗'
WHERE product_id = 453
  AND LOWER(option_name) LIKE '%poulet%';

UPDATE france_product_options
SET icon = '🥘'
WHERE product_id = 453
  AND LOWER(option_name) LIKE '%riz%';

UPDATE france_product_options
SET icon = '🍲'
WHERE product_id = 453
  AND LOWER(option_name) LIKE '%sauce%'
  AND option_group = 'Plats';  -- Pour éviter de toucher les sauces condiments

-- Mettre à jour les boissons si présentes
UPDATE france_product_options
SET icon = '🥤'
WHERE product_id = 453
  AND option_group IN ('Boisson', 'Boissons', 'boisson', 'boissons');

-- Mettre à jour les desserts si présents
UPDATE france_product_options
SET icon = '🍮'
WHERE product_id = 453
  AND option_group IN ('Dessert', 'Desserts', 'dessert', 'desserts');

-- Vérification finale
SELECT
  id,
  option_name,
  option_group,
  icon,
  CASE
    WHEN icon IS NOT NULL THEN '✅ Avec icône'
    ELSE '❌ Sans icône'
  END as status
FROM france_product_options
WHERE product_id = 453
ORDER BY option_group, display_order;

COMMIT;

-- Note: Si certaines options n'ont pas d'icônes après ce script,
-- vous pouvez les ajouter manuellement avec:
-- UPDATE france_product_options SET icon = '🍽️' WHERE id = [ID_SPECIFIQUE];