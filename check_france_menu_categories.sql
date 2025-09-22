-- Vérifier l'existence de france_menu_categories
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'france_menu_categories';

-- Voir la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'france_menu_categories'
ORDER BY ordinal_position;

-- Compter le nombre total de catégories
SELECT COUNT(*) as total_categories FROM france_menu_categories;

-- Voir toutes les catégories avec leur restaurant
SELECT
  r.name as restaurant_name,
  c.name as category_name,
  c.is_active,
  c.display_order
FROM france_menu_categories c
JOIN france_restaurants r ON c.restaurant_id = r.id
ORDER BY r.name, c.display_order;