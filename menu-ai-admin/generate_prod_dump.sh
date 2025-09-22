#!/bin/bash
# ==============================================
# GÉNÉRATION DUMP COMPLET BASE PRODUCTION
# ==============================================
#
# Base PROD: vywbhlnzvfqtiurwmrac.supabase.co
# User: postgres
# Password: p4zN25F7Gfw9Py
#
# Ce script génère un dump complet de toutes les données PROD
# ==============================================

echo "🚀 DÉBUT GÉNÉRATION DUMP PRODUCTION"
echo "=================================================="

# Configuration de connexion
export PGPASSWORD='p4zN25F7Gfw9Py'
HOST='db.vywbhlnzvfqtiurwmrac.supabase.co'
PORT=5432
USER='postgres'
DATABASE='postgres'

# Nom du fichier dump avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="prod_complete_dump_${TIMESTAMP}.sql"

echo "📊 Génération du dump complet..."
echo "Fichier de sortie: ${DUMP_FILE}"

# Génération du dump complet avec données
pg_dump \
  --host="${HOST}" \
  --port="${PORT}" \
  --username="${USER}" \
  --dbname="${DATABASE}" \
  --verbose \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --encoding=UTF8 \
  --no-owner \
  --no-privileges \
  --exclude-schema=information_schema \
  --exclude-schema=pg_catalog \
  --exclude-schema=pg_toast \
  --exclude-schema=extensions \
  --exclude-schema=graphql \
  --exclude-schema=graphql_public \
  --exclude-schema=net \
  --exclude-schema=pgsodium \
  --exclude-schema=pgsodium_masks \
  --exclude-schema=realtime \
  --exclude-schema=storage \
  --exclude-schema=supabase_functions \
  --exclude-schema=vault \
  --exclude-table-data=auth.* \
  --exclude-table-data=storage.* \
  --exclude-table-data=realtime.* \
  --file="${DUMP_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ DUMP GÉNÉRÉ AVEC SUCCÈS"
    echo "=================================================="
    echo "Fichier: ${DUMP_FILE}"
    echo "Taille: $(du -h "${DUMP_FILE}" | cut -f1)"
    echo "Lignes: $(wc -l < "${DUMP_FILE}")"
    echo ""
    echo "📋 UTILISATION:"
    echo "Pour restaurer en DEV:"
    echo "psql -h [DEV_HOST] -U postgres -d postgres -f ${DUMP_FILE}"
    echo "=================================================="
else
    echo "❌ ERREUR LORS DE LA GÉNÉRATION DU DUMP"
    exit 1
fi

# Nettoyage
unset PGPASSWORD

echo "🎯 DUMP PRODUCTION TERMINÉ"