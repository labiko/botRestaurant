-- Migration: Ajout du champ deployment_status pour déploiement progressif
-- Objectif: Masquer restaurants non-produits de la liste "resto"
-- tout en gardant l'accès direct par téléphone pour tests

BEGIN;

-- Ajouter le nouveau champ deployment_status
ALTER TABLE france_restaurants
ADD COLUMN deployment_status VARCHAR(20) DEFAULT 'production'
CHECK (deployment_status IN ('development', 'testing', 'production'));

-- Mettre tous les restaurants existants en production (pas de régression)
UPDATE france_restaurants
SET deployment_status = 'production'
WHERE deployment_status IS NULL;

-- Vérification des données après migration
SELECT name, deployment_status, is_active
FROM france_restaurants
ORDER BY name;

COMMIT;

-- Comment utiliser:
-- development: Restaurant en développement (invisible liste, accessible direct)
-- testing: Restaurant en test (invisible liste, accessible direct)
-- production: Restaurant déployé (visible liste + accessible direct)

-- Pour déployer un restaurant:
-- UPDATE france_restaurants SET deployment_status = 'production' WHERE id = X;

-- Pour retirer un restaurant temporairement:
-- UPDATE france_restaurants SET deployment_status = 'testing' WHERE id = X;