-- =========================================
-- MIGRATION: Ajout table france_option_groups
-- Date: 23/09/2025
-- Description: Table pour les groupes d'options prédéfinis
-- =========================================

BEGIN;

-- Créer la table pour les groupes d'options prédéfinis
CREATE TABLE IF NOT EXISTS france_option_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL UNIQUE,
  component_name VARCHAR(200) NOT NULL,
  unit VARCHAR(50) DEFAULT 'choix',
  icon VARCHAR(10) DEFAULT '📋',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_france_option_groups_active
ON france_option_groups (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_france_option_groups_name
ON france_option_groups (group_name);

-- Données initiales prédéfinies
INSERT INTO france_option_groups (group_name, component_name, unit, icon, display_order) VALUES
('Plats', 'Plat au choix', 'choix', '🍽️', 1),
('Boissons', 'Boisson', 'choix', '🥤', 2),
('Desserts', 'Dessert', 'choix', '🍰', 3),
('Entrées', 'Entrée au choix', 'choix', '🥗', 4),
('Suppléments', 'Supplément', 'pièce', '➕', 5),
('Sauces', 'Sauce', 'choix', '🥄', 6),
('Viandes', 'Viande', 'choix', '🥩', 7),
('Fromages', 'Fromage', 'choix', '🧀', 8),
('Légumes', 'Légume', 'choix', '🥬', 9),
('Pains', 'Pain', 'choix', '🥖', 10)
ON CONFLICT (group_name) DO NOTHING;

-- Vérification
SELECT
  id,
  group_name,
  component_name,
  unit,
  icon,
  display_order
FROM france_option_groups
ORDER BY display_order;

COMMIT;

-- =========================================
-- Notes d'utilisation :
-- 1. Cette table remplace le switch hardcodé
-- 2. Les groupes sont maintenant configurables
-- 3. Chaque groupe a son icône et mapping
-- 4. Extensible via interface d'administration
-- =========================================