-- 🔧 CORRECTION DU MOT DE PASSE ADMIN
-- ====================================

-- Mettre à jour le hash du mot de passe pour admin123
UPDATE login_users
SET password_hash = '$2b$10$sw8qMbB2PnhxAifzcm1GLOwW/t/XdpXXlsA/Q4tbEuP8jziiZtsOm'
WHERE email = 'admin@menuai.com';

-- Vérifier la mise à jour
SELECT
  email,
  SUBSTRING(password_hash, 1, 20) || '...' as hash_preview,
  created_at
FROM login_users
WHERE email = 'admin@menuai.com';