# 💳 Plan d'administration config paiement - Settings Restaurant

## 🎯 Objectif
Ajouter une section "Paiement en ligne" dans `/restaurant-france/settings` pour que chaque restaurant puisse :
- ✅ Voir son status de configuration paiement
- ✅ **Choisir son mode de paiement** : Stripe, Lengopay, Wave, Orange Money
- ✅ Ajouter/modifier ses clés API selon le provider
- ✅ Activer/désactiver le paiement en ligne
- ✅ Voir ses derniers paiements

---

## 📊 Architecture existante (analysée)

### Page settings-france.page.html
Structure avec **tabs cards** :
- 🍽️ Paramétrage Restaurant
- 🍕 Gestion Produits
- ⚙️ Gestion Options
- 🚚 Livraison (désactivé)
- 🏪 Modes de service
- 🔔 Notifications audio

**→ On va ajouter : 💳 Paiement en ligne**

---

## 🎨 Plan UI simple (3 étapes max)

### **Étape 1 : Ajouter le tab "Paiement en ligne"**

```html
<!-- Dans settings-france.page.html, après les autres tabs -->
<div class="tab-card" [class.active]="currentTab === 'payment'" (click)="switchTab('payment')">
  <div class="tab-icon">
    <ion-icon name="card"></ion-icon>
  </div>
  <div class="tab-content">
    <h3>Paiement en ligne</h3>
    <p>Configuration Stripe</p>
  </div>
  <div class="tab-indicator"></div>
</div>
```

### **Étape 2 : Créer le composant payment-config**

```typescript
// payment-config.component.ts
export class PaymentConfigComponent {
  paymentConfig: any = null;
  availableProviders = ['stripe', 'lengopay', 'wave', 'orange_money'];
  selectedProvider = 'stripe';

  // Formulaire dynamique selon le provider
  form = {
    provider: 'stripe',
    is_active: true,
    // Stripe
    api_key_public: '',
    api_key_secret: '',
    // Lengopay
    license_key: '',
    website_id: '',
    merchant_id: '',
    telephone_marchand: '',
    // Commun
    config: {}
  };

  async loadConfig() { /* ... */ }
  async saveConfig() { /* ... */ }
  async deleteConfig() { /* ... */ }
  onProviderChange() { /* Affiche les champs appropriés */ }
}
```

### **Étape 3 : UI avec 3 états**

#### **État 1 : Pas de config (vide)**
```
┌─────────────────────────────────────────┐
│ 💳 Configuration Paiement en ligne      │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️ Aucune configuration trouvée       │
│                                         │
│  Pour accepter les paiements en ligne, │
│  choisissez votre mode de paiement.     │
│                                         │
│  📖 [Voir le guide]                     │
│  ➕ [Configurer un mode de paiement]    │
│                                         │
└─────────────────────────────────────────┘
```

#### **État 2 : Formulaire de configuration**
```
┌─────────────────────────────────────────┐
│ 💳 Nouveau mode de paiement             │
├─────────────────────────────────────────┤
│                                         │
│  🏦 Mode de paiement                    │
│  [Stripe ▼]  Options:                   │
│   • Stripe (Carte bancaire)             │
│   • Lengopay (Mobile)                   │
│   • Wave (Mobile)                       │
│   • Orange Money (Mobile)               │
│                                         │
│  --- SI STRIPE SÉLECTIONNÉ ---          │
│  🔑 Clé publique                        │
│  [pk_test_51AbCdEf...          ]       │
│                                         │
│  🔒 Clé secrète                         │
│  [••••••••••••••••             ]       │
│                                         │
│  --- SI LENGOPAY SÉLECTIONNÉ ---        │
│  🔑 License Key                         │
│  [VmVHNGZud2h1...                ]      │
│                                         │
│  🌐 Website ID                          │
│  [wyp6J7uN3pVG2Pjn              ]      │
│                                         │
│  📞 Téléphone marchand                  │
│  [+224 XXX XXX XXX             ]       │
│                                         │
│  --- COMMUN ---                         │
│  ✅ Activer paiement en ligne           │
│  [x] Activé                             │
│                                         │
│  [Annuler]  [Enregistrer]               │
│                                         │
└─────────────────────────────────────────┘
```

#### **État 3 : Config active**
```
┌─────────────────────────────────────────┐
│ 💳 Paiement en ligne                    │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Configuration active                │
│  🏦 Provider : Stripe / Lengopay        │
│                                         │
│  📊 Statistiques (7 derniers jours)     │
│  • Liens envoyés : 12                   │
│  • Paiements réussis : 10               │
│  • Montant total : 245.50 EUR           │
│                                         │
│  🔑 Identifiants API                    │
│  • Publique : pk_test_51SD3Hg... ✓      │
│  • Secrète : ••••••••••••••••••• ✓      │
│                                         │
│  [Modifier les clés]                    │
│  [Changer de mode de paiement]          │
│  [Désactiver]                           │
│  [Voir Dashboard Provider]              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🛠️ Implémentation (étapes techniques)

### **Fichiers à créer :**

```
botResto/src/app/features/restaurant-france/settings-france/
└── components/
    └── payment-config/
        ├── payment-config.component.ts
        ├── payment-config.component.html
        └── payment-config.component.scss
```

### **Service à créer :**

```typescript
// restaurant-payment-config.service.ts

@Injectable({ providedIn: 'root' })
export class RestaurantPaymentConfigService {

  async getConfig(restaurantId: number) {
    // SELECT * FROM restaurant_payment_configs WHERE restaurant_id = X
    // Table: restaurant_payment_configs (avec S)
  }

  async saveConfig(restaurantId: number, config: any) {
    // INSERT ou UPDATE dans restaurant_payment_configs
    // Provider: 'stripe', 'lengopay', 'wave', 'orange_money', 'custom'
  }

  async deleteConfig(restaurantId: number) {
    // UPDATE is_active = false
  }

  async getStats(restaurantId: number) {
    // Stats depuis payment_links
  }

  getAvailableProviders() {
    // Retourne : stripe, lengopay, wave, orange_money
  }
}
```

---

## 📋 Plan d'implémentation détaillé

### **Phase 1 : Service (30 min)**

1. Créer `restaurant-payment-config.service.ts`
2. Méthodes CRUD :
   - `getConfig(restaurantId)`
   - `saveConfig(restaurantId, data)`
   - `toggleActive(restaurantId, isActive)`
   - `getStats(restaurantId, days = 7)`

### **Phase 2 : Composant (1h)**

1. Créer `payment-config.component.ts`
2. États :
   - `loading` : Chargement
   - `empty` : Pas de config
   - `form` : Formulaire
   - `active` : Config active
3. Méthodes :
   - `loadConfig()`
   - `showForm()`
   - `saveConfig()`
   - `deleteConfig()`
   - `openGuide()`
   - `openStripeDashboard()`

### **Phase 3 : UI (1h)**

1. HTML avec 3 états conditionnels
2. CSS réutilisant le style existant des settings
3. Validation formulaire (clés Stripe format)

### **Phase 4 : Intégration (30 min)**

1. Ajouter tab dans `settings-france.page.html`
2. Router vers le composant
3. Tester workflow complet

---

## 🎨 Code exemple (structure)

### **Component TypeScript**

```typescript
import { Component, OnInit } from '@angular/core';
import { RestaurantPaymentConfigService } from '../../../core/services/restaurant-payment-config.service';
import { AuthFranceService } from '../../auth-france/services/auth-france.service';

@Component({
  selector: 'app-payment-config',
  templateUrl: './payment-config.component.html',
  styleUrls: ['./payment-config.component.scss']
})
export class PaymentConfigComponent implements OnInit {

  currentState: 'loading' | 'empty' | 'form' | 'active' = 'loading';

  paymentConfig: any = null;
  stats: any = null;
  availableProviders = [
    { value: 'stripe', label: 'Stripe', icon: 'card' },
    { value: 'lengopay', label: 'Lengopay', icon: 'phone-portrait' },
    { value: 'wave', label: 'Wave', icon: 'water' },
    { value: 'orange_money', label: 'Orange Money', icon: 'logo-bitcoin' }
  ];

  form = {
    provider: 'stripe',
    is_active: true,
    // Stripe
    api_key_public: '',
    api_key_secret: '',
    // Lengopay
    license_key: '',
    website_id: '',
    merchant_id: '',
    telephone_marchand: '',
    // Commun
    config: { currency: 'EUR' }
  };

  restaurantId: number;

  constructor(
    private paymentService: RestaurantPaymentConfigService,
    private authService: AuthFranceService,
    private toastController: ToastController
  ) {
    this.restaurantId = this.authService.getCurrentRestaurantId()!;
  }

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    this.currentState = 'loading';

    try {
      const config = await this.paymentService.getConfig(this.restaurantId);

      if (config) {
        this.paymentConfig = config;
        this.stats = await this.paymentService.getStats(this.restaurantId);
        this.currentState = 'active';
      } else {
        this.currentState = 'empty';
      }
    } catch (error) {
      console.error('Erreur chargement config:', error);
      this.currentState = 'empty';
    }
  }

  showForm() {
    if (this.paymentConfig) {
      // Édition : charger les données existantes
      this.form = {
        provider: this.paymentConfig.provider,
        is_active: this.paymentConfig.is_active,
        api_key_public: this.paymentConfig.api_key_public || '',
        api_key_secret: this.paymentConfig.api_key_secret || '',
        license_key: this.paymentConfig.license_key || '',
        website_id: this.paymentConfig.website_id || '',
        merchant_id: this.paymentConfig.merchant_id || '',
        telephone_marchand: this.paymentConfig.telephone_marchand || '',
        config: this.paymentConfig.config || { currency: 'EUR' }
      };
    }
    this.currentState = 'form';
  }

  onProviderChange() {
    // Réinitialiser les champs spécifiques au provider
    this.form.api_key_public = '';
    this.form.api_key_secret = '';
    this.form.license_key = '';
    this.form.website_id = '';
    this.form.merchant_id = '';
    this.form.telephone_marchand = '';
  }

  async saveConfig() {
    try {
      // Préparer les données selon le provider
      const configData: any = {
        provider: this.form.provider,
        is_active: this.form.is_active,
        config: this.form.config
      };

      if (this.form.provider === 'stripe') {
        configData.api_key_public = this.form.api_key_public;
        configData.api_key_secret = this.form.api_key_secret;
      } else if (this.form.provider === 'lengopay') {
        configData.license_key = this.form.license_key;
        configData.website_id = this.form.website_id;
        configData.merchant_id = this.form.merchant_id;
        configData.telephone_marchand = this.form.telephone_marchand;
      }

      await this.paymentService.saveConfig(this.restaurantId, configData);

      const toast = await this.toastController.create({
        message: '✅ Configuration enregistrée',
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      await this.loadConfig();

    } catch (error: any) {
      const toast = await this.toastController.create({
        message: `❌ Erreur : ${error.message}`,
        duration: 4000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  getProviderDashboardUrl() {
    switch (this.paymentConfig?.provider) {
      case 'stripe':
        return 'https://dashboard.stripe.com';
      case 'lengopay':
        return 'https://dashboard.lengopay.com';
      default:
        return null;
    }
  }

  openGuide() {
    window.open('https://docs.bot-restaurant.com/payment-setup', '_blank');
  }

  openProviderDashboard() {
    const url = this.getProviderDashboardUrl();
    if (url) window.open(url, '_blank');
  }
}
```

### **Component HTML (structure)**

```html
<!-- Loading -->
<div *ngIf="currentState === 'loading'" class="loading-state">
  <ion-spinner></ion-spinner>
  <p>Chargement...</p>
</div>

<!-- Empty (pas de config) -->
<div *ngIf="currentState === 'empty'" class="empty-state">
  <ion-icon name="card-outline" class="big-icon"></ion-icon>
  <h2>Configuration Paiement en ligne</h2>
  <p>Aucune configuration trouvée</p>
  <ion-button (click)="openGuide()" fill="outline">
    📖 Voir le guide
  </ion-button>
  <ion-button (click)="showForm()" color="primary">
    ➕ Configurer Stripe
  </ion-button>
</div>

<!-- Form -->
<div *ngIf="currentState === 'form'" class="form-state">
  <h2>Configuration Paiement</h2>

  <!-- Sélection du provider -->
  <ion-item>
    <ion-label position="stacked">🏦 Mode de paiement</ion-label>
    <ion-select [(ngModel)]="form.provider" (ionChange)="onProviderChange()">
      <ion-select-option *ngFor="let p of availableProviders" [value]="p.value">
        {{ p.label }}
      </ion-select-option>
    </ion-select>
  </ion-item>

  <!-- Champs spécifiques STRIPE -->
  <ng-container *ngIf="form.provider === 'stripe'">
    <ion-item>
      <ion-label position="stacked">🔑 Clé publique</ion-label>
      <ion-input [(ngModel)]="form.api_key_public" placeholder="pk_test_..."></ion-input>
    </ion-item>

    <ion-item>
      <ion-label position="stacked">🔒 Clé secrète</ion-label>
      <ion-input [(ngModel)]="form.api_key_secret" type="password" placeholder="sk_test_..."></ion-input>
    </ion-item>
  </ng-container>

  <!-- Champs spécifiques LENGOPAY -->
  <ng-container *ngIf="form.provider === 'lengopay'">
    <ion-item>
      <ion-label position="stacked">🔑 License Key</ion-label>
      <ion-input [(ngModel)]="form.license_key" placeholder="VmVHNGZud2h1..."></ion-input>
    </ion-item>

    <ion-item>
      <ion-label position="stacked">🌐 Website ID</ion-label>
      <ion-input [(ngModel)]="form.website_id" placeholder="wyp6J7uN3pVG2Pjn"></ion-input>
    </ion-item>

    <ion-item>
      <ion-label position="stacked">🆔 Merchant ID</ion-label>
      <ion-input [(ngModel)]="form.merchant_id" placeholder="merchant_xxx"></ion-input>
    </ion-item>

    <ion-item>
      <ion-label position="stacked">📞 Téléphone marchand</ion-label>
      <ion-input [(ngModel)]="form.telephone_marchand" type="tel" placeholder="+224 XXX XXX XXX"></ion-input>
    </ion-item>
  </ng-container>

  <!-- Toggle actif (commun à tous) -->
  <ion-item>
    <ion-label>✅ Activer paiement en ligne</ion-label>
    <ion-toggle [(ngModel)]="form.is_active"></ion-toggle>
  </ion-item>

  <div class="button-group">
    <ion-button (click)="currentState = paymentConfig ? 'active' : 'empty'" fill="outline">
      Annuler
    </ion-button>
    <ion-button (click)="saveConfig()" color="primary">
      Enregistrer
    </ion-button>
  </div>
</div>

<!-- Active (config existante) -->
<div *ngIf="currentState === 'active'" class="active-state">
  <div class="status-badge success">
    <ion-icon name="checkmark-circle"></ion-icon>
    Configuration active
  </div>

  <!-- Affichage du provider actif -->
  <ion-item>
    <ion-label>
      <p>🏦 Mode de paiement</p>
      <h3>{{ paymentConfig?.provider | uppercase }}</h3>
    </ion-label>
  </ion-item>

  <h3>📊 Statistiques (7 derniers jours)</h3>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{{ stats?.links_sent || 0 }}</div>
      <div class="stat-label">Liens envoyés</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats?.payments_succeeded || 0 }}</div>
      <div class="stat-label">Paiements réussis</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats?.total_amount || 0 }} EUR</div>
      <div class="stat-label">Montant total</div>
    </div>
  </div>

  <!-- Identifiants selon le provider -->
  <h3>🔑 Identifiants</h3>

  <!-- Si Stripe -->
  <ng-container *ngIf="paymentConfig?.provider === 'stripe'">
    <ion-item>
      <ion-label>
        <p>Clé publique</p>
        <h3>{{ paymentConfig?.api_key_public?.substring(0, 30) }}... ✓</h3>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <p>Clé secrète</p>
        <h3>•••••••••••••••••••• ✓</h3>
      </ion-label>
    </ion-item>
  </ng-container>

  <!-- Si Lengopay -->
  <ng-container *ngIf="paymentConfig?.provider === 'lengopay'">
    <ion-item>
      <ion-label>
        <p>License Key</p>
        <h3>{{ paymentConfig?.license_key?.substring(0, 20) }}... ✓</h3>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <p>Website ID</p>
        <h3>{{ paymentConfig?.website_id }} ✓</h3>
      </ion-label>
    </ion-item>
    <ion-item>
      <ion-label>
        <p>Téléphone marchand</p>
        <h3>{{ paymentConfig?.telephone_marchand }} ✓</h3>
      </ion-label>
    </ion-item>
  </ng-container>

  <div class="button-group">
    <ion-button (click)="showForm()" fill="outline">
      Modifier la configuration
    </ion-button>
    <ion-button (click)="openProviderDashboard()" fill="outline">
      Voir Dashboard {{ paymentConfig?.provider }}
    </ion-button>
  </div>
</div>
```

---

## ⏱️ Estimation temps total : 3 heures

- ✅ Service : 30 min
- ✅ Composant logique : 1h
- ✅ UI/UX : 1h
- ✅ Intégration + tests : 30 min

---

## ✅ Checklist d'implémentation

### Phase 1 : Service
- [ ] Créer `restaurant-payment-config.service.ts`
- [ ] Méthode `getConfig(restaurantId)`
- [ ] Méthode `saveConfig(restaurantId, data)`
- [ ] Méthode `getStats(restaurantId)`
- [ ] Tests unitaires service

### Phase 2 : Composant
- [ ] Créer `payment-config.component.ts/html/scss`
- [ ] État `loading`
- [ ] État `empty`
- [ ] État `form`
- [ ] État `active`
- [ ] Validation formulaire

### Phase 3 : Intégration
- [ ] Ajouter tab dans `settings-france.page.html`
- [ ] Router le composant
- [ ] CSS cohérent avec l'existant
- [ ] Tests end-to-end

### Phase 4 : Documentation
- [ ] Guide utilisateur (capture d'écran)
- [ ] Documentation technique
- [ ] Commit + push

---

## 🎯 Résultat attendu

Un restaurant pourra :
1. **Voir** son statut de configuration Stripe
2. **Ajouter** ses clés API Stripe en 2 clics
3. **Modifier** sa configuration facilement
4. **Voir** ses statistiques de paiement
5. **Accéder** directement à son Dashboard Stripe

**Simple, propre, efficace** ✅

---

**Veux-tu que je commence l'implémentation ?**

Options :
- A) Oui, commence par le service
- B) Oui, mais teste d'abord le paiement actuel
- C) Non, juste le plan suffit pour l'instant

---

**Date** : 2025-01-30
**Version** : 1.0