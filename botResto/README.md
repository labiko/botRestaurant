# 🤖 Bot Resto Conakry

Système moderne de gestion de commandes et livraisons pour restaurants via WhatsApp Business.

## ✨ Fonctionnalités

- 🍽️ **Gestion Restaurant** : Interface complète pour les restaurants
- 🚴‍♂️ **Gestion Livreurs** : Tableau de bord pour les livreurs
- 📱 **WhatsApp Integration** : Bot automatisé pour prendre les commandes
- 💳 **Gestion Paiements** : Support Orange Money, Wave, et paiement cash
- 📊 **Analytics** : Statistiques et rapports détaillés
- 🎨 **Interface Moderne** : Design responsive avec animations

## 🚀 Déploiement Automatique

Ce projet est configuré pour le déploiement automatique sur Vercel via GitHub Actions.

### Configuration GitHub Secrets

Ajoutez les secrets suivants dans votre repository GitHub (Settings > Secrets and variables > Actions):

```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id  
VERCEL_PROJECT_ID=your-vercel-project-id
```

### Workflow de Déploiement

- **Push sur `master`** → Déploiement en production
- **Pull Request** → Déploiement preview avec commentaire automatique
- **Build optimisé** → Angular AOT + Tree shaking + Compression

## 🛠️ Développement Local

### Prérequis

- Node.js 18+
- npm ou yarn
- Ionic CLI

### Installation

```bash
cd botResto
npm install
```

### Scripts Disponibles

```bash
# Développement
npm start                 # Serveur de développement
npm run serve:prod       # Serveur en mode production

# Build
npm run build           # Build production standard
npm run build:prod      # Build optimisé avec AOT
npm run build:vercel    # Build spécifique Vercel

# Tests & Quality
npm run test            # Tests unitaires
npm run lint            # Linting ESLint
```

## 📦 Structure du Projet

```
botResto/
├── src/
│   ├── app/
│   │   ├── auth/                 # Authentification
│   │   ├── features/
│   │   │   ├── restaurant/       # Fonctionnalités restaurant
│   │   │   └── delivery/         # Fonctionnalités livreur
│   │   ├── core/                 # Services core
│   │   ├── shared/               # Composants partagés
│   │   └── home/                 # Page d'accueil
│   ├── assets/                   # Images, icons, etc.
│   └── theme/                    # Styles globaux
├── .github/workflows/            # GitHub Actions
├── vercel.json                   # Configuration Vercel
└── package.json
```

## 🎨 Design System

### Couleurs Principales

- **Primary Purple**: `#8B5CF6` - Couleur principale
- **Primary Green**: `#84CC16` - Couleur secondaire  
- **Secondary Purple**: `#A78BFA` - Accents
- **Secondary Green**: `#A3E635` - Accents verts

### Composants

- Logo personnalisé avec robot + cloche restaurant
- Splashscreen animé au démarrage
- Animations CSS modernes (feu, fumée, particules)
- Interface responsive mobile-first

## 🔧 Configuration

### Variables d'Environnement

Copiez `.env.example` vers `.env` et configurez:

```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# App
APP_VERSION=1.0.0
NODE_ENV=production
```

### Base de Données

Le schéma complet est disponible dans `setup_database_updated.sql`.

## 📱 WhatsApp Bot

Le bot WhatsApp est déployé séparément via Supabase Edge Functions:

```bash
supabase functions deploy webhook-whatsapp
```

## 🚀 URLs de Déploiement

- **Production**: https://bot-resto-conakry.vercel.app
- **Preview**: Généré automatiquement pour chaque PR

## 📄 Licence

© 2024 Bot Resto Conakry - Tous droits réservés

---

**Développé avec ❤️ par l'équipe Bot Resto Conakry**