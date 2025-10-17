-- =========================================================================
-- SYNCHRONISATION PAYS DEV → PROD
-- Basé sur log.txt
-- ⚠️ À EXÉCUTER SUR PROD
-- =========================================================================

-- Les 3 premiers pays (FR, GN, CI) sont identiques en DEV et PROD → RIEN À FAIRE

-- =========================================================================
-- INSERTION DES 3 NOUVEAUX PAYS (ML, SN, BF)
-- =========================================================================

-- ID 4 - Mali
INSERT INTO supported_countries (id, code, name, flag, phone_prefix, remove_leading_zero, phone_format, is_active, display_order)
SELECT 4, 'ML', 'Mali', '🇲🇱', '223', false, '^[67]\d{7}$', true, 4
WHERE NOT EXISTS (SELECT 1 FROM supported_countries WHERE id = 4);

-- ID 5 - Sénégal
INSERT INTO supported_countries (id, code, name, flag, phone_prefix, remove_leading_zero, phone_format, is_active, display_order)
SELECT 5, 'SN', 'Sénégal', '🇸🇳', '221', false, '^7[0678]\d{7}$', true, 5
WHERE NOT EXISTS (SELECT 1 FROM supported_countries WHERE id = 5);

-- ID 6 - Burkina Faso
INSERT INTO supported_countries (id, code, name, flag, phone_prefix, remove_leading_zero, phone_format, is_active, display_order)
SELECT 6, 'BF', 'Burkina Faso', '🇧🇫', '226', false, '^[567]\d{7}$', true, 6
WHERE NOT EXISTS (SELECT 1 FROM supported_countries WHERE id = 6);

-- Réinitialiser séquence
SELECT setval('supported_countries_id_seq', 6);

-- Vérification
SELECT id, code, name, phone_prefix, is_active, display_order FROM supported_countries ORDER BY display_order;
