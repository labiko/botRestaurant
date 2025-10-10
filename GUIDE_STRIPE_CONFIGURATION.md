# 🔧 Guide Complet Configuration Stripe pour Abonnements SaaS

## 📋 Table des matières
1. [Création compte Stripe](#1-création-compte-stripe)
2. [Récupération des clés API](#2-récupération-des-clés-api)
3. [Création des produits et prix](#3-création-des-produits-et-prix)
4. [Configuration du webhook](#4-configuration-du-webhook)
5. [Configuration dans menu-ai-admin](#5-configuration-dans-menu-ai-admin)
6. [Tests](#6-tests)

---

## 1. Création compte Stripe

### Étape 1.1 : Créer un compte
1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte avec votre email professionnel
3. Confirmer votre email
4. Compléter les informations de votre entreprise

### Étape 1.2 : Activer le mode Test
**IMPORTANT** : Commencez TOUJOURS en mode Test avant de passer en Production

- Le mode Test est activé par défaut
- Vous verrez "Mode Test" avec un toggle en haut à droite du dashboard
- Toutes vos clés commencent par `pk_test_` et `sk_test_`

---

## 2. Récupération des clés API

### Étape 2.1 : Clés API publique et secrète
1. Dans le dashboard Stripe, cliquer sur **Developers** (en haut à droite)
2. Cliquer sur **API keys** dans le menu de gauche
3. Vous verrez deux clés :

   **Clé publique (Publishable key)** :
   ```
   pk_test_51ABC...XYZ
   ```
   → Cette clé sera visible côté client

   **Clé secrète (Secret key)** :
   ```
   sk_test_51ABC...XYZ
   ```
   → ⚠️ **NE JAMAIS PARTAGER** cette clé
   → Cliquer sur "Reveal test key" pour la voir
   → Copier et sauvegarder dans un endroit sécurisé

### Étape 2.2 : Clé Webhook Secret
**ATTENTION** : Ne pas créer maintenant, voir [section 4](#4-configuration-du-webhook)

---

## 3. Création des produits et prix

### Étape 3.1 : Créer un produit
1. Dans le dashboard Stripe, aller sur **Products** (menu gauche)
2. Cliquer sur **+ Add product**
3. Remplir les informations :
   - **Name** : `Abonnement Restaurant Bot WhatsApp`
   - **Description** : `Abonnement mensuel/trimestriel/annuel pour bot restaurant`
   - **Image** : (optionnel) Ajouter un logo
4. ⚠️ **NE PAS cliquer sur "Save product" tout de suite !**

### Étape 3.2 : Configurer les prix (dans le même formulaire)

#### Prix 1 : Mensuel
- **Pricing model** : Standard pricing
- **Price** : `49.00` EUR
- **Billing period** : Monthly
- Cliquer sur **+ Add another price**

#### Prix 2 : Trimestriel (3 mois)
- **Pricing model** : Standard pricing
- **Price** : `127.00` EUR
- **Billing period** : Custom → `Every 3 months`
- Cliquer sur **+ Add another price**

#### Prix 3 : Annuel
- **Pricing model** : Standard pricing
- **Price** : `420.00` EUR
- **Billing period** : Yearly

5. Maintenant cliquer sur **Save product**

### Étape 3.3 : Récupérer les Price IDs
1. Une fois le produit créé, vous voyez 3 prix listés
2. Cliquer sur chaque prix pour voir son **Price ID** :
   ```
   Prix mensuel    → price_1ABC...monthly
   Prix trimestriel → price_1DEF...quarterly
   Prix annuel      → price_1GHI...annual
   ```
3. **Copier et noter ces 3 Price IDs** - vous en aurez besoin !

### 📊 Récapitulatif à ce stade :
```
✅ Clé publique (pk_test_...)
✅ Clé secrète (sk_test_...)
✅ Price ID mensuel (price_1...)
✅ Price ID trimestriel (price_1...)
✅ Price ID annuel (price_1...)
❌ Webhook secret (à faire maintenant !)
```

---

## 4. Configuration du webhook

### Étape 4.1 : Déterminer l'URL de votre webhook

**Format de l'URL** :
```
https://[PROJECT_REF].supabase.co/functions/v1/subscription-webhook
```

**Pour trouver votre PROJECT_REF** :
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. L'URL du projet est visible en haut : `https://app.supabase.com/project/[PROJECT_REF]`
4. Ou dans Settings → API : "Project URL" = `https://[PROJECT_REF].supabase.co`

**Exemples d'URLs** :
- DEV : `https://lphvdoyhwaelmwdfkfuh.supabase.co/functions/v1/subscription-webhook`
- PROD : `https://vywbhlnzvfqtiurwmrac.supabase.co/functions/v1/subscription-webhook`

### Étape 4.2 : Créer le webhook dans Stripe
1. Dans Stripe Dashboard, aller sur **Developers** → **Webhooks**
2. Cliquer sur **+ Add endpoint**
3. Remplir le formulaire :

   **Endpoint URL** :
   ```
   https://[VOTRE_PROJECT_REF].supabase.co/functions/v1/subscription-webhook
   ```

   **Description** (optionnel) :
   ```
   Webhook automatique prolongation abonnements restaurants
   ```

   **Events to send** :
   - Cliquer sur **+ Select events**
   - Dans la recherche, taper : `checkout.session.completed`
   - Cocher **checkout.session.completed**
   - Cliquer sur **Add events**

4. Cliquer sur **Add endpoint**

### Étape 4.3 : Récupérer le Webhook Secret
1. Une fois le webhook créé, vous arrivez sur sa page de détails
2. Dans la section **Signing secret**, cliquer sur **Click to reveal**
3. Copier le secret qui commence par `whsec_...`
   ```
   whsec_1ABC...XYZ
   ```
4. **Sauvegarder ce secret de manière sécurisée**

### 📊 Récapitulatif COMPLET :
```
✅ Clé publique (pk_test_...)
✅ Clé secrète (sk_test_...)
✅ Webhook secret (whsec_...)
✅ Price ID mensuel (price_1...)
✅ Price ID trimestriel (price_1...)
✅ Price ID annuel (price_1...)
```

---

## 5. Configuration dans menu-ai-admin

### Étape 5.1 : Accéder à la page de configuration
1. Ouvrir **menu-ai-admin** : http://localhost:3000
2. **Sélectionner l'environnement** : DEV (en haut à droite)
3. Dans la sidebar, cliquer sur **⚙️ Configuration Stripe**

### Étape 5.2 : Remplir le formulaire

#### Section : Environnement
- Sélectionner : **🧪 Test** (pour commencer)

#### Section : Clés API Stripe
- **Clé Publique** : Coller votre `pk_test_...`
- **Clé Secrète** : Coller votre `sk_test_...`
- **Webhook Secret** : Coller votre `whsec_...`

#### Section : Plans & Prix
- **Price ID Mensuel** : Coller `price_1...monthly`
- **Montant** : `49.00` (déjà pré-rempli)
- **Price ID Trimestriel** : Coller `price_1...quarterly`
- **Montant** : `127.00` (déjà pré-rempli)
- **Price ID Annuel** : Coller `price_1...annual`
- **Montant** : `420.00` (déjà pré-rempli)

#### Section : Notes (optionnel)
```
Configuration Stripe Test - Environnement DEV
Date configuration : [DATE]
```

### Étape 5.3 : Tester la connexion
1. Cliquer sur **🧪 Tester Connexion**
2. Vous devriez voir : ✅ Connexion réussie ! + Email de votre compte Stripe
3. Si erreur :
   - Vérifier que la clé secrète commence bien par `sk_test_`
   - Vérifier qu'il n'y a pas d'espaces avant/après

### Étape 5.4 : Sauvegarder
1. Cliquer sur **💾 Sauvegarder**
2. Message de confirmation : ✅ Configuration Stripe sauvegardée !

---

## 6. Tests

### Test 1 : Test de la configuration (menu-ai-admin)
✅ **Déjà fait à l'étape 5.3** - Si connexion réussie, c'est bon !

### Test 2 : Vérifier l'enregistrement en base
1. Aller sur Supabase Dashboard → Table Editor
2. Sélectionner la table `admin_stripe_config`
3. Vérifier qu'une ligne existe avec :
   - `stripe_public_key` = pk_test_...
   - `stripe_secret_key` = sk_test_...
   - `environment` = test
   - `is_active` = true

### Test 3 : Test renouvellement côté restaurant (botResto)
1. Lancer **botResto** en local
2. Se connecter avec un compte restaurant de DEV
3. Aller sur **Dashboard**
4. Scroller jusqu'à la section **💳 Renouveler mon Abonnement**
5. Cliquer sur **Renouveler 1 mois**
6. Vous devriez être redirigé vers une page Stripe Checkout

### Test 4 : Simuler un paiement test
1. Sur la page Stripe Checkout, utiliser une **carte de test** :
   ```
   Numéro : 4242 4242 4242 4242
   Date expiration : 12/34 (n'importe quelle date future)
   CVC : 123
   Code postal : 12345
   ```
2. Cliquer sur **Payer**
3. Vous êtes redirigé vers votre app avec `?success=true`

### Test 5 : Vérifier la prolongation automatique
1. Aller sur Supabase Dashboard → Table Editor
2. Table `subscription_history` :
   - Vérifier qu'une ligne existe avec :
     - `action` = stripe_renewal
     - `duration_months` = 1
     - `payment_method` = stripe
     - `stripe_session_id` = cs_test_...

3. Table `france_restaurants` :
   - Trouver votre restaurant de test
   - Vérifier que `subscription_end_date` a été prolongé de 1 mois

### Test 6 : Tester prolongation manuelle (menu-ai-admin)
1. Dans menu-ai-admin, aller sur **💳 Gestion Abonnements**
2. Trouver un restaurant test
3. Cliquer sur **➕ Prolonger**
4. Sélectionner durée : 3 mois
5. Ajouter note : "Paiement Orange Money - 50€ - Ref: TEST123"
6. Cliquer sur **✅ Confirmer**
7. Vérifier que la date de fin d'abonnement a été mise à jour

### Test 7 : Vérifier le webhook Stripe
1. Aller sur Stripe Dashboard → **Developers** → **Webhooks**
2. Cliquer sur votre webhook
3. Onglet **Events** : Vous devriez voir les événements `checkout.session.completed`
4. Si succès : ✅ Delivered
5. Si échec : Cliquer sur l'événement pour voir l'erreur

---

## 🚀 Passage en Production

### Quand passer en production ?
- ✅ Tous les tests en DEV fonctionnent
- ✅ Workflow complet testé (renouvellement auto + manuel)
- ✅ Webhook fonctionne correctement

### Étapes pour la production :
1. **Activer le compte Stripe Production** :
   - Stripe Dashboard → Passer en mode Live (toggle en haut à droite)
   - Compléter les informations fiscales et bancaires
   - Activer votre compte (Stripe demandera documents KYC)

2. **Créer les clés Production** :
   - Récupérer `pk_live_...` et `sk_live_...`
   - Créer les mêmes produits/prix en mode Live
   - Récupérer les nouveaux `price_1...` (ils seront différents)

3. **Créer un webhook Production** :
   - URL : `https://[PROD_PROJECT_REF].supabase.co/functions/v1/subscription-webhook`
   - Récupérer le nouveau `whsec_...`

4. **Configurer dans menu-ai-admin** :
   - Sélectionner environnement : **PROD**
   - Remplir avec les clés LIVE
   - Environnement Stripe : **🚀 Production**
   - Sauvegarder

5. **Tester avec une vraie carte** :
   - Faire un paiement de test de 0.50€
   - Rembourser depuis Stripe Dashboard si besoin

---

## 🔒 Sécurité - Checklist

- ✅ Les clés secrètes ne sont JAMAIS exposées côté client
- ✅ Le webhook secret est validé dans subscription-webhook
- ✅ Les Edge Functions sont sécurisées (pas d'accès public direct aux clés)
- ✅ La config Stripe est stockée en base avec accès restreint
- ✅ Les paiements sont traités par Stripe (PCI DSS compliant)

---

## 📞 Support Stripe

### Documentation officielle
- Dashboard : https://dashboard.stripe.com
- Docs API : https://stripe.com/docs/api
- Webhooks : https://stripe.com/docs/webhooks
- Checkout : https://stripe.com/docs/payments/checkout

### Cartes de test
- https://stripe.com/docs/testing

### Support
- Email : support@stripe.com
- Chat : Disponible dans le dashboard (bulle en bas à droite)

---

## ✅ Checklist finale

Avant de considérer la configuration terminée :

### Configuration Stripe
- [ ] Compte Stripe créé
- [ ] Mode Test activé
- [ ] Produit créé avec 3 prix
- [ ] Clés API récupérées (pk_test, sk_test)
- [ ] Webhook créé et configuré
- [ ] Webhook secret récupéré (whsec_)

### Configuration menu-ai-admin
- [ ] Configuration Stripe remplie
- [ ] Test connexion réussi
- [ ] Configuration sauvegardée
- [ ] Vérification en base de données

### Tests fonctionnels
- [ ] Test renouvellement restaurant (botResto)
- [ ] Test paiement avec carte test
- [ ] Vérification prolongation automatique en base
- [ ] Test prolongation manuelle (menu-ai-admin)
- [ ] Vérification webhook Stripe (events delivered)
- [ ] Test banner statut abonnement dans orders-france

---

## 🎉 Configuration terminée !

Votre système d'abonnement SaaS est maintenant opérationnel.

**Prochaines étapes** :
1. Tester avec quelques restaurants pilotes
2. Collecter les retours utilisateurs
3. Ajuster les prix si nécessaire
4. Passer en Production quand tout est validé

**Bon courage ! 🚀**
