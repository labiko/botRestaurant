-- 🍕 CRÉATION DU TEMPLATE D'AFFICHAGE UNIFIÉ POUR PIZZAS
-- Ce template sera utilisé pour formater l'affichage des pizzas de manière cohérente
-- SANS MODIFIER le comportement existant des autres produits

BEGIN;

-- 1. Créer le template pour l'affichage unifié des pizzas
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
  'Template unifié pour affichage des pizzas avec descriptions d''ingrédients',
  '{
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
    "separator_line": "━━━━━━━━━━━━━━━━━━━━━"
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (restaurant_id, template_name) 
DO UPDATE SET 
  steps_config = EXCLUDED.steps_config,
  updated_at = NOW();

-- 2. Vérification du template créé
SELECT 
  template_name,
  description,
  steps_config->>'show_separator' as show_separator,
  steps_config->>'global_numbering' as global_numbering,
  steps_config->'format_patterns'->>'individual' as format_individual
FROM france_workflow_templates
WHERE restaurant_id = 1
AND template_name = 'pizza_unified_display';

COMMIT;

-- ✅ Template créé avec succès
-- Ce template sera utilisé par PizzaDisplayService pour formater l'affichage