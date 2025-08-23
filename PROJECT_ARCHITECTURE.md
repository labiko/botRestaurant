# 🏗️ ARCHITECTURE DU PROJET - Bot Restaurant WhatsApp

## 📁 Structure des Dossiers (Principes SOLID)

```
botRestaurant/
├── 📄 .env.example                    # Template des variables d'environnement
├── 📄 .env.local                      # Variables locales (à créer, non versionné)
├── 📄 PROJECT_ARCHITECTURE.md         # Ce fichier
├── 📄 PLAN_BOT_RESTAURANT.md         # Plan technique détaillé
├── 📄 WORKFLOW_BOT_RESTAURANT.md      # Workflows et scénarios utilisateur
├── 📄 CLAUDE.md                       # Guide pour Claude AI
│
├── 📁 supabase/
│   ├── 📄 config.toml                 # Configuration Supabase
│   │
│   ├── 📁 migrations/
│   │   └── 001_create_tables.sql     # Schémas de base de données
│   │
│   └── 📁 functions/
│       ├── 📁 webhook-whatsapp/       # Fonction principale webhook
│       │   └── index.ts               # Point d'entrée webhook Green API
│       │
│       └── 📁 _shared/                # Code partagé entre fonctions
│           ├── 📁 core/               # Core Layer (interfaces, abstractions)
│           │   ├── 📁 interfaces/
│           │   │   ├── IRepository.ts
│           │   │   ├── IMessageService.ts
│           │   │   ├── IPaymentService.ts
│           │   │   └── INotificationService.ts
│           │   │
│           │   ├── 📁 errors/
│           │   │   ├── BaseError.ts
│           │   │   ├── ValidationError.ts
│           │   │   └── BusinessError.ts
│           │   │
│           │   └── 📁 types/
│           │       ├── webhook.types.ts
│           │       └── common.types.ts
│           │
│           ├── 📁 domain/            # Domain Layer (entités métier)
│           │   ├── 📁 entities/
│           │   │   ├── Restaurant.ts
│           │   │   ├── Menu.ts
│           │   │   ├── Client.ts
│           │   │   ├── Order.ts
│           │   │   └── Session.ts
│           │   │
│           │   ├── 📁 value-objects/
│           │   │   ├── Money.ts
│           │   │   ├── PhoneNumber.ts
│           │   │   └── Location.ts
│           │   │
│           │   └── 📁 specifications/
│           │       ├── OrderSpecification.ts
│           │       └── DeliverySpecification.ts
│           │
│           ├── 📁 application/       # Application Layer (use cases)
│           │   ├── 📁 services/
│           │   │   ├── LocationService.ts
│           │   │   ├── MessageParser.ts
│           │   │   ├── MessageFormatter.ts
│           │   │   ├── OrderService.ts
│           │   │   └── SessionService.ts
│           │   │
│           │   ├── 📁 handlers/      # Command/Query Handlers
│           │   │   ├── AccueilHandler.ts
│           │   │   ├── MenuHandler.ts
│           │   │   ├── PanierHandler.ts
│           │   │   ├── ModeHandler.ts
│           │   │   ├── LivraisonHandler.ts
│           │   │   ├── PaiementHandler.ts
│           │   │   └── FavoriHandler.ts
│           │   │
│           │   └── 📁 orchestrators/
│           │       └── ConversationOrchestrator.ts
│           │
│           └── 📁 infrastructure/    # Infrastructure Layer
│               ├── 📁 repositories/
│               │   ├── RestaurantRepository.ts
│               │   ├── MenuRepository.ts
│               │   ├── ClientRepository.ts
│               │   ├── OrderRepository.ts
│               │   └── SessionRepository.ts
│               │
│               ├── 📁 external/      # Services externes
│               │   ├── GreenAPIService.ts
│               │   ├── OrangeMoneyService.ts
│               │   ├── WaveService.ts
│               │   └── SupabaseClient.ts
│               │
│               └── 📁 persistence/
│                   └── DatabaseConnection.ts
│
├── 📁 tests/                          # Tests unitaires et d'intégration
│   ├── 📁 unit/
│   │   ├── LocationService.test.ts
│   │   ├── MessageParser.test.ts
│   │   └── OrderCalculations.test.ts
│   │
│   └── 📁 integration/
│       ├── webhook.test.ts
│       └── order-flow.test.ts
│
├── 📁 docs/                           # Documentation supplémentaire
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
└── 📁 scripts/                        # Scripts utilitaires
    ├── seed-database.ts
    ├── test-webhook.ts
    └── deploy.sh
```

## 🎯 Principes SOLID Appliqués

### 1️⃣ **S** - Single Responsibility Principle
Chaque classe a une seule responsabilité :
- `LocationService` : Calculs géographiques uniquement
- `MessageParser` : Parse des messages WhatsApp uniquement
- `OrderService` : Gestion des commandes uniquement

### 2️⃣ **O** - Open/Closed Principle
Les classes sont ouvertes à l'extension, fermées à la modification :
- Handlers peuvent être étendus sans modifier le code existant
- Nouveaux modes de paiement via interface `IPaymentService`

### 3️⃣ **L** - Liskov Substitution Principle
Les sous-classes peuvent remplacer leurs classes parentes :
- Tous les repositories implémentent `IRepository`
- Tous les handlers implémentent `IMessageHandler`

### 4️⃣ **I** - Interface Segregation Principle
Interfaces spécifiques plutôt que générales :
- `IRepository` pour CRUD basique
- `IPaginatedRepository` pour pagination
- `IRepositoryWithFilter` pour filtrage

### 5️⃣ **D** - Dependency Inversion Principle
Dépendre des abstractions, pas des implémentations :
- Les handlers dépendent de `IMessageService`, pas de `GreenAPIService`
- Les services dépendent de `IRepository`, pas de `SupabaseRepository`

## 🔄 Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│                   WEBHOOK ENTRY                      │
│              (webhook-whatsapp/index.ts)             │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│            CONVERSATION ORCHESTRATOR                 │
│         (Gère l'état et route les messages)         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                MESSAGE HANDLERS                      │
│   (AccueilHandler, MenuHandler, PanierHandler...)   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              APPLICATION SERVICES                    │
│    (OrderService, LocationService, etc.)            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                 REPOSITORIES                         │
│     (Accès aux données via Supabase)                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                   DATABASE                           │
│              (Supabase PostgreSQL)                   │
└──────────────────────────────────────────────────────┘
```

## 🔐 Configuration des Secrets

### Variables d'environnement requises :

```bash
# Copier .env.example vers .env.local
cp .env.example .env.local

# Éditer .env.local avec vos clés
```

### Configuration Supabase :

```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet (si pas déjà fait)
supabase init

# Lier au projet Supabase
supabase link --project-ref [your-project-ref]

# Configurer les secrets
supabase secrets set GREEN_API_TOKEN=[your-token]
supabase secrets set GREEN_API_INSTANCE_ID=[your-instance-id]

# Déployer les migrations
supabase db push

# Déployer les Edge Functions
supabase functions deploy webhook-whatsapp
```

## 🚀 Commandes de Développement

```bash
# Installation des dépendances
npm install

# Développement local
supabase start                    # Démarre Supabase local
supabase functions serve          # Démarre les Edge Functions

# Tests
npm test                          # Tests unitaires
npm run test:integration         # Tests d'intégration

# Déploiement
npm run deploy                   # Déploie vers production
```

## 📊 Monitoring et Logs

### Logs en temps réel :
```bash
supabase functions logs webhook-whatsapp --follow
```

### Dashboard Supabase :
- Logs des fonctions : Dashboard > Functions > Logs
- Métriques : Dashboard > Functions > Metrics
- Base de données : Dashboard > Table Editor

## 🔧 Maintenance

### Nettoyage des sessions expirées :
```sql
-- Créer une fonction scheduled pour nettoyer les sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Programmer l'exécution toutes les heures
SELECT cron.schedule(
  'clean-sessions',
  '0 * * * *',
  'SELECT clean_expired_sessions();'
);
```

## 📈 Scalabilité

Le système est conçu pour être scalable :

1. **Horizontal Scaling** : Les Edge Functions scalent automatiquement
2. **Database Pooling** : Connexions optimisées via Supabase
3. **Caching** : Sessions en mémoire avec TTL
4. **Rate Limiting** : Protection contre les abus
5. **Queue System** : Possibilité d'ajouter RabbitMQ/Redis pour les pics

## 🛡️ Sécurité

- **RLS (Row Level Security)** : Activé sur toutes les tables
- **API Keys** : Stockées dans les secrets Supabase
- **Validation** : Input validation sur tous les endpoints
- **Rate Limiting** : Protection contre le spam
- **Encryption** : HTTPS pour toutes les communications

## 📝 Notes Importantes

1. **Green API** : Nécessite un compte WhatsApp Business
2. **Supabase** : Plan gratuit suffisant pour commencer
3. **Tests** : Toujours tester en local avant déploiement
4. **Monitoring** : Surveiller les logs les premiers jours
5. **Backup** : Configurer les backups automatiques Supabase