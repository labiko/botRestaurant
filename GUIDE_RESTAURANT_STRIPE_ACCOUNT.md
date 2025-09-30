# 🏪 Guide Restaurant - Créer votre compte Stripe

## 🎯 Pourquoi créer un compte Stripe ?

Pour recevoir les **paiements en ligne** de vos clients directement sur votre compte bancaire.

---

## ✅ Étape 1 : Créer votre compte Stripe (Gratuit)

### 1.1 Inscription

1. **Aller sur** : https://dashboard.stripe.com/register
2. **Remplir** :
   - Email professionnel de votre restaurant
   - Nom complet
   - Pays : **France**
   - Mot de passe sécurisé
3. **Cliquer** sur "Create account"
4. **Vérifier votre email** (lien reçu par email)

### 1.2 Compléter votre profil

1. **Se connecter** : https://dashboard.stripe.com/login
2. **Remplir les informations** :
   - Nom du restaurant
   - Type d'entreprise (SARL, Auto-entrepreneur, etc.)
   - SIRET
   - Adresse du restaurant
   - Informations bancaires (IBAN)

**⏱️ Temps nécessaire** : 10-15 minutes

---

## 🔑 Étape 2 : Récupérer vos clés API (Mode Test)

### 2.1 Accéder aux clés

1. **Cliquer** sur **"Developers"** (en haut à droite)
2. **Cliquer** sur **"API keys"** (menu gauche)
3. **Vérifier** que vous êtes en **"Mode Test"** (switch en haut à gauche)

### 2.2 Copier les clés

Vous verrez 2 clés :

#### **Clé publique** (Publishable key)
```
pk_test_51AbCdEf...
```
→ **Copier cette clé**

#### **Clé secrète** (Secret key)
```
sk_test_51AbCdEf...
```
→ **Cliquer sur "Reveal"** puis **copier cette clé**

---

## 📧 Étape 3 : Envoyer vos clés à Bot Restaurant

**⚠️ IMPORTANT** : Les clés test commencent par `pk_test_` et `sk_test_`

**Envoyez-nous par email sécurisé :**
- Nom de votre restaurant
- Clé publique (`pk_test_...`)
- Clé secrète (`sk_test_...`)

**Email** : support@bot-restaurant.com (exemple)

---

## 🧪 Étape 4 : Tests

Une fois vos clés configurées, vous pourrez :

1. **Tester les paiements** avec des cartes de test :
   - Numéro : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel code

2. **Voir les paiements** dans votre Dashboard Stripe

---

## 🚀 Étape 5 : Passer en production (Quand prêt)

### 5.1 Activer votre compte

Stripe vous demandera de :
- ✅ Vérifier votre identité (pièce d'identité)
- ✅ Confirmer vos informations bancaires
- ✅ Fournir documents d'entreprise (Kbis, etc.)

**⏱️ Délai d'activation** : 1-3 jours ouvrés

### 5.2 Récupérer les clés Live

1. **Basculer en mode Live** (switch en haut à gauche)
2. **Copier les nouvelles clés** :
   - Clé publique : `pk_live_...`
   - Clé secrète : `sk_live_...`
3. **Envoyer les clés Live** à Bot Restaurant

---

## 💰 Réception des paiements

### Quand recevez-vous l'argent ?

- **Premier paiement** : 7 jours après activation
- **Suivants** : Tous les 2-3 jours (rolling basis)
- **Virements** : Sur votre compte bancaire automatiquement

### Frais Stripe

- **1.4% + 0.25€** par transaction carte européenne
- **2.9% + 0.25€** par transaction carte non-européenne
- **Pas de frais** d'abonnement mensuel Stripe

---

## 🔒 Sécurité

### ⚠️ Ne JAMAIS partager :
- Vos clés secrètes publiquement
- Votre mot de passe Stripe

### ✅ Bonnes pratiques :
- Utiliser un mot de passe fort
- Activer la double authentification (2FA)
- Vérifier régulièrement votre Dashboard Stripe

---

## 📊 Suivre vos paiements

### Dans Stripe Dashboard

1. **Se connecter** : https://dashboard.stripe.com
2. **Cliquer** sur "Payments" (menu gauche)
3. **Voir** :
   - Liste de tous les paiements
   - Montants reçus
   - Statuts des virements
   - Clients

---

## 🆘 Support

### Questions sur Stripe ?
- **Documentation** : https://stripe.com/docs
- **Support Stripe** : support@stripe.com
- **Téléphone** : 01 76 54 00 12 (France)

### Questions sur Bot Restaurant ?
- **Email** : support@bot-restaurant.com
- **WhatsApp** : +33 X XX XX XX XX

---

## ✅ Checklist finale

- [ ] Compte Stripe créé et vérifié
- [ ] Profil complété (nom, adresse, SIRET)
- [ ] Informations bancaires ajoutées
- [ ] Clés API test récupérées (pk_test + sk_test)
- [ ] Clés envoyées à Bot Restaurant
- [ ] Test de paiement effectué avec succès
- [ ] Compte activé pour production (quand prêt)
- [ ] Clés Live récupérées et envoyées

---

**Date** : 2025-01-30
**Version** : 1.0