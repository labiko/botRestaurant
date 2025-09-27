-- 🔧 MISE À JOUR MOT DE PASSE ADMIN
-- ===================================

BEGIN;

-- Mettre à jour le hash du mot de passe pour Passer@123
UPDATE login_users
SET password_hash = '$2b$10$v8Lwm.HY9F2nXDidif88Fe0Oyfy3n2UxLjaNwxFlVar50DVE.3Ld2',
    updated_at = NOW()
WHERE email = 'admin@menuai.com';

-- Vérifier la mise à jour
SELECT
  email,
  SUBSTRING(password_hash, 1, 20) || '...' as hash_preview,
  updated_at,
  created_at
FROM login_users
WHERE email = 'admin@menuai.com';

-- Si tout est correct, valider avec : COMMIT;
-- En cas de problème, annuler avec : ROLLBACK;

COMMIT;