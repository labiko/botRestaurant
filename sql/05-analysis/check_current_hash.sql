-- 🔍 VÉRIFICATION HASH ACTUEL EN BASE
-- ===================================

SELECT
  email,
  SUBSTRING(password_hash, 1, 30) || '...' as hash_preview,
  password_hash,
  updated_at,
  created_at,
  CASE
    WHEN password_hash = '$2b$10$sw8qMbB2PnhxAifzcm1GLOwW/t/XdpXXlsA/Q4tbEuP8jziiZtsOm'
    THEN '🔄 Hash pour admin123'
    WHEN password_hash = '$2b$10$v8Lwm.HY9F2nXDidif88Fe0Oyfy3n2UxLjaNwxFlVar50DVE.3Ld2'
    THEN '✅ Hash pour Passer@123'
    ELSE '❓ Hash inconnu'
  END as hash_type
FROM login_users
WHERE email = 'admin@menuai.com';