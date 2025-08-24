# Plan Claude Code – Application Restaurant & Livreur
## Ionic + Angular + Capacitor

---

## 📋 Table des matières

1. [Contexte & Objectifs](#1-contexte--objectifs)
2. [Architecture Technique](#2-architecture-technique)
3. [Mise à jour Base de Données](#3-mise-à-jour-base-de-données)
4. [Thème et Design System](#4-thème-et-design-system)
5. [Structure de l'Application](#5-structure-de-lapplication)
6. [Gestion Horaires & Statut Restaurant](#6-gestion-horaires--statut-restaurant)
7. [Flux Utilisateur Détaillé](#7-flux-utilisateur-détaillé)
8. [Système de Notifications](#8-système-de-notifications)
9. [Développement par Phases](#9-développement-par-phases)
10. [Tests et Déploiement](#10-tests-et-déploiement)

---

## 1️⃣ Contexte & Objectifs

### 🎯 Vision
Application mobile unique servant deux types d'utilisateurs :
- **Restaurants** : Gestion des commandes, affectation aux livreurs, gestion horaires/statut
- **Livreurs** : Suivi des livraisons et validation des codes

### 🔗 Intégration
- Base de données Supabase existante
- Bot WhatsApp existant pour les commandes clients
- Notifications WhatsApp automatiques

---

## 2️⃣ Architecture Technique

### 🛠 Stack Technology
```
Frontend: Ionic 7 + Angular 17 + Capacitor 5
Backend: Supabase (PostgreSQL + Edge Functions)
Styling: SCSS + CSS Variables + Ionic Components
State: NgRx (optionnel) ou Services Angular
Push Notifications: Capacitor Push Notifications
Charts: Chart.js + ng2-charts (pour graphiques analytics)
```

### 📁 Structure du Projet
```
src/
├── app/
│   ├── core/                 # Services partagés
│   │   ├── auth/            # Service d'authentification
│   │   ├── supabase/        # Client Supabase
│   │   ├── whatsapp/        # Service notifications WhatsApp
│   │   ├── schedule/        # Service gestion horaires
│   │   ├── analytics/       # Service analytics & chiffre d'affaires
│   │   └── models/          # Types TypeScript
│   ├── shared/              # Composants partagés
│   │   ├── components/      # Composants réutilisables
│   │   └── pipes/           # Pipes personnalisés
│   ├── features/
│   │   ├── auth/            # Connexion/Inscription
│   │   ├── restaurant/      # Interface Restaurant
│   │   └── delivery/        # Interface Livreur
│   └── theme/               # Thème centralisé
├── assets/                  # Images, icônes
└── environments/           # Configuration
```

---

## 3️⃣ Mise à jour Base de Données

### 📝 Modifications Base de Données

#### Table `commande` - Ajout validation code
```sql
-- Ajout des nouvelles colonnes
ALTER TABLE commande 
ADD COLUMN code_validation VARCHAR(6) DEFAULT NULL,
ADD COLUMN date_validation_code TIMESTAMP DEFAULT NULL;

-- Index pour optimiser les recherches
CREATE INDEX idx_commande_code_validation ON commande(code_validation);

-- Fonction pour générer code aléatoire 6 chiffres
CREATE OR REPLACE FUNCTION generate_validation_code()
RETURNS VARCHAR(6) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::VARCHAR, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

#### Table Horaires Restaurants (EXISTANTE - pas de modification)
La table `restaurant_horaires` existe déjà avec la structure suivante :
```sql
-- Table restaurant_horaires (déjà existante)
CREATE TABLE restaurant_horaires (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table Restaurants - Champ statut existant
La colonne `status` existe déjà dans la table `restaurants` :
```sql
-- Colonne status déjà existante dans restaurants
-- Valeurs possibles: 'ouvert', 'ferme', 'temporairement_ferme'
-- Ajout optionnel du champ reason_closed si pas existant
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS reason_closed TEXT DEFAULT NULL;
```

### 🔄 Trigger Automatique
```sql
-- Génération automatique du code à la création
CREATE OR REPLACE FUNCTION set_validation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code_validation IS NULL THEN
    NEW.code_validation = generate_validation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_validation_code
  BEFORE INSERT ON commande
  FOR EACH ROW EXECUTE FUNCTION set_validation_code();
```

---

## 4️⃣ Thème et Design System

### 🎨 Analyse de la Référence Visuelle
D'après la maquette `mk.png` :

#### Palette de Couleurs
```scss
// variables.scss
:root {
  // Couleurs principales (inspirées de la maquette)
  --primary-purple: #8B5CF6;        // Bouton "Start"
  --primary-green: #84CC16;         // Bouton "Sign up", sections "Top Picks"
  --secondary-purple: #A78BFA;      // Dégradés, accents
  --secondary-green: #A3E635;       // Variantes vertes

  // Couleurs neutres
  --background-white: #FFFFFF;
  --background-gray: #F8FAFC;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --border-light: #E2E8F0;
  
  // Couleurs fonctionnelles
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

#### Typographie
```scss
// Typography system
:root {
  --font-family-primary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  
  // Tailles
  --text-xs: 0.75rem;    // 12px
  --text-sm: 0.875rem;   // 14px
  --text-base: 1rem;     // 16px
  --text-lg: 1.125rem;   // 18px
  --text-xl: 1.25rem;    // 20px
  --text-2xl: 1.5rem;    // 24px
  --text-3xl: 1.875rem;  // 30px
  
  // Poids
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Composants UI
```scss
// Boutons
.btn-primary {
  background: linear-gradient(135deg, var(--primary-purple) 0%, #9333EA 100%);
  border-radius: 24px;
  padding: 14px 28px;
  color: white;
  font-weight: var(--font-semibold);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--primary-green) 0%, #65A30D 100%);
  border-radius: 24px;
  padding: 14px 28px;
  color: white;
  font-weight: var(--font-semibold);
  box-shadow: 0 4px 14px rgba(132, 204, 22, 0.3);
}

// Cartes
.card-modern {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  border: 1px solid var(--border-light);
}

// Sections colorées (comme "Top Picks")
.section-highlight {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border-radius: 16px;
  padding: 16px;
}
```

---

## 5️⃣ Structure de l'Application

### 🏠 Page d'Accueil (`/home`)
```typescript
// home.page.ts
export class HomePage {
  selectProfile(type: 'restaurant' | 'delivery') {
    this.router.navigate(['/auth/login'], { 
      queryParams: { userType: type } 
    });
  }
}
```

#### Interface UI
```html
<!-- home.page.html -->
<ion-content class="home-content">
  <div class="welcome-section">
    <img src="assets/images/logo.svg" alt="Bot Resto Conakry">
    <h1>Bot Resto Conakry</h1>
    <p>Choisissez votre profil</p>
  </div>
  
  <div class="profile-cards">
    <div class="profile-card" (click)="selectProfile('restaurant')">
      <ion-icon name="restaurant"></ion-icon>
      <h3>Restaurant</h3>
      <p>Gérer les commandes</p>
    </div>
    
    <div class="profile-card" (click)="selectProfile('delivery')">
      <ion-icon name="bicycle"></ion-icon>
      <h3>Livreur</h3>
      <p>Effectuer les livraisons</p>
    </div>
  </div>
</ion-content>
```

### 🔐 Authentification (`/auth`)

#### Service d'Auth
```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async loginRestaurant(email: string, password: string) {
    // Connexion restaurant via table restaurants
  }

  async loginDelivery(phone: string, code: string) {
    // Connexion livreur via table livreurs
  }

  async getCurrentUser() {
    // Retourne l'utilisateur connecté avec son type
  }
}
```

---

## 6️⃣ Gestion Horaires & Statut Restaurant

### 🕒 Système de Gestion des Horaires

#### Modèle de Données Horaires
```typescript
// schedule.model.ts
export interface RestaurantSchedule {
  restaurant_id: number;
  day_of_week: number; // 0=dimanche, 1=lundi, ..., 6=samedi
  open_time: string;   // Format "HH:MM"
  close_time: string;  // Format "HH:MM"
  is_closed: boolean;  // Fermé exceptionnellement ce jour
}

export interface RestaurantStatus {
  id: number;
  name: string;
  status: 'ouvert' | 'ferme' | 'temporairement_ferme';
  current_schedule: RestaurantSchedule[];
  is_open_now: boolean;
  next_opening: string | null;
  reason_closed?: string;
}
```

### 🏪 Service Gestion Horaires
```typescript
// schedule.service.ts
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  constructor(private supabase: SupabaseService) {}

  async getRestaurantSchedule(restaurantId: number): Promise<RestaurantSchedule[]> {
    const { data } = await this.supabase
      .from('restaurant_horaires')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('day_of_week');
    return data || [];
  }

  async updateSchedule(restaurantId: number, schedule: RestaurantSchedule[]): Promise<void> {
    // Supprimer les anciens horaires
    await this.supabase
      .from('restaurant_horaires')
      .delete()
      .eq('restaurant_id', restaurantId);

    // Insérer les nouveaux
    await this.supabase
      .from('restaurant_horaires')
      .insert(schedule);
  }

  async updateRestaurantStatus(restaurantId: number, status: string, reason?: string): Promise<void> {
    await this.supabase
      .from('restaurants')
      .update({ 
        status, 
        reason_closed: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId);
  }

  isRestaurantOpen(schedule: RestaurantSchedule[], currentStatus: string): {
    isOpen: boolean;
    reason: 'status_closed' | 'outside_hours' | 'temporarily_closed' | 'open';
    nextOpenTime?: string;
  } {
    // Même logique que dans le bot WhatsApp
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    // Vérifier le statut général
    if (currentStatus === 'ferme') {
      return { isOpen: false, reason: 'status_closed' };
    }

    if (currentStatus === 'temporairement_ferme') {
      return { isOpen: false, reason: 'temporarily_closed' };
    }

    // Vérifier les horaires du jour
    const todaySchedule = schedule.find(s => s.day_of_week === currentDay);
    
    if (!todaySchedule || todaySchedule.is_closed) {
      // Trouver la prochaine ouverture
      const nextOpenTime = this.findNextOpenTime(schedule, now);
      return { isOpen: false, reason: 'outside_hours', nextOpenTime };
    }

    // Vérifier si dans les horaires
    if (currentTime >= todaySchedule.open_time && currentTime <= todaySchedule.close_time) {
      return { isOpen: true, reason: 'open' };
    }

    const nextOpenTime = this.findNextOpenTime(schedule, now);
    return { isOpen: false, reason: 'outside_hours', nextOpenTime };
  }

  private findNextOpenTime(schedule: RestaurantSchedule[], from: Date): string {
    // Logique pour trouver la prochaine ouverture
    // Implementation détaillée...
    return '';
  }
}
```

### 🎛️ Interface Gestion Horaires Restaurant

#### Page Paramètres Restaurant
```html
<!-- restaurant-settings.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Paramètres Restaurant</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Statut en temps réel -->
  <div class="status-card">
    <div class="status-header">
      <h2>Statut actuel</h2>
      <ion-chip [color]="getStatusColor(restaurant.status)">
        <ion-icon [name]="getStatusIcon(restaurant.status)"></ion-icon>
        <ion-label>{{ getStatusLabel(restaurant.status) }}</ion-label>
      </ion-chip>
    </div>
    
    <div class="quick-actions">
      <ion-button 
        expand="block" 
        color="success"
        (click)="updateStatus('ouvert')"
        [disabled]="restaurant.status === 'ouvert'">
        🟢 Ouvrir maintenant
      </ion-button>
      
      <ion-button 
        expand="block" 
        color="warning"
        (click)="updateStatus('temporairement_ferme')"
        [disabled]="restaurant.status === 'temporairement_ferme'">
        🟡 Fermer temporairement
      </ion-button>
      
      <ion-button 
        expand="block" 
        color="danger"
        (click)="updateStatus('ferme')"
        [disabled]="restaurant.status === 'ferme'">
        🔴 Fermer définitivement
      </ion-button>
    </div>
  </div>

  <!-- Gestion des horaires -->
  <div class="schedule-section">
    <h3>Horaires d'ouverture</h3>
    
    <div class="day-schedule" *ngFor="let day of weekDays; let i = index">
      <div class="day-header">
        <h4>{{ day.name }}</h4>
        <ion-toggle 
          [(ngModel)]="schedule[i].is_closed"
          (ionChange)="onDayToggle(i)">
        </ion-toggle>
      </div>
      
      <div class="time-inputs" *ngIf="!schedule[i].is_closed">
        <ion-item>
          <ion-label position="stacked">Ouverture</ion-label>
          <ion-datetime
            [(ngModel)]="schedule[i].open_time"
            presentation="time"
            [hourCycle]="h24"
            (ionChange)="onScheduleChange()">
          </ion-datetime>
        </ion-item>
        
        <ion-item>
          <ion-label position="stacked">Fermeture</ion-label>
          <ion-datetime
            [(ngModel)]="schedule[i].close_time"
            presentation="time"
            [hourCycle]="h24"
            (ionChange)="onScheduleChange()">
          </ion-datetime>
        </ion-item>
      </div>
      
      <div class="closed-day" *ngIf="schedule[i].is_closed">
        <p>Fermé ce jour</p>
      </div>
    </div>

    <ion-button 
      expand="block" 
      (click)="saveSchedule()"
      [disabled]="!scheduleChanged">
      Sauvegarder les horaires
    </ion-button>
  </div>

  <!-- Fermetures exceptionnelles -->
  <div class="exceptions-section">
    <h3>Fermetures exceptionnelles</h3>
    
    <ion-item button (click)="addException()">
      <ion-icon name="add" slot="start"></ion-icon>
      <ion-label>Ajouter une fermeture</ion-label>
    </ion-item>
    
    <div class="exception-item" *ngFor="let exception of exceptions">
      <div class="exception-date">
        {{ exception.date | date:'dd/MM/yyyy' }}
      </div>
      <div class="exception-reason">
        {{ exception.reason }}
      </div>
      <ion-button 
        fill="clear" 
        color="danger"
        (click)="removeException(exception.id)">
        <ion-icon name="trash"></ion-icon>
      </ion-button>
    </div>
  </div>
</ion-content>
```

#### Composant TypeScript
```typescript
// restaurant-settings.page.ts
export class RestaurantSettingsPage implements OnInit {
  restaurant: any;
  schedule: RestaurantSchedule[] = [];
  exceptions: any[] = [];
  scheduleChanged = false;
  
  weekDays = [
    { name: 'Dimanche', value: 0 },
    { name: 'Lundi', value: 1 },
    { name: 'Mardi', value: 2 },
    { name: 'Mercredi', value: 3 },
    { name: 'Jeudi', value: 4 },
    { name: 'Vendredi', value: 5 },
    { name: 'Samedi', value: 6 }
  ];

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.restaurant = await this.authService.getCurrentRestaurant();
    this.schedule = await this.scheduleService.getRestaurantSchedule(this.restaurant.id);
    this.initializeEmptySchedule();
  }

  async updateStatus(newStatus: string) {
    if (newStatus === 'ferme' || newStatus === 'temporairement_ferme') {
      await this.showReasonDialog(newStatus);
    } else {
      await this.scheduleService.updateRestaurantStatus(this.restaurant.id, newStatus);
      this.restaurant.status = newStatus;
      this.showToast('Statut mis à jour avec succès');
    }
  }

  async showReasonDialog(status: string) {
    const alert = await this.alertCtrl.create({
      header: 'Raison de la fermeture',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Expliquez pourquoi le restaurant est fermé...'
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Confirmer',
          handler: async (data) => {
            if (data.reason) {
              await this.scheduleService.updateRestaurantStatus(
                this.restaurant.id, 
                status, 
                data.reason
              );
              this.restaurant.status = status;
              this.restaurant.reason_closed = data.reason;
              this.showToast('Statut mis à jour avec succès');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  onScheduleChange() {
    this.scheduleChanged = true;
  }

  async saveSchedule() {
    try {
      await this.scheduleService.updateSchedule(this.restaurant.id, this.schedule);
      this.scheduleChanged = false;
      this.showToast('Horaires sauvegardés avec succès');
    } catch (error) {
      this.showToast('Erreur lors de la sauvegarde', 'danger');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ouvert': return 'success';
      case 'temporairement_ferme': return 'warning';
      case 'ferme': return 'danger';
      default: return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ouvert': return 'checkmark-circle';
      case 'temporairement_ferme': return 'time';
      case 'ferme': return 'close-circle';
      default: return 'help-circle';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ouvert': return 'Ouvert';
      case 'temporairement_ferme': return 'Fermé temporairement';
      case 'ferme': return 'Fermé';
      default: return 'Inconnu';
    }
  }

  private initializeEmptySchedule() {
    // Initialiser avec des horaires par défaut si vide
    if (this.schedule.length === 0) {
      for (let i = 0; i < 7; i++) {
        this.schedule.push({
          restaurant_id: this.restaurant.id,
          day_of_week: i,
          open_time: '08:00',
          close_time: '22:00',
          is_closed: i === 0 // Fermé le dimanche par défaut
        });
      }
    }
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }
}
```

### 🎨 Styles pour la Gestion des Horaires
```scss
// restaurant-settings.page.scss
.status-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: var(--text-primary);
    }
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.schedule-section {
  margin: 16px;
  
  .day-schedule {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: var(--text-primary);
        font-weight: var(--font-semibold);
      }
    }

    .time-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .closed-day {
      text-align: center;
      color: var(--text-secondary);
      font-style: italic;
      padding: 20px;
    }
  }
}

.exceptions-section {
  margin: 16px;

  .exception-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);

    .exception-date {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .exception-reason {
      flex: 1;
      margin-left: 12px;
      color: var(--text-secondary);
    }
  }
}
```

### 📊 Dashboard avec Indicateur de Statut
```typescript
// Mise à jour du dashboard restaurant pour inclure le statut
export class RestaurantDashboardPage implements OnInit {
  restaurant: any;
  orders$ = this.orderService.getRestaurantOrders();
  currentStatus: any;
  
  stats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    todayRevenue: 0
  };

  async ngOnInit() {
    this.restaurant = await this.authService.getCurrentRestaurant();
    await this.updateRestaurantStatus();
    
    // Mettre à jour le statut toutes les minutes
    setInterval(() => this.updateRestaurantStatus(), 60000);
  }

  async updateRestaurantStatus() {
    const schedule = await this.scheduleService.getRestaurantSchedule(this.restaurant.id);
    this.currentStatus = this.scheduleService.isRestaurantOpen(schedule, this.restaurant.status);
  }

  navigateToSettings() {
    this.router.navigate(['/restaurant/settings']);
  }
}
```

---

## 7️⃣ Flux Utilisateur Détaillé

### 👨‍🍳 Interface Restaurant (`/restaurant`)

#### 📊 Dashboard Restaurant avec Analytics
```typescript
// restaurant-dashboard.page.ts
export class RestaurantDashboardPage implements OnInit {
  restaurant: any;
  orders$ = this.orderService.getRestaurantOrders();
  currentStatus: any;
  
  // Statistiques temps réel
  stats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    todayRevenue: 0
  };

  // Analytics financières
  revenueStats = {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  };

  // Données pour les graphiques
  chartData = {
    daily: [], // 30 derniers jours
    monthly: [], // 12 derniers mois
    hourly: [] // Répartition par heure aujourd'hui
  };

  selectedPeriod: 'day' | 'week' | 'month' = 'day';

  constructor(
    private orderService: OrderService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private scheduleService: ScheduleService
  ) {}

  async ngOnInit() {
    this.restaurant = await this.authService.getCurrentRestaurant();
    await this.loadDashboardData();
    
    // Actualisation automatique toutes les 5 minutes
    setInterval(() => this.loadDashboardData(), 300000);
  }

  async loadDashboardData() {
    await Promise.all([
      this.updateRestaurantStatus(),
      this.loadOrderStats(),
      this.loadRevenueAnalytics(),
      this.loadChartData()
    ]);
  }

  async loadRevenueAnalytics() {
    this.revenueStats = await this.analyticsService.getRevenueStats(this.restaurant.id);
  }

  async loadChartData() {
    switch (this.selectedPeriod) {
      case 'day':
        this.chartData.daily = await this.analyticsService.getDailyRevenue(this.restaurant.id, 30);
        break;
      case 'week':
        this.chartData.daily = await this.analyticsService.getWeeklyRevenue(this.restaurant.id, 12);
        break;
      case 'month':
        this.chartData.monthly = await this.analyticsService.getMonthlyRevenue(this.restaurant.id, 12);
        break;
    }
    this.chartData.hourly = await this.analyticsService.getHourlyRevenue(this.restaurant.id);
  }

  onPeriodChange(period: 'day' | 'week' | 'month') {
    this.selectedPeriod = period;
    this.loadChartData();
  }

  async updateRestaurantStatus() {
    const schedule = await this.scheduleService.getRestaurantSchedule(this.restaurant.id);
    this.currentStatus = this.scheduleService.isRestaurantOpen(schedule, this.restaurant.status);
  }

  async loadOrderStats() {
    this.stats = await this.orderService.getOrderStats(this.restaurant.id);
  }

  navigateToSettings() {
    this.router.navigate(['/restaurant/settings']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/restaurant/analytics']);
  }
}
```

#### 💰 Service Analytics
```typescript
// analytics.service.ts
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private supabase: SupabaseService) {}

  async getRevenueStats(restaurantId: number): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Revenus aujourd'hui
    const { data: todayRevenue } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', today);

    // Revenus hier
    const { data: yesterdayRevenue } = await this.supabase
      .from('commande')
      .select('total_ttc')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', yesterday)
      .lt('created_at', today);

    // Calculs de croissance et autres stats...
    const todayTotal = todayRevenue?.reduce((sum, order) => sum + order.total_ttc, 0) || 0;
    const yesterdayTotal = yesterdayRevenue?.reduce((sum, order) => sum + order.total_ttc, 0) || 0;

    return {
      today: todayTotal,
      yesterday: yesterdayTotal,
      thisWeek: await this.getWeekRevenue(restaurantId),
      thisMonth: await this.getMonthRevenue(restaurantId),
      lastMonth: await this.getLastMonthRevenue(restaurantId),
      growth: {
        daily: yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0,
        weekly: await this.getWeeklyGrowth(restaurantId),
        monthly: await this.getMonthlyGrowth(restaurantId)
      }
    };
  }

  async getDailyRevenue(restaurantId: number, days: number): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Grouper par jour
    const dailyData = this.groupByDay(data || []);
    return this.formatChartData(dailyData, 'daily');
  }

  async getMonthlyRevenue(restaurantId: number, months: number): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1);

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Grouper par mois
    const monthlyData = this.groupByMonth(data || []);
    return this.formatChartData(monthlyData, 'monthly');
  }

  async getHourlyRevenue(restaurantId: number): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await this.supabase
      .from('commande')
      .select('total_ttc, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('statut', 'livree')
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    // Grouper par heure
    const hourlyData = this.groupByHour(data || []);
    return this.formatChartData(hourlyData, 'hourly');
  }

  private groupByDay(data: any[]): Map<string, number> {
    return data.reduce((acc, order) => {
      const date = order.created_at.split('T')[0];
      acc.set(date, (acc.get(date) || 0) + order.total_ttc);
      return acc;
    }, new Map());
  }

  private groupByMonth(data: any[]): Map<string, number> {
    return data.reduce((acc, order) => {
      const month = order.created_at.substring(0, 7); // YYYY-MM
      acc.set(month, (acc.get(month) || 0) + order.total_ttc);
      return acc;
    }, new Map());
  }

  private groupByHour(data: any[]): Map<number, number> {
    return data.reduce((acc, order) => {
      const hour = new Date(order.created_at).getHours();
      acc.set(hour, (acc.get(hour) || 0) + order.total_ttc);
      return acc;
    }, new Map());
  }

  private formatChartData(dataMap: Map<any, number>, type: string): any[] {
    return Array.from(dataMap.entries()).map(([key, value]) => ({
      label: this.formatLabel(key, type),
      value: value,
      date: key
    }));
  }

  private formatLabel(key: any, type: string): string {
    switch (type) {
      case 'daily':
        return new Date(key).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      case 'monthly':
        return new Date(key + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      case 'hourly':
        return `${key}h`;
      default:
        return key.toString();
    }
  }
}
```

#### 🎨 Interface Dashboard Moderne
```html
<!-- restaurant-dashboard.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>{{ restaurant?.name }}</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="navigateToSettings()">
        <ion-icon name="settings"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="dashboard-content">
  <!-- Statut Restaurant -->
  <div class="status-banner" [class]="'status-' + restaurant?.status">
    <div class="status-info">
      <ion-icon [name]="getStatusIcon(restaurant?.status)" class="status-icon"></ion-icon>
      <div class="status-text">
        <h3>{{ getStatusLabel(restaurant?.status) }}</h3>
        <p *ngIf="currentStatus?.nextOpenTime">{{ currentStatus.nextOpenTime }}</p>
      </div>
    </div>
    <ion-button fill="clear" (click)="navigateToSettings()">
      Gérer
    </ion-button>
  </div>

  <!-- Cartes KPI -->
  <div class="kpi-grid">
    <div class="kpi-card revenue-today">
      <div class="kpi-header">
        <ion-icon name="cash" class="kpi-icon"></ion-icon>
        <span class="kpi-label">Aujourd'hui</span>
      </div>
      <div class="kpi-value">{{ revenueStats.today | currency:'GNF':'' }}</div>
      <div class="kpi-growth" [class.positive]="revenueStats.growth.daily > 0" [class.negative]="revenueStats.growth.daily < 0">
        <ion-icon [name]="revenueStats.growth.daily > 0 ? 'trending-up' : 'trending-down'"></ion-icon>
        {{ Math.abs(revenueStats.growth.daily) | number:'1.1-1' }}%
      </div>
    </div>

    <div class="kpi-card revenue-month">
      <div class="kpi-header">
        <ion-icon name="calendar" class="kpi-icon"></ion-icon>
        <span class="kpi-label">Ce mois</span>
      </div>
      <div class="kpi-value">{{ revenueStats.thisMonth | currency:'GNF':'' }}</div>
      <div class="kpi-growth" [class.positive]="revenueStats.growth.monthly > 0" [class.negative]="revenueStats.growth.monthly < 0">
        <ion-icon [name]="revenueStats.growth.monthly > 0 ? 'trending-up' : 'trending-down'"></ion-icon>
        {{ Math.abs(revenueStats.growth.monthly) | number:'1.1-1' }}%
      </div>
    </div>

    <div class="kpi-card orders-pending">
      <div class="kpi-header">
        <ion-icon name="time" class="kpi-icon"></ion-icon>
        <span class="kpi-label">En attente</span>
      </div>
      <div class="kpi-value">{{ stats.pending }}</div>
      <div class="kpi-sublabel">commandes</div>
    </div>

    <div class="kpi-card orders-progress">
      <div class="kpi-header">
        <ion-icon name="restaurant" class="kpi-icon"></ion-icon>
        <span class="kpi-label">En cours</span>
      </div>
      <div class="kpi-value">{{ stats.inProgress }}</div>
      <div class="kpi-sublabel">en préparation</div>
    </div>
  </div>

  <!-- Section Graphiques -->
  <div class="charts-section">
    <div class="charts-header">
      <h2>Chiffre d'affaires</h2>
      <ion-segment [(ngModel)]="selectedPeriod" (ionChange)="onPeriodChange($event.detail.value)">
        <ion-segment-button value="day">
          <ion-label>Jour</ion-label>
        </ion-segment-button>
        <ion-segment-button value="week">
          <ion-label>Semaine</ion-label>
        </ion-segment-button>
        <ion-segment-button value="month">
          <ion-label>Mois</ion-label>
        </ion-segment-button>
      </ion-segment>
    </div>

    <!-- Graphique principal -->
    <div class="chart-container">
      <canvas 
        #revenueChart
        class="revenue-chart"
        [chartData]="getChartData()"
        [chartOptions]="getChartOptions()">
      </canvas>
    </div>

    <!-- Répartition par heure (aujourd'hui uniquement) -->
    <div class="hourly-chart" *ngIf="selectedPeriod === 'day'">
      <h3>Répartition par heure (aujourd'hui)</h3>
      <div class="hourly-bars">
        <div 
          class="hour-bar" 
          *ngFor="let hour of chartData.hourly"
          [style.height.%]="getBarHeight(hour.value, chartData.hourly)">
          <div class="bar-value">{{ hour.value | currency:'GNF':'symbol-narrow':'1.0-0' }}</div>
          <div class="bar-label">{{ hour.label }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Statistiques comparatives -->
  <div class="comparison-stats">
    <h2>Comparaisons</h2>
    <div class="comparison-grid">
      <div class="comparison-item">
        <span class="comparison-label">Hier</span>
        <span class="comparison-value">{{ revenueStats.yesterday | currency:'GNF':'' }}</span>
      </div>
      <div class="comparison-item">
        <span class="comparison-label">Cette semaine</span>
        <span class="comparison-value">{{ revenueStats.thisWeek | currency:'GNF':'' }}</span>
      </div>
      <div class="comparison-item">
        <span class="comparison-label">Mois dernier</span>
        <span class="comparison-value">{{ revenueStats.lastMonth | currency:'GNF':'' }}</span>
      </div>
    </div>
  </div>

  <!-- Actions rapides -->
  <div class="quick-actions">
    <ion-button expand="block" (click)="navigateToAnalytics()" class="analytics-btn">
      <ion-icon name="analytics" slot="start"></ion-icon>
      Voir analyses détaillées
    </ion-button>
  </div>
</ion-content>
```

#### 🎨 Styles Dashboard Moderne
```scss
// restaurant-dashboard.page.scss
.dashboard-content {
  --background: var(--background-gray);
  padding: 0;
}

// Bannière de statut
.status-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  
  &.status-ouvert {
    background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
    border-left: 4px solid var(--success);
  }
  
  &.status-ferme {
    background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
    border-left: 4px solid var(--error);
  }
  
  &.status-temporairement_ferme {
    background: linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%);
    border-left: 4px solid var(--warning);
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .status-icon {
      font-size: 24px;
      color: var(--ion-color-primary);
    }

    .status-text {
      h3 {
        margin: 0;
        color: var(--text-primary);
        font-weight: var(--font-semibold);
      }

      p {
        margin: 4px 0 0 0;
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }
    }
  }
}

// Grille KPI
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
  }

  &.revenue-today::before {
    background: linear-gradient(180deg, var(--primary-purple), var(--secondary-purple));
  }

  &.revenue-month::before {
    background: linear-gradient(180deg, var(--primary-green), var(--secondary-green));
  }

  &.orders-pending::before {
    background: linear-gradient(180deg, var(--warning), #FCD34D);
  }

  &.orders-progress::before {
    background: linear-gradient(180deg, var(--info), #60A5FA);
  }

  .kpi-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .kpi-icon {
      font-size: 20px;
      color: var(--text-secondary);
    }

    .kpi-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: var(--font-medium);
    }
  }

  .kpi-value {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .kpi-growth {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);

    &.positive {
      color: var(--success);
    }

    &.negative {
      color: var(--error);
    }

    ion-icon {
      font-size: 16px;
    }
  }

  .kpi-sublabel {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

// Section graphiques
.charts-section {
  margin: 0 16px 24px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  .charts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      color: var(--text-primary);
      font-weight: var(--font-semibold);
    }

    ion-segment {
      --background: var(--background-gray);
    }
  }

  .chart-container {
    height: 300px;
    position: relative;
    margin-bottom: 24px;

    .revenue-chart {
      width: 100%;
      height: 100%;
    }
  }
}

// Graphique barres par heure
.hourly-chart {
  h3 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
  }

  .hourly-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 120px;
    padding: 10px 0;
    gap: 2px;

    .hour-bar {
      flex: 1;
      background: linear-gradient(180deg, var(--primary-purple), var(--secondary-purple));
      border-radius: 4px 4px 0 0;
      min-height: 10px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;

      .bar-value {
        position: absolute;
        top: -20px;
        font-size: 10px;
        color: var(--text-primary);
        font-weight: var(--font-medium);
      }

      .bar-label {
        position: absolute;
        bottom: -20px;
        font-size: 10px;
        color: var(--text-secondary);
      }
    }
  }
}

// Statistiques comparatives
.comparison-stats {
  margin: 0 16px 24px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  h2 {
    margin: 0 0 20px 0;
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  .comparison-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comparison-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
    }

    .comparison-label {
      color: var(--text-secondary);
      font-weight: var(--font-medium);
    }

    .comparison-value {
      color: var(--text-primary);
      font-weight: var(--font-semibold);
    }
  }
}

// Actions rapides
.quick-actions {
  padding: 0 16px 24px;

  .analytics-btn {
    --background: linear-gradient(135deg, var(--primary-purple) 0%, #9333EA 100%);
    --border-radius: 16px;
    height: 48px;
    font-weight: var(--font-semibold);
  }
}
```

#### 📈 Integration Chart.js
```typescript
// Dans le module principal ou dashboard module
import { NgChartsModule } from 'ng2-charts';

// Méthodes dashboard pour les graphiques
getChartData(): any {
  const data = this.selectedPeriod === 'month' 
    ? this.chartData.monthly 
    : this.chartData.daily;

  return {
    labels: data.map(item => item.label),
    datasets: [{
      label: 'Chiffre d\'affaires',
      data: data.map(item => item.value),
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };
}

getChartOptions(): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => value.toLocaleString() + ' GNF'
        }
      }
    }
  };
}

getBarHeight(value: number, data: any[]): number {
  const max = Math.max(...data.map(item => item.value));
  return max > 0 ? (value / max) * 100 : 0;
}
```

#### 📋 Liste des Commandes
```html
<!-- Carte de commande -->
<div class="order-card" *ngFor="let order of orders">
  <div class="order-header">
    <span class="order-id">#{{ order.id }}</span>
    <span class="order-status" [class]="'status-' + order.statut">
      {{ getStatusLabel(order.statut) }}
    </span>
  </div>
  
  <div class="order-details">
    <p><strong>Client:</strong> {{ order.nom_client }}</p>
    <p><strong>Téléphone:</strong> {{ order.telephone_client }}</p>
    <p><strong>Mode:</strong> {{ order.mode }}</p>
    <p><strong>Total:</strong> {{ order.total_ttc | currency:'GNF' }}</p>
  </div>
  
  <div class="order-actions">
    <ion-button 
      *ngIf="!order.livreur_id" 
      (click)="assignDelivery(order)"
      class="btn-secondary">
      Affecter Livreur
    </ion-button>
    
    <ion-button 
      (click)="updateStatus(order)"
      class="btn-primary">
      Changer Statut
    </ion-button>
  </div>
</div>
```

#### 🚴 Affectation Livreur
```typescript
// assign-delivery.modal.ts
export class AssignDeliveryModal {
  availableDeliverers$ = this.deliveryService.getAvailableDeliverers();
  
  async assignOrder(orderId: number, delivererId: number) {
    await this.orderService.assignDeliverer(orderId, delivererId);
    await this.notificationService.notifyDeliverer(delivererId, orderId);
    this.modalCtrl.dismiss();
  }
}
```

### 🚴‍♂️ Interface Livreur (`/delivery`)

#### 📱 Dashboard Livreur
```typescript
// delivery-dashboard.page.ts
export class DeliveryDashboardPage {
  assignedOrders$ = this.orderService.getDelivererOrders();
  
  stats = {
    pending: 0,
    inProgress: 0,
    completedToday: 0
  };
}
```

#### 📋 Détail Commande
```html
<!-- delivery-order-detail.page.html -->
<ion-content>
  <div class="order-info-card">
    <h2>Commande #{{ order.id }}</h2>
    <div class="customer-info">
      <h3>Client</h3>
      <p>{{ order.nom_client }}</p>
      <p>{{ order.telephone_client }}</p>
      <ion-button fill="clear" (click)="callCustomer()">
        <ion-icon name="call"></ion-icon>
        Appeler
      </ion-button>
    </div>
    
    <div class="delivery-address" *ngIf="order.mode === 'livraison'">
      <h3>Adresse de livraison</h3>
      <p>{{ order.adresse_livraison }}</p>
      <ion-button fill="clear" (click)="openMaps()">
        <ion-icon name="map"></ion-icon>
        Voir sur la carte
      </ion-button>
    </div>
    
    <div class="order-items">
      <h3>Articles commandés</h3>
      <div *ngFor="let item of order.details">
        <span>{{ item.quantite }}x {{ item.nom_plat }}</span>
        <span>{{ item.prix_unitaire * item.quantite | currency:'GNF' }}</span>
      </div>
    </div>
  </div>
  
  <div class="validation-section">
    <h3>Validation de livraison</h3>
    <p>Demandez le code de validation au client :</p>
    
    <ion-item>
      <ion-label position="stacked">Code de validation</ion-label>
      <ion-input 
        [(ngModel)]="validationCode"
        type="tel"
        maxlength="6"
        placeholder="Entrez le code à 6 chiffres">
      </ion-input>
    </ion-item>
    
    <ion-button 
      expand="block"
      class="btn-primary"
      (click)="validateDelivery()"
      [disabled]="!validationCode || validationCode.length !== 6">
      Valider la livraison
    </ion-button>
  </div>
</ion-content>
```

#### ✅ Validation Livraison
```typescript
// delivery-order-detail.page.ts
async validateDelivery() {
  try {
    const success = await this.orderService.validateDelivery(
      this.order.id, 
      this.validationCode
    );
    
    if (success) {
      this.presentToast('Livraison validée avec succès !', 'success');
      this.router.navigate(['/delivery/dashboard']);
    } else {
      this.presentToast('Code de validation incorrect', 'danger');
    }
  } catch (error) {
    this.presentToast('Erreur lors de la validation', 'danger');
  }
}
```

---

## 7️⃣ Système de Notifications

### 📱 Service WhatsApp
```typescript
// whatsapp.service.ts
@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  
  async notifyCustomerStatusChange(order: any, newStatus: string) {
    const messages = {
      'en_preparation': '👨‍🍳 Votre commande est en cours de préparation !',
      'prete': '✅ Votre commande est prête !',
      'en_route': '🚴‍♂️ Votre livreur est en route !',
      'livree': '🎉 Commande livrée ! Merci de votre confiance !'
    };
    
    const message = `${messages[newStatus]}\n\n📝 Commande #${order.id}\n🏪 ${order.restaurant_name}`;
    
    await this.sendWhatsAppMessage(order.telephone_client, message);
  }
  
  async notifyDelivererAssignment(delivererPhone: string, order: any) {
    const message = `🚴‍♂️ Nouvelle livraison assignée !\n\n📝 Commande #${order.id}\n🏪 ${order.restaurant_name}\n📍 ${order.adresse_livraison}\n💰 ${order.total_ttc} GNF`;
    
    await this.sendWhatsAppMessage(delivererPhone, message);
  }
}
```

### 🔔 Push Notifications
```typescript
// push-notification.service.ts
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  
  async initializePush() {
    await PushNotifications.requestPermissions();
    await PushNotifications.register();
  }
  
  async notifyDelivererNewOrder(delivererId: number, orderDetails: any) {
    // Notification push locale pour le livreur
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Nouvelle commande assignée',
        body: `Commande #${orderDetails.id} - ${orderDetails.restaurant_name}`,
        id: orderDetails.id,
        actionTypeId: 'view_order',
        extra: { orderId: orderDetails.id }
      }]
    });
  }
}
```

---

## 8️⃣ Développement par Phases

### 🚀 Phase 1 : Foundation (Semaine 1-2)
- [ ] Setup projet Ionic + Angular
- [ ] Configuration Supabase
- [ ] Design System & Thème
- [ ] Page d'accueil + Navigation
- [ ] Système d'authentification
- [ ] Mise à jour base de données

### 🏗 Phase 2 : Interface Restaurant (Semaine 2-3)
- [ ] **Dashboard restaurant avec analytics complet**
- [ ] **Cartes KPI (chiffre d'affaires jour/mois, commandes)**
- [ ] **Graphiques interactifs (Chart.js) - jour/semaine/mois**
- [ ] **Service analytics avec calculs de croissance**
- [ ] Liste des commandes
- [ ] Changement de statut
- [ ] Affectation des livreurs
- [ ] **Gestion horaires et statut restaurant**
- [ ] **Interface paramètres avec contrôle ouvert/fermé**
- [ ] Notifications WhatsApp

### 🚴 Phase 3 : Interface Livreur (Semaine 3-4)
- [ ] Dashboard livreur  
- [ ] Liste des commandes assignées
- [ ] Détail commande + navigation
- [ ] Système de validation par code
- [ ] Notifications push

### 🔧 Phase 4 : Intégrations & Tests (Semaine 4-5)
- [ ] Integration complète WhatsApp
- [ ] Tests E2E complets
- [ ] Optimisation performance
- [ ] Documentation utilisateur

### 📱 Phase 5 : Build & Déploiement (Semaine 5-6)
- [ ] Build Android/iOS
- [ ] Tests sur devices
- [ ] Store deployment prep
- [ ] Formation utilisateurs

---

## 9️⃣ Tests et Déploiement

### 🧪 Stratégie de Tests
```typescript
// Exemple de test
describe('OrderService', () => {
  it('should validate delivery with correct code', async () => {
    const result = await orderService.validateDelivery(123, '123456');
    expect(result).toBe(true);
  });
  
  it('should reject invalid validation code', async () => {
    const result = await orderService.validateDelivery(123, '000000');
    expect(result).toBe(false);
  });
});
```

### 📦 Configuration Build
```json
// capacitor.config.ts
{
  "appId": "com.botrestaurant.app",
  "appName": "Bot Resto Conakry",
  "webDir": "www",
  "plugins": {
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
```

### 🚀 Scripts de Déploiement
```bash
# Build et déploiement
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap run android
```

---

## 📋 Checklist Final

### ✅ Fonctionnalités Core
- [ ] Double authentification (Restaurant/Livreur)
- [ ] Gestion commandes restaurant
- [ ] **Dashboard analytics avec chiffre d'affaires (jour/mois)**
- [ ] **Graphiques interactifs et KPI temps réel**
- [ ] **Analyses de croissance et comparaisons périodiques**
- [ ] **Gestion horaires et statut restaurant (ouvert/fermé)**
- [ ] **Contrôles temps réel du statut restaurant**
- [ ] Affectation livreurs
- [ ] Validation par code
- [ ] Notifications WhatsApp automatiques
- [ ] Interface mobile responsive

### 🎨 Design & UX
- [ ] Thème cohérent basé sur la maquette
- [ ] Navigation intuitive
- [ ] Feedback utilisateur approprié
- [ ] Gestion erreurs gracieuse
- [ ] Performance optimisée

### 🔒 Sécurité
- [ ] Authentification sécurisée
- [ ] Validation côté serveur
- [ ] Chiffrement des communications
- [ ] Gestion des permissions

---

**🎯 Objectif Final :** Application mobile native performante permettant une gestion fluide des commandes restaurants et des livraisons, avec **dashboard analytics moderne incluant chiffre d'affaires en temps réel**, **gestion complète des horaires et statuts d'ouverture**, notifications WhatsApp automatiques et validation sécurisée par code.