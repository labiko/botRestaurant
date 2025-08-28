# 🍽️ Documentation Workflow Bot Restaurant WhatsApp

## 📋 Vue d'ensemble

Le Bot Restaurant WhatsApp permet aux clients de commander dans des restaurants via WhatsApp. Il utilise une architecture simple avec des états de session pour gérer les conversations.

## 🚀 Points d'entrée

### 1. **Mot-clé "resto"** (Classique)
```
User: "resto"
→ Workflow complet avec géolocalisation
```

### 2. **Numéro de téléphone restaurant** (Nouveau)
```
User: "622987654"
→ Accès direct au menu du restaurant
```

### 3. **Mots-clés de conversation**
```
User: "bonjour", "salut", "commander", "hi"
→ Workflow classique
```

### 4. **Mots-clés de redémarrage**
```
User: "restaurant", "menu", "accueil", "start", "restart", "retour"
→ Réinitialisation complète
```

## 🔄 États de Session

### État `INITIAL`
**Point de départ de toute conversation**
- Session créée automatiquement
- Attend un mot-clé d'activation

**Actions possibles :**
- `resto` → `CHOOSING_RESTAURANT`
- `622987654` → `VIEWING_MENU` (direct)
- `bonjour`, `salut` → `CHOOSING_RESTAURANT`
- Autre → Message d'aide

---

### État `CHOOSING_RESTAURANT`
**Choix du mode de recherche restaurant**

**Message affiché :**
```
🍽️ Bienvenue chez Bot Resto Conakry!

Comment souhaitez-vous trouver votre restaurant?

1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴
```

**Actions possibles :**
- `1` → `WAITING_LOCATION`
- `2` → `VIEWING_ALL_RESTOS`

---

### État `WAITING_LOCATION`
**Attente de géolocalisation**

**Message affiché :**
```
📍 Partagez votre position pour voir les restaurants près de vous
```

**Actions possibles :**
- Géolocalisation → Affichage restaurants proches + sélection
- Message texte → Erreur, redemande position

---

### État `VIEWING_ALL_RESTOS`
**Affichage liste complète des restaurants**

**Format d'affichage :**
```
🍴 Restaurants disponibles:

1️⃣ **Restaurant Kaloum** ✅
📍 2.3km • Ouvert
🕐 11:00-22:00

2️⃣ **Brasserie Savigny** ✅
📍 1.8km • Ouvert
🕐 10:00-23:00
```

**Actions possibles :**
- `1`, `2`, `3`... → Sélection restaurant → `VIEWING_MENU`
- `suivant` → Page suivante (si disponible)

---

### État `VIEWING_MENU`
**Affichage du menu du restaurant**

**Format d'affichage :**
```
📋 Menu du jour - Restaurant Kaloum

🥗 ENTRÉES
1️⃣ Salade de fruits de mer - 25 000 GNF
2️⃣ Soupe de poisson - 15 000 GNF

🍖 PLATS PRINCIPAUX  
3️⃣ Riz au gras - 35 000 GNF
4️⃣ Poulet rôti - 40 000 GNF

Pour commander: 1,2,3 (numéros séparés par virgules)
```

**Actions possibles :**
- `1,2,3` → Ajout panier → `CONFIRMING_ORDER`
- `1` → Ajout 1 item → `CONFIRMING_ORDER`
- `modifier` → `MODIFYING_ORDER`

---

### État `CONFIRMING_ORDER`
**Confirmation du panier**

**Format d'affichage :**
```
🛒 Votre panier:
2x Salade fruits de mer: 50 000 GNF
1x Riz au gras: 35 000 GNF

💰 Sous-total: 85 000 GNF

1️⃣ Confirmer ✅
2️⃣ Modifier le panier 📝
3️⃣ Tout annuler ❌
```

**Actions possibles :**
- `1` → `CHOOSING_MODE`
- `2` → `MODIFYING_ORDER`  
- `3` → Reset → `INITIAL`

---

### État `MODIFYING_ORDER`
**Modification du panier**

**Actions possibles :**
- `1`, `2`, `3`... → Suppression item
- Retour automatique → `CONFIRMING_ORDER`

---

### État `CHOOSING_MODE`
**Choix du mode de récupération**

**Message affiché :**
```
📦 Comment souhaitez-vous récupérer votre commande?

1️⃣ Sur place 🍽️ (manger au restaurant)
2️⃣ À emporter 📦 (récupérer et partir)  
3️⃣ Livraison 🏠 (nous vous livrons)
```

**Actions possibles :**
- `1` → Mode sur place → `CHOOSING_PAYMENT_TIMING`
- `2` → Mode à emporter → `CHOOSING_PAYMENT_TIMING`
- `3` → Mode livraison → `WAITING_DELIVERY_ADDRESS`

---

### État `WAITING_DELIVERY_ADDRESS`
**Saisie adresse de livraison**

**Actions possibles :**
- Géolocalisation → Calcul frais → `CHOOSING_PAYMENT_TIMING`
- Adresse texte → Validation → `CHOOSING_PAYMENT_TIMING`

---

### État `CHOOSING_PAYMENT_TIMING`
**Choix du moment de paiement**

**Messages selon le mode :**

**Sur place :**
```
💳 Quand souhaitez-vous payer?
1️⃣ Maintenant (paiement mobile)
2️⃣ À la fin du repas (cash)
Total: 85 000 GNF
```

**À emporter :**
```
💳 Quand souhaitez-vous payer?
1️⃣ Maintenant (paiement mobile) 
2️⃣ À la récupération (cash)
Total: 85 000 GNF
```

**Livraison :**
```
💳 Quand souhaitez-vous payer?
1️⃣ Maintenant (paiement mobile)
2️⃣ À la livraison (cash)  
Total: 95 000 GNF (frais livraison: 10 000 GNF)
```

**Actions possibles :**
- `1` → `CHOOSING_PAYMENT_METHOD`
- `2` → Commande confirmée → `ORDER_CONFIRMED`

---

### État `CHOOSING_PAYMENT_METHOD`  
**Sélection méthode de paiement immédiat**

**Message affiché :**
```
💳 Choisissez votre méthode de paiement:
1️⃣ Orange Money
2️⃣ Wave
Montant: 85 000 GNF
```

**Actions possibles :**
- `1`, `2` → Simulation paiement → `ORDER_CONFIRMED`

---

### État `ORDER_CONFIRMED`
**Commande confirmée - État final**

**Messages selon le mode :**

**Sur place :**
```
✅ Commande #2024-0001 confirmée!
🍽️ SUR PLACE au restaurant
⏱️ Table prête dans ~10-15 minutes  
💰 À payer sur place: 85 000 GNF
Nous vous attendons!
```

**À emporter :**
```
✅ Commande #2024-0001 confirmée!
📦 À EMPORTER - Restaurant Kaloum
⏱️ Prête dans ~20-25 minutes
💰 À payer au retrait: 85 000 GNF  
📲 Nous vous préviendrons!
```

**Livraison :**
```
✅ Commande #2024-0001 confirmée!
🛵 LIVRAISON - 123 Rue Kaloum
⏱️ Arrivée estimée: 30-40 minutes
💰 À payer à la livraison: 95 000 GNF
🏍️ Recherche de livreur en cours...
```

**Actions possibles :**
- Proposition favori (automatique après 3s)
- `resto` → Nouvelle commande

---

### État `CONFIRM_CANCEL` 
**Confirmation d'annulation**

**Message affiché :**
```
⚠️ Êtes-vous sûr de vouloir annuler votre commande?
Tapez "oui" pour annuler ou "non" pour continuer.
```

**Actions possibles :**
- `oui` → Annulation → `INITIAL` 
- `non` → Retour état précédent

## 🛠️ Fonctions Système

### Détection de Format
```typescript
isPhoneNumberFormat(message) 
// Détecte: 6XXXXXXXX ou 7XXXXXXXX (9 chiffres)
```

### Recherche Restaurant par Téléphone
```typescript
findRestaurantByPhone(phone)
// Formats: "622987654", "+224622987654", "224622987654"  
// Table: restaurants.telephone
// Filtre: statut = 'ouvert'
```

### Gestion Session
```typescript
SimpleSession.create(phone, state)    // Créer session
SimpleSession.get(phone)              // Récupérer session  
SimpleSession.update(id, data)        // Mettre à jour
SimpleSession.deleteAllForPhone(phone) // Nettoyer
```

### Workflow Principal
```typescript
handleDirectRestaurantAccess()   // Numéro téléphone → Menu direct
handleAccueil()                  // Mot-clé "resto" → Choix restaurant
showSimpleMenu()                 // Affichage menu avec ordre déterministe
```

## 🔄 Flux de Données

### Base de Données
- **`sessions`** : État conversation utilisateur
- **`clients`** : Profils utilisateurs WhatsApp  
- **`restaurants`** : Liste restaurants (telephone, statut, horaires)
- **`menus`** : Items menu par restaurant
- **`commandes`** : Commandes avec statut et paiement

### WhatsApp API (Green API)
- **Envoi messages** : `sendMessage()`
- **Réception webhooks** : `incomingMessageReceived`
- **Géolocalisation** : `locationMessageData`

## 🚨 Gestion d'Erreurs

### Timeout Session
- **30 minutes** d'inactivité
- Message : `"❓ Session expirée. Tapez "resto" pour recommencer"`

### Restaurant Non Trouvé (Numéro)
```
❌ Aucun restaurant trouvé avec le numéro 622987654.
🔄 Tapez "resto" pour voir tous nos restaurants disponibles.
```

### Erreurs Base de Données
```
❌ Erreur de connexion à la base de données. 
Veuillez réessayer avec "resto".
```

### Commandes Invalides
```
❓ Pour commander, utilisez le format: 1,2,3 
(numéros séparés par des virgules)
Ou tapez "retour" pour changer de restaurant.
```

## 🎯 Mots-Clés Spéciaux

### Redémarrage Global (Depuis n'importe quel état)
- `resto`, `restaurant`, `menu`, `accueil`, `start`, `restart`, `retour`

### Annulation
- `annuler` → État `CONFIRM_CANCEL`

### Navigation
- `retour` → Étape précédente (selon contexte)
- `modifier` → Modification panier

### Initialisation
- `commander`, `bonjour`, `salut`, `hi` → Workflow classique

---

## 📊 Métriques et Logs

### Console Logs
- `🏠` Gestion accueil  
- `📱` Format téléphone détecté
- `🔍` Recherche restaurant
- `✅` Actions réussies
- `❌` Erreurs système
- `🔄` Redémarrages

### Sessions Actives
- Nettoyage automatique (30 min)
- Une session par numéro WhatsApp
- Contexte préservé entre messages

---

*Documentation mise à jour : Décembre 2024*
*Version Bot : 2.0 (avec accès direct par téléphone)*