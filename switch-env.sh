#!/bin/bash
# ========================================
# SCRIPT DE BASCULE D'ENVIRONNEMENT
# ========================================

if [ -z "$1" ]; then
  echo "❌ Usage: ./switch-env.sh [dev|prod]"
  echo "📖 Exemples:"
  echo "   ./switch-env.sh dev   # Bascule vers développement"
  echo "   ./switch-env.sh prod  # Bascule vers production"
  exit 1
fi

ENV=$1

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
  echo "❌ Environnement invalide. Utilisez 'dev' ou 'prod'"
  exit 1
fi

echo "🔄 Basculement vers environnement: $ENV"

# Définir la variable d'environnement
export APP_ENV=$ENV

# Déployer avec le nouvel environnement
echo "📦 Déploiement du bot avec environnement $ENV..."
supabase functions deploy bot-resto-france-universel

if [ $? -eq 0 ]; then
  echo "✅ Déploiement réussi!"
  echo "🎯 Le bot utilise maintenant l'environnement: $ENV"

  if [ "$ENV" = "prod" ]; then
    echo "🔴 ENVIRONNEMENT PRODUCTION ACTIF"
  else
    echo "🟡 ENVIRONNEMENT DÉVELOPPEMENT ACTIF"
  fi
else
  echo "❌ Erreur lors du déploiement"
  exit 1
fi