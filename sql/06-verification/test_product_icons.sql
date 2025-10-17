-- ================================================
-- TEST SIMPLE - AJOUT ICÔNES PRODUITS THIEP & YASSA
-- ================================================

BEGIN;

-- Identifier les produits Thiep et Yassa pour test
SELECT id, name, category_id, icon FROM france_products
WHERE LOWER(name) LIKE '%thiep%' OR LOWER(name) LIKE '%yassa%';

-- Ajouter icônes spécifiques pour test
UPDATE france_products
SET icon = '🍛'
WHERE LOWER(name) LIKE '%thiep%';

UPDATE france_products
SET icon = '🍖'
WHERE LOWER(name) LIKE '%yassa%';

-- Vérification résultat
SELECT
  id,
  name,
  icon,
  CASE
    WHEN icon IS NOT NULL THEN 'AVEC icône: ' || icon
    ELSE 'SANS icône (utilise catégorie)'
  END as status
FROM france_products
WHERE LOWER(name) LIKE '%thiep%' OR LOWER(name) LIKE '%yassa%'
ORDER BY name;

COMMIT;

-- Résultat attendu dans le bot:
-- AVANT: 🎯 📋 📋 THIEP
-- APRÈS: 🎯 🍛 🍛 THIEP
--
-- AVANT: 🎯 📋 📋 YASSA
-- APRÈS: 🎯 🍖 🍖 YASSA