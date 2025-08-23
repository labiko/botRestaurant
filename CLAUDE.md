# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bot Restaurant WhatsApp - Un système de commande multi-restaurants pour Conakry utilisant WhatsApp Business via Green API et Supabase Edge Functions.

## Architecture

- **Backend**: Supabase Edge Functions (TypeScript/Deno)
- **WhatsApp**: Green API (WhatsApp Business API)
- **Database**: Supabase PostgreSQL
- **Architecture**: Clean Architecture + Principes SOLID

## Development Commands

```bash
# Setup initial
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Développement local
supabase start
supabase functions serve webhook-whatsapp

# Base de données
supabase db push                    # Appliquer migrations
supabase db reset                   # Reset avec seed data

# Déploiement
supabase functions deploy webhook-whatsapp
supabase secrets set GREEN_API_TOKEN=your-token
supabase secrets set GREEN_API_INSTANCE_ID=your-instance-id

# Tests
deno test supabase/functions/
```

## Structure du Code

- `supabase/functions/webhook-whatsapp/` : Point d'entrée webhook
- `supabase/functions/_shared/core/` : Interfaces et types
- `supabase/functions/_shared/domain/` : Entités métier
- `supabase/functions/_shared/application/` : Logique applicative
- `supabase/functions/_shared/infrastructure/` : Accès données et APIs externes

## Workflows Principaux

1. **Accueil** : Choix restaurant (géoloc/liste/favori)
2. **Menu** : Sélection numérotée (1,1,3 = 2×plat#1 + 1×plat#3)
3. **Panier** : Récap obligatoire avec confirmation
4. **Mode** : Sur place / À emporter / Livraison
5. **Livraison** : Calcul automatique des frais selon paramètres restaurant
6. **Paiement** : Maintenant (mobile) ou plus tard (cash)

## Points Clés

- Réponses toujours numérotées
- "annuler" fonctionne à tout moment
- Calcul Haversine pour distances
- Sessions avec timeout 30min
- Pagination à 5 items max

## Configuration Requise

- Compte Green API avec WhatsApp Business
- Projet Supabase avec Edge Functions activées
- Variables d'environnement configurées