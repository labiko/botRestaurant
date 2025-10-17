-- Supprimer la session existante qui empêche la création d'une nouvelle session
DELETE FROM france_user_sessions WHERE id = 11030;

-- Vérifier qu'elle est bien supprimée
SELECT COUNT(*) as sessions_restantes FROM france_user_sessions WHERE phone_number = '33620951645@c.us';