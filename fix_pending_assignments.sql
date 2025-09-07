-- ============================================
-- Script de nettoyage et test des assignations pending
-- ============================================

-- 1. Vérifier l'état actuel des assignations pending
SELECT 
    fa.id,
    fa.order_id,
    fa.driver_id,
    fa.assignment_status,
    fa.created_at,
    fa.responded_at,
    fo.order_number,
    fo.status as order_status,
    fo.driver_id as order_driver_id,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN fa.created_at < NOW() - INTERVAL '30 minutes' THEN 'EXPIRÉ'
        ELSE 'ACTIF'
    END as expiration_status
FROM france_delivery_assignments fa
JOIN france_orders fo ON fa.order_id = fo.id
LEFT JOIN france_delivery_drivers fdd ON fa.driver_id = fdd.id
WHERE fa.assignment_status = 'pending'
ORDER BY fa.created_at DESC;

-- 2. Supprimer l'assignation pending bloquante pour la commande 44
-- (Exécuter uniquement si nécessaire)
DELETE FROM france_delivery_assignments 
WHERE order_id = 44 
AND assignment_status = 'pending';

-- 3. Nettoyer toutes les assignations pending expirées (> 30 minutes)
UPDATE france_delivery_assignments
SET 
    assignment_status = 'expired',
    updated_at = NOW()
WHERE 
    assignment_status = 'pending'
    AND created_at < NOW() - INTERVAL '30 minutes'
    AND order_id IN (
        SELECT id FROM france_orders 
        WHERE driver_id IS NULL
    );

-- 4. Vérifier le résultat après nettoyage
SELECT 
    'Assignations pending actives' as type,
    COUNT(*) as count
FROM france_delivery_assignments
WHERE assignment_status = 'pending'
AND created_at > NOW() - INTERVAL '30 minutes'

UNION ALL

SELECT 
    'Assignations expirées' as type,
    COUNT(*) as count
FROM france_delivery_assignments
WHERE assignment_status = 'expired'

UNION ALL

SELECT 
    'Commandes prêtes sans livreur' as type,
    COUNT(*) as count
FROM france_orders
WHERE status = 'prete'
AND driver_id IS NULL;

-- 5. Créer une fonction pour auto-expirer les assignations (optionnel)
CREATE OR REPLACE FUNCTION auto_expire_pending_assignments()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE france_delivery_assignments
    SET 
        assignment_status = 'expired',
        updated_at = NOW()
    WHERE 
        assignment_status = 'pending'
        AND created_at < NOW() - INTERVAL '30 minutes'
        AND order_id IN (
            SELECT id FROM france_orders 
            WHERE driver_id IS NULL
        );
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Test de la fonction (optionnel)
-- SELECT auto_expire_pending_assignments() as expired_assignments;

-- 7. Vérifier spécifiquement la commande 44
SELECT 
    'Commande 44' as info,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.assignment_started_at,
    fo.updated_at,
    COUNT(fa.id) as pending_assignments_count
FROM france_orders fo
LEFT JOIN france_delivery_assignments fa 
    ON fo.id = fa.order_id 
    AND fa.assignment_status = 'pending'
WHERE fo.id = 44
GROUP BY fo.id, fo.order_number, fo.status, fo.driver_id, fo.assignment_started_at, fo.updated_at;