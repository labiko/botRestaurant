-- =====================================================
-- MISE À JOUR DE LA FONCTION POUR SUPPRESSION FORCÉE
-- Supprime tous les contrôles de vérification
-- =====================================================

CREATE OR REPLACE FUNCTION archive_and_delete_restaurant(
  p_restaurant_id UUID,
  p_archived_by UUID DEFAULT NULL,
  p_archive_reason TEXT DEFAULT 'Suppression complète demandée'
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  archived_data JSONB
) AS $$
DECLARE
  v_restaurant_name VARCHAR;
  v_archived_counts JSONB DEFAULT '{}'::jsonb;
  v_error_message TEXT;
  v_count INTEGER;
BEGIN
  -- Vérifier que le restaurant existe
  SELECT nom INTO v_restaurant_name 
  FROM restaurants 
  WHERE id = p_restaurant_id;
  
  IF v_restaurant_name IS NULL THEN
    RETURN QUERY SELECT 
      false::BOOLEAN, 
      'Restaurant non trouvé'::TEXT, 
      NULL::JSONB;
    RETURN;
  END IF;

  -- SUPPRESSION FORCÉE - PAS DE VÉRIFICATIONS
  -- Début de la transaction
  BEGIN
    -- 1. Archiver le restaurant principal
    INSERT INTO archive_restaurants 
    SELECT 
      id, nom, adresse, ville, quartier, telephone, phone_whatsapp,
      email, latitude, longitude, logo_url, banner_url, description,
      cuisine_types, heures_ouverture, created_at, updated_at, status,
      is_active, can_delivery, delivery_fee, delivery_min_amount,
      delivery_max_distance_km, min_preparation_time, max_preparation_time,
      currency, zone_livraison, deleted_at, allow_pay_now,
      NOW() as archived_at,
      p_archived_by,
      p_archive_reason
    FROM restaurants 
    WHERE id = p_restaurant_id;
    
    -- 2. Archiver les commandes (toutes, même récentes)
    INSERT INTO archive_commandes 
    SELECT *, NOW() as archived_at
    FROM commandes 
    WHERE restaurant_id = p_restaurant_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_archived_counts := v_archived_counts || jsonb_build_object('commandes', v_count);
    
    -- 3. Archiver les paiements (même en cours)
    BEGIN
      INSERT INTO archive_restaurant_payments 
      SELECT *, NOW() as archived_at
      FROM restaurant_payments 
      WHERE restaurant_id = p_restaurant_id;
      GET DIAGNOSTICS v_count = ROW_COUNT;
      v_archived_counts := v_archived_counts || jsonb_build_object('payments', v_count);
    EXCEPTION WHEN undefined_table THEN
      v_archived_counts := v_archived_counts || jsonb_build_object('payments', 0);
    END;
    
    -- 4. Archiver les menus
    INSERT INTO archive_menus 
    SELECT *, NOW() as archived_at
    FROM menus 
    WHERE restaurant_id = p_restaurant_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_archived_counts := v_archived_counts || jsonb_build_object('menus', v_count);
    
    -- 5. Archiver les utilisateurs restaurant
    INSERT INTO archive_restaurant_users 
    SELECT *, NOW() as archived_at
    FROM restaurant_users 
    WHERE restaurant_id = p_restaurant_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_archived_counts := v_archived_counts || jsonb_build_object('users', v_count);
    
    -- 6. Archiver les livreurs
    BEGIN
      INSERT INTO archive_delivery_users 
      SELECT *, NOW() as archived_at
      FROM delivery_users 
      WHERE restaurant_id = p_restaurant_id;
      GET DIAGNOSTICS v_count = ROW_COUNT;
      v_archived_counts := v_archived_counts || jsonb_build_object('delivery_users', v_count);
    EXCEPTION WHEN undefined_table THEN
      v_archived_counts := v_archived_counts || jsonb_build_object('delivery_users', 0);
    END;
    
    -- SUPPRESSION FORCÉE DE TOUTES LES DONNÉES
    -- =========================================
    
    -- Supprimer les sessions actives (forcer déconnexion)
    BEGIN
      DELETE FROM sessions 
      WHERE user_id IN (
        SELECT id FROM restaurant_users WHERE restaurant_id = p_restaurant_id
      ) OR user_id IN (
        SELECT id FROM delivery_users WHERE restaurant_id = p_restaurant_id
      );
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les logs de statut
    BEGIN
      DELETE FROM restaurant_status_logs WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les analytics
    BEGIN
      DELETE FROM restaurant_analytics WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les configs de paiement
    BEGIN
      DELETE FROM restaurant_payment_config WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les configs de livraison
    BEGIN
      DELETE FROM restaurant_delivery_config WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les paiements (même en cours)
    BEGIN
      DELETE FROM restaurant_payments WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les menus
    DELETE FROM menus WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les utilisateurs et déconnecter
    DELETE FROM restaurant_users WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les livreurs
    BEGIN
      DELETE FROM delivery_users WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Supprimer les commandes (même récentes et en cours)
    DELETE FROM commandes WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les abonnements et factures
    BEGIN
      DELETE FROM invoices 
      WHERE subscription_id IN (
        SELECT id FROM restaurant_subscriptions WHERE restaurant_id = p_restaurant_id
      );
      DELETE FROM restaurant_subscriptions WHERE restaurant_id = p_restaurant_id;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
    
    -- Nettoyer les références dans clients
    UPDATE clients 
    SET restaurant_favori_id = NULL 
    WHERE restaurant_favori_id = p_restaurant_id;
    
    -- ENFIN, supprimer le restaurant
    DELETE FROM restaurants WHERE id = p_restaurant_id;
    
    -- Retourner le succès
    RETURN QUERY SELECT 
      true::BOOLEAN,
      format('Restaurant "%s" supprimé définitivement avec archivage complet (FORCE DELETE)', v_restaurant_name)::TEXT,
      jsonb_build_object(
        'restaurant_name', v_restaurant_name,
        'restaurant_id', p_restaurant_id,
        'archived_at', NOW(),
        'archived_by', p_archived_by,
        'archive_reason', p_archive_reason,
        'force_delete', true,
        'archived_counts', v_archived_counts
      );
      
  EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, annuler toute la transaction
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    
    RETURN QUERY SELECT 
      false::BOOLEAN,
      format('Erreur lors de la suppression forcée: %s', v_error_message)::TEXT,
      jsonb_build_object(
        'error', v_error_message,
        'restaurant_id', p_restaurant_id,
        'force_delete_failed', true
      );
  END;
  
END;
$$ LANGUAGE plpgsql;

-- Confirmer le déploiement
SELECT 'Fonction mise à jour pour suppression forcée sans vérifications' as status;