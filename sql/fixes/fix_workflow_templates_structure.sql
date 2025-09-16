-- 🔧 CORRECTION - Permettre restaurant_id NULL pour templates universels
-- La table france_workflow_templates doit pouvoir stocker des templates par défaut

BEGIN;

-- 1. Modifier la contrainte pour permettre restaurant_id NULL
ALTER TABLE france_workflow_templates 
ALTER COLUMN restaurant_id DROP NOT NULL;

-- 2. Supprimer la contrainte unique existante et créer une nouvelle
-- (Permet templates avec restaurant_id NULL)
ALTER TABLE france_workflow_templates 
DROP CONSTRAINT IF EXISTS france_workflow_templates_restaurant_id_template_name_key;

-- Créer une nouvelle contrainte unique conditionnelle
CREATE UNIQUE INDEX idx_workflow_templates_unique 
ON france_workflow_templates (
  COALESCE(restaurant_id, -1), 
  template_name
);

-- 3. Vérifier la structure modifiée
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'france_workflow_templates'
AND column_name = 'restaurant_id';

-- 4. Maintenant insérer le template par défaut
INSERT INTO france_workflow_templates (
  restaurant_id,
  template_name,
  description,
  steps_config,
  created_at,
  updated_at
) VALUES (
  NULL, -- NULL = Template par défaut universel
  'pizza_unified_display_default',
  'Template par défaut universel pour affichage des pizzas',
  '{
    "enabled": true,
    "apply_to_categories": ["pizzas", "pizza", "pizzas-artisanales", "nos-pizzas"],
    "apply_to_menu_categories": ["menu-pizza", "menus-pizza", "menu pizza", "menus pizzas"],
    "show_category_header": true,
    "show_restaurant_name": true,
    "show_separator": true,
    "global_numbering": true,
    "ingredient_display": true,
    "format_patterns": {
      "individual": "🎯 *🍕 {name}*\n🧾 {description}\n\n💰 Choisissez votre taille:\n{sizes}",
      "menu_list": "🎯 *📋 {name}*\n🧾 {description}\n\n💰 {price} EUR - Tapez {index}",
      "workflow_step": "🎯 *🍕 {name} {size}*\n🧾 {description}\n💰 Inclus dans le menu - Tapez {index}"
    },
    "size_format": "   🔸 {size_name} ({price} EUR) - Tapez {index}",
    "separator_line": "━━━━━━━━━━━━━━━━━━━━━",
    "footer_messages": {
      "navigation": "💡 Tapez le numéro de votre choix",
      "back": "↩️ Tapez 0 pour revenir au menu principal"
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT ON CONSTRAINT idx_workflow_templates_unique
DO UPDATE SET 
  steps_config = EXCLUDED.steps_config,
  updated_at = NOW();

-- 5. Créer la table de configuration si elle n'existe pas
CREATE TABLE IF NOT EXISTS france_pizza_display_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id),
  use_unified_display BOOLEAN DEFAULT true,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- 6. Activer pour Pizza Yolo 77
INSERT INTO france_pizza_display_settings (
  restaurant_id, 
  use_unified_display, 
  custom_settings
) VALUES (
  1, 
  true,
  '{
    "enable_ingredients": true,
    "enable_global_numbering": true,
    "price_format": "{price} EUR",
    "show_size_names": true
  }'::jsonb
)
ON CONFLICT (restaurant_id) 
DO UPDATE SET 
  use_unified_display = EXCLUDED.use_unified_display,
  custom_settings = EXCLUDED.custom_settings,
  updated_at = NOW();

-- 7. Vérification
SELECT 
  'Template Par Défaut (NULL)' as type,
  template_name,
  restaurant_id,
  steps_config->>'enabled' as enabled
FROM france_workflow_templates 
WHERE restaurant_id IS NULL
UNION ALL
SELECT 
  'Template Pizza Yolo 77' as type,
  template_name,
  restaurant_id,
  steps_config->>'enabled' as enabled
FROM france_workflow_templates 
WHERE restaurant_id = 1 AND template_name LIKE '%pizza%';

COMMIT;

-- ✅ Structure corrigée - Templates universels possibles maintenant