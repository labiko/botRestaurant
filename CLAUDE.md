# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📌 RÈGLES DE COMMIT ET PUSH

**⚠️ IMPORTANT**: Quand l'utilisateur demande "commit + push" :
- **TOUJOURS faire `git add .`** pour ajouter TOUS les fichiers modifiés
- **NE JAMAIS faire de commits partiels** avec seulement certains fichiers
- **Committer TOUT le projet** à chaque fois
- **Un seul commit global** pour toutes les modifications en cours

## 🎯 PRINCIPE DE NON-RÉGRESSION

**⚠️ IMPORTANT**: Avant toute modification du code, s'assurer que les changements ne cassent pas les workflows existants. Toujours tester les scénarios fonctionnels après chaque modification.

## 🚫 SERVEUR DE DÉVELOPPEMENT

**⚠️ IMPORTANT**: NE JAMAIS essayer de lancer le projet avec `ng serve`, `ionic serve`, ou tout autre commande de serveur de développement. Le projet est toujours déjà lancé du côté utilisateur. Ne pas utiliser les commandes Bash pour démarrer/arrêter/redémarrer des serveurs.

## 🔄 PRINCIPE DE RÉUTILISATION

**⚠️ AVANT DE CRÉER UN NOUVEAU CODE** : Vérifier intégralement dans le code existant et s'assurer que la même logique n'est pas utilisée ailleurs. **PRIVILÉGIER LA RÉUTILISATION** de fonctions existantes plutôt que de dupliquer la logique.

### Étapes obligatoires :
1. **Rechercher** dans le codebase si une fonction similaire existe déjà
2. **Analyser** les fonctions existantes avant d'en créer de nouvelles
3. **Réutiliser** ou **étendre** les fonctions existantes quand possible
4. **Éviter** la duplication de logique métier
5. **Refactoriser** le code dupliqué découvert lors de la recherche

### ✅ Workflows fonctionnels à préserver

1. **Workflow complet avec paiement différé**:
   - `resto` → Liste restaurants
   - Sélection (1-7) → Menu  
   - Ajout panier (ex: "1,1,3") → Récap
   - Mode livraison (1-3) → Paiement
   - Option "2" (plus tard) → Confirmation
   - **Status**: ✅ FONCTIONNEL - Ne pas casser !

2. **Réinitialisation session**:
   - `resto` à tout moment → Reset complet
   - **Status**: ✅ FONCTIONNEL

### 🚧 Workflows à implémenter
- Paiement immédiat Orange Money/Wave
- Gestion adresses livraison
- Recherche par localisation

## Project Overview

Bot Restaurant WhatsApp - Un système de commande multi-restaurants pour Conakry utilisant WhatsApp Business via Green API et Supabase Edge Functions.

## Architecture

- **Backend**: Supabase Edge Functions (TypeScript/Deno)
- **WhatsApp**: Green API (WhatsApp Business API)
- **Database**: Supabase PostgreSQL
- **Architecture**: Architecture simplifiée (single file)

## 📋 RÈGLES DE GESTION DES MENUS

**⚠️ IMPORTANT**: Lors de la création de fichiers de menus pour les restaurants :

### Règles strictes :
1. **NE JAMAIS MODIFIER** le contenu fourni par l'utilisateur
2. **PRENDRE EXACTEMENT** ce qui est donné (texte, ordre, format)
3. **AJOUTER UNIQUEMENT** les icônes modernes appropriées
4. **RESPECTER L'ORDRE** de présentation original
5. **NE PAS RÉORGANISER** par prix ou catégorie
6. **NE PAS CORRIGER** les éventuelles erreurs ou manques (ex: prix manquant)
7. **⚠️ PRIX SUR PLACE UNIQUEMENT** - TOUJOURS prendre les prix sur place, JAMAIS les prix livraison (règle absolue)
8. **INCLURE TOUS LES DÉTAILS** - Compositions complètes des plats (ingrédients, poids, etc.)

### Format standard :
- Reprendre le texte tel quel avec TOUS les détails
- Ajouter une icône moderne en début de ligne
- Garder la mise en forme originale
- Préserver les espaces et la ponctuation
- Inclure la composition complète du plat

### Exemples :
```
Utilisateur donne: "LE CHICKEN — galette de poulet panné,fromage,cornichon — 6,50 €"
Fichier résultat: "🍗 LE CHICKEN — galette de poulet panné,fromage,cornichon — 6,50 €"

Avec détails complets:
"L'AMÉRICAIN — pain brioche, 2 steaks façon bouchère 150g, bacon, œufs, cornichons — 13,50 €"
Fichier résultat: "🇺🇸 L'AMÉRICAIN — pain brioche, 2 steaks façon bouchère 150g, bacon, œufs, cornichons — 13,50 €"
```

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

## Points Clés Techniques

### Base de données - Contraintes IMPORTANTES
- **paiement_mode** accepte UNIQUEMENT : 'maintenant', 'fin_repas', 'recuperation', 'livraison'
- Mapping obligatoire :
  - `sur_place` + paiement différé → `'fin_repas'`
  - `a_emporter` + paiement différé → `'recuperation'`  
  - `livraison` + paiement différé → `'livraison'`

### Session Management
- Préserver `selectedRestaurantId` dans tous les updates de session
- Préserver `menuOrder` pour le mapping correct des items du menu
- Timeout: 30 minutes
- Réinitialisation complète avec commande "resto"

### Règles métier
- Réponses toujours numérotées
- "annuler" fonctionne à tout moment
- Calcul Haversine pour distances
- Pagination à 5 items max
- Format panier: "1,1,3" = 2× item#1 + 1× item#3

## Tests de non-régression obligatoires

Avant chaque déploiement:
1. Test workflow complet: `resto → 1 → 1,1,3 → 1 → 2`
2. Test réinitialisation: `(en commande) → resto`
3. Test validation: `resto → 1 → abc` (doit échouer)

## Configuration Requise

- Compte Green API avec WhatsApp Business
- Projet Supabase avec Edge Functions activées
- Variables d'environnement configurées
- Green API Instance: 8101819298
- Numéro test: 33753058254

## Fichiers de référence base de données

- **Schéma complet**: `C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\setup_database_updated.sql`

## Fichier bot WhatsApp

- **Code principal**: `C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\supabase\functions\webhook-whatsapp\index.ts`