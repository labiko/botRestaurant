-- 🍕 TEMPLATE D'AFFICHAGE UNIFIÉ POUR PIZZAS - VERSION UNIVERSELLE
-- Compatible avec TOUS les restaurants du bot universel
-- Chaque restaurant peut personnaliser son affichage

BEGIN;

-- 1. Créer le template UNIVERSEL (restaurant_id = NULL pour template par défaut)
INSERT INTO france_workflow_templates (
  restaurant_id,
  template_name,
  description,
  steps_config,
  created_at,
  updated_at
) VALUES (
  NULL, -- NULL = Template par défaut pour TOUS les restaurants
  'pizza_unified_display_default',
  'Template par défaut pour affichage unifié des pizzas',
  '{
    "enabled": true,
    "apply_to_categories": ["pizzas", "pizza", "pizzas-artisanales"],
    "apply_to_menu_categories": ["menu-pizza", "menus-pizza", "menu pizza"],
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
ON CONFLICT (restaurant_id, template_name) 
DO UPDATE SET 
  steps_config = EXCLUDED.steps_config,
  updated_at = NOW();

-- 2. Créer une configuration spécifique pour Pizza Yolo 77 (personnalisation possible)
INSERT INTO france_workflow_templates (
  restaurant_id,
  template_name,
  description,
  steps_config,
  created_at,
  updated_at
) VALUES (
  1, -- Pizza Yolo 77
  'pizza_unified_display',
  'Configuration personnalisée Pizza Yolo 77 pour affichage pizzas',
  '{
    "enabled": true,
    "inherit_from": "pizza_unified_display_default",
    "apply_to_categories": ["pizzas"],
    "apply_to_menu_categories": ["menu-pizza"],
    "overrides": {
      "show_restaurant_name": true,
      "separator_line": "━━━━━━━━━━━━━━━━━━━━━"
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (restaurant_id, template_name) 
DO UPDATE SET 
  steps_config = EXCLUDED.steps_config,
  updated_at = NOW();

-- 3. Table de configuration pour activer/désactiver par restaurant
CREATE TABLE IF NOT EXISTS france_pizza_display_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id),
  use_unified_display BOOLEAN DEFAULT true,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- 4. Activer pour Pizza Yolo 77
INSERT INTO france_pizza_display_settings (restaurant_id, use_unified_display, custom_settings)
VALUES (
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

-- 5. Vue pour récupérer facilement la configuration d'un restaurant
CREATE OR REPLACE VIEW v_restaurant_pizza_display_config AS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  COALESCE(s.use_unified_display, true) as use_unified_display,
  COALESCE(
    -- Config spécifique du restaurant
    rt.steps_config,
    -- Sinon config par défaut
    (SELECT steps_config FROM france_workflow_templates WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default')
  ) as display_config,
  s.custom_settings
FROM france_restaurants r
LEFT JOIN france_pizza_display_settings s ON r.id = s.restaurant_id
LEFT JOIN france_workflow_templates rt ON r.id = rt.restaurant_id AND rt.template_name = 'pizza_unified_display';

-- 6. Vérification
SELECT 
  restaurant_id,
  restaurant_name,
  use_unified_display,
  display_config->>'enabled' as enabled,
  display_config->'apply_to_categories' as categories
FROM v_restaurant_pizza_display_config
WHERE restaurant_id IN (1, 2, 3)
LIMIT 5;

COMMIT;

-- ✅ Configuration universelle créée avec succès
-- Chaque restaurant peut :
-- 1. Activer/désactiver l'affichage unifié
-- 2. Personnaliser ses catégories concernées
-- 3. Modifier le format d'affichage
-- 4. Hériter du template par défaut ou le surcharger