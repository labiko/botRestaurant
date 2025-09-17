-- Supprimer la session actuelle pour tester createNewSession()
DELETE FROM france_user_sessions WHERE id = 11031;

-- Vérifier suppression
SELECT COUNT(*) as sessions_restantes FROM france_user_sessions WHERE phone_number = '33620951645@c.us';