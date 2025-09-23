-- 🔐 CRÉATION TABLE LOGIN USERS
-- ================================

-- Table pour l'authentification des utilisateurs admin
CREATE TABLE IF NOT EXISTS login_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les recherches par email
CREATE INDEX IF NOT EXISTS idx_login_users_email ON login_users(email);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_login_users_updated_at ON login_users;
CREATE TRIGGER update_login_users_updated_at
    BEFORE UPDATE ON login_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les colonnes
COMMENT ON TABLE login_users IS 'Table d''authentification pour les utilisateurs admin MenuAI';
COMMENT ON COLUMN login_users.email IS 'Email unique de l''utilisateur';
COMMENT ON COLUMN login_users.password_hash IS 'Hash du mot de passe (bcrypt)';
COMMENT ON COLUMN login_users.last_login IS 'Timestamp de la dernière connexion';
COMMENT ON COLUMN login_users.created_at IS 'Date de création du compte';
COMMENT ON COLUMN login_users.updated_at IS 'Date de dernière modification';

-- Utilisateur admin par défaut (password: "admin123")
-- Hash bcrypt pour "admin123": $2b$10$rN5Zo0p5ELYo.EJm6wjUm.8.KjBtN8qgQyG8YjQm5Zr4Qm7XqVcuW
INSERT INTO login_users (email, password_hash)
VALUES ('admin@menuai.com', '$2b$10$rN5Zo0p5ELYo.EJm6wjUm.8.KjBtN8qgQyG8YjQm5Zr4Qm7XqVcuW')
ON CONFLICT (email) DO NOTHING;

-- Afficher le résultat
SELECT 'Table login_users créée avec succès!' as message;
SELECT 'Utilisateur admin créé: admin@menuai.com / admin123' as info;