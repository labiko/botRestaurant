-- ========================================================================
-- NETTOYAGE NUMÉROTATION HARDCODÉE - BOISSONS UNIQUEMENT
-- DATE: 2025-10-10
-- OBJECTIF: Supprimer les emojis numérotés (1️⃣, 2️⃣, 3️⃣, 4️⃣, 5️⃣) des noms de boissons
--
-- STATISTIQUES:
-- - Total boissons concernées: 940 options
-- - Groupes: Boisson 33CL incluse (696), Boissons (198), Boisson 1.5L incluse (20)
--           boisson (12), boissons_choix (12), Boisson enfant (2)
-- ========================================================================

BEGIN;

-- ========================================================================
-- ÉTAPE 1: CRÉER UNE TABLE DE BACKUP
-- ========================================================================
CREATE TABLE IF NOT EXISTS france_product_options_backup_boissons_20251010 AS
SELECT *
FROM france_product_options
WHERE option_name ~ '[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%');

-- Vérifier le backup
SELECT COUNT(*) as "Nombre options sauvegardées"
FROM france_product_options_backup_boissons_20251010;

-- ========================================================================
-- ÉTAPE 2: AFFICHER UN APERÇU DES MODIFICATIONS (20 premiers)
-- ========================================================================
SELECT
  id,
  option_name as "AVANT",
  CASE
    WHEN option_name LIKE '1️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '2️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '3️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '4️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '5️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '1️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '2️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '3️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '4️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '5️⃣%' THEN SUBSTRING(option_name FROM 3)
    ELSE option_name
  END as "APRÈS",
  option_group,
  display_order
FROM france_product_options
WHERE option_name ~ '[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%')
ORDER BY option_group, display_order
LIMIT 20;

-- ========================================================================
-- ÉTAPE 3: APPLIQUER LES MODIFICATIONS
-- ========================================================================

-- Supprimer les emojis numérotés avec espace après
UPDATE france_product_options
SET option_name = CASE
    WHEN option_name LIKE '1️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '2️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '3️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '4️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '5️⃣ %' THEN SUBSTRING(option_name FROM 4)
    WHEN option_name LIKE '1️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '2️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '3️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '4️⃣%' THEN SUBSTRING(option_name FROM 3)
    WHEN option_name LIKE '5️⃣%' THEN SUBSTRING(option_name FROM 3)
    ELSE option_name
  END
WHERE option_name ~ '[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%');

-- ========================================================================
-- ÉTAPE 4: VÉRIFICATIONS POST-MODIFICATION
-- ========================================================================

-- 1. Vérifier qu'il ne reste plus d'emojis numérotés dans les boissons
SELECT COUNT(*) as "Options boissons avec emojis restants (devrait être 0)"
FROM france_product_options
WHERE option_name ~ '[1-5]️⃣'
  AND (option_group ILIKE '%boisson%' OR option_group ILIKE '%drink%');

-- 2. Vérifier le nombre total de boissons modifiées
SELECT 'Modifications appliquées' as statut, COUNT(*) as nb_lignes_modifiees
FROM france_product_options_backup_boissons_20251010;

-- 3. Afficher quelques exemples de résultat
SELECT
  id,
  option_name as "APRÈS NETTOYAGE",
  option_group,
  display_order
FROM france_product_options
WHERE id IN (
  SELECT id
  FROM france_product_options_backup_boissons_20251010
  LIMIT 20
)
ORDER BY option_group, display_order;

-- 4. Comparer avec le backup
SELECT
  'Comparaison Backup vs Actuel' as info,
  backup.id,
  backup.option_name as "AVANT (backup)",
  current.option_name as "APRÈS (actuel)",
  backup.option_group
FROM france_product_options_backup_boissons_20251010 backup
JOIN france_product_options current ON backup.id = current.id
ORDER BY backup.option_group, backup.display_order
LIMIT 30;

-- ========================================================================
-- RÉCAPITULATIF FINAL
-- ========================================================================
SELECT
  '✅ NETTOYAGE TERMINÉ' as statut,
  (SELECT COUNT(*) FROM france_product_options_backup_boissons_20251010) as options_modifiees,
  (SELECT COUNT(DISTINCT option_group)
   FROM france_product_options_backup_boissons_20251010) as groupes_affectes,
  'Backup: france_product_options_backup_boissons_20251010' as table_backup;

-- ========================================================================
-- Si tout est correct, valider avec COMMIT
-- En cas de problème, annuler avec ROLLBACK
-- ========================================================================

-- ATTENTION: Décommenter la ligne suivante UNIQUEMENT après vérification !
-- COMMIT;

-- Pour annuler en cas de problème:
-- ROLLBACK;

-- ========================================================================
-- ROLLBACK EN CAS DE PROBLÈME APRÈS COMMIT
-- ========================================================================
-- Si vous avez fait COMMIT et que vous voulez revenir en arrière :
/*
UPDATE france_product_options
SET option_name = backup.option_name
FROM france_product_options_backup_boissons_20251010 backup
WHERE france_product_options.id = backup.id;
*/
