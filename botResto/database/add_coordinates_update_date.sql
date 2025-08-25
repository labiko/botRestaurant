-- ===============================================
-- 🚀 AJOUT COLONNE DATE MISE À JOUR COORDONNÉES LIVREUR
-- ===============================================
-- Script pour ajouter une colonne pour tracker la dernière mise à jour des coordonnées

-- Ajouter colonne pour la date de mise à jour des coordonnées
ALTER TABLE delivery_users 
ADD COLUMN IF NOT EXISTS coordinates_updated_at TIMESTAMP WITH TIME ZONE;

-- Ajouter colonne pour la précision GPS (en mètres)
ALTER TABLE delivery_users 
ADD COLUMN IF NOT EXISTS accuracy NUMERIC;

-- Ajouter un index sur cette colonne pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_delivery_users_coordinates_updated_at 
ON delivery_users(coordinates_updated_at);

-- Mettre à jour la colonne updated_at existante quand les coordonnées changent
-- (Ceci sera géré programmatiquement dans le service)

-- Commentaire: Cette colonne permettra de tracker quand les coordonnées 
-- du livreur ont été mises à jour pour la dernière fois, utile pour 
-- s'assurer que les calculs de distance sont basés sur des données récentes.

-- Pour tester la structure modifiée:
-- SELECT id, nom, telephone, latitude, longitude, accuracy, coordinates_updated_at 
-- FROM delivery_users 
-- WHERE coordinates_updated_at IS NOT NULL;