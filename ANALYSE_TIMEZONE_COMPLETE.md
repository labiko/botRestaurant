# 🌍 ANALYSE COMPLÈTE - GESTION DES TIMEZONES

**Date**: 2025-10-01
**Contexte**: Bot restaurant déployé en Guinée (Africa/Conakry) avec base Supabase en Europe/Paris

---

## 📋 CONTEXTE TECHNIQUE

### Contraintes Infrastructure
- **Serveur Supabase** : Timezone fixe `Europe/Paris` (UTC+1/+2) - **NON MODIFIABLE**
- **Base de données** : PostgreSQL avec colonnes `timestamp without time zone`
- **Restaurants cibles** : France (Europe/Paris) + Guinée (Africa/Conakry - UTC+0)

### Solution Architecture
✅ **Colonne `timezone` dans table `france_restaurants`**
- Permet à chaque restaurant d'avoir son propre fuseau horaire
- Valeur par défaut : `'Europe/Paris'`
- Guinée utilise : `'Africa/Conakry'`

---

## ✅ CE QUI EST BIEN IMPLÉMENTÉ

### 1. **Bot WhatsApp Universel** ✅

#### Service TimezoneService (`services/TimezoneService.ts`)
```typescript
✅ createContext(restaurant) - Crée contexte avec timezone restaurant
✅ formatTime(date) - Format HH:MM selon timezone
✅ formatDateTime(date) - Format complet selon timezone
✅ getCurrentTimeString() - Heure actuelle formatée
✅ getCurrentDayName() - Jour en français selon timezone
✅ getTimeInTimezone(timezone) - Méthode statique utilitaire
✅ getDayInTimezone(timezone) - Jour selon timezone
```

#### Service RestaurantScheduleService (`services/RestaurantScheduleService.ts`)
```typescript
✅ checkRestaurantSchedule(restaurant) - Utilise restaurant.timezone
✅ getCurrentTime(timezone) - Heure formatée selon timezone
⚠️ getCurrentDay(timezone) - PROBLÈME IDENTIFIÉ (voir ci-dessous)
✅ isWithinOperatingHours() - Comparaison horaires correcte
✅ calculateNextOpenTime() - Calcul prochaine ouverture
```

### 2. **BackOffice Restaurant (Angular/Ionic)** ✅

#### Service FuseauHoraireService (`fuseau-horaire.service.ts`)
```typescript
✅ getRestaurantTimezone(restaurantId) - Récupère timezone avec cache
✅ getRestaurantCurrentTime(restaurantId) - Heure dans timezone resto
✅ getRestaurantFutureTimeForDatabase(restaurantId, minutes) - Calcul expiration
✅ getRestaurantFutureTimeForDatabaseHours(restaurantId, hours) - Calcul en heures
✅ getCurrentDatabaseTimeForRestaurant() - Heure BDD pour resto connecté
✅ formatDate(date, options) - Formatage avec timezone
✅ debugCurrentUserTimezone() - Debug complet
```

### 3. **Base de Données** ✅

```sql
-- Table france_restaurants
CREATE TABLE public.france_restaurants (
  ...
  timezone character varying DEFAULT 'Europe/Paris'::character varying,
  country_code character varying DEFAULT 'FR'::character varying,
  ...
);

-- Table green_api_scheduled_reboots
CREATE TABLE public.green_api_scheduled_reboots (
  ...
  timezone character varying NOT NULL DEFAULT 'Europe/Paris'::character varying,
  scheduled_time time without time zone NOT NULL DEFAULT '03:00:00'::time without time zone,
  ...
);
```

---

## ⚠️ PROBLÈMES IDENTIFIÉS

### 1. **Bug dans RestaurantScheduleService.getCurrentDay()** ❌

**Fichier**: `supabase/functions/bot-resto-france-universel/services/RestaurantScheduleService.ts`
**Ligne**: 165-172

```typescript
// ❌ CODE ACTUEL (INCORRECT)
private getCurrentDay(timezone: string = 'Europe/Paris'): string {
  const now = new Date();
  const dayIndex = now.getDay(); // ⚠️ Utilise timezone SERVEUR, pas restaurant!
  const dayName = this.DAYS[dayIndex];
  return dayName;
}
```

**Problème** :
- `now.getDay()` retourne le jour selon le timezone du **serveur Supabase** (Europe/Paris)
- Si le restaurant est en Guinée à 23h55 (dimanche), le serveur est à 00h55 (lundi)
- Le bot dira "fermé le lundi" alors que le client est encore dimanche

**Solution** :
```typescript
// ✅ CODE CORRIGÉ
private getCurrentDay(timezone: string = 'Europe/Paris'): string {
  const now = new Date();
  const localeDateString = now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short'
  });

  const dayMap: { [key: string]: number } = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
    'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  const dayIndex = dayMap[localeDateString.split(',')[0]] || 0;
  return this.DAYS[dayIndex];
}
```

---

## 🔍 ZONES À VÉRIFIER

### 1. **Création de commandes** 🔍

**Fichier à vérifier** : `services/OrderService.ts`

```typescript
// ⚠️ À VÉRIFIER : Est-ce que created_at utilise le timezone du restaurant ?
const order = {
  created_at: new Date().toISOString(), // ❓ UTC ou timezone restaurant ?
  ...
};
```

**Recommandation** :
- Vérifier que `created_at`, `updated_at` utilisent le bon timezone
- Potentiellement utiliser `TimezoneService` pour ces champs

### 2. **Tokens de livraison** 🔍

**Fichier à vérifier** : `botResto/src/app/core/services/delivery-token.service.ts`

```typescript
// ⚠️ À VÉRIFIER : Expiration des tokens
expires_at: this.fuseauHoraireService.getFutureTimeForDatabase(15), // ❓ Ancienne méthode ?
```

**Recommandation** :
- Utiliser `getRestaurantFutureTimeForDatabase(restaurantId, 15)` au lieu de `getFutureTimeForDatabase(15)`
- Méthode legacy marquée `@deprecated` dans le code

### 3. **Messages WhatsApp avec horodatage** 🔍

**Fichiers à vérifier** :
- `supabase/functions/payment-link-sender/index.ts`
- Tous les messages envoyés via WhatsApp contenant des heures

**Exemple à vérifier** :
```typescript
// ❓ Le message utilise-t-il le timezone du restaurant ?
const message = `Votre commande #${order.order_number} est prête !
📦 Montant : ${amount}${currency}
⏱️ Ce lien expire dans 15 minutes.`; // ← Basé sur timezone restaurant ?
```

---

## 📊 RÉSUMÉ PAR COMPOSANT

| Composant | Status | Timezone Support | Actions Requises |
|-----------|--------|------------------|------------------|
| **TimezoneService (Bot)** | ✅ Excellent | Complet | Aucune |
| **FuseauHoraireService (BackOffice)** | ✅ Excellent | Complet | Aucune |
| **RestaurantScheduleService** | ⚠️ Bug mineur | Partiel | Fix `getCurrentDay()` |
| **OrderService** | 🔍 À vérifier | Inconnu | Audit complet |
| **DeliveryTokenService** | ⚠️ Méthode deprecated | Ancien | Migrer vers nouvelles méthodes |
| **PaymentLinkSender** | 🔍 À vérifier | Inconnu | Vérifier messages |
| **Messages WhatsApp** | 🔍 À vérifier | Inconnu | Audit formatage heures |

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

### **Priority 1 - CRITIQUE** 🔴

1. **Corriger bug getCurrentDay()**
   - Impact : Détection jour incorrect pour horaires restaurant
   - Urgence : HAUTE (affecte disponibilité perçue)
   - Effort : 5 minutes

### **Priority 2 - IMPORTANT** 🟠

2. **Auditer OrderService**
   - Vérifier `created_at`, `updated_at` utilisent timezone restaurant
   - Impact : Historique commandes, statistiques
   - Effort : 30 minutes

3. **Migrer DeliveryTokenService**
   - Remplacer méthodes deprecated par nouvelles
   - Impact : Expiration tokens incorrecte
   - Effort : 15 minutes

### **Priority 3 - AMÉLIORATIONS** 🟡

4. **Audit messages WhatsApp**
   - Vérifier formatage heures dans tous les messages
   - Impact : UX client (affichage heures)
   - Effort : 1 heure

5. **Tests end-to-end timezone**
   - Simuler restaurant Guinée (Africa/Conakry)
   - Tester workflow complet commande
   - Effort : 2 heures

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Restaurant Guinée à minuit
```sql
-- Configurer restaurant test
UPDATE france_restaurants
SET timezone = 'Africa/Conakry',
    business_hours = '{
      "lundi": {"isOpen": true, "opening": "09:00", "closing": "23:00"}
    }'
WHERE id = 1;

-- Test à 23h55 Conakry (00h55 Paris)
-- Doit afficher : "Ouvert" et non "Fermé le mardi"
```

### Test 2 : Expiration token livraison
```typescript
// Restaurant Guinée
const restaurantId = 1; // timezone: Africa/Conakry
const expirationTime = await fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 15);

// Vérifier que expires_at est correct dans le fuseau Conakry
console.log('Expiration token:', expirationTime);
```

### Test 3 : Historique commandes
```typescript
// Créer commande à 23h00 Conakry
// Vérifier dans l'interface que l'heure affichée est 23h00 et non 00h00
```

---

## 💡 BEST PRACTICES ÉTABLIES

### ✅ À FAIRE

1. **Toujours récupérer le timezone du restaurant**
   ```typescript
   const timezone = restaurant.timezone || 'Europe/Paris';
   ```

2. **Utiliser TimezoneService pour formatage**
   ```typescript
   const context = timezoneService.createContext(restaurant);
   const formattedTime = context.formatTime(new Date());
   ```

3. **Utiliser FuseauHoraireService pour calculs**
   ```typescript
   const expiresAt = await fuseauHoraireService
     .getRestaurantFutureTimeForDatabase(restaurantId, 15);
   ```

4. **Toujours préciser timezone dans toLocaleString()**
   ```typescript
   date.toLocaleString('fr-FR', { timeZone: restaurant.timezone });
   ```

### ❌ À ÉVITER

1. **Ne JAMAIS utiliser new Date() sans contexte**
   ```typescript
   // ❌ MAUVAIS
   const now = new Date();
   const hour = now.getHours(); // Timezone serveur !

   // ✅ BON
   const context = timezoneService.createContext(restaurant);
   const hour = context.getCurrentTimeString();
   ```

2. **Ne PAS utiliser méthodes deprecated**
   ```typescript
   // ❌ MAUVAIS (deprecated)
   fuseauHoraireService.getFutureTimeForDatabase(15);

   // ✅ BON
   fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 15);
   ```

3. **Ne PAS ignorer le timezone dans les comparaisons**
   ```typescript
   // ❌ MAUVAIS
   if (new Date().getDay() === 0) { } // Dimanche serveur, pas restaurant !

   // ✅ BON
   if (context.getCurrentDayName() === 'dimanche') { }
   ```

---

## 📝 CONFIGURATION RESTAURANTS

### France (Default)
```sql
UPDATE france_restaurants
SET timezone = 'Europe/Paris',
    country_code = 'FR'
WHERE country_code = 'FR';
```

### Guinée-Conakry
```sql
UPDATE france_restaurants
SET timezone = 'Africa/Conakry',
    country_code = 'GN'
WHERE country_code = 'GN';
```

### Autres pays supportés
```typescript
const SUPPORTED_TIMEZONES = {
  'FR': 'Europe/Paris',      // UTC+1/+2 (heure d'été)
  'GN': 'Africa/Conakry',    // UTC+0 (pas d'heure d'été)
  'SN': 'Africa/Dakar',      // UTC+0
  'CI': 'Africa/Abidjan',    // UTC+0
  'ML': 'Africa/Bamako',     // UTC+0
};
```

---

## 🔧 OUTILS DE DEBUG

### Debug timezone restaurant (Bot)
```typescript
const context = timezoneService.createContext(restaurant);
console.log('Timezone:', context.timezone);
console.log('Heure actuelle:', context.getCurrentTimeString());
console.log('Jour actuel:', context.getCurrentDayName());
```

### Debug timezone restaurant (BackOffice)
```typescript
const result = await fuseauHoraireService.debugCurrentUserTimezone();
console.log(result);
// {
//   restaurantId: 1,
//   timezone: 'Africa/Conakry',
//   currentTime: '...',
//   formattedTime: '...',
//   user: {...}
// }
```

---

## ✅ CONCLUSION

### Points Forts
- ✅ Architecture timezone bien pensée et extensible
- ✅ Services dédiés des deux côtés (Bot + BackOffice)
- ✅ Colonne timezone dans base de données
- ✅ Cache pour performance
- ✅ Méthodes utilitaires complètes

### Points d'Attention
- ⚠️ **1 bug critique** à corriger dans `getCurrentDay()`
- 🔍 **3 zones** à auditer (OrderService, Tokens, Messages)
- ⚠️ Méthodes deprecated à migrer

### Effort Total Estimé
- **Corrections critiques** : 20 minutes
- **Audit complet** : 2 heures
- **Tests validation** : 2 heures
- **Total** : ~4-5 heures

### Recommandation Finale
Le système est **globalement bien conçu** mais nécessite :
1. Correction du bug `getCurrentDay()` (URGENT)
2. Audit complet des usages `new Date()` sans contexte
3. Tests end-to-end avec restaurant Guinée

**Une fois corrigé, le système sera prêt pour déploiement multi-timezone** 🚀

---

**Rédigé par**: Claude Code
**Date**: 2025-10-01
**Version**: 1.0
