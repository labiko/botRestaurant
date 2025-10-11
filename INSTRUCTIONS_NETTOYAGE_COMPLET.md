# 🔧 INSTRUCTIONS - Nettoyage complet icônes et numéros

**Date** : 2025-10-11
**Objectif** : Nettoyer les duplications d'icônes et numéros dans france_product_options

---

## 📋 RÉSUMÉ DES PROBLÈMES DÉTECTÉS

### **1. Duplication d'icônes (774 options)**
- **Problème** : Icône dans colonne `icon` ET au début de `option_name`
- **Affichage bot** : `1. 🥩 🥩 Viande Hachée` (dupliqué)
- **Restaurants** : Pizza Yolo 77 (642), Le Carreman (132)

### **2. Numérotation hardcodée (32 options)**
- **Problème** : Emoji numéros (1️⃣, 2️⃣, 3️⃣) dans `option_name`
- **Affichage bot** : `1. 1️⃣ 🍗 Nuggets` (dupliqué)
- **Restaurants** : Pizza Yolo 77, Le Carreman, O'CV Moissy, Bh Tacos one

---

## 🚀 PROCÉDURE D'EXÉCUTION

### **ÉTAPE 1 : BACKUP (OBLIGATOIRE)**

#### **Option A : Script automatique (Windows)**
```bash
cd C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant
BACKUP_AVANT_NETTOYAGE_EMOJI_NUMEROS.bat
```

#### **Option B : Commande manuelle**
```bash
"C:\Program Files\PostgreSQL\17\bin\pg_dump" --table=france_product_options --data-only "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" > backups/france_product_options_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Résultat attendu** : Fichier `backups/france_product_options_backup_YYYYMMDD_HHMMSS.sql` créé

---

### **ÉTAPE 2 : NETTOYAGE ICÔNES DUPLIQUÉES (774 options)**

#### **Script** : `NETTOYAGE_GLOBAL_ICONS_TOUS_PRODUITS.sql`

1. Ouvre Supabase PROD
2. SQL Editor
3. Copie le contenu du script
4. **RUN**

**Transformation** :
```
AVANT : option_name = "🥩 Viande Hachée", icon = "🥩"
APRÈS : option_name = "Viande Hachée", icon = "🥩"
```

**Affichage bot** :
```
AVANT : 1. 🥩 🥩 Viande Hachée  ❌ (dupliqué)
APRÈS : 1. 🥩 Viande Hachée     ✅ (correct)
```

**Sécurité** :
- ✅ Transaction BEGIN/COMMIT
- ✅ Filtre : `WHERE option_name ~ '^[^\w\s]+\s+'`
- ✅ 774 options modifiées (59 produits)

---

### **ÉTAPE 3 : NETTOYAGE NUMÉROS HARDCODÉS (32 options)**

#### **Script** : `NETTOYAGE_EMOJI_NUMEROS.sql`

1. Ouvre Supabase PROD
2. SQL Editor
3. Copie le contenu du script
4. **RUN**

**Transformation** :
```
AVANT : option_name = "1️⃣ 🍗 Nuggets"
APRÈS : option_name = "🍗 Nuggets"
```

**Affichage bot** :
```
AVANT : 1. 1️⃣ 🍗 Nuggets  ❌ (dupliqué)
APRÈS : 1. 🍗 Nuggets     ✅ (correct)
```

**Sécurité** :
- ✅ Nettoie UNIQUEMENT emoji numéros encerclés (1️⃣-9️⃣)
- ✅ Préserve noms de marque : `7 UP`, `4 FROMAGES`, `180 Burger`
- ✅ Préserve descriptions : `1 viande au choix`
- ✅ Transaction BEGIN/COMMIT

---

## 🔄 EN CAS DE PROBLÈME - RESTAURATION

### **Restaurer le backup**

```bash
psql "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" < backups/france_product_options_backup_YYYYMMDD_HHMMSS.sql
```

**Remplace** `YYYYMMDD_HHMMSS` par le timestamp de ton backup.

---

## ✅ VÉRIFICATIONS POST-EXÉCUTION

### **1. Vérifier que les icônes ne sont plus dupliquées**
```sql
SELECT
  option_name,
  icon
FROM france_product_options
WHERE option_name ~ '^[^\w\s]+\s+'
LIMIT 10;
```

**Résultat attendu** : `0 rows` (aucune duplication)

### **2. Vérifier que les emoji numéros sont supprimés**
```sql
SELECT
  option_name,
  icon
FROM france_product_options
WHERE option_name ~ '[1-9]️⃣'
LIMIT 10;
```

**Résultat attendu** : `0 rows` (aucun emoji numéro)

### **3. Vérifier que les noms de marque sont intacts**
```sql
SELECT
  option_name
FROM france_product_options
WHERE option_name LIKE '%7%UP%'
   OR option_name LIKE '%4 FROMAGES%'
   OR option_name LIKE '%180%'
ORDER BY option_name
LIMIT 20;
```

**Résultat attendu** : Tous les noms sont intacts (`7 UP`, `7UP CHERRY`, `4 FROMAGES`, `180 Burger`)

---

## 📊 STATISTIQUES FINALES ATTENDUES

| Nettoyage | Options modifiées | Produits concernés | Restaurants |
|-----------|-------------------|-------------------|-------------|
| **Icônes** | 774 | 59 | 2 |
| **Numéros** | 32 | 8 | 4 |
| **TOTAL** | **806** | **67** | **4** |

---

## 📁 FICHIERS CRÉÉS

1. ✅ `ANALYSE_GLOBALE_ICONS_DUPLIQUEES.sql` - Analyse initiale
2. ✅ `NETTOYAGE_GLOBAL_ICONS_TOUS_PRODUITS.sql` - Script icônes (774 options)
3. ✅ `ANALYSE_NUMEROTATION_HARDCODEE.sql` - Analyse numéros
4. ✅ `NETTOYAGE_EMOJI_NUMEROS.sql` - Script numéros (32 options)
5. ✅ `BACKUP_AVANT_NETTOYAGE_EMOJI_NUMEROS.bat` - Script backup Windows
6. ✅ `BACKUP_AVANT_NETTOYAGE_EMOJI_NUMEROS.sh` - Script backup Linux/Mac

---

## ⚠️ IMPORTANT

1. **TOUJOURS faire le backup AVANT** d'exécuter les nettoyages
2. **Exécuter dans l'ordre** : Backup → Icônes → Numéros
3. **Vérifier les résultats** après chaque script
4. **Tester dans le bot** après nettoyage complet

---

## 🎯 RÉSULTAT FINAL ATTENDU

### **Affichage bot AVANT nettoyage**
```
1. 1️⃣ 🥩 🥩 Viande Hachée   ❌ (double icône + double numéro)
2. 2️⃣ 🍗 🍗 Cordon Bleu      ❌ (double icône + double numéro)
```

### **Affichage bot APRÈS nettoyage**
```
1. 🥩 Viande Hachée          ✅ (icône + numéro simple)
2. 🍗 Cordon Bleu            ✅ (icône + numéro simple)
```

---

**PRÊT POUR EXÉCUTION !** 🚀
