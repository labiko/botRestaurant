-- =======================================
-- DEBUG: Vérification livreur pour login
-- =======================================

-- 1. Vérifier si le livreur existe avec les bonnes données
SELECT id, nom, telephone, code_acces, status, is_blocked, is_online
FROM public.delivery_users 
WHERE telephone = '+33667326357';

-- 2. Vérifier avec le code exact
SELECT id, nom, telephone, code_acces, status, is_blocked, is_online
FROM public.delivery_users 
WHERE telephone = '+33667326357' 
  AND code_acces = '523107';

-- 3. Vérifier les conditions complètes de login
SELECT id, nom, telephone, code_acces, status, is_blocked, is_online
FROM public.delivery_users 
WHERE telephone = '+33667326357' 
  AND code_acces = '523107'
  AND status = 'actif'
  AND is_blocked = false;

-- 4. Voir tous les livreurs pour comparaison
SELECT id, nom, telephone, code_acces, status, is_blocked, is_online
FROM public.delivery_users 
ORDER BY created_at DESC;