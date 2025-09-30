# 🔍 GREEN API MONITORING SYSTEM - Documentation Complète

## 📋 Vue d'ensemble

Système automatisé de surveillance et maintenance de l'instance Green API WhatsApp Business.

**Fonctionnalités principales :**
- ✅ Health check automatique toutes les 5 minutes
- ✅ Reboot planifié configurable (heure personnalisée)
- ✅ Alertes WhatsApp au support en cas de problème
- ✅ Interface web de monitoring et configuration
- ✅ Architecture queue-based (contourne limitations Supabase)

---

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                         PG_CRON JOBS                            │
│  (Scheduled dans PostgreSQL - Triggers automatiques)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── Toutes les 5 minutes
                              │    └─> trigger_green_api_health_check()
                              │
                              └─── Toutes les minutes
                                   └─> trigger_scheduled_reboot()
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      QUEUE TABLES                               │
│  • green_api_health_check_queue  (health checks en attente)    │
│  • green_api_reboot_queue        (reboots en attente)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES                          │
│  (Polling toutes les 30s depuis l'UI)                          │
│  • /api/green-api-health/process-queue                         │
│  • /api/green-api-health/process-health-queue                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE EDGE FUNCTIONS                       │
│  • green-api-health-monitor  (check + reboot si nécessaire)    │
│  • green-api-reboot          (reboot forcé)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GREEN API INSTANCE                         │
│  WhatsApp Business API (Instance 8101819298)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Structure Base de Données

### 1. **green_api_health_logs**
Table principale des logs de health check.

```sql
CREATE TABLE green_api_health_logs (
  id BIGSERIAL PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'rebooted', 'critical_failure')),
  state_instance VARCHAR,
  error_message TEXT,
  reboot_triggered BOOLEAN DEFAULT false,
  reboot_success BOOLEAN,
  response_time_ms INTEGER,
  support_notified BOOLEAN DEFAULT false,
  support_notification_sent_at TIMESTAMPTZ,
  trigger_type VARCHAR DEFAULT 'automatic' CHECK (trigger_type IN ('automatic', 'manual'))
);

CREATE INDEX idx_health_logs_checked_at ON green_api_health_logs(checked_at DESC);
CREATE INDEX idx_health_logs_status ON green_api_health_logs(status);
```

**Colonnes importantes :**
- `status` : État de l'instance ('healthy', 'unhealthy', 'rebooted', 'critical_failure')
- `state_instance` : État WhatsApp retourné par l'API ('authorized', 'notAuthorized', etc.)
- `reboot_triggered` : true si un reboot a été tenté
- `support_notified` : true si une alerte a été envoyée au support

---

### 2. **green_api_health_check_queue**
Queue des health checks en attente de traitement.

```sql
CREATE TABLE green_api_health_check_queue (
  id BIGSERIAL PRIMARY KEY,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  trigger_type VARCHAR NOT NULL DEFAULT 'automatic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_health_check_queue_status ON green_api_health_check_queue(status, scheduled_for);
```

**Workflow :**
1. pg_cron ajoute une entrée avec `status = 'pending'`
2. API route la passe en `'processing'`
3. Après exécution : `'completed'` ou `'failed'`

---

### 3. **green_api_reboot_queue**
Queue des reboots planifiés en attente.

```sql
CREATE TABLE green_api_reboot_queue (
  id BIGSERIAL PRIMARY KEY,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  trigger_type VARCHAR NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_reboot_queue_status ON green_api_reboot_queue(status, scheduled_for);
```

---

### 4. **green_api_scheduled_reboots**
Configuration du reboot planifié quotidien.

```sql
CREATE TABLE green_api_scheduled_reboots (
  id BIGSERIAL PRIMARY KEY,
  scheduled_time TIME NOT NULL,
  timezone VARCHAR NOT NULL DEFAULT 'Europe/Paris',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**⚠️ Table singleton** : Une seule ligne autorisée.

**Exemple de configuration :**
```sql
INSERT INTO green_api_scheduled_reboots (scheduled_time, timezone, is_enabled)
VALUES ('03:00:00', 'Europe/Paris', true);
```

---

### 5. **system_support_contacts**
Contacts du support pour les alertes WhatsApp.

```sql
CREATE TABLE system_support_contacts (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  phone_number VARCHAR NOT NULL,
  notification_priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Format numéro :** `33620951645@c.us` (format Green API)

---

## 🔧 Fonctions PostgreSQL

### 1. **trigger_green_api_health_check()**
Appelée par pg_cron toutes les 5 minutes.

```sql
CREATE OR REPLACE FUNCTION trigger_green_api_health_check()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  queue_count INT;
BEGIN
  -- Éviter doublons : vérifier si déjà fait récemment
  SELECT COUNT(*) INTO queue_count
  FROM green_api_health_check_queue
  WHERE created_at > NOW() - INTERVAL '2 minutes'
    AND status IN ('pending', 'processing', 'completed');

  IF queue_count = 0 THEN
    INSERT INTO green_api_health_check_queue (scheduled_for, trigger_type)
    VALUES (NOW(), 'automatic');
    RAISE LOG 'Health check added to queue';
  ELSE
    RAISE LOG 'Health check already queued or completed recently';
  END IF;
END;
$$;
```

---

### 2. **trigger_scheduled_reboot()**
Appelée par pg_cron toutes les minutes.

```sql
CREATE OR REPLACE FUNCTION trigger_scheduled_reboot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config RECORD;
  current_time_str TEXT;
  scheduled_time_str TEXT;
  queue_count INT;
BEGIN
  -- Récupérer la config active
  SELECT * INTO config
  FROM green_api_scheduled_reboots
  WHERE is_enabled = true
  ORDER BY id ASC
  LIMIT 1;

  IF FOUND THEN
    current_time_str := TO_CHAR(NOW() AT TIME ZONE config.timezone, 'HH24:MI');
    scheduled_time_str := TO_CHAR(config.scheduled_time, 'HH24:MI');

    RAISE LOG 'Scheduled reboot check: current=%, scheduled=%', current_time_str, scheduled_time_str;

    -- Si l'heure correspond
    IF current_time_str = scheduled_time_str THEN
      -- Vérifier qu'on n'a pas déjà créé une entrée
      SELECT COUNT(*) INTO queue_count
      FROM green_api_reboot_queue
      WHERE scheduled_for > NOW() - INTERVAL '2 minutes'
        AND status IN ('pending', 'processing', 'completed');

      IF queue_count = 0 THEN
        INSERT INTO green_api_reboot_queue (scheduled_for, trigger_type)
        VALUES (NOW(), 'scheduled');
        RAISE LOG 'Scheduled reboot added to queue';
      ELSE
        RAISE LOG 'Reboot already queued or completed recently';
      END IF;
    END IF;
  END IF;
END;
$$;
```

---

## ⏰ Jobs PG_CRON

### 1. **Health Check Job**
```sql
SELECT cron.schedule(
  'green-api-health-check',
  '*/5 * * * *',  -- Toutes les 5 minutes
  $$SELECT trigger_green_api_health_check();$$
);
```

### 2. **Scheduled Reboot Job**
```sql
SELECT cron.schedule(
  'scheduled-reboot-check',
  '* * * * *',  -- Toutes les minutes
  $$SELECT trigger_scheduled_reboot();$$
);
```

**Vérifier les jobs actifs :**
```sql
SELECT jobid, jobname, schedule, active, command
FROM cron.job
WHERE jobname IN ('green-api-health-check', 'scheduled-reboot-check');
```

**Désactiver un job :**
```sql
SELECT cron.unschedule('green-api-health-check');
```

---

## 🚀 API Routes Next.js

### 1. **/api/green-api-health/process-health-queue**
Traite les health checks en attente.

**Fichier :** `menu-ai-admin/src/app/api/green-api-health/process-health-queue/route.ts`

**Workflow :**
1. Récupère 1 entrée `pending` de `green_api_health_check_queue`
2. Marque comme `processing`
3. Appelle Edge Function `green-api-health-monitor`
4. Marque comme `completed` ou `failed`

**Appelée par :** UI (polling toutes les 30s)

---

### 2. **/api/green-api-health/process-queue**
Traite les reboots planifiés en attente.

**Fichier :** `menu-ai-admin/src/app/api/green-api-health/process-queue/route.ts`

**Workflow :**
1. Récupère 1 entrée `pending` de `green_api_reboot_queue`
2. Marque comme `processing`
3. Appelle Edge Function `green-api-reboot`
4. Marque comme `completed` ou `failed`

**Appelée par :** UI (polling toutes les 30s)

---

## 🔌 Supabase Edge Functions

### 1. **green-api-health-monitor**
Vérifie l'état de l'instance Green API.

**Fichier :** `supabase/functions/green-api-health-monitor/index.ts`

**Logique :**
```typescript
1. Appel API : getStateInstance (timeout 10s)

2. Si stateInstance !== 'authorized':
   → Status = 'unhealthy'
   → Alerte support (PAS de reboot pour éviter déconnexion QR)

3. Si timeout/erreur réseau:
   → Status = 'critical_failure'
   → Tentative reboot automatique
   → Si reboot échoue : Alerte support

4. Logger résultat dans green_api_health_logs
```

**Types d'alertes support :**
- `instance_not_authorized` : État != 'authorized' (pas de reboot)
- `timeout_and_reboot_failed` : Timeout + reboot échoué
- `complete_failure` : Instance totalement inaccessible

---

### 2. **green-api-reboot**
Force le reboot de l'instance Green API.

**Fichier :** `supabase/functions/green-api-reboot/index.ts`

**Appel API :**
```typescript
GET https://7105.api.greenapi.com/waInstance8101819298/reboot/{TOKEN}
```

**⚠️ Attention :** Le reboot déconnecte WhatsApp (nécessite scan QR code manuel).

---

## 🖥️ Interface Web

### Page principale
**URL :** `http://localhost:3000/green-api-health`

**Fichier :** `menu-ai-admin/src/app/green-api-health/page.tsx`

**Fonctionnalités :**

#### 1. **Dashboard Temps Réel**
- Dernier health check (status, date, temps de réponse)
- État de l'instance WhatsApp
- Statistiques (taux de succès, temps moyen de réponse)

#### 2. **Actions Manuelles**
- ✅ Déclencher health check manuel
- 🔄 Forcer reboot immédiat
- ⏰ Configurer reboot planifié (heure + timezone)

#### 3. **Historique des Logs**
- Liste paginée des 50 derniers health checks
- Filtres par status
- Détails de chaque check (erreurs, reboots, alertes)

#### 4. **Polling Automatique**
```typescript
// Toutes les 30 secondes
useEffect(() => {
  const interval = setInterval(processQueue, 30000);
  return () => clearInterval(interval);
}, []);

async function processQueue() {
  // Traite les 2 queues en parallèle
  const [rebootResponse, healthResponse] = await Promise.all([
    fetch('/api/green-api-health/process-queue', { method: 'POST' }),
    fetch('/api/green-api-health/process-health-queue', { method: 'POST' })
  ]);

  // Recharge les données si quelque chose a été traité
  if (rebootResponse.processed > 0 || healthResponse.processed > 0) {
    await loadData();
  }
}
```

---

## 📱 Système d'Alertes WhatsApp

### Configuration
Les alertes sont envoyées aux contacts dans `system_support_contacts` (par ordre de priorité).

```sql
INSERT INTO system_support_contacts (full_name, phone_number, notification_priority, is_active)
VALUES
  ('Support Principal', '33620951645@c.us', 1, true),
  ('Support Secondaire', '33612345678@c.us', 2, true);
```

### Types d'Alertes

#### 1. **Instance Non Autorisée**
```
🚨 *ALERTE GREEN API* 🚨

⏰ 15/01/2025 14:30:00
📱 Instance: 8101819298

⚠️ *INSTANCE NON AUTORISÉE*

État détecté: notAuthorized
Erreur: Instance state is "notAuthorized" instead of "authorized"

ℹ️ *PAS DE REBOOT AUTOMATIQUE*
Le reboot déconnecte WhatsApp (nécessite scan QR)

⚠️ *ACTION SUGGÉRÉE:*
1. Vérifier le dashboard Green API
2. Reconnecter WhatsApp si nécessaire
3. Ou attendre la reconnexion automatique

🔗 Dashboard: https://7105.api.greenapi.com
```

#### 2. **Timeout + Reboot Échoué**
```
🚨 *ALERTE GREEN API* 🚨

⏰ 15/01/2025 14:30:00
📱 Instance: 8101819298

❌ *TIMEOUT + REBOOT ÉCHOUÉ*

Erreur: Connection timeout
Temps réponse: 10000ms

⚠️ *ACTION REQUISE:*
1. L'instance ne répond plus
2. Reboot automatique a échoué
3. Intervention manuelle critique

🔗 Dashboard: https://7105.api.greenapi.com
```

#### 3. **Échec Complet**
```
🚨 *ALERTE GREEN API* 🚨

⏰ 15/01/2025 14:30:00
📱 Instance: 8101819298

🔴 *ÉCHEC COMPLET DU SYSTÈME*

Erreur: Primary: Connection timeout | Reboot: HTTP 500

⚠️ *ACTION IMMÉDIATE REQUISE:*
1. Instance complètement inaccessible
2. Reboot impossible
3. Vérifier dashboard Green API
4. Contact support Green API si nécessaire

🔗 Dashboard: https://7105.api.greenapi.com
```

---

## 🔐 Variables d'Environnement

### Supabase Edge Functions
```bash
# Green API credentials
GREEN_API_INSTANCE_ID=8101819298
GREEN_API_TOKEN=your_token_here
GREEN_API_URL=https://7105.api.greenapi.com

# Supabase
SUPABASE_URL=https://otxfuxvbdxobipgfnwag.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Commande pour définir les secrets :**
```bash
supabase secrets set GREEN_API_INSTANCE_ID=8101819298
supabase secrets set GREEN_API_TOKEN=your_token
supabase secrets set GREEN_API_URL=https://7105.api.greenapi.com
```

### Next.js App
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://otxfuxvbdxobipgfnwag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🚀 Déploiement

### 1. Déployer les Edge Functions
```bash
# Depuis la racine du projet
cd supabase/functions

# Déployer health monitor
supabase functions deploy green-api-health-monitor

# Déployer reboot function
supabase functions deploy green-api-reboot
```

### 2. Créer les tables et fonctions
```bash
# Exécuter le script SQL complet dans Supabase SQL Editor
# Inclut : tables, indexes, fonctions, jobs pg_cron
```

### 3. Configurer les jobs pg_cron
```sql
-- Health check toutes les 5 minutes
SELECT cron.schedule(
  'green-api-health-check',
  '*/5 * * * *',
  $$SELECT trigger_green_api_health_check();$$
);

-- Reboot planifié (check toutes les minutes)
SELECT cron.schedule(
  'scheduled-reboot-check',
  '* * * * *',
  $$SELECT trigger_scheduled_reboot();$$
);
```

### 4. Configurer le reboot planifié
```sql
INSERT INTO green_api_scheduled_reboots (scheduled_time, timezone, is_enabled)
VALUES ('03:00:00', 'Europe/Paris', true)
ON CONFLICT (id) DO UPDATE
SET scheduled_time = EXCLUDED.scheduled_time,
    timezone = EXCLUDED.timezone,
    is_enabled = EXCLUDED.is_enabled;
```

### 5. Ajouter les contacts support
```sql
INSERT INTO system_support_contacts (full_name, phone_number, notification_priority, is_active)
VALUES ('Votre Nom', '33620951645@c.us', 1, true);
```

### 6. Lancer l'interface Next.js
```bash
cd menu-ai-admin
npm run dev
# Accéder à http://localhost:3000/green-api-health
```

---

## 🧪 Tests et Vérifications

### 1. Tester un health check manuel
```sql
-- Ajouter manuellement une entrée dans la queue
INSERT INTO green_api_health_check_queue (scheduled_for, trigger_type)
VALUES (NOW(), 'manual');

-- L'UI va la traiter automatiquement dans les 30 secondes
-- Vérifier le résultat :
SELECT * FROM green_api_health_logs ORDER BY checked_at DESC LIMIT 1;
```

### 2. Tester un reboot planifié
```sql
-- Configurer un reboot dans 2 minutes
UPDATE green_api_scheduled_reboots
SET scheduled_time = (NOW() + INTERVAL '2 minutes')::TIME,
    is_enabled = true;

-- Attendre 2 minutes et vérifier :
SELECT * FROM green_api_reboot_queue ORDER BY created_at DESC LIMIT 1;
```

### 3. Vérifier les logs pg_cron
```sql
SELECT
  jobname,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '1 hour'
ORDER BY start_time DESC
LIMIT 20;
```

### 4. Tester l'alerte support
```sql
-- Désactiver temporairement l'instance dans Green API dashboard
-- Le prochain health check déclenchera une alerte
```

---

## 🐛 Debugging

### Problème : Les health checks ne se déclenchent pas

**Vérifications :**
```sql
-- 1. Job pg_cron existe et est actif ?
SELECT * FROM cron.job WHERE jobname = 'green-api-health-check';

-- 2. Fonction existe ?
SELECT proname FROM pg_proc WHERE proname = 'trigger_green_api_health_check';

-- 3. Logs pg_cron récents ?
SELECT * FROM cron.job_run_details
WHERE jobname = 'green-api-health-check'
ORDER BY start_time DESC LIMIT 5;

-- 4. Entrées dans la queue ?
SELECT * FROM green_api_health_check_queue
ORDER BY created_at DESC LIMIT 5;
```

---

### Problème : L'UI ne traite pas la queue

**Vérifications :**
1. L'app Next.js est bien lancée ?
2. La page `/green-api-health` est ouverte ?
3. Console navigateur pour erreurs JavaScript
4. Vérifier les logs API :
```bash
cd menu-ai-admin
npm run dev
# Ouvrir http://localhost:3000/green-api-health
# F12 → Console pour voir les erreurs
```

---

### Problème : Edge Function échoue

**Vérifications :**
```bash
# Logs Edge Function en temps réel
supabase functions logs green-api-health-monitor --tail

# Tester manuellement
curl -X POST \
  https://otxfuxvbdxobipgfnwag.supabase.co/functions/v1/green-api-health-monitor \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

### Problème : Alertes support non envoyées

**Vérifications :**
```sql
-- 1. Contacts support configurés ?
SELECT * FROM system_support_contacts WHERE is_active = true;

-- 2. Logs avec support_notified = true ?
SELECT * FROM green_api_health_logs
WHERE support_notified = true
ORDER BY checked_at DESC;

-- 3. Format numéro correct ? (doit finir par @c.us)
UPDATE system_support_contacts
SET phone_number = '33620951645@c.us'
WHERE id = 1;
```

---

## 📊 Requêtes Utiles

### Statistiques globales
```sql
SELECT
  COUNT(*) as total_checks,
  COUNT(*) FILTER (WHERE status = 'healthy') as healthy_count,
  COUNT(*) FILTER (WHERE status = 'unhealthy') as unhealthy_count,
  COUNT(*) FILTER (WHERE status = 'critical_failure') as critical_count,
  ROUND(AVG(response_time_ms)) as avg_response_ms,
  COUNT(*) FILTER (WHERE reboot_triggered = true) as total_reboots,
  COUNT(*) FILTER (WHERE support_notified = true) as total_alerts
FROM green_api_health_logs
WHERE checked_at > NOW() - INTERVAL '7 days';
```

### Health checks par jour (7 derniers jours)
```sql
SELECT
  DATE(checked_at) as check_date,
  COUNT(*) as total_checks,
  COUNT(*) FILTER (WHERE status = 'healthy') as healthy,
  COUNT(*) FILTER (WHERE status != 'healthy') as issues,
  ROUND(AVG(response_time_ms)) as avg_response_ms
FROM green_api_health_logs
WHERE checked_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(checked_at)
ORDER BY check_date DESC;
```

### Derniers checks avec problèmes
```sql
SELECT
  checked_at,
  status,
  state_instance,
  error_message,
  reboot_triggered,
  support_notified
FROM green_api_health_logs
WHERE status != 'healthy'
ORDER BY checked_at DESC
LIMIT 20;
```

---

## 🔄 Maintenance

### Nettoyer les vieux logs (garder 30 jours)
```sql
DELETE FROM green_api_health_logs
WHERE checked_at < NOW() - INTERVAL '30 days';
```

### Nettoyer les queues (garder 7 jours)
```sql
DELETE FROM green_api_health_check_queue
WHERE created_at < NOW() - INTERVAL '7 days';

DELETE FROM green_api_reboot_queue
WHERE created_at < NOW() - INTERVAL '7 days';
```

### Désactiver temporairement le monitoring
```sql
-- Désactiver health checks
SELECT cron.unschedule('green-api-health-check');

-- Désactiver reboot planifié
UPDATE green_api_scheduled_reboots SET is_enabled = false;
SELECT cron.unschedule('scheduled-reboot-check');
```

### Réactiver le monitoring
```sql
-- Réactiver health checks
SELECT cron.schedule(
  'green-api-health-check',
  '*/5 * * * *',
  $$SELECT trigger_green_api_health_check();$$
);

-- Réactiver reboot planifié
UPDATE green_api_scheduled_reboots SET is_enabled = true;
SELECT cron.schedule(
  'scheduled-reboot-check',
  '* * * * *',
  $$SELECT trigger_scheduled_reboot();$$
);
```

---

## 🎯 Points Clés

### ✅ Avantages de l'architecture queue-based
- Contourne les limitations Supabase (`net.http_post` indisponible)
- Résilience : si l'API échoue, la queue conserve les tâches
- Traçabilité : chaque opération est loggée
- Scalabilité : facile d'ajouter d'autres types de checks

### ⚠️ Précautions
- **Le reboot déconnecte WhatsApp** → Nécessite scan QR manuel
- Donc **reboot automatique UNIQUEMENT sur timeout**, pas sur état != 'authorized'
- Alertes support préférées pour état 'notAuthorized'

### 🔒 Sécurité
- Secrets stockés dans Supabase (pas de tokens en clair)
- Fonctions PostgreSQL en `SECURITY DEFINER`
- API routes Next.js sans authentification (TODO: ajouter auth si nécessaire)

---

## 📞 Support

**En cas de problème critique :**
1. Vérifier le dashboard Green API : https://7105.api.greenapi.com
2. Consulter les logs Supabase : `supabase functions logs green-api-health-monitor`
3. Vérifier pg_cron : `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
4. Contacter le support Green API si l'instance est complètement inaccessible

---

## 📝 Changelog

### Version 1.0.0 (Janvier 2025)
- ✅ Health check automatique toutes les 5 minutes
- ✅ Reboot planifié configurable
- ✅ Alertes WhatsApp au support
- ✅ Interface web de monitoring
- ✅ Architecture queue-based complète
- ✅ Documentation complète

---

**Dernière mise à jour :** Janvier 2025
**Auteur :** Bot Restaurant Team
**Instance Green API :** 8101819298