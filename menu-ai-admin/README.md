# 🤖 Menu AI Modifier

Automatisation intelligente des modifications de menu avec IA pour le système Bot Restaurant.

<!-- Test webhook déploiement automatique -->

## 🎯 Objectif

Cette application permet d'automatiser les modifications de menu des restaurants en utilisant l'intelligence artificielle. L'IA analyse les commandes en langage naturel et génère automatiquement le SQL correspondant.

## ✨ Fonctionnalités

- **Analyse IA** : Conversion de commandes naturelles en SQL précis
- **Interface Web** : Interface intuitive pour les modifications
- **Multi-environnement** : Support DEV et PRODUCTION avec sécurité
- **Prévisualisation** : Aperçu des modifications avant exécution
- **Validation** : Contrôles de sécurité pour éviter les commandes dangereuses

## 🚀 Types de commandes supportées

### ✅ Duplication de produits
```
Duplique L'AMERICAIN en MINI AMERICAIN à 8€
```

### ✅ Ajout à une catégorie
```
Ajouter Coca Cherry 33CL - 2.50€ dans BOISSONS
```

### ✅ Modification de prix
```
Changer prix AMERICAIN de 13.50€ à 14€
```

## 🛠️ Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration des variables d'environnement

Copier `.env.local.example` vers `.env.local` et configurer :

```env
# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Supabase DEV
NEXT_PUBLIC_SUPABASE_URL=https://lphvdoyhwaelmwdfkfuh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key

# Supabase PROD
NEXT_PUBLIC_SUPABASE_URL_PROD=https://vywbhlnzvfqtiurwmrac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=your-prod-anon-key

# Environnement par défaut
NEXT_PUBLIC_ENVIRONMENT=DEV

# Chemin vers les données extraites
DATA_FILE_PATH=C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\DATA\DATABASE\data.txt
```

### 3. Configuration Supabase

Exécuter le script de configuration SQL dans Supabase :

```sql
-- Exécuter le contenu de supabase-setup.sql
-- Ce script crée la fonction execute_sql et la table de logs
```

### 4. Extraction des données template

S'assurer que le fichier `data.txt` contient les données extraites du système existant. Ce fichier est utilisé par l'IA pour comprendre la structure et les workflows.

## 🚀 Lancement

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

L'application sera disponible sur `http://localhost:3000`

## 🔒 Sécurité

### Protections implémentées

- ✅ **Validation SQL** : Interdiction des commandes dangereuses (DROP, TRUNCATE, DELETE)
- ✅ **Confirmation PROD** : Double confirmation pour l'environnement production
- ✅ **Logging** : Toutes les exécutions SQL sont loggées
- ✅ **Environnements séparés** : DEV et PROD complètement isolés

### Commandes SQL interdites

- `DROP TABLE`
- `TRUNCATE`
- `DELETE FROM`
- `ALTER TABLE`

Seules les commandes `INSERT` et `UPDATE` sont autorisées.

## 📊 Workflow d'utilisation

1. **Sélection environnement** : Choisir DEV ou PROD
2. **Saisie commande** : Entrer la commande en langage naturel
3. **Analyse IA** : L'IA génère le SQL et un aperçu
4. **Vérification** : Contrôler le SQL généré et l'aperçu
5. **Exécution** : Valider et exécuter sur la base de données

## 🧠 Intelligence Artificielle

L'IA utilise les données template existantes pour :
- Comprendre la structure des produits et catégories
- Reproduire les workflows et configurations
- Générer du SQL précis avec les bons IDs
- Calculer automatiquement les prix livraison (+1€)

## 📁 Structure du projet

```
menu-ai-admin/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Interface principale
│   │   └── api/
│   │       ├── analyze-command/  # Analyse IA
│   │       └── execute-sql/      # Exécution SQL
│   └── lib/
│       ├── data-loader.ts        # Chargement données template
│       └── types.ts              # Types TypeScript
├── supabase-setup.sql            # Configuration base de données
└── .env.local.example            # Template configuration
```

## 🔧 Maintenance

### Logs d'exécution

Toutes les exécutions SQL sont loggées dans la table `sql_execution_log` :

```sql
SELECT * FROM sql_execution_log ORDER BY executed_at DESC;
```

### Mise à jour des données template

Pour mettre à jour les données utilisées par l'IA, re-extraire la base avec le script `extract_complete_database.sql`.

## ⚠️ Important

- **Toujours tester sur DEV** avant la production
- **Vérifier le SQL généré** avant exécution
- **Faire des sauvegardes** avant les modifications importantes
- **Ce système modifie uniquement** les éléments existants, il ne crée pas de nouveaux restaurants

## 🆘 Support

En cas de problème :
1. Vérifier les logs dans la console du navigateur
2. Consulter les logs Supabase dans `sql_execution_log`
3. Tester sur l'environnement DEV d'abord
