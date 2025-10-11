#!/bin/bash
# =========================================
# BACKUP AVANT NETTOYAGE EMOJI NUMÉROS
# =========================================
# Date: 2025-10-11
# Objectif: Sauvegarder france_product_options AVANT modifications
# =========================================

# Créer le répertoire de backup s'il n'existe pas
mkdir -p backups

# Date et heure pour le nom du fichier
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📦 Backup en cours..."

# =========================================
# OPTION 1: BACKUP TABLE COMPLÈTE (RECOMMANDÉ)
# =========================================
# Sauvegarde UNIQUEMENT la table france_product_options avec toutes les données
"/c/Program Files/PostgreSQL/17/bin/pg_dump" \
  --table=france_product_options \
  --data-only \
  "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" \
  > "backups/france_product_options_backup_${TIMESTAMP}.sql"

echo "✅ Backup créé: backups/france_product_options_backup_${TIMESTAMP}.sql"

# =========================================
# OPTION 2: BACKUP OPTIONS CONCERNÉES UNIQUEMENT
# =========================================
# Plus léger: seulement les 32 options avec emoji numéros
"/c/Program Files/PostgreSQL/17/bin/pg_dump" \
  --table=france_product_options \
  --data-only \
  "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" \
  | grep -E "(INSERT INTO|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣)" \
  > "backups/emoji_numeros_only_backup_${TIMESTAMP}.sql"

echo "✅ Backup ciblé créé: backups/emoji_numeros_only_backup_${TIMESTAMP}.sql"

# =========================================
# VÉRIFICATION
# =========================================
echo ""
echo "📊 Vérification des backups:"
ls -lh backups/*${TIMESTAMP}*

echo ""
echo "✅ Backup terminé avec succès!"
echo "   Vous pouvez maintenant exécuter NETTOYAGE_EMOJI_NUMEROS.sql"
echo ""
echo "🔄 Pour restaurer en cas de problème:"
echo "   psql 'postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres' < backups/france_product_options_backup_${TIMESTAMP}.sql"
