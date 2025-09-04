-- ============================================
-- VÉRIFICATION SESSION DRINK_SELECTION
-- ============================================

-- 1. Voir toutes les sessions récentes (dernières 24h)
SELECT 
  id,
  phone_whatsapp,
  state,
  created_at,
  updated_at,
  expires_at,
  context->'selectedItemWithDrink' as selected_item,
  context->'availableDrinks' as available_drinks,
  context->'selectedQuantity' as selected_quantity
FROM france_sessions 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;

-- 2. Chercher spécifiquement les sessions DRINK_SELECTION
SELECT 
  id,
  phone_whatsapp,
  state,
  updated_at,
  context
FROM france_sessions 
WHERE state = 'DRINK_SELECTION'
ORDER BY updated_at DESC;

-- 3. Voir les dernières sessions par numéro de téléphone
SELECT DISTINCT ON (phone_whatsapp)
  phone_whatsapp,
  state,
  updated_at,
  context->'selectedItemWithDrink'->>'display_name' as item_name,
  jsonb_array_length(context->'availableDrinks') as drinks_count
FROM france_sessions 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY phone_whatsapp, updated_at DESC;

-- 4. Sessions expirées vs actives
SELECT 
  state,
  COUNT(*) as count,
  CASE WHEN expires_at > NOW() THEN 'ACTIVE' ELSE 'EXPIRED' END as status
FROM france_sessions 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY state, CASE WHEN expires_at > NOW() THEN 'ACTIVE' ELSE 'EXPIRED' END
ORDER BY state, status;