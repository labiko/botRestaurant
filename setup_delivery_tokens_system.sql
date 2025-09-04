-- =================================================================
-- SYSTÈME DE TOKENS SÉCURISÉS POUR LIVREURS - BASE DE DONNÉES
-- =================================================================
-- Basé sur PLAN_ACCEPT_COMMANDE_LIVREUR.md
-- Tables nécessaires pour le système de notifications avec liens personnalisés

-- 1. TABLE PRINCIPALE : Tokens sécurisés pour les livreurs
CREATE TABLE delivery_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES france_orders(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES france_delivery_drivers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,           -- Expiration relative (15 min)
  absolute_expires_at TIMESTAMP NOT NULL, -- Expiration absolue (2h)
  used BOOLEAN DEFAULT FALSE,              -- Token utilisé avec succès
  suspended BOOLEAN DEFAULT FALSE,         -- Token temporairement suspendu
  reactivated BOOLEAN DEFAULT FALSE,       -- Token réactivé après refus
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLE DE SUIVI : Actions des livreurs
CREATE TABLE delivery_driver_actions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES france_orders(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES france_delivery_drivers(id) ON DELETE CASCADE,
  token_id INTEGER REFERENCES delivery_tokens(id) ON DELETE SET NULL,
  action_type VARCHAR(20) NOT NULL, -- 'notified', 'link_viewed', 'accepted', 'refused', 'expired'
  action_timestamp TIMESTAMP DEFAULT NOW(),
  details JSONB -- Info supplémentaire (raison refus, device info, etc.)
);

-- 3. TABLE DES REFUS : Refus explicites avec raisons détaillées
CREATE TABLE delivery_refusals (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES france_orders(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES france_delivery_drivers(id) ON DELETE CASCADE,
  token_id INTEGER REFERENCES delivery_tokens(id) ON DELETE SET NULL,
  reason VARCHAR(20), -- 'too_far', 'busy', 'vehicle_issue', 'accident', 'other'
  custom_reason TEXT, -- Raison personnalisée si reason = 'other'
  refused_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABLE DE LOGS : Actions critiques restaurant (Force Release, etc.)
CREATE TABLE delivery_order_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES france_orders(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL, -- 'FORCE_RELEASE', 'MANUAL_ASSIGNMENT', 'MANUAL_REMINDER'
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =================================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =================================================================

-- Index sur delivery_tokens
CREATE INDEX idx_delivery_tokens_order_driver ON delivery_tokens(order_id, driver_id);
CREATE INDEX idx_delivery_tokens_active ON delivery_tokens(token) WHERE used = FALSE AND suspended = FALSE;
CREATE INDEX idx_delivery_tokens_cleanup ON delivery_tokens(absolute_expires_at);
CREATE INDEX idx_delivery_tokens_order ON delivery_tokens(order_id);

-- Index sur delivery_driver_actions
CREATE INDEX idx_delivery_actions_order ON delivery_driver_actions(order_id);
CREATE INDEX idx_delivery_actions_driver ON delivery_driver_actions(driver_id);
CREATE INDEX idx_delivery_actions_timestamp ON delivery_driver_actions(action_timestamp);

-- Index sur delivery_refusals
CREATE INDEX idx_delivery_refusals_order ON delivery_refusals(order_id);
CREATE INDEX idx_delivery_refusals_driver ON delivery_refusals(driver_id);

-- Index sur delivery_order_logs
CREATE INDEX idx_delivery_order_logs_order ON delivery_order_logs(order_id);
CREATE INDEX idx_delivery_order_logs_type ON delivery_order_logs(action_type);

-- =================================================================
-- FONCTIONS SQL POUR LE SYSTÈME
-- =================================================================

-- Fonction 1: Acceptation atomique d'une commande
CREATE OR REPLACE FUNCTION accept_order_atomic(
  p_token VARCHAR(64),
  p_order_id INTEGER,
  p_driver_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Vérifier que la commande est encore disponible
  IF NOT EXISTS (
    SELECT 1 FROM france_orders 
    WHERE id = p_order_id AND status = 'prete' AND driver_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Commande déjà prise ou non disponible';
  END IF;
  
  -- 2. Marquer le token comme utilisé
  UPDATE delivery_tokens 
  SET used = TRUE, expires_at = NOW(), updated_at = NOW()
  WHERE token = p_token AND order_id = p_order_id AND driver_id = p_driver_id;
  
  -- 3. Assigner la commande au livreur
  UPDATE france_orders 
  SET status = 'assignee', driver_id = p_driver_id, updated_at = NOW()
  WHERE id = p_order_id;
  
  -- 4. Suspendre tous les autres tokens de cette commande
  UPDATE delivery_tokens 
  SET suspended = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id AND driver_id != p_driver_id AND used = FALSE;
  
  -- 5. Logger l'acceptation
  INSERT INTO delivery_driver_actions (
    order_id, driver_id, token_id, action_type, details
  ) VALUES (
    p_order_id, 
    p_driver_id, 
    (SELECT id FROM delivery_tokens WHERE token = p_token),
    'accepted',
    jsonb_build_object('token', p_token, 'timestamp', NOW())
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction 2: Forcer la libération d'une commande (Restaurant)
CREATE OR REPLACE FUNCTION force_release_order(
    p_order_id INTEGER,
    p_restaurant_id INTEGER,
    p_reason TEXT DEFAULT 'Liberation forcee par restaurant'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. Vérifier que c'est bien le restaurant propriétaire
    IF NOT EXISTS (
        SELECT 1 FROM france_orders 
        WHERE id = p_order_id AND restaurant_id = p_restaurant_id
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- 2. Suspendre tous les tokens actifs
    UPDATE delivery_tokens 
    SET suspended = true, updated_at = NOW()
    WHERE order_id = p_order_id AND used = false;
    
    -- 3. Logger l'action
    INSERT INTO delivery_order_logs (
        order_id, action_type, details, created_at
    ) VALUES (
        p_order_id, 'FORCE_RELEASE', p_reason, NOW()
    );
    
    -- 4. Remettre la commande en recherche
    UPDATE france_orders 
    SET 
        status = 'prete',
        driver_id = NULL,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction 3: Obtenir les statistiques de tracking pour une commande
CREATE OR REPLACE FUNCTION get_order_delivery_stats(p_order_id INTEGER)
RETURNS TABLE (
  notified_count INTEGER,
  viewed_count INTEGER,
  refused_count INTEGER,
  accepted_count INTEGER,
  last_action_driver_name TEXT,
  last_action_type TEXT,
  last_action_timestamp TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(stats.notified_count, 0)::INTEGER,
    COALESCE(stats.viewed_count, 0)::INTEGER,
    COALESCE(stats.refused_count, 0)::INTEGER,
    COALESCE(stats.accepted_count, 0)::INTEGER,
    last_act.driver_name,
    last_act.action_type,
    last_act.action_timestamp
  FROM (
    SELECT 
      COUNT(*) FILTER (WHERE dda.action_type = 'notified') AS notified_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'link_viewed') AS viewed_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'refused') AS refused_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'accepted') AS accepted_count
    FROM delivery_driver_actions dda
    WHERE dda.order_id = p_order_id
  ) stats
  LEFT JOIN (
    SELECT 
      fdd.first_name || ' ' || COALESCE(fdd.last_name, '') AS driver_name,
      dda.action_type,
      dda.action_timestamp
    FROM delivery_driver_actions dda
    JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
    WHERE dda.order_id = p_order_id
    ORDER BY dda.action_timestamp DESC
    LIMIT 1
  ) last_act ON TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction 4: Nettoyer les anciens tokens expirés (CRON)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM delivery_tokens
  WHERE absolute_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Logger le nettoyage
  INSERT INTO delivery_order_logs (
    order_id, action_type, details, created_at
  ) VALUES (
    NULL, 'TOKEN_CLEANUP', 
    'Cleaned ' || deleted_count || ' expired tokens',
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- TRIGGERS AUTOMATIQUES
-- =================================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_delivery_tokens_updated_at 
    BEFORE UPDATE ON delivery_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =================================================================

-- Insérer quelques tokens de test (décommenter si nécessaire pour les tests)
/*
INSERT INTO delivery_tokens (token, order_id, driver_id, expires_at, absolute_expires_at) VALUES
('test_token_123456789abcdef', 1, 1, NOW() + INTERVAL '15 minutes', NOW() + INTERVAL '2 hours'),
('test_token_987654321fedcba', 2, 2, NOW() + INTERVAL '10 minutes', NOW() + INTERVAL '2 hours');

INSERT INTO delivery_driver_actions (order_id, driver_id, action_type, details) VALUES
(1, 1, 'notified', '{"method": "whatsapp", "timestamp": "2024-01-01T10:00:00"}'),
(2, 2, 'link_viewed', '{"user_agent": "WhatsApp/1.0", "timestamp": "2024-01-01T10:05:00"}');
*/

-- =================================================================
-- VÉRIFICATIONS FINALES
-- =================================================================

-- Vérifier que toutes les tables ont été créées
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename IN (
  'delivery_tokens', 
  'delivery_driver_actions', 
  'delivery_refusals', 
  'delivery_order_logs'
) 
ORDER BY tablename;

-- Vérifier les fonctions
SELECT 
  proname as function_name,
  prokind as kind
FROM pg_proc 
WHERE proname IN (
  'accept_order_atomic',
  'force_release_order', 
  'get_order_delivery_stats',
  'cleanup_expired_tokens'
);

-- =================================================================
-- FIN DU SCRIPT
-- =================================================================
-- Ce script crée toute l'infrastructure nécessaire pour le système
-- de tokens sécurisés avec liens personnalisés pour les livreurs.
-- 
-- Prochaines étapes après exécution:
-- 1. Implémenter DeliveryTokenService côté TypeScript
-- 2. Créer les fonctions de génération/validation de tokens
-- 3. Ajouter l'envoi de notifications WhatsApp
-- 4. Intégrer avec le workflow existant des commandes
-- =================================================================