# 💳 PLAN D'INTÉGRATION SYSTÈME DE PAIEMENT EN LIGNE

## 🎯 Objectifs

**Contraintes strictes :**
- ✅ **ZÉRO modification sur le bot WhatsApp**
- ✅ Chaque restaurant avec son propre système de paiement (Stripe, Lengopay, etc.)
- ✅ Nouveau bouton côté livreur pour envoyer lien de paiement
- ✅ Nouveau bouton côté back office restaurant pour envoyer lien de paiement
- ✅ Service générique réutilisable par les deux interfaces
- ✅ Envoi automatique du lien par WhatsApp au client

**Cas d'usage :**
1. **Restaurant** : Envoie lien de paiement avant/pendant préparation
2. **Livreur** : Envoie lien de paiement à la livraison (si paiement non effectué)

---

## 🏗️ Architecture Proposée

```
┌──────────────────────────────────────────────────────────────┐
│                    INTERFACES UTILISATEUR                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │  Back Office Restaurant │  │   Application Livreur    │  │
│  │       (botResto)        │  │      (botResto)          │  │
│  │                          │  │                          │  │
│  │  📋 Liste commandes     │  │  📦 Commandes assignées  │  │
│  │  💳 Bouton "Envoyer     │  │  💳 Bouton "Demander     │  │
│  │      lien paiement"     │  │      paiement"           │  │
│  └─────────────────────────┘  └──────────────────────────┘  │
│              │                            │                   │
└──────────────┼────────────────────────────┼──────────────────┘
               │                            │
               └────────────┬───────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION (GÉNÉRIQUE)              │
│                 payment-link-sender                          │
│                                                               │
│  Input: { orderId, senderId, senderType }                   │
│                                                               │
│  1. Récupère commande (france_orders)                       │
│  2. Récupère config paiement restaurant                     │
│  3. Génère lien de paiement (provider spécifique)           │
│  4. Envoie lien via WhatsApp (MessageSender)                │
│  5. Log transaction (payment_links)                         │
└──────────────────────────────────────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
┌────────────────────────┐  ┌────────────────────────┐
│   Payment Providers    │  │   WhatsApp (Green API) │
│                        │  │                        │
│  • Stripe              │  │  Envoie message avec   │
│  • Lengopay            │  │  lien de paiement      │
│  • Wave (futur)        │  │                        │
│  • Orange Money (futur)│  │                        │
└────────────────────────┘  └────────────────────────┘
```

---

## 🗄️ Base de Données

### 1. **restaurant_payment_configs** (Nouvelle table)
Configuration des moyens de paiement par restaurant.

```sql
CREATE TABLE public.restaurant_payment_configs (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES public.france_restaurants(id) ON DELETE CASCADE,

  -- Provider de paiement
  provider VARCHAR NOT NULL CHECK (provider IN ('stripe', 'lengopay', 'wave', 'orange_money', 'custom')),

  -- Identifiants API (chiffrés en production)
  api_key_public VARCHAR,      -- Clé publique (ex: pk_test_...)
  api_key_secret VARCHAR,       -- Clé secrète (chiffrée)
  merchant_id VARCHAR,          -- ID marchand (pour Lengopay, Wave, etc.)

  -- Configuration spécifique
  config JSONB DEFAULT '{}',    -- Config flexible par provider

  -- URLs de callback
  success_url VARCHAR,          -- URL de succès personnalisée
  cancel_url VARCHAR,           -- URL d'annulation personnalisée
  webhook_url VARCHAR,          -- URL webhook pour notifications

  -- Options
  is_active BOOLEAN DEFAULT true,
  auto_send_on_order BOOLEAN DEFAULT false,  -- Envoi automatique à chaque commande
  send_on_delivery BOOLEAN DEFAULT false,    -- Envoi automatique à la livraison

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_restaurant_provider UNIQUE (restaurant_id, provider)
);

CREATE INDEX idx_payment_configs_restaurant ON restaurant_payment_configs(restaurant_id);
CREATE INDEX idx_payment_configs_active ON restaurant_payment_configs(is_active);

-- Trigger pour updated_at
CREATE TRIGGER update_restaurant_payment_configs_updated_at
  BEFORE UPDATE ON restaurant_payment_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Exemples de configurations :**

```sql
-- Restaurant avec Stripe
INSERT INTO restaurant_payment_configs
(restaurant_id, provider, api_key_public, api_key_secret, config, is_active)
VALUES
(1, 'stripe', 'pk_test_...', 'sk_test_...',
 '{"currency": "EUR", "payment_methods": ["card", "google_pay", "apple_pay"]}',
 true);

-- Restaurant avec Lengopay
INSERT INTO restaurant_payment_configs
(restaurant_id, provider, merchant_id, api_key_secret, config, is_active)
VALUES
(2, 'lengopay', 'merchant_123', 'lengopay_secret_key',
 '{"currency": "GNF", "payment_methods": ["mobile_money", "card"]}',
 true);
```

---

### 2. **payment_links** (Nouvelle table)
Historique des liens de paiement générés et envoyés.

```sql
CREATE TABLE public.payment_links (
  id BIGSERIAL PRIMARY KEY,

  -- Relations
  order_id INTEGER NOT NULL REFERENCES public.france_orders(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES public.france_restaurants(id),
  config_id BIGINT NOT NULL REFERENCES public.restaurant_payment_configs(id),

  -- Détails du lien
  provider VARCHAR NOT NULL,
  payment_link_url TEXT NOT NULL,
  payment_intent_id VARCHAR,     -- ID transaction chez le provider (ex: pi_xxx pour Stripe)

  -- Montant
  amount NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'EUR',

  -- Statut
  status VARCHAR NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'viewed', 'paid', 'failed', 'expired', 'cancelled')),

  -- Qui a envoyé le lien
  sent_by_id INTEGER,            -- ID du user (restaurant staff ou livreur)
  sent_by_type VARCHAR CHECK (sent_by_type IN ('restaurant', 'driver', 'system')),
  sent_at TIMESTAMPTZ,

  -- Tracking
  viewed_at TIMESTAMPTZ,         -- Quand le client a ouvert le lien
  paid_at TIMESTAMPTZ,           -- Quand le paiement a été effectué

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  -- Métadonnées
  metadata JSONB DEFAULT '{}',   -- Infos supplémentaires du provider
  webhook_events JSONB DEFAULT '[]',  -- Log des événements webhook reçus

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT payment_links_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT payment_links_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

CREATE INDEX idx_payment_links_order ON payment_links(order_id);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_payment_links_provider ON payment_links(provider);
CREATE INDEX idx_payment_links_created_at ON payment_links(created_at DESC);

-- Trigger pour updated_at
CREATE TRIGGER update_payment_links_updated_at
  BEFORE UPDATE ON payment_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 3. **Modification france_orders** (Optionnel)
Ajouter une colonne pour tracker l'état du paiement en ligne.

```sql
ALTER TABLE public.france_orders
ADD COLUMN online_payment_status VARCHAR
  CHECK (online_payment_status IN ('not_sent', 'link_sent', 'paid', 'failed'))
  DEFAULT 'not_sent';

CREATE INDEX idx_orders_online_payment_status ON france_orders(online_payment_status);
```

---

## 🔌 Service Générique : Payment Link Sender

### Architecture du service

```typescript
// supabase/functions/payment-link-sender/index.ts

/**
 * SERVICE GÉNÉRIQUE D'ENVOI DE LIENS DE PAIEMENT
 *
 * Utilisé par :
 * - Back office restaurant (botResto)
 * - Application livreur (botResto)
 *
 * Workflow :
 * 1. Récupère config paiement du restaurant
 * 2. Génère lien de paiement via provider
 * 3. Envoie lien par WhatsApp
 * 4. Log transaction
 */

interface PaymentLinkRequest {
  orderId: number;
  senderId?: number;           // ID du user qui envoie (optionnel)
  senderType: 'restaurant' | 'driver' | 'system';
  customMessage?: string;      // Message personnalisé (optionnel)
  expiresIn?: number;          // Durée d'expiration en heures (défaut: 24h)
}

interface PaymentLinkResponse {
  success: boolean;
  paymentLinkId?: number;
  paymentUrl?: string;
  messageSent: boolean;
  error?: string;
}
```

---

### Intégration des providers de paiement

#### **1. Stripe**

```typescript
// supabase/functions/payment-link-sender/providers/StripeProvider.ts

import Stripe from 'https://esm.sh/stripe@14.0.0';

export class StripeProvider {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentLink(order: Order, config: PaymentConfig): Promise<PaymentLinkResult> {
    try {
      // Créer un Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convertir en centimes
        currency: config.currency || 'eur',
        payment_method_types: config.config.payment_methods || ['card'],
        metadata: {
          order_id: order.id,
          restaurant_id: order.restaurant_id,
          customer_phone: order.phone_number
        }
      });

      // Créer un Checkout Session
      const session = await this.stripe.checkout.sessions.create({
        payment_intent: paymentIntent.id,
        mode: 'payment',
        success_url: config.success_url || `${Deno.env.get('APP_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config.cancel_url || `${Deno.env.get('APP_URL')}/payment/cancel`,
        customer_email: undefined, // Pas d'email disponible
        line_items: [
          {
            price_data: {
              currency: config.currency || 'eur',
              product_data: {
                name: `Commande #${order.order_number}`,
                description: `Restaurant: ${order.restaurant_name}`
              },
              unit_amount: Math.round(order.total_amount * 100)
            },
            quantity: 1
          }
        ]
      });

      return {
        success: true,
        paymentUrl: session.url!,
        paymentIntentId: paymentIntent.id,
        metadata: {
          sessionId: session.id,
          paymentIntentId: paymentIntent.id
        }
      };
    } catch (error) {
      console.error('❌ [Stripe] Erreur création lien:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

---

#### **2. Lengopay**

```typescript
// supabase/functions/payment-link-sender/providers/LengopayProvider.ts

export class LengopayProvider {
  private apiUrl: string;
  private merchantId: string;
  private apiKey: string;

  constructor(merchantId: string, apiKey: string) {
    this.apiUrl = 'https://api.lengopay.com/v1'; // URL à confirmer
    this.merchantId = merchantId;
    this.apiKey = apiKey;
  }

  async createPaymentLink(order: Order, config: PaymentConfig): Promise<PaymentLinkResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payment-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-Id': this.merchantId
        },
        body: JSON.stringify({
          amount: order.total_amount,
          currency: config.currency || 'GNF',
          description: `Commande #${order.order_number}`,
          customer: {
            phone: order.phone_number,
            name: order.customer_name
          },
          metadata: {
            order_id: order.id,
            restaurant_id: order.restaurant_id
          },
          success_url: config.success_url,
          cancel_url: config.cancel_url,
          webhook_url: config.webhook_url,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        })
      });

      if (!response.ok) {
        throw new Error(`Lengopay API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        paymentUrl: data.payment_url,
        paymentIntentId: data.payment_id,
        metadata: data
      };
    } catch (error) {
      console.error('❌ [Lengopay] Erreur création lien:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

---

### Service principal (Factory Pattern)

```typescript
// supabase/functions/payment-link-sender/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { StripeProvider } from './providers/StripeProvider.ts';
import { LengopayProvider } from './providers/LengopayProvider.ts';
import { MessageSender } from '../_shared/services/MessageSender.ts';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { orderId, senderId, senderType, customMessage, expiresIn } = await req.json();

    // 1. Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('france_orders')
      .select(`
        *,
        restaurant:france_restaurants(id, name, slug)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Commande introuvable');
    }

    // 2. Récupérer la config de paiement du restaurant
    const { data: config, error: configError } = await supabase
      .from('restaurant_payment_configs')
      .select('*')
      .eq('restaurant_id', order.restaurant_id)
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      throw new Error('Aucune configuration de paiement active pour ce restaurant');
    }

    // 3. Créer le lien de paiement via le provider approprié
    let paymentResult;

    switch (config.provider) {
      case 'stripe':
        const stripeProvider = new StripeProvider(config.api_key_secret);
        paymentResult = await stripeProvider.createPaymentLink(order, config);
        break;

      case 'lengopay':
        const lengopayProvider = new LengopayProvider(config.merchant_id, config.api_key_secret);
        paymentResult = await lengopayProvider.createPaymentLink(order, config);
        break;

      default:
        throw new Error(`Provider non supporté: ${config.provider}`);
    }

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Échec création lien de paiement');
    }

    // 4. Enregistrer le lien dans la BDD
    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .insert({
        order_id: orderId,
        restaurant_id: order.restaurant_id,
        config_id: config.id,
        provider: config.provider,
        payment_link_url: paymentResult.paymentUrl,
        payment_intent_id: paymentResult.paymentIntentId,
        amount: order.total_amount,
        currency: config.config?.currency || 'EUR',
        status: 'pending',
        sent_by_id: senderId,
        sent_by_type: senderType,
        expires_at: new Date(Date.now() + (expiresIn || 24) * 60 * 60 * 1000),
        metadata: paymentResult.metadata
      })
      .select()
      .single();

    if (linkError) {
      throw new Error('Erreur enregistrement lien de paiement');
    }

    // 5. Envoyer le lien par WhatsApp
    const messageSender = new MessageSender(
      Deno.env.get('GREEN_API_TOKEN')!,
      Deno.env.get('GREEN_API_INSTANCE')!
    );

    const message = customMessage || formatPaymentMessage(order, paymentResult.paymentUrl, config);

    try {
      await messageSender.sendMessage(order.phone_number, message);

      // Marquer comme envoyé
      await supabase
        .from('payment_links')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', paymentLink.id);

      // Mettre à jour la commande
      await supabase
        .from('france_orders')
        .update({ online_payment_status: 'link_sent' })
        .eq('id', orderId);

      return new Response(JSON.stringify({
        success: true,
        paymentLinkId: paymentLink.id,
        paymentUrl: paymentResult.paymentUrl,
        messageSent: true
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (sendError) {
      console.error('❌ Erreur envoi WhatsApp:', sendError);

      return new Response(JSON.stringify({
        success: true,
        paymentLinkId: paymentLink.id,
        paymentUrl: paymentResult.paymentUrl,
        messageSent: false,
        error: 'Lien créé mais envoi WhatsApp échoué'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }

  } catch (error) {
    console.error('❌ [Payment Link Sender] Erreur:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Formatter le message WhatsApp avec le lien de paiement
 */
function formatPaymentMessage(order: any, paymentUrl: string, config: any): string {
  const restaurantName = order.restaurant?.name || 'Restaurant';

  return `💳 *PAIEMENT EN LIGNE*

Bonjour ${order.customer_name || 'cher client'},

Votre commande #${order.order_number} est prête !

📦 Montant : ${order.total_amount}€

Pour finaliser votre commande, veuillez effectuer le paiement en ligne :

🔗 ${paymentUrl}

⏱️ Ce lien expire dans 24 heures.

Merci de votre confiance !
${restaurantName}`;
}
```

---

## 🖥️ Intégrations UI

### 1. Back Office Restaurant (botResto)

#### **Bouton dans la liste des commandes**

```typescript
// botResto/src/app/features/restaurant-france/orders-france/orders-france.page.ts

'use client';

import { useState } from 'react';

interface OrderActionsProps {
  order: Order;
  onPaymentLinkSent: () => void;
}

export function OrderActions({ order, onPaymentLinkSent }: OrderActionsProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function sendPaymentLink() {
    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/payment/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          senderType: 'restaurant'
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur envoi lien');
      }

      onPaymentLinkSent();
      alert('✅ Lien de paiement envoyé avec succès !');

    } catch (err: any) {
      setError(err.message);
      alert(`❌ Erreur : ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  // Ne pas afficher si déjà payé ou si pas de config paiement
  if (order.payment_method === 'online' && order.online_payment_status === 'paid') {
    return <span className="text-green-600">✅ Payé en ligne</span>;
  }

  return (
    <button
      onClick={sendPaymentLink}
      disabled={sending}
      className="btn btn-primary"
    >
      {sending ? '⏳ Envoi...' : '💳 Envoyer lien de paiement'}
    </button>
  );
}
```

#### **Service Angular dans botResto**

```typescript
// botResto/src/app/core/services/payment-link.service.ts

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentLinkService {

  async sendPaymentLink(orderId: number, senderType: 'restaurant' | 'driver', customMessage?: string) {
    try {
      const response = await fetch(
        `${environment.supabaseUrl}/functions/v1/payment-link-sender`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.supabaseAnonKey}`
          },
          body: JSON.stringify({
            orderId,
            senderType,
            customMessage
          })
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur envoi lien');
      }

      return result;

    } catch (error: any) {
      console.error('Error sending payment link:', error);
      throw error;
    }
  }
}
```

---

### 2. Application Livreur (botResto)

#### **Bouton dans le détail de la commande**

```typescript
// botResto/src/app/features/delivery/components/OrderDetail.tsx

import { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { card } from 'ionicons/icons';

interface OrderDetailProps {
  order: Order;
  onPaymentLinkSent: () => void;
}

export function OrderDetail({ order, onPaymentLinkSent }: OrderDetailProps) {
  const [sending, setSending] = useState(false);

  async function requestPayment() {
    setSending(true);

    try {
      const response = await fetch(`${environment.supabaseUrl}/functions/v1/payment-link-sender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${environment.supabaseAnonKey}`
        },
        body: JSON.stringify({
          orderId: order.id,
          senderId: currentDriverId, // ID du livreur connecté
          senderType: 'driver',
          customMessage: `💳 Bonjour ${order.customer_name},\n\nVotre commande est arrivée ! Veuillez effectuer le paiement via ce lien :\n\n{payment_url}\n\nMerci !`
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      onPaymentLinkSent();
      alert('✅ Lien de paiement envoyé au client');

    } catch (err: any) {
      alert(`❌ Erreur : ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {/* ... autres détails de la commande ... */}

      {order.online_payment_status !== 'paid' && (
        <IonButton
          expand="block"
          color="primary"
          onClick={requestPayment}
          disabled={sending}
        >
          <IonIcon slot="start" icon={card} />
          {sending ? 'Envoi...' : 'Demander le paiement'}
        </IonButton>
      )}
    </div>
  );
}
```

---

## 🔐 Webhooks (Callbacks paiement)

### Edge Function pour recevoir les webhooks

```typescript
// supabase/functions/payment-webhook-handler/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const provider = req.headers.get('x-payment-provider') || 'stripe';

    if (provider === 'stripe') {
      return handleStripeWebhook(req, signature);
    } else if (provider === 'lengopay') {
      return handleLengopayWebhook(req);
    }

    throw new Error('Provider non supporté');

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function handleStripeWebhook(req: Request, signature: string) {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16'
  });

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Traiter l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Trouver le payment_link correspondant
    const { data: paymentLink } = await supabase
      .from('payment_links')
      .select('*')
      .eq('payment_intent_id', session.payment_intent)
      .single();

    if (paymentLink) {
      // Marquer comme payé
      await supabase
        .from('payment_links')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          webhook_events: [...(paymentLink.webhook_events || []), event]
        })
        .eq('id', paymentLink.id);

      // Mettre à jour la commande
      await supabase
        .from('france_orders')
        .update({
          online_payment_status: 'paid',
          payment_method: 'online'
        })
        .eq('id', paymentLink.order_id);

      console.log(`✅ Paiement confirmé pour commande #${paymentLink.order_id}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleLengopayWebhook(req: Request) {
  const payload = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Traiter selon le format Lengopay
  if (payload.event === 'payment.success') {
    const { data: paymentLink } = await supabase
      .from('payment_links')
      .select('*')
      .eq('payment_intent_id', payload.payment_id)
      .single();

    if (paymentLink) {
      await supabase
        .from('payment_links')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          webhook_events: [...(paymentLink.webhook_events || []), payload]
        })
        .eq('id', paymentLink.id);

      await supabase
        .from('france_orders')
        .update({
          online_payment_status: 'paid',
          payment_method: 'online'
        })
        .eq('id', paymentLink.order_id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## 📊 Configuration Restaurant (Back Office)

### Page de configuration des paiements

```typescript
// botResto/src/app/features/restaurant-france/settings-france/settings-france.page.ts

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-settings',
  templateUrl: './payment-settings.component.html'
})
export class PaymentSettingsComponent implements OnInit {
  const [configs, setConfigs] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('stripe');

  async function saveConfig(formData: any) {
    const response = await fetch('/api/payment/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: currentRestaurantId,
        provider: selectedProvider,
        ...formData
      })
    });

    const result = await response.json();
    if (result.success) {
      alert('✅ Configuration enregistrée');
      loadConfigs();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration Paiement en Ligne</h1>

      <div className="card">
        <h2>Choisir un provider</h2>
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
        >
          <option value="stripe">Stripe</option>
          <option value="lengopay">Lengopay</option>
          <option value="wave">Wave (bientôt)</option>
          <option value="orange_money">Orange Money (bientôt)</option>
        </select>

        {selectedProvider === 'stripe' && (
          <StripeConfigForm onSave={saveConfig} />
        )}

        {selectedProvider === 'lengopay' && (
          <LengopayConfigForm onSave={saveConfig} />
        )}
      </div>

      <div className="card mt-6">
        <h2>Configurations actives</h2>
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map(config => (
              <tr key={config.id}>
                <td>{config.provider}</td>
                <td>{config.is_active ? '✅ Actif' : '❌ Inactif'}</td>
                <td>
                  <button>Modifier</button>
                  <button>Désactiver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🧪 Tests

### Tests unitaires de l'Edge Function

```typescript
// supabase/functions/payment-link-sender/test.ts

Deno.test('Payment Link Sender - Stripe', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/payment-link-sender', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      orderId: 123,
      senderType: 'restaurant'
    })
  });

  const result = await response.json();

  assertEquals(result.success, true);
  assertExists(result.paymentUrl);
  assertExists(result.paymentLinkId);
});
```

---

## 📝 Checklist de Déploiement

### Phase 1 : Infrastructure
- [ ] Créer les tables `restaurant_payment_configs` et `payment_links`
- [ ] Ajouter colonne `online_payment_status` à `france_orders`
- [ ] Créer les indexes
- [ ] Créer la fonction `update_updated_at_column()` si inexistante

### Phase 2 : Edge Functions
- [ ] Créer `payment-link-sender` Edge Function
- [ ] Créer `payment-webhook-handler` Edge Function
- [ ] Configurer les secrets Supabase (Stripe keys, etc.)
- [ ] Tester Edge Functions localement
- [ ] Déployer Edge Functions

### Phase 3 : Back Office
- [ ] Créer page configuration paiement (`/settings/payment`)
- [ ] Ajouter bouton "Envoyer lien" dans liste commandes
- [ ] Créer API route `/api/payment/send-link`
- [ ] Créer API route `/api/payment/config`
- [ ] Tester envoi de lien depuis back office

### Phase 4 : App Livreur
- [ ] Ajouter bouton "Demander paiement" dans détail commande
- [ ] Configurer appel Edge Function
- [ ] Tester envoi de lien depuis app livreur

### Phase 5 : Webhooks
- [ ] Configurer webhooks Stripe
- [ ] Configurer webhooks Lengopay
- [ ] Tester callbacks paiement
- [ ] Vérifier mise à jour statuts

### Phase 6 : Tests & Production
- [ ] Tests end-to-end (restaurant → client → paiement)
- [ ] Tests end-to-end (livreur → client → paiement)
- [ ] Configurer 1 restaurant pilote avec Stripe
- [ ] Valider en production
- [ ] Documentation utilisateur

---

## 🎯 Résumé des Avantages

✅ **ZÉRO modification bot WhatsApp** - Le bot continue de fonctionner normalement
✅ **Flexible** - Chaque restaurant peut avoir son propre provider
✅ **Réutilisable** - Un seul service pour back office + livreur
✅ **Scalable** - Facile d'ajouter d'autres providers (Wave, Orange Money)
✅ **Traçabilité** - Historique complet des liens envoyés et paiements
✅ **Webhooks** - Mise à jour automatique des statuts
✅ **Sécurisé** - Clés API stockées en base (à chiffrer en production)

---

## 📞 Prochaines Étapes

1. **Validation du plan** par l'équipe
2. **Choix des providers prioritaires** (Stripe + Lengopay ?)
3. **Création des comptes test** (Stripe test mode, Lengopay sandbox)
4. **Développement Phase 1** (BDD + Edge Function)
5. **Tests avec restaurant pilote**

---

**Dernière mise à jour :** Janvier 2025
**Version :** 1.0.0 (Plan initial)