# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📌 RÈGLES DE COMMIT ET PUSH

**⚠️ IMPORTANT**: Quand l'utilisateur demande "commit + push" :
- **TOUJOURS faire `git add .`** pour ajouter TOUS les fichiers modifiés
- **NE JAMAIS faire de commits partiels** avec seulement certains fichiers
- **Committer TOUT le projet** à chaque fois
- **Un seul commit global** pour toutes les modifications en cours

## 🔄 STRATÉGIE DE BRANCHES

**⚠️ RÈGLES CRITIQUES DE DÉVELOPPEMENT** :

### **🛡️ PROTECTION MASTER**
- **MASTER = PRODUCTION** : Ne jamais modifier directement
- **Commit sur master** uniquement pour sauvegarder l'état stable actuel
- **❌ NE JAMAIS MERGER DEV → MASTER** sans demande explicite de l'utilisateur
- **Master reste intouchable** pendant le développement
- **PAR DÉFAUT : Commit + push UNIQUEMENT sur DEV**

### **🚀 BRANCHE DE DÉVELOPPEMENT**
- **BRANCHE PAR DÉFAUT** : `dev` pour tout le développement
- **Tous les changements** se font sur la branche `dev`
- **Tests et expérimentations** uniquement sur `dev`
- **Déploiements depuis `dev`** pour tester

### **📋 WORKFLOW OBLIGATOIRE**
1. **TOUJOURS travailler sur `dev`** par défaut
2. **Commit + push sur `dev`** pour tous les changements
3. **NE JAMAIS merger vers master** sans instruction explicite
4. **Master = Production** - Intouchable sauf demande utilisateur
5. **Merge vers master** SEULEMENT sur demande explicite utilisateur

## 🎯 PRINCIPE DE NON-RÉGRESSION

**⚠️ IMPORTANT**: Avant toute modification du code, s'assurer que les changements ne cassent pas les workflows existants. Toujours tester les scénarios fonctionnels après chaque modification.

## 🚫 SERVEUR DE DÉVELOPPEMENT

**⚠️ IMPORTANT**: NE JAMAIS essayer de lancer le projet avec `ng serve`, `ionic serve`, ou tout autre commande de serveur de développement. Le projet est toujours déjà lancé du côté utilisateur. Ne pas utiliser les commandes Bash pour démarrer/arrêter/redémarrer des serveurs.

## ⚠️ INTERDICTION ABSOLUE - GESTION NODE_MODULES

**🚨 RÈGLE CRITIQUE** - Ces commandes détruisent l'environnement de travail :

### **❌ STRICTEMENT INTERDIT :**
- **`rm -rf node_modules`** - JAMAIS supprimer node_modules !
- **`npm install`** après suppression de node_modules - Casse l'environnement !
- **`npm install --legacy-peer-deps`** - Corrompt les dépendances existantes !
- **Toute suppression de package-lock.json** - Détruit la stabilité !

### **✅ POURQUOI C'EST INTERDIT :**
- **L'environnement fonctionne** avec les node_modules existants
- **La suppression casse** Angular 20 + Ionic 8 qui marchent parfaitement
- **npm install** réinstalle des versions incompatibles
- **Récupération difficile** - Nécessite backup utilisateur

### **✅ CE QU'IL FAUT FAIRE À LA PLACE :**
- **Utiliser l'environnement existant** qui fonctionne
- **NE JAMAIS toucher aux node_modules** sauf instruction explicite utilisateur
- **En cas de problème** : demander à l'utilisateur s'il a un backup
- **Pour les dépendances** : vérifier d'abord avec `npm list`

**🔒 RAPPEL** : Si ça fonctionne, NE PAS Y TOUCHER !

## 🌍 BOT UNIVERSEL PAR DÉFAUT

**⚠️ IMPORTANT**: Sauf indication contraire explicite de l'utilisateur, TOUJOURS travailler sur le **bot WhatsApp universel** :
- **Fichier principal** : `supabase/functions/bot-resto-france-universel/index.ts`
- **Services universels** : `supabase/functions/bot-resto-france-universel/services/`
- **Tables universelles** : `restaurants`, `menu_items`, etc.
- **Deploy universel** : `supabase functions deploy bot-resto-france-universel`
- **⚠️ DÉPLOIEMENT OBLIGATOIRE** : TOUJOURS déployer sur environnement DEV en premier

Le bot universel est la version de production active qui gère tous les pays. Ne travailler sur les bots spécifiques que si l'utilisateur le demande explicitement.

## 🤖 RÈGLE ABSOLUE - BOT UNIVERSEL UNIQUEMENT

**⚠️ CRITIQUE**: TOUJOURS travailler sur le **bot universel** exclusivement :
- **Fichier principal** : `supabase/functions/bot-resto-france-universel/core/UniversalBot.ts`
- **Services** : `supabase/functions/bot-resto-france-universel/services/`
- **Types** : `supabase/functions/bot-resto-france-universel/types.ts`
- **Deploy** : `supabase functions deploy bot-resto-france-universel`
- **🔄 RÈGLE DÉPLOIEMENT** : Toujours déployer en DEV avant PROD
- **❌ INTERDIT PROD** : Ne JAMAIS déployer en PROD sauf demande explicite

**❌ INTERDICTION ABSOLUE** :
- **NE JAMAIS analyser** les autres bots (`webhook-whatsapp`, `bot-whatsapp-france`, etc.)
- **NE JAMAIS modifier** les anciens bots
- **NE JAMAIS référencer** les tables obsolètes (`menus`, `restaurant_categories`)
- **IGNORER COMPLÈTEMENT** tout autre bot que `bot-resto-france-universel`

**✅ Le bot universel utilise** :
- Tables : `france_restaurants`, `france_menu_categories`, `france_products`
- Architecture moderne avec services séparés
- Workflows composites avec `steps_config`

## 🚨 COMMANDES INTERDITES - BASE DE DONNÉES ET FICHIERS

**⚠️ CRITIQUE**: NE JAMAIS exécuter les commandes suivantes qui détruisent les données :
- **`supabase db reset`** - INTERDIT ! Supprime toutes les données du projet
- **`supabase db push --reset`** - INTERDIT ! Force la suppression des données
- **`DROP TABLE`** ou **`TRUNCATE`** - INTERDIT ! Supprime les données existantes
- **NE JAMAIS exécuter de requêtes SQL directement en base** - INTERDIT ! Toujours donner le SQL à l'utilisateur
- **`rm`** - INTERDIT ! Ne jamais supprimer de fichiers automatiquement
- **`del`** - INTERDIT ! Ne jamais supprimer de fichiers automatiquement

## 🔒 RÈGLE ABSOLUE - EXÉCUTION SQL EN BASE

**⚠️ RÈGLES D'EXÉCUTION SQL DIRECTE** :

### **✅ AUTORISÉ - Scripts de lecture (SELECT)** :
- **Exécuter directement** les requêtes `SELECT` en PROD/DEV
- **Scripts de vérification** et d'analyse (ANALYSE_*.sql)
- **Consultation** des données existantes
- **EXPLAIN** pour analyser les requêtes
- **DESCRIBE** ou **SHOW** pour la structure

### **❌ STRICTEMENT INTERDIT - Scripts de modification** :
- **NE JAMAIS exécuter** `INSERT`, `UPDATE`, `DELETE` directement
- **NE JAMAIS exécuter** `CREATE`, `ALTER`, `DROP`
- **NE JAMAIS exécuter** de scripts de nettoyage (NETTOYAGE_*.sql)
- **NE JAMAIS exécuter** de scripts d'alimentation (ALIMENTATION_*.sql)
- **NE JAMAIS exécuter** de scripts de migration (MIGRATION_*.sql)

### **✅ Workflow obligatoire pour modifications** :
1. **Créer le script SQL** avec transactions (`BEGIN;` ... `COMMIT;`)
2. **DONNER le script à l'utilisateur** pour qu'il l'exécute lui-même
3. **NE JAMAIS l'exécuter directement**, même si demandé
4. **Exception** : Scripts de vérification (SELECT uniquement)

### **📋 Exemples** :
```sql
-- ✅ AUTORISÉ - Exécution directe
SELECT COUNT(*) FROM france_product_options WHERE icon IS NULL;

-- ❌ INTERDIT - Donner à l'utilisateur
UPDATE france_product_options SET icon = '🥤' WHERE ...;
INSERT INTO france_products (...) VALUES (...);
DELETE FROM france_product_options WHERE ...;
```

## 🔄 RÈGLE SYNCHRONISATION DEV → PROD

**⚠️ CHAMPS À EXCLURE DES SCRIPTS DE SYNCHRONISATION** :
Lors de la génération de scripts SQL pour synchroniser `france_restaurants` DEV → PROD, **TOUJOURS EXCLURE** ces champs :
- ❌ `phone` - Géré manuellement par restaurant
- ❌ `whatsapp_number` - Géré manuellement par restaurant
- ❌ `password_hash` - Géré par système d'authentification

**Raison** : Ces champs sont spécifiques à chaque environnement et ne doivent jamais être écrasés automatiquement.

**🔄 En cas de problème de données :**
- Toujours créer des scripts de **restauration** avant toute modification
- Utiliser des **sauvegardes** avant les opérations risquées
- Ne jamais faire de modifications destructives sans accord explicite de l'utilisateur

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

## 📋 RÈGLES DE GESTION DES MENUS ET CRÉATION DE SCRIPTS SQL

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

### 💡 MÉTHODOLOGIE STANDARDISÉE POUR SCRIPTS SQL

**⚠️ WORKFLOW OBLIGATOIRE**: Quand l'utilisateur fournit des menus restaurant, TOUJOURS suivre cette méthodologie :

#### 1. **ANALYSE AUTOMATIQUE DES PRIX** :
- **Règle +1€ livraison** : Prix livraison = Prix sur place + 1€
- **Automatique** : Ne pas demander confirmation, appliquer directement
- **Exemple** : 8€ sur place → 9€ livraison

#### 2. **QUESTIONS STANDARDISÉES À POSER** :
```
Pour chaque menu fourni, TOUJOURS demander :

1. **Workflow interactif** : "Ce produit nécessite-t-il un choix interactif ?" (OUI/NON)

2. **Type de boissons** (si boisson incluse) : 
   - "Quel format de boisson ?"
   - Options : "33CL" ou "1L5" ou "autre"

3. **Choix multiples** (si applicable) :
   - "Quels sont les choix disponibles ?" 
   - Exemple : viandes, sauces, accompagnements

4. **Type de produit** :
   - "simple" (aucun choix)
   - "composite" (avec workflow interactif)
```

#### 3. **STRUCTURE SQL STANDARDISÉE** :
```sql
-- Toujours utiliser cette structure :
1. BEGIN;
2. Création catégorie
3. Insertion produits (simple OU composite selon analyse)
4. Configuration workflow (si composite)
5. Éléments fixes (france_composite_items si nécessaire)
6. Vérifications complètes
7. COMMIT;
```

#### 4. **CONFIGURATION AUTOMATIQUE** :
- **Prix livraison** : TOUJOURS +1€ automatiquement
- **Display order** : Respecter l'ordre fourni (1, 2, 3...)
- **Slug** : Générer automatiquement depuis le nom
- **Restaurant** : pizza-yolo-77 (par défaut)

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

### 📄 RÈGLES SQL - TRANSACTIONS OBLIGATOIRES

**⚠️ IMPORTANT**: Tous les scripts d'insertion en base de données doivent être encapsulés dans des transactions :

```sql
-- ✅ Format obligatoire pour tous les scripts SQL
BEGIN;

-- Vos requêtes d'insertion/modification ici
INSERT INTO table_name (...) VALUES (...);
UPDATE table_name SET ... WHERE ...;

-- Vérification des résultats
SELECT COUNT(*) FROM table_name WHERE condition;

-- Si tout est correct, valider
COMMIT;

-- En cas de problème, annuler avec : ROLLBACK;
```

**Avantages :**
- ✅ **Atomicité** : Tout réussit ou tout échoue
- ✅ **Pas de doublons** en cas d'échec partiel
- ✅ **Rollback facile** si problème détecté
- ✅ **Base cohérente** à tout moment

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

## Fichiers de référence base de données

- **Schéma complet**: `C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\setup_database_updated.sql`
- **Structure base de données**: `C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\botResto\database_fr_structure.sql`

## 🔧 COMMANDES EXTRACTION BASE DE DONNÉES

**⚠️ COMMANDES VALIDÉES**: Utiliser ces commandes pour extraire les structures de base de données :

### **Extraction structure DEV** :
```bash
"/c/Program Files/PostgreSQL/17/bin/pg_dump" --schema-only "postgresql://postgres:p4zN25F7Gfw9Py@db.lphvdoyhwaelmwdfkfuh.supabase.co:5432/postgres" > structure_dev_extracted.sql
```

### **Extraction structure PROD** :
```bash
"/c/Program Files/PostgreSQL/17/bin/pg_dump" --schema-only "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" > structure_prod_extracted.sql
```

### **Format de connexion** :
- **Format** : `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres`
- **Mot de passe** : `p4zN25F7Gfw9Py`
- **DEV Project Ref** : `lphvdoyhwaelmwdfkfuh`
- **PROD Project Ref** : `vywbhlnzvfqtiurwmrac`

**Note** : Ne pas utiliser le format pooler (`aws-0-eu-central-1.pooler.supabase.com:6543`) qui ne fonctionne pas.

---

## 🔄 DUMP COMPLET PROD → DEV (Structure + Données)

**⚠️ COMMANDES RECOMMANDÉES**: Utiliser ces commandes pour synchroniser complètement DEV avec PROD :

### **1️⃣ Export PROD (schéma public uniquement)** :
```bash
cd /c/Users/diall/Documents/IonicProjects/Claude/botRestaurant && \
"/c/Program Files/PostgreSQL/17/bin/pg_dump" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --schema=public \
  "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" \
  > dump_prod_public_$(date +%Y%m%d_%H%M%S).sql
```

**Options expliquées :**
- `--clean` : Génère les commandes DROP avant CREATE
- `--if-exists` : Ajoute IF EXISTS aux DROP (évite les erreurs)
- `--no-owner` : Ignore les propriétaires (évite les conflits de users)
- `--no-privileges` : Ignore les permissions (évite les conflits)
- `--schema=public` : Exporte uniquement le schéma public (données métier)

### **2️⃣ Import en DEV** :
```bash
cd /c/Users/diall/Documents/IonicProjects/Claude/botRestaurant && \
"/c/Program Files/PostgreSQL/17/bin/psql" \
  "postgresql://postgres:p4zN25F7Gfw9Py@db.lphvdoyhwaelmwdfkfuh.supabase.co:5432/postgres" \
  < dump_prod_public_YYYYMMDD_HHMMSS.sql
```

**⚠️ ATTENTION** : L'import écrase **TOUTES les données DEV** avec les données PROD !

**📋 Workflow complet :**
1. Exécuter la commande d'export → Fichier `dump_prod_public_YYYYMMDD_HHMMSS.sql` créé
2. Vérifier la taille du fichier (`ls -lh dump_prod_public_*.sql`)
3. Remplacer `YYYYMMDD_HHMMSS` dans la commande d'import par le nom du fichier
4. Exécuter la commande d'import
5. Vérifier les logs pour s'assurer du succès

## Fichier bot WhatsApp

- **Code principal**: `C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\supabase\functions\webhook-whatsapp\index.ts`

## 🚫 RÈGLE DE MODIFICATION DE CODE

**⚠️ CRITIQUE**: Ne JAMAIS modifier le code directement sans validation préalable :

1. **TOUJOURS proposer un plan détaillé** avant toute modification
2. **Attendre la validation** explicite de l'utilisateur 
3. **Expliquer clairement** ce qui va être modifié et pourquoi
4. **Ne jamais modifier** sans accord préalable, même pour des corrections évidentes

## 📋 RÈGLE OBLIGATOIRE SQL

**⚠️ IMPORTANT**: Avant de donner TOUTE requête SQL, TOUJOURS vérifier le fichier `database_fr_structure.sql` pour connaître les VRAIES tables et colonnes. Ne jamais deviner les noms de tables.

## 📝 GESTION DES VERSIONS DE FONCTIONS SQL

**⚠️ RÈGLE OBLIGATOIRE**: Pour chaque modification de fonction SQL :

### **Création de fichiers versionnés :**
1. **TOUJOURS créer un nouveau fichier** avec numéro de version incrémenté
2. **Format obligatoire** : `nom_fonction_vX.sql` où X est le numéro de version
3. **Exemple** : `load_orders_with_assignment_state_v1.sql`, `load_orders_with_assignment_state_v2.sql`, etc.
4. **Inclure un en-tête** avec date, problème résolu et changements

### **Avant chaque commit :**
1. **SUPPRIMER toutes les anciennes versions** (v1, v2, v3...)
2. **GARDER UNIQUEMENT la dernière version** (ex: v4 si c'est la dernière)
3. **Renommer si nécessaire** pour que la version finale soit claire

### **Exemple de workflow :**
```
1. Création initiale → load_orders_with_assignment_state_v1.sql
2. Correction bug → load_orders_with_assignment_state_v2.sql
3. Optimisation → load_orders_with_assignment_state_v3.sql
4. Avant commit → Supprimer v1 et v2, garder uniquement v3
```

### **Structure d'en-tête obligatoire :**
```sql
-- ========================================================================
-- VERSION: vX
-- DATE: YYYY-MM-DD
-- PROBLÈME RÉSOLU: Description du problème
-- CHANGEMENTS: Liste des modifications
-- ========================================================================
```