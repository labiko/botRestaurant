-- Migration: Création table green_api_health_logs pour monitoring Green API
-- Date: 2025-09-30
-- Description: Logs des checks de santé Green API avec support notification

CREATE TABLE IF NOT EXISTS green_api_health_logs (
  id BIGSERIAL PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'rebooted', 'critical_failure')),
  state_instance VARCHAR,
  error_message TEXT,
  reboot_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  reboot_success BOOLEAN,
  response_time_ms INTEGER,
  support_notified BOOLEAN DEFAULT FALSE,
  support_notification_sent_at TIMESTAMPTZ,
  support_notification_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_health_logs_checked_at ON green_api_health_logs(checked_at DESC);
CREATE INDEX idx_health_logs_status ON green_api_health_logs(status);
CREATE INDEX idx_health_logs_support_notified ON green_api_health_logs(support_notified);