-- ============================================
-- Requêtes de vérification du bouton "📨 Envoyer rappel"
-- Commande 44 - AVANT et APRÈS le clic
-- ============================================

-- 1. AVANT le clic - État initial des assignations
SELECT 
    'AVANT RAPPEL - Assignations' as info,
    fa.id,
    fa.order_id,
    fa.driver_id,
    fa.assignment_status,
    fa.created_at,
    fa.responded_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    EXTRACT(EPOCH FROM (NOW() - fa.created_at))/60 as age_minutes
FROM france_delivery_assignments fa
LEFT JOIN france_delivery_drivers fdd ON fa.driver_id = fdd.id
WHERE fa.order_id = 44
ORDER BY fa.created_at DESC;

-- 2. AVANT le clic - État initial des tokens
SELECT 
    'AVANT RAPPEL - Tokens' as info,
    dt.id,
    dt.order_id,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.reactivated,
    dt.expires_at,
    dt.updated_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN dt.expires_at > NOW() THEN 'ACTIF'
        ELSE 'EXPIRÉ'
    END as token_status
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE dt.order_id = 44
ORDER BY dt.updated_at DESC;

-- 3. État de la commande
SELECT 
    'COMMANDE 44 - État' as info,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.assignment_started_at,
    fo.updated_at
FROM france_orders fo
WHERE fo.id = 44;

-- ============================================
-- À EXÉCUTER APRÈS avoir cliqué sur "📨 Envoyer rappel"
-- ============================================

-- 4. APRÈS le clic - Vérifier les changements sur les tokens
-- (Les tokens doivent être réactivés avec expires_at mis à jour)
SELECT 
    'APRÈS RAPPEL - Tokens réactivés' as info,
    dt.id,
    dt.order_id,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.reactivated,
    dt.expires_at,
    dt.updated_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN dt.expires_at > NOW() THEN 'ACTIF ✅'
        ELSE 'EXPIRÉ ❌'
    END as token_status,
    -- Vérifier si le token a été mis à jour récemment (dernières 2 minutes)
    CASE 
        WHEN dt.updated_at > NOW() - INTERVAL '2 minutes' THEN 'RÉCEMMENT MIS À JOUR ✅'
        ELSE 'ANCIEN'
    END as recent_update
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE dt.order_id = 44
ORDER BY dt.updated_at DESC;

-- 5. APRÈS le clic - Les assignations doivent rester inchangées
-- (Le rappel ne crée PAS de nouvelles assignations, juste réactive les tokens)
SELECT 
    'APRÈS RAPPEL - Assignations (doivent être identiques)' as info,
    fa.id,
    fa.order_id,
    fa.driver_id,
    fa.assignment_status,
    fa.created_at,
    fa.responded_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    EXTRACT(EPOCH FROM (NOW() - fa.created_at))/60 as age_minutes
FROM france_delivery_assignments fa
LEFT JOIN france_delivery_drivers fdd ON fa.driver_id = fdd.id
WHERE fa.order_id = 44
ORDER BY fa.created_at DESC;

-- 6. Vérifier qu'aucune nouvelle assignation n'a été créée
SELECT 
    'NOUVELLES ASSIGNATIONS - Ne doit rien retourner' as info,
    COUNT(*) as count
FROM france_delivery_assignments
WHERE order_id = 44
    AND created_at > NOW() - INTERVAL '2 minutes';

-- 7. Vérifier que la commande reste dans le même état
SELECT 
    'COMMANDE 44 - État après rappel' as info,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.assignment_started_at,
    fo.updated_at,
    CASE 
        WHEN fo.updated_at > NOW() - INTERVAL '2 minutes' THEN 'RÉCEMMENT MIS À JOUR'
        ELSE 'INCHANGÉ'
    END as update_status
FROM france_orders fo
WHERE fo.id = 44;

-- ============================================
-- Résumé de ce qui DOIT se passer avec "📨 Envoyer rappel" :
-- ============================================
-- ✅ Tokens: expires_at prolongé, reactivated = true, updated_at récent
-- ✅ Assignations: AUCUN changement (mêmes ID, status, created_at)
-- ✅ Commande: assignment_started_at possiblement mis à jour
-- ❌ PAS de nouvelles assignations créées
-- ❌ PAS d'erreur de contrainte unique