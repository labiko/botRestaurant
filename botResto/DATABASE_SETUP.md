# 🗄️ Configuration Base de Données - Bot Restaurant Ionic

## 📋 **Instructions de Setup**

### **1. Exécuter le Script SQL**

Connectez-vous à votre console Supabase et exécutez le fichier :
```
database/setup.sql
```

⚠️ **IMPORTANT**: La table `restaurants` doit utiliser des UUID, pas des BIGINT. Le script a été corrigé pour cette compatibilité.

### **2. Comptes de Test Créés**

Une fois le script exécuté, vous aurez accès à ces comptes pour tester l'application :

#### **🏪 Comptes Restaurant**
```
Email: admin@bellvista.com
Mot de passe: n'importe quel mot de passe (auth simplifiée pour demo)
```

```
Email: admin@chezfatou.com  
Mot de passe: n'importe quel mot de passe
```

```
Email: admin@lepalmier.com
Mot de passe: n'importe quel mot de passe
```

#### **🚚 Comptes Livreur**
```
Téléphone: 624123456
Code d'accès: 123456
```

```
Téléphone: 628987654
Code d'accès: 654321
```

```
Téléphone: 611555333
Code d'accès: 789123
```

## 🔄 **Modifications Apportées**

### **✅ Services Mis à Jour**

1. **AuthService** - Authentification réelle via Supabase
   - Login restaurant via `restaurant_users` table
   - Login livreur via `delivery_users` table
   - Suppression des données mockées

2. **DeliveryService** - Données réelles depuis la base
   - Chargement des commandes depuis `commandes` table
   - Calcul des statistiques réelles
   - Mise à jour du statut des commandes

3. **ScheduleService** - Déjà connecté à la base
   - Utilise `restaurant_horaires` table
   - Gestion du statut restaurant

### **🗑️ Supprimé**
- Bouton "Connexion Demo" 
- Méthodes `demoLoginRestaurant()`
- Toutes les données mockées dans les services
- Données de test hardcodées

### **🆕 Tables Ajoutées**

- `restaurant_users` - Utilisateurs des restaurants
- `delivery_users` - Comptes livreurs
- `restaurant_analytics` - Statistiques par jour
- `delivery_stats` - Statistiques livreurs
- `user_sessions` - Tracking des sessions
- `restaurant_status_logs` - Historique des changements

## 🧪 **Tests de l'Application**

### **Test Restaurant**
1. Aller sur `/login?userType=restaurant`
2. Utiliser: `admin@bellvista.com` + n'importe quel mot de passe
3. Accéder au dashboard avec données réelles

### **Test Livreur**  
1. Aller sur `/login?userType=delivery`
2. Utiliser: `624123456` + `123456`
3. Accéder au dashboard livreur avec commandes réelles

## ⚡ **Optimisations**

- Index sur les colonnes fréquemment requêtées
- Triggers automatiques pour `updated_at`
- Contraintes de données pour la cohérence
- Vues pré-calculées pour les statistiques
- Politique RLS (optionnelle, commentée)

## 🚨 **Points Importants**

1. **Types de Données**: Utilisation d'UUID pour les foreign keys restaurant_id
2. **Authentification**: Simplifiée pour demo (accepte tout mot de passe non vide)
3. **Données de Test**: Analytics et statistiques générées automatiquement
4. **Performance**: Index ajoutés sur les requêtes critiques

## 🔐 **Sécurité en Production**

Pour la production, implémentez :
- Hashage bcrypt pour les mots de passe
- Supabase Auth complet
- Validation stricte des inputs
- Row Level Security (RLS)
- Rate limiting sur les endpoints

---

**✨ L'application est maintenant entièrement connectée à la base de données réelle !**