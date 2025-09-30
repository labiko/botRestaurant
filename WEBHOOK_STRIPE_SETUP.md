# 🔔 Configuration Webhook Stripe - Guide rapide

## ✅ Status actuel:
- ✅ Tables BDD créées
- ✅ Config Stripe Pizza Yolo 77 en base
- ✅ Edge Function `payment-webhook-handler` déployée
- ⏳ **Webhook Stripe à configurer**

---

## 🎯 Étape 1: Créer le webhook dans Stripe Dashboard

### 1.1 Se connecter
1. Aller sur : https://dashboard.stripe.com/login
2. **Vérifier que vous êtes en mode TEST** (switch en haut à gauche)

### 1.2 Accéder aux webhooks
1. Cliquer sur **"Developers"** (en haut à droite)
2. Cliquer sur **"Webhooks"** (dans le menu de gauche)
3. Cliquer sur **"Add endpoint"** (bouton bleu)

### 1.3 Configurer l'endpoint

**Endpoint URL** (copier-coller exactement):
```
https://lphvdoyhwaelmwdfkfuh.supabase.co/functions/v1/payment-webhook-handler
```

**Description** (optionnel):
```
Bot Restaurant - Notifications paiement
```

**Version API**:
```
Laisser par défaut (Latest API version)
```

### 1.4 Sélectionner les événements

Cocher **uniquement** ces 3 événements:

✅ **checkout.session.completed** (obligatoire - paiement réussi)
✅ **checkout.session.expired** (optionnel - session expirée)
✅ **payment_intent.payment_failed** (optionnel - paiement échoué)

**Comment les trouver ?**
- Cliquer sur "Select events to listen to"
- Chercher "checkout.session" dans la barre de recherche
- Cocher les 3 événements ci-dessus

### 1.5 Créer l'endpoint

1. Cliquer sur **"Add endpoint"**
2. Stripe affiche la page avec le **Signing secret**

---

## 🔐 Étape 2: Récupérer le Signing Secret

**Sur la page du webhook que vous venez de créer:**

1. Repérer la section **"Signing secret"**
2. Cliquer sur **"Reveal"** (ou "Click to reveal")
3. Le secret commence par: `whsec_...`
4. **Copier ce secret** (il sera utilisé dans l'étape suivante)

Exemple:
```
whsec_abcd1234efgh5678ijkl9012mnop3456
```

---

## ⚙️ Étape 3: Configurer le secret dans Supabase

### Option A: Via Supabase CLI (recommandé)

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici --project-ref lphvdoyhwaelmwdfkfuh
```

### Option B: Via Supabase Dashboard

1. Aller sur : https://supabase.com/dashboard/project/lphvdoyhwaelmwdfkfuh/settings/vault
2. Cliquer sur **"New secret"**
3. Remplir:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Secret: `whsec_votre_secret_ici`
4. Cliquer sur **"Create secret"**

---

## 🧪 Étape 4: Tester le système complet

### 4.1 Test dans botResto

1. **Lancer botResto** en dev: `npm start`
2. **Se connecter** comme restaurant Pizza Yolo 77
3. **Aller sur** "Gestion des commandes"
4. **Créer une commande test** (si besoin)
5. **Cliquer sur** "💳 Envoyer lien paiement"
6. **Vérifier** que le message WhatsApp est reçu

### 4.2 Test paiement Stripe

1. **Ouvrir le lien** reçu par WhatsApp
2. **Entrer les infos** de carte de test:
   - Numéro: `4242 4242 4242 4242`
   - Date: N'importe quelle date future (ex: `12/25`)
   - CVC: N'importe quel 3 chiffres (ex: `123`)
   - Code postal: N'importe lequel
3. **Cliquer sur** "Pay"
4. **Attendre** la redirection (succès)

### 4.3 Vérification dans botResto

1. **Attendre 30 secondes** (auto-refresh)
2. **Vérifier** que le badge "Payé en ligne" apparaît sur la commande

### 4.4 Vérification dans Stripe Dashboard

1. **Aller sur** : https://dashboard.stripe.com/test/payments
2. **Vérifier** que le paiement apparaît
3. **Cliquer dessus** pour voir les détails

### 4.5 Vérification dans Supabase

```sql
-- Vérifier le payment_link
SELECT * FROM payment_links ORDER BY created_at DESC LIMIT 1;
-- Status doit être 'paid'

-- Vérifier la commande
SELECT id, order_number, online_payment_status
FROM france_orders
WHERE online_payment_status = 'paid'
ORDER BY created_at DESC LIMIT 1;
```

---

## 🐛 Troubleshooting

### Problème: Badge ne s'affiche pas

**Solutions:**
1. Attendre 30s (auto-refresh)
2. Rafraîchir manuellement (bouton refresh)
3. Vérifier les logs webhook: https://dashboard.stripe.com/test/webhooks
4. Vérifier les logs Edge Function: `supabase functions logs payment-webhook-handler --project-ref lphvdoyhwaelmwdfkfuh`

### Problème: Webhook échoue (erreur dans Stripe)

**Solutions:**
1. Vérifier que `STRIPE_WEBHOOK_SECRET` est bien configuré
2. Vérifier que l'URL du webhook est correcte
3. Vérifier les logs: `supabase functions logs payment-webhook-handler`

### Problème: Message WhatsApp non reçu

**Solutions:**
1. Vérifier les credentials Green API
2. Vérifier les logs: `supabase functions logs payment-link-sender`
3. Vérifier le format du numéro (doit finir par `@c.us`)

---

## ✅ Checklist finale

- [ ] Webhook créé dans Stripe Dashboard
- [ ] Événements sélectionnés (checkout.session.completed minimum)
- [ ] Signing secret copié
- [ ] Secret configuré dans Supabase (`STRIPE_WEBHOOK_SECRET`)
- [ ] Test complet réussi (envoi lien → paiement → badge)
- [ ] Vérification dans Stripe Dashboard
- [ ] Vérification dans Supabase (payment_links + france_orders)

---

## 🎉 Félicitations !

Si tous les tests passent, le système de paiement en ligne est **100% fonctionnel** !

**Prochaine étape** : Passer en production (clés live + webhook live)

---

**Date de création** : 2025-01-30