-- ========================================================================
-- SUPPRESSION DOUBLONS CONTACTS SUPPORT - ID 2 et ID 3
-- ========================================================================

-- Supprimer les doublons ID 2 et 3, garder uniquement ID 1
DELETE FROM system_support_contacts
WHERE id IN (2, 3);

-- Vérifier le résultat final
SELECT
  id,
  contact_type,
  phone_number,
  full_name,
  is_active,
  notification_priority,
  created_at
FROM system_support_contacts
ORDER BY id;
