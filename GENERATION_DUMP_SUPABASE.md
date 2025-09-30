# 📦 GUIDE GÉNÉRATION DUMPS SUPABASE

Guide simple pour gérer vos bases de données DEV et PROD avec Supabase CLI.

---

## 🔧 1. CONFIGURATION INITIALE

### Vérifier la version installée
```bash
supabase --version
# Version actuelle: v2.31.8
```

### Mettre à jour Supabase CLI (recommandé)
```bash
# Windows (via PowerShell en admin)
scoop update supabase

# Alternative: Télécharger depuis
# https://github.com/supabase/cli/releases
```

---

## 🔗 2. CONFIGURATION DES PROJETS

### Projet DEV (déjà configuré)
```bash
cd C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant
supabase link --project-ref lphvdoyhwaelmwdfkfuh
```

### Projet PROD
```bash
cd C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant
supabase link --project-ref vywbhlnzvfqtiurwmrac
```

**Note**: Un seul projet peut être "linked" à la fois dans un dossier. Pour gérer les deux, utiliser `--project-ref` dans chaque commande.

---

## 💾 3. GÉNÉRATION DE DUMPS

### 🎯 MÉTHODE 1: Dump complet avec pg_dump (RECOMMANDÉ - 1 seul fichier)

**Export complet DEV (schéma + données en 1 fichier)**
```bash
pg_dump "postgresql://postgres.lphvdoyhwaelmwdfkfuh:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" > dev_complete_dump.sql
```

**Export complet PROD (schéma + données en 1 fichier)**
```bash
pg_dump "postgresql://postgres.vywbhlnzvfqtiurwmrac:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" > prod_complete_dump.sql
```

**Avec horodatage automatique (format: export_database_prod_30_09_2025_09h_30.sql)**
```bash
# DEV
pg_dump "postgresql://postgres.lphvdoyhwaelmwdfkfuh:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" > "export_database_dev_$(date +%d_%m_%Y_%Hh_%M).sql"

# PROD
pg_dump "postgresql://postgres.vywbhlnzvfqtiurwmrac:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" > "export_database_prod_$(date +%d_%m_%Y_%Hh_%M).sql"
```

**Exemple de noms générés**:
- `export_database_dev_30_09_2025_09h_30.sql`
- `export_database_prod_30_09_2025_14h_45.sql`

---

### 📦 MÉTHODE 2: Dumps séparés avec Supabase CLI (si besoin de contrôle fin)

**Export complet DEV (2 fichiers)**
```bash
# 1. Schéma (structure)
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh --data-only=false -f dev_schema.sql

# 2. Données
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh --schema-only=false -f dev_data.sql
```

**Export complet PROD (2 fichiers)**
```bash
# 1. Schéma (structure)
supabase db dump --project-ref vywbhlnzvfqtiurwmrac --data-only=false -f prod_schema.sql

# 2. Données
supabase db dump --project-ref vywbhlnzvfqtiurwmrac --schema-only=false -f prod_data.sql
```

---

## 📊 4. DUMPS PARTIELS

### Schéma uniquement (structure sans données)
```bash
# DEV
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh --data-only=false -f dev_schema_only.sql

# PROD
supabase db dump --project-ref vywbhlnzvfqtiurwmrac --data-only=false -f prod_schema_only.sql
```

### Données uniquement (sans structure)
```bash
# DEV
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh --schema-only=false -f dev_data_only.sql

# PROD
supabase db dump --project-ref vywbhlnzvfqtiurwmrac --schema-only=false -f prod_data_only.sql
```

### Tables spécifiques
```bash
# Exporter uniquement les tables de commandes
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh \
  --table france_orders \
  --table france_order_items \
  -f orders_backup.sql
```

---

## 🔄 5. IMPORT DE DUMPS

### Méthode 1: Via psql (recommandé)

**Récupérer la chaîne de connexion**:
```bash
# DEV
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh --db-url
# Affiche: postgresql://postgres.lphvdoyhwaelmwdfkfuh:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# PROD
supabase db dump --project-ref vywbhlnzvfqtiurwmrac --db-url
# Affiche: postgresql://postgres.vywbhlnzvfqtiurwmrac:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Importer un dump**:
```bash
# Importer dans DEV
psql "postgresql://postgres.lphvdoyhwaelmwdfkfuh:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f votre_dump.sql

# Importer dans PROD
psql "postgresql://postgres.vywbhlnzvfqtiurwmrac:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f votre_dump.sql
```

### Méthode 2: Via Supabase Dashboard
1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet (DEV ou PROD)
3. Aller dans "SQL Editor"
4. Coller le contenu du fichier .sql
5. Exécuter

---

## 🔀 6. COPIER PROD VERS DEV

### Étape 1: Exporter PROD
```bash
supabase db dump --project-ref vywbhlnzvfqtiurwmrac -f prod_backup.sql
```

### Étape 2: Nettoyer DEV (ATTENTION: supprime toutes les données)
```bash
supabase db reset --project-ref lphvdoyhwaelmwdfkfuh
```

### Étape 3: Importer dans DEV
```bash
psql "postgresql://postgres.lphvdoyhwaelmwdfkfuh:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f prod_backup.sql
```

---

## 📁 7. ORGANISATION DES DUMPS

### Structure recommandée
```
botRestaurant/
├── backups/
│   ├── dev/
│   │   ├── dev_dump_20250930_083000.sql
│   │   ├── dev_dump_20250930_140000.sql
│   │   └── ...
│   ├── prod/
│   │   ├── prod_dump_20250930_083000.sql
│   │   ├── prod_dump_20250930_140000.sql
│   │   └── ...
│   └── migration/
│       ├── prod_to_dev_20250930.sql
│       └── ...
```

### Créer les dossiers
```bash
cd C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant
mkdir -p backups/dev backups/prod backups/migration
```

### Export organisé
```bash
# DEV
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh -f "backups/dev/dev_dump_$(date +%Y%m%d_%H%M%S).sql"

# PROD
supabase db dump --project-ref vywbhlnzvfqtiurwmrac -f "backups/prod/prod_dump_$(date +%Y%m%d_%H%M%S).sql"
```

---

## ⚙️ 8. SCRIPTS AUTOMATISÉS

### Script backup quotidien (backup_daily.sh)
```bash
#!/bin/bash
# Créer dans: C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\scripts\

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="C:/Users/diall/Documents/IonicProjects/Claude/botRestaurant/backups"

# Backup PROD
echo "🔄 Backup PROD en cours..."
supabase db dump --project-ref vywbhlnzvfqtiurwmrac -f "$BACKUP_DIR/prod/prod_$DATE.sql"
echo "✅ Backup PROD terminé: prod_$DATE.sql"

# Backup DEV
echo "🔄 Backup DEV en cours..."
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh -f "$BACKUP_DIR/dev/dev_$DATE.sql"
echo "✅ Backup DEV terminé: dev_$DATE.sql"

# Nettoyer les backups > 7 jours
find "$BACKUP_DIR/prod" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR/dev" -name "*.sql" -mtime +7 -delete

echo "🎉 Backup terminé!"
```

### Rendre exécutable
```bash
chmod +x scripts/backup_daily.sh
```

### Planifier avec Task Scheduler (Windows)
1. Ouvrir "Planificateur de tâches"
2. Créer une tâche de base
3. Nom: "Supabase Daily Backup"
4. Déclencheur: Quotidien à 3h00
5. Action: Démarrer un programme
6. Programme: `C:\Program Files\Git\bin\bash.exe`
7. Arguments: `C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\scripts\backup_daily.sh`

---

## 🆘 9. COMMANDES UTILES

### Vérifier la connexion
```bash
# DEV
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh --db-url

# PROD
supabase db dump --project-ref vywbhlnzvfqtiurwmrac --db-url
```

### Lister les migrations
```bash
supabase migration list --project-ref lphvdoyhwaelmwdfkfuh
```

### Comparer DEV avec migrations locales
```bash
supabase db diff --project-ref lphvdoyhwaelmwdfkfuh
```

### Appliquer les migrations
```bash
supabase db push --project-ref lphvdoyhwaelmwdfkfuh
```

---

## ⚠️ 10. BONNES PRATIQUES

### ✅ À FAIRE
- Toujours faire un backup AVANT une migration importante
- Tester les imports sur DEV avant PROD
- Nommer les dumps avec horodatage
- Garder au moins 7 jours de backups PROD
- Vérifier le dump après export (`ls -lh backup.sql`)

### ❌ À ÉVITER
- Ne JAMAIS faire `db reset` sur PROD sans backup
- Ne pas importer des dumps DEV dans PROD (données de test)
- Ne pas committer les dumps dans Git (trop lourds)
- Ne pas stocker les mots de passe en clair dans les scripts

---

## 📞 11. AIDE ET DÉPANNAGE

### Aide Supabase CLI
```bash
supabase db dump --help
supabase db reset --help
supabase migration --help
```

### Documentation officielle
- https://supabase.com/docs/guides/cli
- https://supabase.com/docs/guides/cli/local-development

### Vérifier logs d'erreur
```bash
# Si un dump échoue, vérifier les permissions
supabase projects list
```

---

## 🎯 12. EXEMPLE COMPLET: WORKFLOW HEBDOMADAIRE

```bash
# Lundi matin: Backup PROD
cd C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant
supabase db dump --project-ref vywbhlnzvfqtiurwmrac -f "backups/prod/prod_$(date +%Y%m%d).sql"

# Mercredi: Synchroniser DEV avec PROD
pg_dump "postgresql://postgres.vywbhlnzvfqtiurwmrac:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" > "backups/migration/prod_to_dev_$(date +%Y%m%d).sql"
supabase db reset --project-ref lphvdoyhwaelmwdfkfuh
psql "postgresql://postgres.lphvdoyhwaelmwdfkfuh:p4zN25F7Gfw9Py@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f "backups/migration/prod_to_dev_$(date +%Y%m%d).sql"

# Vendredi: Backup DEV avant tests weekend
supabase db dump --project-ref lphvdoyhwaelmwdfkfuh -f "backups/dev/dev_$(date +%Y%m%d).sql"
```

---

**🎉 Vous êtes prêt à gérer vos bases Supabase comme un pro !**