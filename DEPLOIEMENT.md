# 🚀 GUIDE DE DÉPLOIEMENT - Bot Restaurant WhatsApp

## ✅ Prérequis

1. **Node.js** installé (version 16+)
2. **Supabase CLI** installé globalement
3. **Compte Supabase** avec projet créé
4. **Compte Green API** avec instance WhatsApp Business
5. **WhatsApp Business** configuré

## 📋 Étapes de Déploiement

### 1. Installation Supabase CLI

```bash
# Installation globale
npm install -g supabase

# Vérification
supabase --version
```

### 2. Configuration du Projet

```bash
# Aller dans le dossier du projet
cd botRestaurant

# Lier au projet Supabase
supabase link --project-ref ymlzjvposzzdgpksgvsn

# Copier et configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés
```

### 3. Déploiement Automatique

```powershell
# Exécuter le script de déploiement
.\deploy.ps1
```

OU manuellement :

### 4. Déploiement Manuel

#### 4.1 Configuration des Secrets

```bash
# Secrets Green API
supabase secrets set GREEN_API_TOKEN=022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad
supabase secrets set GREEN_API_INSTANCE_ID=7105303512
supabase secrets set GREEN_API_BASE_URL=https://7105.api.greenapi.com

# Configuration Bot
supabase secrets set BOT_PHONE_NUMBER=224600000000
supabase secrets set DEFAULT_TIMEOUT_MINUTES=30
supabase secrets set MAX_ITEMS_PER_PAGE=5
supabase secrets set DEFAULT_CURRENCY=GNF

# Paramètres livraison
supabase secrets set DEFAULT_DELIVERY_RADIUS_KM=10
supabase secrets set DEFAULT_DELIVERY_FEE_PER_KM=3000
supabase secrets set DEFAULT_FREE_DELIVERY_THRESHOLD=100000
supabase secrets set DEFAULT_MINIMUM_ORDER_DELIVERY=25000

# Environnement
supabase secrets set DENO_ENV=production
supabase secrets set DEBUG=false
supabase secrets set LOG_LEVEL=info
```

#### 4.2 Déploiement Base de Données

```bash
# Déployer les migrations
supabase db push

# Vérifier les tables créées
supabase db diff
```

#### 4.3 Déploiement Edge Functions

```bash
# Déployer la fonction webhook
supabase functions deploy webhook-whatsapp

# Vérifier le déploiement
supabase functions list
```

### 5. Configuration Green API

1. **Aller sur** https://console.green-api.com/
2. **Sélectionner votre instance** 7105303512
3. **Configurer les webhooks :**
   - URL : `https://ymlzjvposzzdgpksgvsn.supabase.co/functions/v1/webhook-whatsapp`
   - Événements : `incomingMessageReceived`, `stateInstanceChanged`
4. **Scanner le QR Code** pour connecter WhatsApp Business

### 6. Vérification du Déploiement

#### 6.1 Test de Santé

```bash
curl https://ymlzjvposzzdgpksgvsn.supabase.co/functions/v1/webhook-whatsapp/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "whatsapp_instance_state": "authorized",
  "environment": "production"
}
```

#### 6.2 Test Automatisé

```powershell
# Lancer les tests
.\test-webhook.ps1
```

#### 6.3 Test Manuel WhatsApp

1. **Envoyer "resto"** à votre numéro WhatsApp Business
2. **Vérifier la réponse** avec le menu d'accueil
3. **Tester le flux complet** jusqu'à la commande

## 📊 Monitoring et Logs

### Logs en Temps Réel

```bash
# Suivre les logs de la fonction
supabase functions logs webhook-whatsapp --follow

# Logs avec filtre
supabase functions logs webhook-whatsapp --filter="ERROR"
```

### Dashboard Supabase

- **Functions Logs** : https://supabase.com/dashboard/project/ymlzjvposzzdgpksgvsn/functions
- **Database** : https://supabase.com/dashboard/project/ymlzjvposzzdgpksgvsn/editor
- **Auth** : https://supabase.com/dashboard/project/ymlzjvposzzdgpksgvsn/auth

### Métriques Importantes

1. **Taux de réponse** des webhooks
2. **Sessions actives** dans la table `sessions`
3. **Commandes créées** dans la table `commandes`
4. **Erreurs** dans les logs

## 🛠️ Maintenance

### Nettoyage Automatique

```sql
-- Nettoyer les sessions expirées (exécuter périodiquement)
DELETE FROM sessions WHERE expires_at < NOW();

-- Voir les sessions actives
SELECT phone_whatsapp, state, expires_at 
FROM sessions 
WHERE expires_at > NOW() 
ORDER BY created_at DESC;
```

### Redémarrage des Services

```bash
# Redéployer si nécessaire
supabase functions deploy webhook-whatsapp --no-verify-jwt

# Vérifier l'état
curl -I https://ymlzjvposzzdgpksgvsn.supabase.co/functions/v1/webhook-whatsapp/health
```

## 🚨 Résolution des Problèmes

### Problème : WhatsApp non autorisé

**Symptôme :** `whatsapp_instance_state: "notAuthorized"`

**Solution :**
1. Aller sur Green API Console
2. Rescanner le QR Code
3. Vérifier que le téléphone est connecté

### Problème : Webhook ne reçoit pas les messages

**Symptômes :** Pas de logs dans Supabase

**Solutions :**
1. Vérifier l'URL webhook dans Green API
2. Tester l'URL avec curl
3. Vérifier les secrets configurés

```bash
# Tester l'URL directement
curl -X POST https://ymlzjvposzzdgpksgvsn.supabase.co/functions/v1/webhook-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"typeWebhook":"test"}'
```

### Problème : Erreurs de base de données

**Symptômes :** Erreurs SQL dans les logs

**Solutions :**
1. Vérifier les migrations : `supabase db diff`
2. Redéployer : `supabase db push`
3. Vérifier les permissions RLS

### Problème : Sessions qui expirent trop vite

**Solution :**
```bash
# Augmenter le timeout
supabase secrets set DEFAULT_TIMEOUT_MINUTES=60
```

## 📈 Optimisations de Performance

### 1. Cache des Restaurants

```sql
-- Index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_restaurants_location 
ON restaurants USING GIST (ll_to_earth(latitude, longitude));
```

### 2. Nettoyage Automatique

```sql
-- Fonction scheduled pour nettoyer les sessions
SELECT cron.schedule(
  'clean-sessions',
  '0 */6 * * *', -- Toutes les 6 heures
  'DELETE FROM sessions WHERE expires_at < NOW();'
);
```

### 3. Rate Limiting

```javascript
// Ajouter dans le webhook si nécessaire
const rateLimiter = new Map();
const RATE_LIMIT = 10; // messages par minute
```

## 🔒 Sécurité

### Variables Sensibles

- ✅ Secrets stockés dans Supabase Secrets
- ✅ RLS activé sur toutes les tables
- ✅ Service Role utilisé pour les Edge Functions
- ✅ HTTPS pour toutes les communications

### Monitoring de Sécurité

1. **Surveiller les tentatives de spam**
2. **Rate limiting par numéro**
3. **Logs des erreurs suspects**
4. **Backup réguliers de la base**

## 📞 Support

### En cas de problème :

1. **Vérifier les logs** : `supabase functions logs webhook-whatsapp`
2. **Tester la santé** : GET `/health`
3. **Vérifier Green API** : https://console.green-api.com/
4. **Base de données** : Dashboard Supabase

### Contacts Utiles

- **Documentation Supabase** : https://supabase.com/docs
- **Support Green API** : https://green-api.com/support
- **Documentation WhatsApp Business** : https://developers.facebook.com/docs/whatsapp

---

## ✅ Checklist Post-Déploiement

- [ ] ✅ Edge Function déployée et accessible
- [ ] ✅ Base de données migrée
- [ ] ✅ Secrets configurés
- [ ] ✅ Green API webhook configuré
- [ ] ✅ WhatsApp Business connecté
- [ ] ✅ Test "resto" fonctionnel
- [ ] ✅ Test flux complet (accueil → commande)
- [ ] ✅ Logs monitoring configuré
- [ ] ✅ Backup base de données planifié
- [ ] ✅ Documentation équipe mise à jour

🎉 **Bot Restaurant WhatsApp est opérationnel !**