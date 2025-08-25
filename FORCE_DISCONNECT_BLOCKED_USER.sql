-- =============================================
-- DÉCONNEXION FORCÉE DU LIVREUR BLOQUÉ
-- =============================================
-- À exécuter pour déconnecter immédiatement le livreur balde dieynaba (ID: 6)

-- 1. Marquer comme offline
UPDATE public.delivery_users 
SET is_online = false, 
    updated_at = now() 
WHERE id = 6 
  AND is_blocked = true;

-- 2. Supprimer toutes les sessions actives de ce livreur
DELETE FROM public.user_sessions 
WHERE user_id = 6 
  AND user_type = 'delivery';

-- 3. Vérifier le résultat
SELECT id, nom, telephone, is_blocked, is_online, updated_at 
FROM public.delivery_users 
WHERE id = 6;