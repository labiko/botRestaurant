-- ========================================================================
-- CORRECTION DOUBLONS CONTACTS SUPPORT
-- ========================================================================

-- 1. Voir les doublons actuels
SELECT
  id,
  contact_name,
  whatsapp_number,
  is_active,
  notification_priority,
  created_at
FROM system_support_contacts
ORDER BY whatsapp_number, created_at;

-- 2. Compter les doublons par numéro
SELECT
  whatsapp_number,
  COUNT(*) as nombre_doublons
FROM system_support_contacts
WHERE is_active = true
GROUP BY whatsapp_number
HAVING COUNT(*) > 1;

-- ========================================================================
-- OPTION 1 : Supprimer les doublons en gardant le plus ancien
-- ========================================================================
DELETE FROM system_support_contacts
WHERE id NOT IN (
  SELECT MIN(id)
  FROM system_support_contacts
  GROUP BY whatsapp_number, contact_name
);

-- ========================================================================
-- OPTION 2 : Désactiver les doublons au lieu de les supprimer
-- ========================================================================
UPDATE system_support_contacts
SET is_active = false
WHERE id NOT IN (
  SELECT MIN(id)
  FROM system_support_contacts
  GROUP BY whatsapp_number, contact_name
)
AND is_active = true;

-- 3. Vérifier le résultat
SELECT
  id,
  contact_name,
  whatsapp_number,
  is_active,
  notification_priority
FROM system_support_contacts
WHERE is_active = true
ORDER BY notification_priority;
