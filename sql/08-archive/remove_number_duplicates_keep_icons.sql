-- =========================================
-- SUPPRIMER LA NUMÉROTATION DOUBLÉE
-- =========================================
-- Garder les icônes automatiques 1️⃣, 2️⃣, 3️⃣
-- Supprimer les numéros dans les noms "1. ", "2. ", etc.

BEGIN;

-- =========================================
-- 1. VOIR L'ÉTAT ACTUEL
-- =========================================

SELECT
  option_group,
  display_order,
  option_name as nom_actuel,
  CASE
    WHEN option_name ~ '^\d+\.' THEN 'NUMÉRO À SUPPRIMER'
    WHEN option_name ~ '^[0-9️⃣]+' THEN 'ÉMOJI À GARDER'
    ELSE 'TEXTE SIMPLE'
  END as type_numerotation
FROM france_product_options
WHERE product_id = 238
  AND option_group IN ('Suppléments BOWL', 'Choix suppléments')
ORDER BY option_group, display_order;

-- =========================================
-- 2. SUPPRIMER LES NUMÉROS DES NOMS - GARDER UNIQUEMENT LE TEXTE
-- =========================================

-- Pour les suppléments : retirer "1. ", "2. ", etc.
UPDATE france_product_options
SET option_name =
  CASE
    -- Supprimer les numéros simples comme "1. ", "2. ", etc.
    WHEN option_name ~ '^\d+\.\s*' THEN
      REGEXP_REPLACE(option_name, '^\d+\.\s*', '')
    -- Supprimer les émojis numériques s'ils existent dans le nom
    WHEN option_name ~ '^[0-9️⃣🔟]+\s*' THEN
      REGEXP_REPLACE(option_name, '^[0-9️⃣🔟]+\s*', '')
    ELSE option_name
  END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- Pour les choix suppléments : même chose
UPDATE france_product_options
SET option_name =
  CASE
    WHEN option_name ~ '^\d+\.\s*' THEN
      REGEXP_REPLACE(option_name, '^\d+\.\s*', '')
    WHEN option_name ~ '^[0-9️⃣🔟]+\s*' THEN
      REGEXP_REPLACE(option_name, '^[0-9️⃣🔟]+\s*', '')
    ELSE option_name
  END
WHERE product_id = 238
  AND option_group = 'Choix suppléments';

-- =========================================
-- 3. VÉRIFIER LE RÉSULTAT
-- =========================================

SELECT
  option_group,
  display_order,
  option_name as nom_corrige,
  'Icon ' || display_order || ' → ' || option_name as affichage_final
FROM france_product_options
WHERE product_id = 238
  AND option_group IN ('Suppléments BOWL', 'Choix suppléments')
ORDER BY option_group, display_order;

-- =========================================
-- 4. VÉRIFIER QUELQUES EXEMPLES
-- =========================================

SELECT
  'SUPPLÉMENTS EXEMPLES' as type,
  display_order as icone_numero,
  option_name as texte_seul
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND display_order <= 6
ORDER BY display_order;

-- =========================================
-- 5. RÉSUMÉ
-- =========================================

SELECT
  '✅ Numéros supprimés des noms' as action_1,
  '✅ Icônes automatiques conservées (1️⃣, 2️⃣, 3️⃣...)' as action_2,
  '✅ Plus de numérotation doublée' as action_3,
  '✅ Affichage: Icon + Texte propre' as resultat_final;

COMMIT;
-- En cas de problème : ROLLBACK;