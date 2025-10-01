# 🧪 GUIDE DE TEST - TIMEZONE RESTAURANT

**Date**: 2025-10-01
**Objectif**: Tester la récupération et l'utilisation du timezone restaurant

---

## 🎯 COMMANDE DEBUG AJOUTÉE

### **Mot-clé**: `debug`

Une nouvelle commande a été ajoutée au bot universel pour tester le timezone du restaurant.

### **Comment l'utiliser** :

1. **Envoyer un message au bot WhatsApp** : `debug`
2. **Le bot va** :
   - Récupérer le restaurant (depuis session ou ID 1 par défaut)
   - Lire le timezone depuis la base de données
   - Créer un contexte timezone
   - Tester toutes les méthodes de temps
   - Afficher des logs détaillés dans la console
   - Envoyer une confirmation WhatsApp

---

## 📋 CE QUE LE TEST VÉRIFIE

### 1. **Récupération du restaurant**
```
✅ Restaurant récupéré:
   - ID: 1
   - Nom: Pizza Yolo 77
   - Slug: pizza-yolo-77
   - Timezone: Europe/Paris (ou Africa/Conakry)
   - Country: FR (ou GN)
```

### 2. **Création du contexte**
```
✅ Contexte créé:
   - Timezone configuré: Europe/Paris
```

### 3. **Tests des méthodes de temps**
```
⏰ Tests des méthodes de temps:
   - getCurrentTime(): [Date object]
   - Type: object
   - ISO: 2025-10-01T20:30:00.000Z
   - formatTime(): 21:30
   - formatDateTime(): 01/10/2025 21:30
   - getCurrentTimeString(): 21:30
   - getCurrentDayName(): mardi
```

### 4. **Comparaison avec Paris**
```
🔄 Comparaison avec Europe/Paris:
   - Heure Paris: 21:30:45
   - Heure Restaurant: 21:30
   - Différence: AUCUNE (même timezone)
```

OU pour Guinée :

```
🔄 Comparaison avec Europe/Paris:
   - Heure Paris: 21:30:45
   - Heure Restaurant: 20:30
   - Différence: DIFFÉRENTE
```

### 5. **Test date future**
```
⏭️ Test calcul date future (+ 2 heures):
   - Date future: 01/10/2025 23:30
```

### 6. **Test jour de la semaine**
```
📅 Test jour de la semaine:
   - Jour Paris: mardi
   - Jour Restaurant: mardi
   - Match: ✅ OUI
```

---

## 🧪 SCÉNARIOS DE TEST

### **Scénario 1 : Restaurant France (Europe/Paris)**

**Configuration** :
```sql
SELECT id, name, timezone, country_code
FROM france_restaurants
WHERE id = 1;

-- Résultat attendu:
-- id: 1
-- name: Pizza Yolo 77
-- timezone: Europe/Paris
-- country_code: FR
```

**Test** :
1. Envoyer `debug` au bot
2. Vérifier dans les logs que timezone = `Europe/Paris`
3. Vérifier que heure Paris = heure Restaurant

**Résultat attendu** :
- ✅ Timezone: Europe/Paris
- ✅ Heure identique à Paris
- ✅ Jour identique à Paris

---

### **Scénario 2 : Restaurant Guinée (Africa/Conakry)**

**Configuration** :
```sql
-- Configurer un restaurant test pour la Guinée
UPDATE france_restaurants
SET
  timezone = 'Africa/Conakry',
  country_code = 'GN'
WHERE id = 1;
```

**Test** :
1. Envoyer `debug` au bot
2. Vérifier dans les logs que timezone = `Africa/Conakry`
3. Vérifier la différence d'heure avec Paris

**Résultat attendu** :
- ✅ Timezone: Africa/Conakry
- ✅ Heure = Paris - 1h (en hiver) ou Paris - 2h (en été)
- ⚠️ Jour peut être différent (23h55 Conakry = 00h55 Paris)

**Exemple concret** :
```
Si à Paris il est 22h00 (mardi):
→ À Conakry il est 21h00 (mardi) en hiver
→ À Conakry il est 20h00 (mardi) en été

Si à Paris il est 00h30 (mercredi):
→ À Conakry il est 23h30 (mardi) en hiver ← JOUR DIFFÉRENT !
→ À Conakry il est 22h30 (mardi) en été ← JOUR DIFFÉRENT !
```

---

## 📊 INTERPRÉTATION DES RÉSULTATS

### ✅ **TEST RÉUSSI si** :

1. **Timezone récupéré depuis base de données**
   ```
   ✅ Timezone: Africa/Conakry
   ```

2. **Contexte créé correctement**
   ```
   ✅ Contexte créé avec timezone: Africa/Conakry
   ```

3. **Méthodes retournent des valeurs cohérentes**
   ```
   - formatTime() retourne HH:MM
   - formatDateTime() retourne DD/MM/YYYY HH:MM
   - getCurrentDayName() retourne un jour en français
   ```

4. **Différence horaire correcte**
   ```
   Si timezone ≠ Europe/Paris:
   → Différence: DIFFÉRENTE
   → Heure restaurant ≠ Heure Paris
   ```

### ❌ **TEST ÉCHOUÉ si** :

1. **Timezone NULL ou par défaut**
   ```
   ❌ Timezone: null
   ❌ Timezone: undefined
   ⚠️ Timezone: Europe/Paris (alors que configuré autrement)
   ```

2. **Contexte non créé**
   ```
   ❌ Erreur création contexte
   ```

3. **Heure identique alors que timezone différent**
   ```
   ❌ Timezone: Africa/Conakry
   ❌ Heure Paris = Heure Restaurant (devrait être différent !)
   ```

---

## 🔍 OÙ VOIR LES LOGS

### **Option 1 : Logs Supabase Edge Functions**

1. Aller sur **Supabase Dashboard**
2. Projet → **Edge Functions**
3. Sélectionner **bot-resto-france-universel**
4. Onglet **Logs**
5. Chercher : `🧪 TEST TIMEZONE RESTAURANT`

### **Option 2 : Logs locaux (développement)**

Si vous testez en local avec `supabase functions serve` :

```bash
# Terminal affiche automatiquement les logs
supabase functions serve bot-resto-france-universel
```

Puis envoyer `debug` au bot.

### **Option 3 : Logs depuis Vercel (si déployé)**

1. Vercel Dashboard → Votre projet
2. **Functions** → **bot-resto-france-universel**
3. **Logs** en temps réel
4. Chercher : `🧪 TEST TIMEZONE RESTAURANT`

---

## 🎯 PROCHAINES ÉTAPES

### **Si le test fonctionne** ✅

1. ✅ **Timezone correctement récupéré** → Passer à la migration
2. ✅ **Contexte créé** → Corriger les 2 bugs identifiés
3. ✅ **Méthodes fonctionnelles** → Migrer getCurrentTime() et getCurrentDay()

### **Si le test échoue** ❌

1. ❌ **Timezone non récupéré** → Vérifier colonne existe en base
2. ❌ **Contexte non créé** → Débugger TimezoneService
3. ❌ **Erreurs de formatage** → Vérifier IANA timezone valide

---

## 📝 EXEMPLE DE LOGS ATTENDUS

```
🧪 ========================================
🧪 TEST TIMEZONE RESTAURANT
🧪 ========================================
🔍 [TEST] Récupération restaurant ID: 1
✅ [TEST] Restaurant récupéré:
   - ID: 1
   - Nom: Pizza Yolo 77
   - Slug: pizza-yolo-77
   - Timezone: Europe/Paris
   - Country: FR

🌍 [TEST] Création contexte timezone...
✅ [TEST] Contexte créé:
   - Timezone configuré: Europe/Paris

⏰ [TEST] Tests des méthodes de temps:
   - getCurrentTime(): Tue Oct 01 2025 21:30:45 GMT+0200
   - Type: object
   - ISO: 2025-10-01T19:30:45.000Z
   - formatTime(): 21:30
   - formatDateTime(): 01/10/2025, 21:30
   - getCurrentTimeString(): 21:30
   - getCurrentDayName(): mardi

🔄 [TEST] Comparaison avec Europe/Paris:
   - Heure Paris: 21:30:45
   - Heure Restaurant: 21:30
   - Différence: AUCUNE (même timezone)

⏭️ [TEST] Test calcul date future (+ 2 heures):
   - Date future: 01/10/2025, 23:30

📅 [TEST] Test jour de la semaine:
   - Jour Paris: mardi
   - Jour Restaurant: mardi
   - Match: ✅ OUI

🧪 ========================================
✅ TEST TERMINÉ AVEC SUCCÈS
🧪 ========================================
```

---

## 💡 CONSEILS

1. **Tester avec restaurant France d'abord**
   - Timezone = Europe/Paris
   - Résultats identiques à Paris
   - Validation que le système fonctionne

2. **Ensuite tester avec restaurant Guinée**
   - Modifier timezone en base
   - Vérifier différence horaire
   - Valider calculs de dates

3. **Tester à minuit (00h)**
   - Cas critique où le jour change
   - Vérifier que le jour est correct selon timezone
   - Important pour horaires restaurant

4. **Vérifier les logs en détail**
   - Chaque étape doit avoir ✅
   - Aucune erreur ❌
   - Valeurs cohérentes

---

**Une fois le test validé, nous pourrons corriger les 2 bugs identifiés et migrer le système !** 🚀

---

**Créé par**: Claude Code
**Version**: 1.0
**Date**: 2025-10-01
