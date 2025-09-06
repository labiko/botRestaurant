-- Vérifier les types de colonnes pour comprendre le stockage des timestamps
SELECT 
    column_name,
    data_type,
    datetime_precision,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'delivery_tokens' 
AND column_name IN ('updated_at', 'created_at', 'expires_at', 'absolute_expires_at')
ORDER BY ordinal_position;

-- Vérifier aussi pour france_orders
SELECT 
    column_name,
    data_type,
    datetime_precision,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'france_orders' 
AND column_name IN ('assignment_started_at', 'updated_at', 'created_at')
ORDER BY ordinal_position;