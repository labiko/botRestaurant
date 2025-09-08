-- 🔄 MIGRATION VERS TEMPLATE UNIVERSEL POUR PIZZAS
-- Transforme le template existant en version universelle configurable

BEGIN;

-- 1. Mettre à jour le template existant pour Pizza Yolo 77 avec configuration étendue
UPDATE france_workflow_templates
SET 
  steps_config = '{
    "enabled": true,
    "apply_to_categories": ["pizzas"],
    "apply_to_menu_categories": ["menu-pizza"],
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
  updated_at = NOW()
WHERE restaurant_id = 1 
AND template_name = 'pizza_unified_display';

-- 2. Créer le template PAR DÉFAUT pour tous les restaurants (restaurant_id = NULL)
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
ON CONFLICT (restaurant_id, template_name) 
DO UPDATE SET 
  steps_config = EXCLUDED.steps_config,
  updated_at = NOW();

-- 3. Créer la table de configuration si elle n'existe pas
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
    "show_size_names": true,
    "inherit_from_default": false
  }'::jsonb
)
ON CONFLICT (restaurant_id) 
DO UPDATE SET 
  use_unified_display = EXCLUDED.use_unified_display,
  custom_settings = EXCLUDED.custom_settings,
  updated_at = NOW();

-- 5. Créer une vue pour simplifier la récupération de config
CREATE OR REPLACE VIEW v_restaurant_pizza_display_config AS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  COALESCE(s.use_unified_display, true) as use_unified_display,
  CASE 
    WHEN rt.steps_config IS NOT NULL THEN 
      -- Config spécifique du restaurant
      rt.steps_config
    WHEN s.custom_settings->>'inherit_from_default' = 'true' OR s.custom_settings IS NULL THEN
      -- Hériter du template par défaut
      (SELECT steps_config FROM france_workflow_templates 
       WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default')
    ELSE 
      -- Config personnalisée ou par défaut
      COALESCE(
        rt.steps_config,
        (SELECT steps_config FROM france_workflow_templates 
         WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default')
      )
  END as display_config,
  s.custom_settings
FROM france_restaurants r
LEFT JOIN france_pizza_display_settings s ON r.id = s.restaurant_id
LEFT JOIN france_workflow_templates rt ON r.id = rt.restaurant_id 
  AND rt.template_name = 'pizza_unified_display';

-- 6. Vérification de la migration
SELECT 
  'Template Pizza Yolo 77' as element,
  EXISTS(
    SELECT 1 FROM france_workflow_templates 
    WHERE restaurant_id = 1 AND template_name = 'pizza_unified_display'
  ) as existe,
  (SELECT steps_config->>'apply_to_categories' FROM france_workflow_templates 
   WHERE restaurant_id = 1 AND template_name = 'pizza_unified_display') as categories
UNION ALL
SELECT 
  'Template Par Défaut' as element,
  EXISTS(
    SELECT 1 FROM france_workflow_templates 
    WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default'
  ) as existe,
  (SELECT steps_config->>'apply_to_categories' FROM france_workflow_templates 
   WHERE restaurant_id IS NULL AND template_name = 'pizza_unified_display_default') as categories
UNION ALL
SELECT 
  'Config Pizza Yolo 77' as element,
  EXISTS(
    SELECT 1 FROM france_pizza_display_settings WHERE restaurant_id = 1
  ) as existe,
  (SELECT use_unified_display::text FROM france_pizza_display_settings WHERE restaurant_id = 1) as categories;

-- 7. Test de la vue pour Pizza Yolo 77
SELECT 
  restaurant_id,
  restaurant_name,
  use_unified_display,
  display_config->>'enabled' as enabled,
  display_config->'apply_to_categories' as pizza_categories,
  custom_settings->>'inherit_from_default' as inherit_default
FROM v_restaurant_pizza_display_config
WHERE restaurant_id = 1;

COMMIT;

-- ✅ Migration réussie
-- Le système est maintenant universel :
-- - Template par défaut pour tous les restaurants
-- - Configuration spécifique possible par restaurant
-- - Vue unifiée pour récupérer la config
-- - Table de settings pour activer/désactiver