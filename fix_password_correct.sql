-- 🔧 CORRECTION URGENTE MOT DE PASSE ADMIN
-- ========================================

BEGIN;

-- Hash correct pour Passer@123 (vérifié avec bcrypt.compareSync)
UPDATE login_users
SET password_hash = '$2b$10$v8Lwm.HY9F2nXDidif88Fe0Oyfy3n2UxLjaNwxFlVar50DVE.3Ld2',
    updated_at = NOW()
WHERE email = 'admin@menuai.com';

-- Vérifier que l'update a bien fonctionné
SELECT
  email,
  password_hash,
  updated_at,
  CASE
    WHEN password_hash = '$2b$10$v8Lwm.HY9F2nXDidif88Fe0Oyfy3n2UxLjaNwxFlVar50DVE.3Ld2'
    THEN '✅ Hash correct pour Passer@123'
    ELSE '❌ Hash incorrect - Update échoué'
  END as verification
FROM login_users
WHERE email = 'admin@menuai.com';

COMMIT;