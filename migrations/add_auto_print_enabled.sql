-- ========================================================================
-- VERSION: v1
-- DATE: 2025-10-11
-- PROBLÈME RÉSOLU: Centraliser la configuration d'impression automatique en base de données
-- CHANGEMENTS: Ajout de la colonne auto_print_enabled dans france_restaurants (activée par défaut)
-- ========================================================================

BEGIN;

-- Ajouter la colonne auto_print_enabled avec valeur par défaut TRUE
ALTER TABLE france_restaurants
ADD COLUMN auto_print_enabled BOOLEAN DEFAULT TRUE NOT NULL;

-- Activer par défaut pour tous les restaurants existants
UPDATE france_restaurants
SET auto_print_enabled = TRUE
WHERE auto_print_enabled IS NULL;

-- Vérification
SELECT
  slug,
  name,
  auto_print_enabled
FROM france_restaurants
ORDER BY slug;

-- Si tout est correct, valider avec : COMMIT;
-- En cas de problème, annuler avec : ROLLBACK;

COMMIT;
