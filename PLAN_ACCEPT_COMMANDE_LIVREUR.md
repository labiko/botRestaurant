# 📋 **Plan Final Détaillé - Système de Notification des Livreurs avec Option B**

## 🏗️ **1. Structure Base de Données**

```sql
-- Table pour les tokens sécurisés
CREATE TABLE delivery_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES france_orders(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES france_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,           -- Expiration relative (15 min)
  absolute_expires_at TIMESTAMP NOT NULL, -- Expiration absolue (2h)
  used BOOLEAN DEFAULT FALSE,              -- Token utilisé avec succès
  suspended BOOLEAN DEFAULT FALSE,         -- Token temporairement suspendu
  reactivated BOOLEAN DEFAULT FALSE        -- Token réactivé après refus
);

-- Index pour performances
CREATE INDEX idx_delivery_tokens_order_driver ON delivery_tokens(order_id, driver_id);
CREATE INDEX idx_delivery_tokens_active ON delivery_tokens(token) WHERE used = FALSE AND suspended = FALSE;
CREATE INDEX idx_delivery_tokens_cleanup ON delivery_tokens(absolute_expires_at) WHERE absolute_expires_at < NOW();
```

## ⚙️ **2. Configuration des Constantes**

```typescript
// Configuration URLs et timings
const CONFIG = {
  BASE_URL: 'http://localhost:4200', // À changer en prod
  TOKEN_EXPIRY_MINUTES: 15,
  TOKEN_ABSOLUTE_EXPIRY_HOURS: 2,
  REACTIVATION_THRESHOLD_MINUTES: 5,
  TOKEN_LENGTH: 32
};
```

## 🔄 **3. Workflow Complet Détaillé**

### **Phase 1 : Commande Prête → Notification Initiale**

#### **A. Déclencheur**
```typescript
// Dans FranceOrdersService.updateOrderStatus()
if (newStatus === 'prete' && deliveryMode === 'livraison') {
  await this.notifyAvailableDrivers(orderId);
}
```

#### **B. Génération des tokens**
```typescript
async notifyAvailableDrivers(orderId: number) {
  // 1. Récupérer livreurs actifs du restaurant
  const activeDrivers = await this.getActiveDriversForOrder(orderId);
  
  // 2. Générer tokens pour chaque livreur
  const tokens = [];
  for (const driver of activeDrivers) {
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + CONFIG.TOKEN_EXPIRY_MINUTES * 60000);
    const absoluteExpiresAt = new Date(Date.now() + CONFIG.TOKEN_ABSOLUTE_EXPIRY_HOURS * 3600000);
    
    await this.supabase.from('delivery_tokens').insert({
      token,
      order_id: orderId,
      driver_id: driver.id,
      expires_at: expiresAt,
      absolute_expires_at: absoluteExpiresAt
    });
    
    tokens.push({token, driver});
  }
  
  // 3. Envoyer notifications WhatsApp initiales
  await this.sendInitialNotifications(orderId, tokens);
}
```

#### **C. Message WhatsApp initial**
```
🚨 *NOUVELLE COMMANDE DISPONIBLE* 🚨

📦 Commande #0409-0007
👤 Client: Jean Dupont  
📍 Zone: Kaloum - 2.5 km
💰 Total: 15.00€
🕒 Prête depuis 2 min

✅ *Cliquez pour accepter:*
http://localhost:4200/delivery/accept?token=abc123xyz

⏱️ Lien valide 15 minutes
🚀 Premier arrivé, premier servi !
```

### **Phase 2 : Acceptation → Suspension**

#### **A. Livreur A accepte**
```typescript
async acceptOrderByToken(tokenString: string): Promise<{success: boolean, message: string}> {
  // 1. Valider le token
  const validation = await this.validateToken(tokenString);
  if (!validation.valid) {
    return {success: false, message: 'Lien expiré ou invalide'};
  }
  
  // 2. Transaction atomique
  const { data, error } = await this.supabase.rpc('accept_order_atomic', {
    p_token: tokenString,
    p_order_id: validation.orderId,
    p_driver_id: validation.driverId
  });
  
  return {success: !error, message: error?.message || 'Commande acceptée !'};
}
```

#### **B. Fonction SQL atomique**
```sql
CREATE OR REPLACE FUNCTION accept_order_atomic(
  p_token VARCHAR(64),
  p_order_id INTEGER,
  p_driver_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Vérifier que la commande est encore disponible
  IF NOT EXISTS (SELECT 1 FROM france_orders WHERE id = p_order_id AND status = 'prete' AND driver_id IS NULL) THEN
    RAISE EXCEPTION 'Commande déjà prise';
  END IF;
  
  -- 2. Marquer le token comme utilisé
  UPDATE delivery_tokens 
  SET used = TRUE, expires_at = NOW()
  WHERE token = p_token AND order_id = p_order_id AND driver_id = p_driver_id;
  
  -- 3. Assigner la commande
  UPDATE france_orders 
  SET status = 'assignee', driver_id = p_driver_id, updated_at = NOW()
  WHERE id = p_order_id;
  
  -- 4. Suspendre tous les autres tokens
  UPDATE delivery_tokens 
  SET suspended = TRUE 
  WHERE order_id = p_order_id AND driver_id != p_driver_id AND used = FALSE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### **Phase 3 : Refus → Réactivation avec Option B**

#### **A. Livreur A refuse/annule**
```typescript
async handleOrderRefusal(orderId: number, driverId: number, reason: string) {
  // 1. Remettre commande disponible
  await this.supabase.from('france_orders').update({
    status: 'prete',
    driver_id: null,
    updated_at: new Date()
  }).eq('id', orderId);
  
  // 2. Réactiver les tokens valides
  const reactivatedTokens = await this.reactivateTokens(orderId);
  
  // 3. OPTION B: Notifier la réactivation
  if (reactivatedTokens.length > 0) {
    await this.sendReactivationNotifications(orderId, reactivatedTokens);
  }
}
```

#### **B. Réactivation des tokens**
```typescript
async reactivateTokens(orderId: number): Promise<any[]> {
  // Réactiver les tokens suspendus non expirés absolument
  const { data: reactivatedTokens } = await this.supabase
    .from('delivery_tokens')
    .update({
      suspended: false,
      reactivated: true,
      expires_at: new Date(Date.now() + CONFIG.TOKEN_EXPIRY_MINUTES * 60000) // Nouveau délai 15min
    })
    .eq('order_id', orderId)
    .eq('suspended', true)
    .eq('used', false)
    .gt('absolute_expires_at', new Date().toISOString())
    .select(`
      *,
      france_users!driver_id (
        id, whatsapp_number, first_name
      )
    `);
  
  return reactivatedTokens || [];
}
```

#### **C. Message WhatsApp de réactivation (Option B)**
```
🔄 *COMMANDE DISPONIBLE À NOUVEAU* 🔄

📦 Commande #0409-0007
👤 Client: Jean Dupont
💰 Total: 15.00€
ℹ️ Le livreur précédent a annulé

✅ *Votre lien est toujours actif:*
http://localhost:4200/delivery/accept?token=def456xyz

⏱️ Nouveau délai: 15 minutes
🚀 À vous de jouer !
```

### **Phase 4 : Si tous tokens expirés → Nouvelle génération**

```typescript
async handleExpiredTokensReactivation(orderId: number) {
  // Si aucun token réactivable, générer de nouveaux tokens
  const activeDrivers = await this.getActiveDriversForOrder(orderId);
  
  // Supprimer anciens tokens expirés
  await this.supabase.from('delivery_tokens')
    .delete()
    .eq('order_id', orderId);
  
  // Générer nouveaux tokens
  await this.notifyAvailableDrivers(orderId);
}
```

## 🔍 **4. Validation et Sécurité**

```typescript
async validateToken(tokenString: string): Promise<ValidationResult> {
  const { data: token } = await this.supabase
    .from('delivery_tokens')
    .select(`
      *,
      france_orders!order_id (id, status, driver_id),
      france_users!driver_id (id, whatsapp_number)
    `)
    .eq('token', tokenString)
    .single();

  if (!token) return {valid: false, reason: 'Token inexistant'};
  
  const now = new Date();
  
  if (token.used) return {valid: false, reason: 'Token déjà utilisé'};
  if (token.suspended) return {valid: false, reason: 'Commande temporairement indisponible'};
  if (new Date(token.expires_at) < now) return {valid: false, reason: 'Lien expiré'};
  if (new Date(token.absolute_expires_at) < now) return {valid: false, reason: 'Lien définitivement expiré'};
  if (token.france_orders.status !== 'prete') return {valid: false, reason: 'Commande non disponible'};
  if (token.france_orders.driver_id) return {valid: false, reason: 'Commande déjà assignée'};

  return {
    valid: true,
    orderId: token.order_id,
    driverId: token.driver_id,
    orderData: token.france_orders
  };
}
```

## 🧹 **5. Nettoyage Automatique**

```typescript
// Tâche CRON pour nettoyer les vieux tokens
async cleanupExpiredTokens() {
  await this.supabase
    .from('delivery_tokens')
    .delete()
    .lt('absolute_expires_at', new Date().toISOString());
}
```

## 📱 **6. Interface de Réception du Lien**

```typescript
// Nouvelle route: /delivery/accept
@Component({...})
export class DeliveryAcceptPage {
  async ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      await this.handleTokenAcceptance(token);
    }
  }
  
  async handleTokenAcceptance(token: string) {
    const result = await this.deliveryService.acceptOrderByToken(token);
    if (result.success) {
      this.router.navigate(['/restaurant-france/delivery-france/my-orders']);
    } else {
      this.presentErrorAlert(result.message);
    }
  }
}
```

## 🎯 **Résumé des Messages WhatsApp**

1. **Message initial** → Nouveau lien généré
2. **Message de réactivation (Option B)** → Même lien réactivé  
3. **Message de nouvelle génération** → Nouveau lien (si tous expirés)

## 📋 **Checklist d'implémentation**

- [ ] Créer la table `delivery_tokens` avec les index
- [ ] Implémenter la fonction SQL `accept_order_atomic`
- [ ] Créer le service `DeliveryTokenService` 
- [ ] Ajouter la génération de tokens dans `FranceOrdersService`
- [ ] Créer les fonctions de notification WhatsApp
- [ ] Implémenter la validation de tokens
- [ ] Créer la page `/delivery/accept`
- [ ] Ajouter la logique de réactivation (Option B)
- [ ] Implémenter le nettoyage automatique
- [ ] Tests de sécurité et de performance

## 📊 **7. Interface Restaurant - Tracking et Gestion**

### **A. Tables supplémentaires pour le tracking**

```sql
-- Table pour tracker les actions des livreurs
CREATE TABLE delivery_driver_actions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES france_orders(id),
  driver_id INTEGER REFERENCES france_users(id),
  token_id INTEGER REFERENCES delivery_tokens(id),
  action_type VARCHAR(20) NOT NULL, -- 'notified', 'link_viewed', 'accepted', 'refused', 'expired'
  action_timestamp TIMESTAMP DEFAULT NOW(),
  details JSONB -- Info supplémentaire (raison refus, device info, etc.)
);

-- Table pour les refus explicites avec raisons
CREATE TABLE delivery_refusals (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES france_orders(id),
  driver_id INTEGER REFERENCES france_users(id),
  token_id INTEGER REFERENCES delivery_tokens(id),
  reason VARCHAR(20), -- 'too_far', 'busy', 'vehicle_issue', 'accident', 'other'
  custom_reason TEXT,
  refused_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_delivery_actions_order ON delivery_driver_actions(order_id);
CREATE INDEX idx_delivery_refusals_order ON delivery_refusals(order_id);
```

### **B. Interface Restaurant - Vue Synthétique**

```typescript
// Composant de suivi des livraisons dans l'interface restaurant
@Component({
  selector: 'app-delivery-tracking',
  template: `
    <ion-card *ngFor="let order of pendingDeliveryOrders" class="delivery-tracking-card">
      <ion-card-header>
        <ion-card-title>📦 Commande #{{order.order_number}}</ion-card-title>
        <ion-card-subtitle>
          {{order.customer_name}} - {{formatPrice(order.total_amount)}} - 
          <span class="waiting-time">⏰ En attente depuis {{getWaitingTime(order.created_at)}}</span>
        </ion-card-subtitle>
      </ion-card-header>
      
      <ion-card-content>
        <!-- Vue synthétique des actions -->
        <div class="delivery-summary">
          <div class="summary-stats">
            <span class="stat-item">
              📱 {{order.tracking_stats.notified_count}} notifiés
            </span>
            <span class="stat-item" *ngIf="order.tracking_stats.viewed_count > 0">
              👀 {{order.tracking_stats.viewed_count}} vus
            </span>
            <span class="stat-item" *ngIf="order.tracking_stats.refused_count > 0">
              ❌ {{order.tracking_stats.refused_count}} refus
            </span>
          </div>
          
          <div class="last-action" *ngIf="order.last_action">
            <small>
              Dernière action: <strong>{{order.last_action.driver_name}}</strong> 
              {{getActionText(order.last_action.action_type)}} 
              {{formatTime(order.last_action.action_timestamp)}}
            </small>
          </div>
        </div>
        
        <!-- Actions manuelles -->
        <div class="manual-actions">
          <ion-button 
            size="small" 
            fill="outline" 
            color="primary"
            (click)="sendManualReminder(order.id)"
            [disabled]="order.recently_sent">
            📢 Relancer tous les livreurs
          </ion-button>
          
          <ion-button 
            size="small" 
            fill="outline" 
            color="secondary"
            (click)="showDriverSelection(order.id)">
            👤 Assigner manuellement
          </ion-button>
          
          <ion-button 
            size="small" 
            fill="clear" 
            color="medium"
            (click)="showFullTracking(order.id)">
            📊 Détails complets
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `
})
export class DeliveryTrackingComponent {
  async loadPendingDeliveryOrders() {
    const { data } = await this.supabase.rpc('get_pending_delivery_orders_with_tracking', {
      restaurant_id: this.restaurantId
    });
    
    this.pendingDeliveryOrders = data || [];
  }
}
```

### **C. Fonction SQL pour récupérer les statistiques synthétiques**

```sql
CREATE OR REPLACE FUNCTION get_pending_delivery_orders_with_tracking(restaurant_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  order_number VARCHAR,
  customer_name VARCHAR,
  total_amount DECIMAL,
  created_at TIMESTAMP,
  tracking_stats JSONB,
  last_action JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fo.id,
    fo.order_number,
    fo.customer_name,
    fo.total_amount,
    fo.created_at,
    -- Statistiques agrégées
    jsonb_build_object(
      'notified_count', COALESCE(stats.notified_count, 0),
      'viewed_count', COALESCE(stats.viewed_count, 0),
      'refused_count', COALESCE(stats.refused_count, 0)
    ) AS tracking_stats,
    -- Dernière action
    jsonb_build_object(
      'driver_name', last_act.driver_name,
      'action_type', last_act.action_type,
      'action_timestamp', last_act.action_timestamp
    ) AS last_action
  FROM france_orders fo
  LEFT JOIN (
    SELECT 
      dda.order_id,
      COUNT(*) FILTER (WHERE dda.action_type = 'notified') AS notified_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'link_viewed') AS viewed_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'refused') AS refused_count
    FROM delivery_driver_actions dda
    GROUP BY dda.order_id
  ) stats ON fo.id = stats.order_id
  LEFT JOIN (
    SELECT DISTINCT ON (dda.order_id)
      dda.order_id,
      fu.first_name || ' ' || COALESCE(fu.last_name, '') AS driver_name,
      dda.action_type,
      dda.action_timestamp
    FROM delivery_driver_actions dda
    JOIN france_users fu ON dda.driver_id = fu.id
    ORDER BY dda.order_id, dda.action_timestamp DESC
  ) last_act ON fo.id = last_act.order_id
  WHERE fo.restaurant_id = restaurant_id
    AND fo.status = 'prete'
    AND fo.delivery_mode = 'livraison'
    AND fo.driver_id IS NULL
  ORDER BY fo.created_at ASC;
END;
$$ LANGUAGE plpgsql;
```

### **D. Interface de Refus Explicite pour les Livreurs**

```typescript
// Page d'acceptation avec bouton refus
@Component({
  template: `
    <div class="order-details">
      <h2>📦 Commande #{{order.order_number}}</h2>
      <p><strong>👤 Client:</strong> {{order.customer_name}}</p>
      <p><strong>📍 Adresse:</strong> {{order.delivery_address}}</p>
      <p><strong>💰 Total:</strong> {{formatPrice(order.total_amount)}}</p>
      <p><strong>📞 Téléphone:</strong> {{order.phone_number}}</p>
    </div>
    
    <div class="action-buttons">
      <ion-button 
        expand="block" 
        color="success" 
        size="large"
        (click)="acceptOrder()">
        ✅ J'accepte cette commande
      </ion-button>
      
      <ion-button 
        expand="block" 
        color="medium" 
        fill="outline" 
        (click)="showRefusalOptions()">
        ❌ Je ne peux pas la prendre
      </ion-button>
    </div>
  `
})
export class DeliveryAcceptPage {
  async showRefusalOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Pourquoi ne pouvez-vous pas accepter cette commande ?',
      buttons: [
        {
          text: '🚗 Problème avec mon véhicule',
          handler: () => this.refuseOrder('vehicle_issue')
        },
        {
          text: '📍 L\'adresse est trop éloignée',
          handler: () => this.refuseOrder('too_far')
        },
        {
          text: '⏰ Je ne suis plus disponible',
          handler: () => this.refuseOrder('busy')
        },
        {
          text: '🚨 J\'ai eu un accident/problème',
          handler: () => this.refuseOrder('accident')
        },
        {
          text: '📝 Autre raison',
          handler: () => this.showCustomReasonPrompt()
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
  
  async refuseOrder(reason: string, customReason?: string) {
    // Enregistrer le refus explicite
    await this.deliveryService.refuseOrderExplicitly(this.token, reason, customReason);
    
    // Tracking automatique
    await this.deliveryService.trackDriverAction(
      this.orderId, 
      this.driverId, 
      this.tokenId, 
      'refused', 
      { reason, custom_reason: customReason }
    );
    
    // Message de confirmation
    this.presentToast('Refus enregistré. Merci pour votre honnêteté !');
    
    // Redirection
    this.router.navigate(['/restaurant-france/delivery-france/available-orders']);
  }
}
```

### **E. Actions Manuelles pour le Restaurant**

```typescript
// Service pour les actions manuelles restaurant
export class RestaurantDeliveryManagementService {
  
  // Relance manuelle de tous les livreurs
  async sendManualReminder(orderId: number): Promise<boolean> {
    try {
      // 1. Vérifier qu'on peut relancer (pas fait dans les 5 dernières minutes)
      const { data: lastReminder } = await this.supabase
        .from('delivery_driver_actions')
        .select('action_timestamp')
        .eq('order_id', orderId)
        .eq('action_type', 'manual_reminder')
        .order('action_timestamp', { ascending: false })
        .limit(1)
        .single();
      
      if (lastReminder) {
        const lastReminderTime = new Date(lastReminder.action_timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastReminderTime.getTime()) / (1000 * 60);
        
        if (diffMinutes < 5) {
          throw new Error('Vous devez attendre 5 minutes entre chaque relance');
        }
      }
      
      // 2. Regénérer les tokens et renvoyer les notifications
      await this.regenerateTokensAndNotify(orderId);
      
      // 3. Tracker l'action manuelle
      await this.trackRestaurantAction(orderId, 'manual_reminder');
      
      return true;
    } catch (error) {
      console.error('Erreur relance manuelle:', error);
      return false;
    }
  }
  
  // Assignation manuelle à un livreur spécifique
  async assignOrderManually(orderId: number, driverId: number): Promise<boolean> {
    try {
      // 1. Vérifier que le livreur est actif
      const isDriverActive = await this.isDriverActiveAndAvailable(driverId);
      if (!isDriverActive) {
        throw new Error('Ce livreur n\'est pas disponible actuellement');
      }
      
      // 2. Assigner la commande directement
      const { error } = await this.supabase
        .from('france_orders')
        .update({ 
          status: 'assignee', 
          driver_id: driverId,
          updated_at: new Date()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // 3. Invalider tous les tokens de cette commande
      await this.supabase
        .from('delivery_tokens')
        .update({ suspended: true, used: true })
        .eq('order_id', orderId);
      
      // 4. Notifier le livreur assigné
      await this.notifyManualAssignment(orderId, driverId);
      
      // 5. Tracker l'assignation manuelle
      await this.trackRestaurantAction(orderId, 'manual_assignment', { assigned_driver_id: driverId });
      
      return true;
    } catch (error) {
      console.error('Erreur assignation manuelle:', error);
      return false;
    }
  }
}
```

### **F. Interface de Tracking Détaillé (Modal/Page séparée)**

```typescript
// Modal pour voir le détail complet des actions
@Component({
  selector: 'app-delivery-tracking-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>📊 Suivi Commande #{{order.order_number}}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <!-- Timeline détaillée -->
      <div class="tracking-timeline">
        <div *ngFor="let action of allActions" 
             class="timeline-item"
             [class]="'timeline-' + action.action_type">
          
          <div class="timeline-marker">
            <ion-icon [name]="getActionIcon(action.action_type)"></ion-icon>
          </div>
          
          <div class="timeline-content">
            <div class="action-header">
              <strong>{{action.driver_name}}</strong>
              <span class="action-badge" [class]="'badge-' + action.action_type">
                {{getActionText(action.action_type)}}
              </span>
            </div>
            
            <div class="action-details" *ngIf="action.details">
              <span *ngIf="action.details.reason">
                Raison: {{getReasonText(action.details.reason)}}
              </span>
              <span *ngIf="action.details.custom_reason">
                "{{action.details.custom_reason}}"
              </span>
            </div>
            
            <time class="action-time">
              {{formatDateTime(action.action_timestamp)}}
            </time>
          </div>
        </div>
      </div>
    </ion-content>
  `
})
export class DeliveryTrackingDetailModal {
  async loadFullTracking(orderId: number) {
    const { data } = await this.supabase
      .from('delivery_driver_actions')
      .select(`
        *,
        france_users!driver_id (first_name, last_name),
        delivery_refusals (reason, custom_reason)
      `)
      .eq('order_id', orderId)
      .order('action_timestamp', { ascending: false });
    
    this.allActions = data || [];
  }
}
```

## ⚠️ **Points d'attention**

1. **Sécurité** : Tokens cryptographiquement sécurisés
2. **Performance** : Index sur les requêtes fréquentes  
3. **Concurrence** : Transaction atomique pour l'acceptation
4. **Nettoyage** : Supprimer les vieux tokens régulièrement
5. **Monitoring** : Logs des actions pour debug
6. **URL Production** : Changer CONFIG.BASE_URL en production
7. **Limitation des relances** : Max 1 relance manuelle toutes les 5 minutes
8. **Historique** : Conserver les actions pour analyse des performances livreurs

## 🚨 **8. Action d'Urgence Restaurant - Force Release**

### **Action unique simplifiée : "Forcer la libération"**

#### **A. Fonctionnement**
1. **Bouton rouge** dans l'interface de suivi des commandes
2. **Confirmation obligatoire** : "Êtes-vous sûr de vouloir libérer cette commande ?"
3. **Exécution automatique** :
   - Suspend tous les tokens actifs pour cette commande
   - Met la commande en statut "recherche_livreur"
   - Relance la notification à TOUS les livreurs disponibles
   - Log l'action avec timestamp et raison

#### **B. Interface simplifiée**
```html
📦 COMMANDE #1234 - En cours de livraison
👤 Livreur: Jean Dupont
⏰ Assignée depuis: 45 min

📊 Suivi: 5 notifiés | 2 refus | 1 accepté

🔴 [FORCER LA LIBÉRATION]
```

#### **C. Fonction SQL pour forcer la libération**
```sql
-- Fonction pour forcer la libération
CREATE OR REPLACE FUNCTION force_release_order(
    p_order_id INTEGER,
    p_restaurant_id INTEGER,
    p_reason TEXT DEFAULT 'Liberation forcee par restaurant'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. Vérifier que c'est bien le restaurant propriétaire
    IF NOT EXISTS (
        SELECT 1 FROM france_orders 
        WHERE id = p_order_id AND restaurant_id = p_restaurant_id
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- 2. Suspendre tous les tokens actifs
    UPDATE delivery_tokens 
    SET suspended = true, updated_at = NOW()
    WHERE order_id = p_order_id AND used = false;
    
    -- 3. Logger l'action
    INSERT INTO delivery_order_logs (
        order_id, action_type, details, created_at
    ) VALUES (
        p_order_id, 'FORCE_RELEASE', p_reason, NOW()
    );
    
    -- 4. Remettre la commande en recherche
    UPDATE france_orders 
    SET 
        status = 'recherche_livreur',
        assigned_driver_id = NULL,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### **D. Service TypeScript**
```typescript
// Méthode dans RestaurantDeliveryManagementService
async forceReleaseOrder(orderId: number, reason?: string): Promise<boolean> {
  try {
    const { data, error } = await this.supabase.rpc('force_release_order', {
      p_order_id: orderId,
      p_restaurant_id: this.getCurrentRestaurantId(),
      p_reason: reason || 'Libération forcée par le restaurant'
    });
    
    if (error) throw error;
    
    // Relancer la notification à tous les livreurs
    if (data) {
      await this.notifyAvailableDrivers(orderId);
    }
    
    return data;
  } catch (error) {
    console.error('Erreur force release:', error);
    return false;
  }
}
```

#### **E. Bouton dans l'interface restaurant**
```html
<ion-button 
  color="danger" 
  fill="outline" 
  size="small"
  (click)="confirmForceRelease(order.id)">
  <ion-icon name="refresh-outline" slot="start"></ion-icon>
  Forcer la libération
</ion-button>
```

#### **F. Table pour les logs d'actions**
```sql
-- Table pour logger les actions critiques restaurant
CREATE TABLE delivery_order_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES france_orders(id),
  action_type VARCHAR(20) NOT NULL, -- 'FORCE_RELEASE', 'MANUAL_ASSIGNMENT', etc.
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_order_logs_order ON delivery_order_logs(order_id);
```

Cette action d'urgence permet au restaurant de **débloquer immédiatement** une situation où un livreur ne répond plus, en relançant automatiquement la recherche de livreur disponible.