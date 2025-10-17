-- ============================================
-- Requêtes de vérification SANS modification
-- ============================================

-- 1. État actuel de la commande 44
SELECT 
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.assignment_started_at,
    fo.updated_at,
    fo.created_at
FROM france_orders fo
WHERE fo.id = 44;

-- 2. Assignations pour la commande 44
SELECT 
    fa.id,
    fa.order_id,
    fa.driver_id,
    fa.assignment_status,
    fa.created_at,
    fa.responded_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    -- Calcul de l'âge de l'assignation
    EXTRACT(EPOCH FROM (NOW() - fa.created_at))/60 as age_minutes,
    -- Est-ce que c'est expiré selon notre logique (30 minutes)
    CASE 
        WHEN fa.created_at < NOW() - INTERVAL '30 minutes' THEN 'EXPIRÉ (>30min)'
        ELSE 'ACTIF (<30min)'
    END as expiration_status
FROM france_delivery_assignments fa
LEFT JOIN france_delivery_drivers fdd ON fa.driver_id = fdd.id
WHERE fa.order_id = 44
ORDER BY fa.created_at DESC;

-- 3. Tokens pour la commande 44
SELECT 
    dt.id,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.reactivated,
    dt.expires_at,
    dt.updated_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE dt.order_id = 44
ORDER BY dt.updated_at DESC;

-- 4. Résumé de la situation
SELECT 
    'Assignations pending NON expirées' as info,
    COUNT(*) as count
FROM france_delivery_assignments
WHERE order_id = 44
    AND assignment_status = 'pending'
    AND created_at > NOW() - INTERVAL '30 minutes'

UNION ALL

SELECT 
    'Assignations pending EXPIRÉES' as info,
    COUNT(*) as count
FROM france_delivery_assignments
WHERE order_id = 44
    AND assignment_status = 'pending'
    AND created_at <= NOW() - INTERVAL '30 minutes'

UNION ALL

SELECT 
    'Tokens actifs (non utilisés)' as info,
    COUNT(*) as count
FROM delivery_tokens
WHERE order_id = 44
    AND used = false;