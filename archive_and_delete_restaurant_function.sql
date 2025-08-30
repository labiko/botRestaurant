-- =====================================================
-- FONCTION D'ARCHIVAGE ET SUPPRESSION COMPLÈTE D'UN RESTAURANT
-- Option 2: Hard Delete avec Archivage
-- =====================================================

-- Fonction principale d'archivage et suppression
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
  v_archived_count JSONB;
  v_error_message TEXT;
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

  -- Début de la transaction
  BEGIN
    -- 1. Archiver le restaurant principal
    INSERT INTO archive_restaurants 
    SELECT 
      *,
      NOW() as archived_at,
      p_archived_by,
      p_archive_reason
    FROM restaurants 
    WHERE id = p_restaurant_id;
    
    -- 2. Archiver les commandes
    WITH archived_commandes AS (
      INSERT INTO archive_commandes 
      SELECT *, NOW() as archived_at
      FROM commandes 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'commandes' FROM archived_commandes;
    
    -- 3. Archiver les paiements
    WITH archived_payments AS (
      INSERT INTO archive_restaurant_payments 
      SELECT *, NOW() as archived_at
      FROM restaurant_payments 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'payments' FROM archived_payments;
    
    -- 4. Archiver les menus
    WITH archived_menus AS (
      INSERT INTO archive_menus 
      SELECT *, NOW() as archived_at
      FROM menus 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'menus' FROM archived_menus;
    
    -- 5. Archiver les utilisateurs restaurant
    WITH archived_users AS (
      INSERT INTO archive_restaurant_users 
      SELECT *, NOW() as archived_at
      FROM restaurant_users 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'users' FROM archived_users;
    
    -- 6. Archiver les livreurs
    WITH archived_delivery AS (
      INSERT INTO archive_delivery_users 
      SELECT *, NOW() as archived_at
      FROM delivery_users 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'delivery_users' FROM archived_delivery;
    
    -- 7. Archiver les analytics
    WITH archived_analytics AS (
      INSERT INTO archive_restaurant_analytics 
      SELECT *, NOW() as archived_at
      FROM restaurant_analytics 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'analytics' FROM archived_analytics;
    
    -- 8. Archiver les configs de paiement
    WITH archived_payment_config AS (
      INSERT INTO archive_restaurant_payment_config 
      SELECT *, NOW() as archived_at
      FROM restaurant_payment_config 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'payment_config' FROM archived_payment_config;
    
    -- 9. Archiver les configs de livraison
    WITH archived_delivery_config AS (
      INSERT INTO archive_restaurant_delivery_config 
      SELECT *, NOW() as archived_at
      FROM restaurant_delivery_config 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'delivery_config' FROM archived_delivery_config;
    
    -- 10. Archiver les abonnements
    WITH archived_subscriptions AS (
      INSERT INTO archive_restaurant_subscriptions 
      SELECT *, NOW() as archived_at
      FROM restaurant_subscriptions 
      WHERE restaurant_id = p_restaurant_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO v_archived_count->>'subscriptions' FROM archived_subscriptions;
    
    -- 11. Supprimer les données dans l'ordre inverse des dépendances
    
    -- Supprimer les logs de statut
    DELETE FROM restaurant_status_logs WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les invoices liées aux abonnements
    DELETE FROM invoices 
    WHERE subscription_id IN (
      SELECT id FROM restaurant_subscriptions WHERE restaurant_id = p_restaurant_id
    );
    
    -- Supprimer les sessions des utilisateurs
    DELETE FROM sessions 
    WHERE user_id IN (
      SELECT id FROM restaurant_users WHERE restaurant_id = p_restaurant_id
    ) OR user_id IN (
      SELECT id FROM delivery_users WHERE restaurant_id = p_restaurant_id
    );
    
    -- Supprimer les paiements
    DELETE FROM restaurant_payments WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les configs
    DELETE FROM restaurant_payment_config WHERE restaurant_id = p_restaurant_id;
    DELETE FROM restaurant_delivery_config WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les analytics
    DELETE FROM restaurant_analytics WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les menus
    DELETE FROM menus WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les utilisateurs et livreurs
    DELETE FROM delivery_users WHERE restaurant_id = p_restaurant_id;
    DELETE FROM restaurant_users WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les commandes
    DELETE FROM commandes WHERE restaurant_id = p_restaurant_id;
    
    -- Supprimer les abonnements
    DELETE FROM restaurant_subscriptions WHERE restaurant_id = p_restaurant_id;
    
    -- Nettoyer les références dans clients (mettre à NULL)
    UPDATE clients 
    SET restaurant_favori_id = NULL 
    WHERE restaurant_favori_id = p_restaurant_id;
    
    -- 12. Supprimer le restaurant
    DELETE FROM restaurants WHERE id = p_restaurant_id;
    
    -- Retourner le succès
    RETURN QUERY SELECT 
      true::BOOLEAN,
      format('Restaurant "%s" archivé et supprimé avec succès', v_restaurant_name)::TEXT,
      jsonb_build_object(
        'restaurant_name', v_restaurant_name,
        'restaurant_id', p_restaurant_id,
        'archived_at', NOW(),
        'archived_by', p_archived_by,
        'archive_reason', p_archive_reason,
        'archived_counts', v_archived_count
      );
      
  EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, annuler toute la transaction
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    
    RETURN QUERY SELECT 
      false::BOOLEAN,
      format('Erreur lors de l''archivage: %s', v_error_message)::TEXT,
      jsonb_build_object(
        'error', v_error_message,
        'restaurant_id', p_restaurant_id
      );
  END;
  
END;
$$ LANGUAGE plpgsql;

-- Fonction de vérification avant suppression
CREATE OR REPLACE FUNCTION check_restaurant_can_be_deleted(p_restaurant_id UUID)
RETURNS TABLE (
  can_delete BOOLEAN,
  reason TEXT,
  stats JSONB
) AS $$
DECLARE
  v_recent_orders_count INTEGER;
  v_pending_payments_count INTEGER;
  v_active_deliveries_count INTEGER;
BEGIN
  -- Vérifier les commandes récentes (moins de 30 jours)
  SELECT COUNT(*) INTO v_recent_orders_count
  FROM commandes
  WHERE restaurant_id = p_restaurant_id
    AND created_at > NOW() - INTERVAL '30 days'
    AND statut NOT IN ('annulee', 'terminee', 'livree');
  
  -- Vérifier les paiements en attente
  SELECT COUNT(*) INTO v_pending_payments_count
  FROM restaurant_payments
  WHERE restaurant_id = p_restaurant_id
    AND status IN ('PENDING', 'PROCESSING');
  
  -- Vérifier les livraisons actives
  SELECT COUNT(*) INTO v_active_deliveries_count
  FROM commandes
  WHERE restaurant_id = p_restaurant_id
    AND statut = 'en_livraison';
  
  -- Déterminer si on peut supprimer
  IF v_recent_orders_count > 0 OR v_pending_payments_count > 0 OR v_active_deliveries_count > 0 THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Restaurant avec activité récente ne peut pas être supprimé'::TEXT,
      jsonb_build_object(
        'recent_orders', v_recent_orders_count,
        'pending_payments', v_pending_payments_count,
        'active_deliveries', v_active_deliveries_count
      );
  ELSE
    RETURN QUERY SELECT 
      true::BOOLEAN,
      'Restaurant peut être supprimé en toute sécurité'::TEXT,
      jsonb_build_object(
        'total_orders', (SELECT COUNT(*) FROM commandes WHERE restaurant_id = p_restaurant_id),
        'total_menus', (SELECT COUNT(*) FROM menus WHERE restaurant_id = p_restaurant_id),
        'total_users', (SELECT COUNT(*) FROM restaurant_users WHERE restaurant_id = p_restaurant_id)
      );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction de restauration depuis les archives (en cas d'erreur)
CREATE OR REPLACE FUNCTION restore_restaurant_from_archive(
  p_restaurant_id UUID,
  p_archived_at TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_restaurant_exists BOOLEAN;
BEGIN
  -- Vérifier que le restaurant n'existe pas déjà
  SELECT EXISTS(SELECT 1 FROM restaurants WHERE id = p_restaurant_id)
  INTO v_restaurant_exists;
  
  IF v_restaurant_exists THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Restaurant existe déjà, impossible de restaurer'::TEXT;
    RETURN;
  END IF;
  
  BEGIN
    -- Restaurer le restaurant
    INSERT INTO restaurants
    SELECT 
      id, nom, adresse, ville, quartier, telephone, phone_whatsapp, 
      email, latitude, longitude, logo_url, banner_url, description,
      cuisine_types, heures_ouverture, created_at, updated_at, status,
      is_active, can_delivery, delivery_fee, delivery_min_amount,
      delivery_max_distance_km, min_preparation_time, max_preparation_time,
      currency, zone_livraison, deleted_at
    FROM archive_restaurants
    WHERE id = p_restaurant_id 
      AND archived_at = p_archived_at;
    
    -- Restaurer les menus
    INSERT INTO menus
    SELECT 
      id, restaurant_id, categorie, nom, description, prix, prix_promo,
      image_url, is_available, is_active, ordre, options, created_at, updated_at
    FROM archive_menus
    WHERE restaurant_id = p_restaurant_id 
      AND archived_at = p_archived_at;
    
    -- Restaurer les utilisateurs
    INSERT INTO restaurant_users
    SELECT 
      id, restaurant_id, telephone, password, role, nom, email,
      is_active, last_login, created_at, updated_at
    FROM archive_restaurant_users
    WHERE restaurant_id = p_restaurant_id 
      AND archived_at = p_archived_at;
    
    -- Note: Les commandes et paiements ne sont pas restaurés par défaut
    -- car ils représentent des transactions historiques
    
    RETURN QUERY SELECT 
      true::BOOLEAN,
      'Restaurant restauré avec succès depuis les archives'::TEXT;
      
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      format('Erreur lors de la restauration: %s', SQLERRM)::TEXT;
  END;
END;
$$ LANGUAGE plpgsql;

-- Permissions
GRANT EXECUTE ON FUNCTION archive_and_delete_restaurant TO authenticated;
GRANT EXECUTE ON FUNCTION check_restaurant_can_be_deleted TO authenticated;
GRANT EXECUTE ON FUNCTION restore_restaurant_from_archive TO authenticated;

-- Commentaires
COMMENT ON FUNCTION archive_and_delete_restaurant IS 'Archive toutes les données d''un restaurant puis les supprime de la base principale';
COMMENT ON FUNCTION check_restaurant_can_be_deleted IS 'Vérifie si un restaurant peut être supprimé en toute sécurité';
COMMENT ON FUNCTION restore_restaurant_from_archive IS 'Restaure un restaurant depuis les archives en cas d''erreur';