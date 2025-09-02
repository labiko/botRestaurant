-- ÉTAPE 2 : Migration données existantes

-- Script de migration automatique
-- Peupler avec les catégories actuelles de Pizza Yolo 77
INSERT INTO restaurant_categories (restaurant_id, category_key, category_name, emoji, ordre) 
SELECT 
  'b4f2f614-5152-48fd-9acd-35b17d9c1d9a', -- Pizza Yolo 77
  category_key, 
  category_name, 
  emoji,
  ordre
FROM (VALUES 
  ('pizza', 'PIZZAS', '🍕', 1),
  ('burger', 'BURGERS', '🍔', 2),
  ('sandwich', 'SANDWICHS', '🥪', 3),
  ('taco', 'TACOS', '🌮', 4),
  ('pates', 'PÂTES', '🍝', 5),
  ('salade', 'SALADES', '🥗', 6),
  ('assiette', 'ASSIETTES', '🍽️', 7),
  ('naan', 'NAANS', '🫓', 8),
  ('accompagnement', 'ACCOMPAGNEMENTS', '🍟', 9),
  ('entree', 'ENTRÉES', '🥗', 10),
  ('dessert', 'DESSERTS', '🍰', 11),
  ('boisson', 'BOISSONS', '🥤', 12)
) AS categories(category_key, category_name, emoji, ordre);