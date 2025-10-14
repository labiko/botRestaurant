-- ========================================================================
-- NETTOYAGE PRÉFIXE FR DES NUMÉROS DE TÉLÉPHONE
-- Date: 2025-10-14
-- Problème: Les numéros ont le préfixe "FR" au lieu de "33"
-- Exemple: "FR33673263357" → "33673263357"
-- ========================================================================

BEGIN;

-- 1. Vérification des numéros avec préfixe FR
SELECT
  id,
  name,
  phone AS phone_avant,
  whatsapp_number AS whatsapp_avant
FROM france_restaurants
WHERE phone LIKE 'FR%' OR whatsapp_number LIKE 'FR%';

-- 2. Nettoyer le préfixe FR du champ phone
UPDATE france_restaurants
SET phone = SUBSTRING(phone FROM 3)
WHERE phone LIKE 'FR%';

-- 3. Nettoyer le préfixe FR du champ whatsapp_number
UPDATE france_restaurants
SET whatsapp_number = SUBSTRING(whatsapp_number FROM 3)
WHERE whatsapp_number LIKE 'FR%';

-- 4. Vérification finale
SELECT
  id,
  name,
  country_code,
  phone AS phone_apres,
  whatsapp_number AS whatsapp_apres
FROM france_restaurants;

-- Si tout est OK : COMMIT;
-- Si problème : ROLLBACK;

COMMIT;
