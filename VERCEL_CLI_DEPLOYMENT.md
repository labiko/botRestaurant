# 🚀 GUIDE DÉPLOIEMENT VERCEL CLI

Guide complet pour déployer un projet Next.js sur Vercel via CLI en contournant les problèmes de webhook timeout.

## 📋 CONTEXTE

**Problème :** Les webhooks GitHub → Vercel connaissent des timeouts fréquents depuis septembre 2024, empêchant les déploiements automatiques.

**Solution :** Utilisation de Vercel CLI pour déploiement direct et fiable.

---

## 🛠️ PRÉREQUIS

### Installation Vercel CLI
```bash
npm install -g vercel
```

### Vérification de l'installation
```bash
vercel --version
```

---

## 🔐 ÉTAPE 1 : CONNEXION

### Se connecter à Vercel
```bash
vercel login
```

**Process :**
1. **Saisir votre email** Vercel
2. **Vérifier votre boîte mail** → Code de vérification
3. **Entrer le code** dans le terminal
4. **Confirmation** : "Logged in to [votre-email]"

---

## 📂 ÉTAPE 2 : NAVIGATION

### Aller dans le dossier du projet
```bash
cd path/to/your/next-project
```

**Exemple pour ce projet :**
```bash
cd C:/Users/diall/Documents/IonicProjects/Claude/botRestaurant/menu-ai-admin
```

---

## 🔗 ÉTAPE 3 : LIAISON DU PROJET

### Première liaison (nouveau projet)
```bash
vercel link
```

**Réponses aux prompts :**
- **Set up and deploy?** → `y` (yes)
- **Which scope?** → Sélectionner votre compte/équipe
- **Link to existing project?** → `y` si projet existe, `n` pour nouveau
- **Project name?** → Nom du projet (ex: `menu-ai-admin`)

### Liaison forcée (projet existant avec problèmes)
```bash
vercel link --yes
```

---

## 🚀 ÉTAPE 4 : DÉPLOIEMENT

### Déploiement en production
```bash
vercel --prod --yes
```

### Déploiement avec confirmation manuelle
```bash
vercel --prod
```

### Déploiement preview (développement)
```bash
vercel
```

---

## 🔧 RÉSOLUTION DES PROBLÈMES COURANTS

### Erreur : "The provided path does not exist"

**Cause :** Configuration incorrecte du Root Directory dans Vercel

**Solution :**
1. Aller sur : `https://vercel.com/[votre-compte]/[projet]/settings`
2. **General** → **Root Directory** : Laisser **vide** ou mettre `.`
3. **Save** puis réessayer le déploiement

### Erreur : "The specified token is not valid"

**Solution :**
```bash
vercel login
```

### Erreur : Configuration locale corrompue

**Solution Windows :**
```bash
# Supprimer le dossier .vercel
rmdir /s .vercel

# Relancer la liaison
vercel link --yes
```

**Solution Linux/Mac :**
```bash
# Supprimer le dossier .vercel
rm -rf .vercel

# Relancer la liaison
vercel link --yes
```

---

## 📊 PROCESSUS DE DÉPLOIEMENT

### Ce qui se passe lors du déploiement :

1. **Upload des fichiers** (~17MB pour ce projet)
2. **Allocation des ressources** (Build machine: 2 cores, 8 GB)
3. **Installation des dépendances** (`npm install`)
4. **Build Next.js** (`next build`)
5. **Déploiement des outputs**
6. **Attribution de l'URL finale**

### URLs générées :
- **URL temporaire** : `https://[projet]-[hash]-[compte].vercel.app`
- **URL d'inspection** : Pour voir les logs détaillés
- **URL de production** : `https://[projet].vercel.app`

---

## ✅ AVANTAGES VERCEL CLI

- **🚀 Contourne les timeouts webhook** GitHub ↔ Vercel
- **📊 Logs en temps réel** durant le build
- **🎯 Contrôle total** sur le processus
- **⚡ Déploiement direct** sans intermédiaire
- **🔄 Retry facile** en cas d'échec

---

## 🎯 COMMANDES ESSENTIELLES

### Déploiement complet depuis zéro
```bash
# 1. Connexion
vercel login

# 2. Navigation
cd path/to/project

# 3. Liaison
vercel link --yes

# 4. Déploiement
vercel --prod --yes
```

### Déploiement rapide (projet déjà lié)
```bash
cd path/to/project
vercel --prod --yes
```

### Vérification du statut
```bash
vercel list
vercel inspect [deployment-url]
```

---

## 📝 NOTES IMPORTANTES

### Variables d'environnement
- Les variables **NEXT_PUBLIC_*** sont automatiquement incluses
- Vérifier que toutes les variables nécessaires sont configurées sur Vercel Dashboard

### Temps de déploiement
- **Upload** : ~30 secondes (selon taille projet)
- **Build** : 2-5 minutes (selon complexité)
- **Total** : 3-6 minutes en moyenne

### Monitoring
- Utiliser l'URL d'**Inspect** pour suivre les logs détaillés
- Dashboard Vercel pour historique des déploiements

---

## 🔍 VÉRIFICATION POST-DÉPLOIEMENT

### Tester les APIs déployées
```bash
# Exemple pour ce projet
curl https://menu-ai-admin.vercel.app/api/deployment/restaurants
```

### Vérifier les logs d'erreur
1. Dashboard Vercel → Projet → Deployments
2. Cliquer sur le déploiement → **Runtime Logs**

---

## 🆘 SUPPORT

### Commandes de diagnostic
```bash
vercel --debug
vercel whoami
vercel list
```

### Ressources utiles
- **Documentation** : https://vercel.com/docs/cli
- **Status Vercel** : https://vercel-status.com
- **Community** : https://vercel.com/community

---

## 📅 DERNIÈRE MISE À JOUR

**Date** : Septembre 2025
**Version Vercel CLI** : 44.5.5+
**Testé avec** : Next.js 15.5.3, Node.js 18+

---

**🎉 Ce guide résout définitivement les problèmes de webhook timeout Vercel !**