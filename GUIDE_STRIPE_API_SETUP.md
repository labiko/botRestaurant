# 🔑 GUIDE: Récupération des clés API Stripe

## 📋 Prérequis

- Un compte Stripe (gratuit)
- Accès au Dashboard Stripe

---

## 🚀 Étape 1: Créer un compte Stripe

### 1.1 Inscription

1. **Aller sur** : https://dashboard.stripe.com/register
2. **Remplir le formulaire** :
   - Email professionnel
   - Nom complet
   - Pays (sélectionner votre pays)
   - Mot de passe
3. **Cliquer sur** "Create account"
4. **Vérifier votre email** (cliquer sur le lien reçu)

### 1.2 Activation du compte

1. **Se connecter** : https://dashboard.stripe.com/login
2. **Compléter le profil** :
   - Nom de l'entreprise
   - Type d'entreprise
   - Site web (optionnel pour les tests)
   - Description de l'activité
3. **Informations bancaires** (nécessaire uniquement pour recevoir des paiements réels)

---

## 🔐 Étape 2: Récupérer les clés API (Mode Test)

### 2.1 Accéder aux clés API

1. **Se connecter** au Dashboard Stripe
2. **Cliquer sur** "Developers" (en haut à droite)
3. **Cliquer sur** "API keys" (dans le menu de gauche)

### 2.2 Mode Test vs Mode Production

⚠️ **IMPORTANT** : Utilisez toujours le **mode Test** pour le développement.

- **Mode Test** : Clés commençant par `pk_test_` et `sk_test_`
- **Mode Production** : Clés commençant par `pk_live_` et `sk_live_`

**Vérifier que vous êtes en mode Test** :
- En haut à gauche du dashboard, vous devez voir : **"Test mode"** avec un switch

### 2.3 Récupérer les clés

Vous verrez 2 types de clés :

#### **1. Publishable key (Clé publique)**
```
pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```
- **Usage** : Côté client (JavaScript, mobile apps)
- **Sécurité** : Peut être exposée publiquement
- **Pour ce projet** : Utilisée dans `api_key_public`

#### **2. Secret key (Clé secrète)**
```
sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```
- **Usage** : Côté serveur (Edge Functions, backend)
- **Sécurité** : ⚠️ **NE JAMAIS exposer publiquement**
- **Pour ce projet** : Utilisée dans `api_key_secret`

### 2.4 Révéler et copier la clé secrète

1. **Cliquer sur** "Reveal test key" (à côté de "Secret key")
2. **Copier la clé** (elle commence par `sk_test_`)
3. **Conserver la clé en sécurité** (ne pas la commiter dans Git)

---

## 📊 Étape 3: Configuration dans la base de données

### 3.1 Exécuter la migration SQL

```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: supabase/migrations/create_payment_system.sql
```

### 3.2 Ajouter la configuration Stripe pour un restaurant

```sql
-- Exemple pour le restaurant ID 1
INSERT INTO public.restaurant_payment_configs
(restaurant_id, provider, api_key_public, api_key_secret, config, is_active)
VALUES
(
  1, -- ID de votre restaurant
  'stripe',
  'pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...', -- Votre clé publique
  'sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...', -- Votre clé secrète
  '{"currency": "EUR", "payment_methods": ["card", "google_pay", "apple_pay"]}'::jsonb,
  true
);
```

### 3.3 Vérifier la configuration

```sql
SELECT
  id,
  restaurant_id,
  provider,
  LEFT(api_key_public, 20) || '...' as public_key_preview,
  LEFT(api_key_secret, 20) || '...' as secret_key_preview,
  config,
  is_active
FROM public.restaurant_payment_configs
WHERE restaurant_id = 1;
```

---

## 🧪 Étape 4: Tester avec des cartes de test Stripe

### 4.1 Cartes de test disponibles

Stripe fournit des cartes de test pour simuler différents scénarios :

#### ✅ **Paiement réussi**
```
Numéro : 4242 4242 4242 4242
Date : N'importe quelle date future (ex: 12/25)
CVC : N'importe quel 3 chiffres (ex: 123)
Code postal : N'importe lequel
```

#### ⚠️ **Carte déclinée**
```
Numéro : 4000 0000 0000 0002
```

#### 🔐 **Authentification 3D Secure requise**
```
Numéro : 4000 0025 0000 3155
```

#### 💰 **Solde insuffisant**
```
Numéro : 4000 0000 0000 9995
```

**Liste complète** : https://stripe.com/docs/testing

### 4.2 Simuler un paiement

1. **Créer une commande** dans botResto
2. **Cliquer sur** "💳 Envoyer lien paiement"
3. **Ouvrir le lien** reçu par WhatsApp
4. **Entrer les informations** de carte de test
5. **Valider le paiement**
6. **Vérifier** dans le Dashboard Stripe → "Payments" → Voir la transaction

---

## 🔔 Étape 5: Configurer les webhooks (obligatoire)

### 5.1 Pourquoi les webhooks ?

Les webhooks permettent à Stripe de notifier votre système quand un paiement est effectué.

### 5.2 Créer un endpoint webhook

1. **Se connecter** au Dashboard Stripe
2. **Cliquer sur** "Developers" → "Webhooks"
3. **Cliquer sur** "Add endpoint"

### 5.3 Configuration de l'endpoint

```
Endpoint URL: https://otxfuxvbdxobipgfnwag.supabase.co/functions/v1/payment-webhook-handler
Description: Bot Restaurant - Payment notifications
```

### 5.4 Sélectionner les événements

Cocher les événements suivants :
- ✅ `checkout.session.completed` (paiement réussi)
- ✅ `checkout.session.expired` (session expirée)
- ✅ `payment_intent.succeeded` (confirmation paiement)
- ✅ `payment_intent.payment_failed` (paiement échoué)

### 5.5 Récupérer le Webhook Secret

1. **Après création**, Stripe affiche le **Webhook signing secret**
```
whsec_abcdef123456789...
```

2. **Copier cette clé** et la stocker dans Supabase :

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_abcdef123456789...
```

---

## 🛠️ Étape 6: Déployer l'Edge Function

### 6.1 Déployer payment-link-sender

```bash
# Depuis la racine du projet
supabase functions deploy payment-link-sender
```

### 6.2 Configurer les secrets Supabase

```bash
# Green API (déjà configuré normalement)
supabase secrets set GREEN_API_TOKEN=your_green_api_token
supabase secrets set GREEN_API_INSTANCE=8101819298
supabase secrets set GREEN_API_URL=https://7105.api.greenapi.com

# URL de l'application (pour les redirections)
supabase secrets set APP_URL=https://votre-domaine.com
```

### 6.3 Déployer payment-webhook-handler (à créer)

```bash
supabase functions deploy payment-webhook-handler
```

---

## ✅ Étape 7: Vérification complète

### 7.1 Checklist de déploiement

- [ ] Migration SQL exécutée (tables créées)
- [ ] Configuration Stripe ajoutée en BDD pour le restaurant
- [ ] Edge Function `payment-link-sender` déployée
- [ ] Edge Function `payment-webhook-handler` déployée (à créer)
- [ ] Secrets Supabase configurés
- [ ] Webhook Stripe configuré avec la bonne URL
- [ ] Test complet : commande → lien → paiement → webhook

### 7.2 Test end-to-end

1. **Créer une commande** de test dans botResto
2. **Envoyer un lien de paiement** depuis le back office
3. **Vérifier** que le message WhatsApp est reçu
4. **Ouvrir le lien** Stripe
5. **Payer** avec la carte de test `4242 4242 4242 4242`
6. **Vérifier** dans Supabase que :
   - `payment_links.status` = `'paid'`
   - `france_orders.online_payment_status` = `'paid'`
7. **Vérifier** dans Dashboard Stripe que le paiement apparaît

---

## 🌍 Étape 8: Passer en production (quand prêt)

### 8.1 Activer le compte Stripe

1. **Compléter le profil** de l'entreprise
2. **Ajouter les informations bancaires** (pour recevoir les paiements)
3. **Vérifier l'identité** (Stripe peut demander des documents)
4. **Attendre l'activation** (généralement 1-2 jours)

### 8.2 Récupérer les clés de production

1. **Dashboard Stripe** → "Developers" → "API keys"
2. **Basculer en mode Live** (switch en haut à gauche)
3. **Révéler et copier** les clés Live :
   - `pk_live_...` (clé publique)
   - `sk_live_...` (clé secrète)

### 8.3 Mettre à jour la configuration

```sql
-- Mettre à jour avec les clés Live
UPDATE public.restaurant_payment_configs
SET
  api_key_public = 'pk_live_...',
  api_key_secret = 'sk_live_...'
WHERE restaurant_id = 1 AND provider = 'stripe';
```

### 8.4 Configurer le webhook de production

1. **Dashboard Stripe** → "Developers" → "Webhooks"
2. **Créer un nouveau endpoint** pour la production
3. **Utiliser la même URL** que pour les tests
4. **Récupérer le nouveau Webhook Secret** (différent du mode test)
5. **Mettre à jour** dans Supabase :

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_production_key...
```

---

## 🔒 Sécurité et bonnes pratiques

### ⚠️ Ne JAMAIS exposer publiquement :
- ❌ La clé secrète (`sk_test_...` ou `sk_live_...`)
- ❌ Le webhook secret (`whsec_...`)

### ✅ Bonnes pratiques :
- ✅ Utiliser des variables d'environnement (Supabase secrets)
- ✅ Tester en mode Test avant de passer en Live
- ✅ Vérifier les signatures des webhooks
- ✅ Logger tous les paiements pour audit
- ✅ Mettre en place des alertes en cas d'échec répété

---

## 🆘 Troubleshooting

### Problème : "Webhook signature verification failed"

**Solution** :
1. Vérifier que le `STRIPE_WEBHOOK_SECRET` est correct
2. Vérifier que l'Edge Function est bien déployée
3. Tester avec `stripe listen` en local

### Problème : "No such payment_intent"

**Solution** :
1. Vérifier que vous utilisez les bonnes clés (test vs live)
2. Vérifier que le payment_intent_id est bien enregistré en BDD

### Problème : "Lien de paiement créé mais pas de WhatsApp"

**Solution** :
1. Vérifier les logs Edge Function : `supabase functions logs payment-link-sender`
2. Vérifier les credentials Green API
3. Vérifier le format du numéro de téléphone (doit finir par `@c.us`)

---

## 📚 Ressources utiles

- **Documentation Stripe** : https://stripe.com/docs
- **Dashboard Stripe** : https://dashboard.stripe.com
- **Cartes de test** : https://stripe.com/docs/testing
- **Webhooks Stripe** : https://stripe.com/docs/webhooks
- **API Reference** : https://stripe.com/docs/api

---

## 📞 Support

**Questions ?**
- Documentation Stripe : https://stripe.com/docs
- Support Stripe : https://support.stripe.com
- Community Stripe : https://github.com/stripe

---

**Dernière mise à jour** : Janvier 2025
**Version** : 1.0.0