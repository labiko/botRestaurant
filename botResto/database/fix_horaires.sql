-- ===============================================
-- CORRECTION DES HORAIRES CORROMPUS
-- ===============================================
-- Restaurant ID: a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90

-- Corriger les horaires JSONB du restaurant Brasserie de Savigny
UPDATE restaurants 
SET horaires = '{
  "lundi": {"ouverture": "19:00", "fermeture": "22:00"},
  "mardi": {"ouverture": "19:00", "fermeture": "22:00"},
  "mercredi": {"ouverture": "19:00", "fermeture": "22:00"},
  "jeudi": {"ouverture": "19:00", "fermeture": "22:00"},
  "vendredi": {"ouverture": "19:00", "fermeture": "23:00"},
  "samedi": {"ouverture": "19:00", "fermeture": "23:00"},
  "dimanche": {"ouverture": "11:00", "fermeture": "22:00"}
}'::jsonb
WHERE id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90';

-- Vérifier la correction
SELECT id, nom, horaires 
FROM restaurants 
WHERE id = 'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90';