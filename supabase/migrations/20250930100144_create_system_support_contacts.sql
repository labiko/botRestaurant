-- Migration: Création table system_support_contacts pour notifications support
-- Date: 2025-09-30
-- Description: Stockage des contacts support à notifier en cas d'erreur critique Green API

CREATE TABLE IF NOT EXISTS system_support_contacts (
  id BIGSERIAL PRIMARY KEY,
  contact_type VARCHAR NOT NULL CHECK (contact_type IN ('primary', 'secondary', 'emergency')),
  phone_number VARCHAR NOT NULL, -- Format: 33620951645@c.us
  full_name VARCHAR NOT NULL,
  email VARCHAR,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notification_priority INTEGER DEFAULT 1, -- 1 = haute, 2 = moyenne, 3 = basse
  available_hours JSONB DEFAULT '{"start": "00:00", "end": "23:59"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_support_contacts_active ON system_support_contacts(is_active, notification_priority);
CREATE INDEX idx_support_contacts_type ON system_support_contacts(contact_type);

-- Insérer contact support par défaut
INSERT INTO system_support_contacts (contact_type, phone_number, full_name, notification_priority)
VALUES ('primary', '33620951645@c.us', 'Admin Principal', 1);