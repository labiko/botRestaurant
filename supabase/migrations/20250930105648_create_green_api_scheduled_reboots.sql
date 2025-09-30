-- Migration: Création table green_api_scheduled_reboots
-- Date: 2025-09-30
-- Description: Configuration reboot planifié quotidien Green API

CREATE TABLE IF NOT EXISTS green_api_scheduled_reboots (
  id BIGSERIAL PRIMARY KEY,
  scheduled_time TIME NOT NULL DEFAULT '03:00:00',
  timezone VARCHAR NOT NULL DEFAULT 'Europe/Paris',
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_scheduled_reboots_enabled ON green_api_scheduled_reboots(is_enabled);

-- Insérer config par défaut (singleton pattern - une seule ligne)
INSERT INTO green_api_scheduled_reboots (scheduled_time, is_enabled)
VALUES ('03:00:00', FALSE);