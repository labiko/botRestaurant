# 📁 Organisation des Scripts SQL

Organisation automatique créée le 2025-10-17

## 📂 Structure des Dossiers

### 01-schema/ - Scripts de création de structure
### 02-migrations/ - Scripts de modification de structure  
### 03-data/ - Scripts de manipulation de données (insert/update/delete)
### 04-fixes/ - Scripts de correction
### 05-analysis/ - Scripts d'analyse et diagnostic
### 06-verification/ - Scripts de vérification et test
### 07-debug/ - Scripts de débogage
### 08-archive/ - Scripts anciens ou obsolètes

## 🗄️ Backups
- backups/dumps/prod/ - Dumps production
- backups/dumps/dev/ - Dumps développement
- backups/structures/ - Structures extraites

## 📝 Conventions
- MAJUSCULES = Scripts production (UPDATE_, FIX_, ANALYSE_)
- minuscules = Scripts dev (update_, fix_, check_)
