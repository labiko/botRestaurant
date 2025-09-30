# 🔗 Stripe Connect - Multi-restaurants

## 🎯 Objectif
Chaque restaurant reçoit directement les paiements sur **son propre compte Stripe**.

---

## 📋 Architecture Stripe Connect

### Concept
```
┌──────────────────────────────────────────────────────────┐
│          TON COMPTE STRIPE PLATFORM (Maître)             │
│  - Gère la plateforme                                    │
│  - Prend commission optionnelle                          │
│  - Voit tous les paiements                               │
└──────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Restaurant 1  │  │ Restaurant 2  │  │ Restaurant 3  │
│ Compte Stripe │  │ Compte Stripe │  │ Compte Stripe │
│ Connect       │  │ Connect       │  │ Connect       │
└───────────────┘  └───────────────┘  └───────────────┘
      │                  │                  │
      └──────────────────┴──────────────────┘
              Argent arrive directement
```

---

## 🚀 Étapes d'implémentation

### 1. Activer Stripe Connect sur ton compte

1. **Se connecter** : https://dashboard.stripe.com
2. **Aller sur** : Settings → Connect settings
3. **Activer Stripe Connect**
4. **Choisir le type** : "Standard accounts" (recommandé)

### 2. Modifier la table `restaurant_payment_configs`

```sql
-- Ajouter colonne pour Stripe Connect Account ID
ALTER TABLE public.restaurant_payment_configs
ADD COLUMN stripe_connect_account_id VARCHAR;

-- Index
CREATE INDEX idx_payment_configs_connect_account
ON restaurant_payment_configs(stripe_connect_account_id);

-- Commentaire
COMMENT ON COLUMN restaurant_payment_configs.stripe_connect_account_id
IS 'ID du compte Stripe Connect du restaurant (acct_...)';
```

### 3. Créer un lien d'onboarding pour chaque restaurant

#### **Option A: Onboarding automatique (Express/Standard)**

```typescript
// supabase/functions/create-stripe-connect-account/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';

serve(async (req) => {
  const { restaurantId, email, name } = await req.json();

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16'
  });

  // Créer un compte Connect
  const account = await stripe.accounts.create({
    type: 'express', // ou 'standard'
    country: 'FR',
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    business_profile: {
      name: name
    }
  });

  // Créer un lien d'onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${Deno.env.get('APP_URL')}/restaurant/settings/payment`,
    return_url: `${Deno.env.get('APP_URL')}/restaurant/settings/payment?success=true`,
    type: 'account_onboarding'
  });

  // Sauvegarder l'account ID en BDD
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase
    .from('restaurant_payment_configs')
    .update({ stripe_connect_account_id: account.id })
    .eq('restaurant_id', restaurantId);

  return new Response(JSON.stringify({
    accountId: account.id,
    onboardingUrl: accountLink.url
  }));
});
```

### 4. Modifier `payment-link-sender` pour utiliser Connect

```typescript
// Dans createPaymentLink(), ajouter le destination account

const session = await stripe.checkout.sessions.create({
  payment_intent_data: {
    // ✅ NOUVEAU : Argent va sur le compte du restaurant
    transfer_data: {
      destination: config.stripe_connect_account_id
    },
    // ✅ OPTIONNEL : Commission pour toi
    application_fee_amount: Math.round(order.total_amount * 100 * 0.05) // 5% commission
  },
  mode: 'payment',
  success_url: config.success_url,
  cancel_url: config.cancel_url,
  line_items: [...]
});
```

### 5. Webhook reste le même

Le webhook actuel fonctionne déjà ! Stripe Connect utilise le même système.

---

## 📊 Flux complet

### **Pour chaque nouveau restaurant:**

1. **Restaurant s'inscrit** dans ton back office
2. **Tu cliques sur** "Connecter Stripe"
3. **Edge Function génère** un lien d'onboarding
4. **Restaurant clique** sur le lien → Redirigé vers Stripe
5. **Restaurant remplit** ses infos (compte bancaire, etc.)
6. **Stripe valide** le compte (quelques minutes/heures)
7. **Account ID** stocké en BDD (`acct_xxx`)
8. **Restaurant prêt** à recevoir des paiements

### **Quand un client paie:**

```
Client paie 50€ pour Pizza Yolo 77
     │
     ├─ 47.50€ → Compte Stripe Pizza Yolo 77 (direct)
     ├─ 2.50€  → Ton compte (commission)
     └─ Frais Stripe (~1.4% + 0.25€) déduits automatiquement
```

---

## 💰 Gestion des commissions

### Option 1: Commission fixe (ex: 5%)
```typescript
application_fee_amount: Math.round(order.total_amount * 100 * 0.05)
```

### Option 2: Commission par restaurant (flexible)
```typescript
// Ajouter colonne en BDD
ALTER TABLE restaurant_payment_configs
ADD COLUMN commission_percentage NUMERIC DEFAULT 5.0;

// Utiliser en code
application_fee_amount: Math.round(
  order.total_amount * 100 * (config.commission_percentage / 100)
)
```

### Option 3: Pas de commission
```typescript
// Supprimer application_fee_amount
// Tu gagnes quand même via abonnement mensuel, etc.
```

---

## 🔒 Sécurité et vérifications

### Vérifier qu'un compte est activé

```typescript
const account = await stripe.accounts.retrieve(accountId);

if (account.charges_enabled && account.payouts_enabled) {
  // ✅ Compte prêt
} else {
  // ❌ Compte pas encore activé
  throw new Error('Restaurant doit compléter son onboarding Stripe');
}
```

### Gérer les comptes non activés

```typescript
// Dans payment-link-sender
if (!config.stripe_connect_account_id) {
  throw new Error('Restaurant n\'a pas configuré son compte Stripe');
}

const account = await stripe.accounts.retrieve(config.stripe_connect_account_id);
if (!account.charges_enabled) {
  throw new Error('Compte Stripe du restaurant pas encore activé');
}
```

---

## 🧪 Tests avec Stripe Connect

### Créer un compte test

```bash
# Créer un compte Express test
stripe accounts create \
  --type=express \
  --country=FR \
  --email=test-restaurant@example.com \
  --capabilities[card_payments][requested]=true \
  --capabilities[transfers][requested]=true
```

### Simuler un compte activé

Dans le Dashboard Stripe Test mode, tu peux activer instantanément les comptes Connect pour les tests.

---

## 📱 Interface utilisateur (back office)

### Page "Paramètres paiement" pour restaurants

```typescript
// botResto/src/app/features/restaurant-france/settings-france/payment-settings.component.ts

async connectStripe() {
  const response = await fetch(
    `${environment.supabaseFranceUrl}/functions/v1/create-stripe-connect-account`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.supabaseFranceAnonKey}`
      },
      body: JSON.stringify({
        restaurantId: this.restaurantId,
        email: this.restaurant.email,
        name: this.restaurant.name
      })
    }
  );

  const { onboardingUrl } = await response.json();

  // Rediriger vers Stripe
  window.location.href = onboardingUrl;
}
```

### UI avec status du compte

```html
<div *ngIf="!hasStripeConnected">
  <ion-button (click)="connectStripe()">
    <ion-icon name="card" slot="start"></ion-icon>
    Connecter mon compte Stripe
  </ion-button>
</div>

<div *ngIf="hasStripeConnected">
  <div class="status-badge success">
    <ion-icon name="checkmark-circle"></ion-icon>
    Compte Stripe connecté
  </div>

  <p>Les paiements arrivent directement sur votre compte.</p>

  <ion-button fill="outline" (click)="viewStripeDashboard()">
    Voir mes paiements sur Stripe
  </ion-button>
</div>
```

---

## 💡 Solution alternative : Comptes Stripe séparés (non recommandé)

Si tu veux vraiment des comptes **totalement indépendants** sans Connect :

### Inconvénients:
- ❌ Chaque restaurant doit créer son compte Stripe seul
- ❌ Tu dois stocker les clés de CHAQUE restaurant en BDD
- ❌ Pas de commission automatique pour toi
- ❌ Pas de vue centralisée
- ❌ Plus complexe à maintenir

### Si tu veux quand même cette approche:

1. Chaque restaurant crée son compte Stripe
2. Chaque restaurant te donne ses clés API
3. Tu stockes les clés en BDD (chiffrées)
4. Tu utilises les clés spécifiques pour chaque paiement

**⚠️ Pas recommandé** : Stripe Connect est fait exactement pour ton cas d'usage.

---

## ✅ Checklist implémentation Stripe Connect

### Phase 1: Setup
- [ ] Activer Stripe Connect sur ton compte
- [ ] Ajouter colonne `stripe_connect_account_id` en BDD
- [ ] Créer Edge Function `create-stripe-connect-account`
- [ ] Déployer Edge Function

### Phase 2: UI Restaurant
- [ ] Page "Paramètres paiement" dans botResto
- [ ] Bouton "Connecter Stripe"
- [ ] Affichage status compte
- [ ] Lien vers Dashboard Stripe du restaurant

### Phase 3: Modifier paiements
- [ ] Mettre à jour `payment-link-sender` avec `transfer_data`
- [ ] Ajouter gestion commission (optionnel)
- [ ] Tester avec compte Connect test

### Phase 4: Production
- [ ] Onboarder premier restaurant réel
- [ ] Tester paiement end-to-end
- [ ] Vérifier que l'argent arrive sur bon compte
- [ ] Documentation pour nouveaux restaurants

---

## 🎯 Recommandation finale

**Utilise Stripe Connect** :
- C'est la solution standard pour les marketplaces/plateformes
- Simple à maintenir
- Flexible (commission, pas de commission)
- Chaque restaurant contrôle son argent
- Tu gardes une vue d'ensemble

**Temps d'implémentation** : ~2-3 heures pour la version de base

**Veux-tu que je commence l'implémentation de Stripe Connect ?**

---

**Date:** 2025-01-30
**Version:** 1.0