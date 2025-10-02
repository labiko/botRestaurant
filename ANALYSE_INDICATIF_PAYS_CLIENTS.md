# 🌍 ANALYSE - RÉCUPÉRATION AUTOMATIQUE INDICATIF PAYS CLIENTS

**Date**: 2025-10-01
**Objectif**: Stocker l'indicatif pays des clients pour envoyer correctement les notifications WhatsApp

---

## 📊 ÉTAT ACTUEL

### **1. Comment les numéros sont stockés actuellement**

#### **📱 Dans le Bot (OrderService.ts)**
```typescript
// Ligne 404 - Nettoyage du numéro WhatsApp
const cleanPhone = phoneNumber.replace('@c.us', '');

// Le numéro reçu du bot WhatsApp est au format international :
// Exemple France : "33753058254@c.us" → "33753058254"
// Exemple Guinée : "224622123456@c.us" → "224622123456"
```

#### **🗄️ Dans la base de données**
```sql
-- Table: france_orders
phone_number character varying NOT NULL  -- Stocke: "33753058254" ou "224622123456"
```

**✅ BON** : Le numéro est déjà au format international complet

---

### **2. Comment les notifications sont envoyées actuellement**

#### **📤 BackOffice → WhatsApp (whatsapp-notification-france.service.ts)**

```typescript
// Ligne 184-220 - cleanFrenchPhoneNumber()
private cleanFrenchPhoneNumber(phone: string): string {
  // ❌ PROBLÈME : Assume que c'est TOUJOURS un numéro français

  // Si commence par 0 et 10 chiffres → Ajoute "33"
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '33' + cleaned.substring(1);
  }

  // Si commence par 6 ou 7 et 9 chiffres → Ajoute "33"
  if ((cleaned.startsWith('6') || cleaned.startsWith('7')) && cleaned.length === 9) {
    cleaned = '33' + cleaned;
  }
}
```

**❌ PROBLÈME** :
- Fonctionne pour France (33)
- **NE FONCTIONNE PAS** pour Guinée (224), Sénégal (221), etc.
- Pas de détection automatique de l'indicatif pays

---

## 🎯 OBJECTIF

**Stocker l'indicatif pays du client** pour :
1. ✅ Envoyer correctement les notifications WhatsApp multi-pays
2. ✅ Supporter automatiquement tous les pays
3. ✅ Éviter les erreurs de formatage de numéro

---

## 🔍 ANALYSE DES INDICATIFS PAYS COURANTS

### **Codes pays internationaux (ITU-T E.164)**

| Pays | Code | Format | Exemple complet | Longueur totale |
|------|------|--------|-----------------|-----------------|
| 🇫🇷 France | 33 | 33 + 9 chiffres | 33753058254 | 11 |
| 🇬🇳 Guinée | 224 | 224 + 9 chiffres | 224622123456 | 12 |
| 🇸🇳 Sénégal | 221 | 221 + 9 chiffres | 221771234567 | 12 |
| 🇨🇮 Côte d'Ivoire | 225 | 225 + 10 chiffres | 2250707123456 | 13 |
| 🇲🇱 Mali | 223 | 223 + 8 chiffres | 22376123456 | 11 |
| 🇧🇫 Burkina Faso | 226 | 226 + 8 chiffres | 22670123456 | 11 |

### **🔑 Règle de détection**

Les indicatifs pays peuvent avoir :
- **1 chiffre** : USA (1), Russie (7), etc.
- **2 chiffres** : France (33), Belgique (32), etc.
- **3 chiffres** : Guinée (224), Sénégal (221), etc.

**Algorithme de détection** :
```
SI numéro commence par "1" OU "7" → Code pays = 1 chiffre
SINON SI numéro commence par "2" ou "3" ou "4" ou "5" ou "6" ou "8" ou "9" :
  - Tester d'abord 3 chiffres (224, 225, etc.)
  - Si pas trouvé, tester 2 chiffres (33, 32, etc.)
```

---

## 📋 PLAN D'IMPLÉMENTATION

### **PHASE 1 - Base de données (5 min)** 🗄️

#### **1.1 - Ajouter colonne `customer_country_code` à `france_orders`**

```sql
-- Migration SQL
ALTER TABLE france_orders
ADD COLUMN customer_country_code VARCHAR(5);

-- Index pour performance
CREATE INDEX idx_france_orders_country_code
ON france_orders(customer_country_code);

-- Commenter la colonne
COMMENT ON COLUMN france_orders.customer_country_code IS
'Code pays du client (ex: 33, 224, 221) extrait automatiquement du numéro WhatsApp';
```

**Pourquoi VARCHAR(5) ?**
- La plupart des codes = 1-3 chiffres
- Certains codes spéciaux peuvent aller jusqu'à 4 chiffres
- Marge de sécurité : 5 caractères

---

### **PHASE 2 - Utilitaire extraction indicatif (15 min)** 🔧

#### **2.1 - Créer service `PhoneNumberUtils.ts` (Bot)**

```typescript
// supabase/functions/bot-resto-france-universel/utils/PhoneNumberUtils.ts

/**
 * Mapping des codes pays connus avec leurs métadonnées
 */
interface CountryCodeInfo {
  code: string;
  country: string;
  digitLength: number; // Longueur totale attendue (code + numéro)
}

const KNOWN_COUNTRY_CODES: CountryCodeInfo[] = [
  // Codes 3 chiffres (Afrique principalement)
  { code: '224', country: 'Guinea', digitLength: 12 },
  { code: '225', country: 'Ivory Coast', digitLength: 13 },
  { code: '221', country: 'Senegal', digitLength: 12 },
  { code: '223', country: 'Mali', digitLength: 11 },
  { code: '226', country: 'Burkina Faso', digitLength: 11 },
  { code: '227', country: 'Niger', digitLength: 11 },
  { code: '228', country: 'Togo', digitLength: 11 },
  { code: '229', country: 'Benin', digitLength: 11 },

  // Codes 2 chiffres (Europe principalement)
  { code: '33', country: 'France', digitLength: 11 },
  { code: '32', country: 'Belgium', digitLength: 11 },
  { code: '41', country: 'Switzerland', digitLength: 11 },
  { code: '34', country: 'Spain', digitLength: 11 },
  { code: '39', country: 'Italy', digitLength: 12 },

  // Codes 1 chiffre
  { code: '1', country: 'USA/Canada', digitLength: 11 },
  { code: '7', country: 'Russia', digitLength: 11 },
];

export class PhoneNumberUtils {

  /**
   * Extrait le code pays d'un numéro de téléphone international
   * @param phoneNumber - Numéro au format international (ex: "33753058254")
   * @returns Code pays (ex: "33") ou null si non trouvé
   */
  static extractCountryCode(phoneNumber: string): string | null {
    if (!phoneNumber || phoneNumber.length < 8) {
      return null;
    }

    // Nettoyer le numéro (enlever espaces, +, etc.)
    let cleaned = phoneNumber.replace(/[^\d]/g, '');

    // Enlever le + initial si présent
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // Tester les codes par ordre de longueur (3, 2, 1)
    for (const codeInfo of KNOWN_COUNTRY_CODES) {
      if (cleaned.startsWith(codeInfo.code)) {
        // Vérifier que la longueur totale est cohérente
        if (cleaned.length === codeInfo.digitLength ||
            cleaned.length === codeInfo.digitLength - 1 ||
            cleaned.length === codeInfo.digitLength + 1) {
          console.log(`✅ [PhoneUtils] Code pays détecté: ${codeInfo.code} (${codeInfo.country})`);
          return codeInfo.code;
        }
      }
    }

    console.warn(`⚠️ [PhoneUtils] Code pays non reconnu pour: ${phoneNumber}`);
    return null;
  }

  /**
   * Obtient les infos du pays depuis le code
   */
  static getCountryInfo(countryCode: string): CountryCodeInfo | null {
    return KNOWN_COUNTRY_CODES.find(c => c.code === countryCode) || null;
  }

  /**
   * Formate un numéro pour WhatsApp (ajoute @c.us)
   */
  static formatForWhatsApp(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d]/g, '');
    return `${cleaned}@c.us`;
  }
}
```

---

### **PHASE 3 - Modification Bot (10 min)** 🤖

#### **3.1 - Modifier `OrderService.ts` pour extraire et stocker l'indicatif**

```typescript
// Ligne 404 - Enrichir le nettoyage du numéro
const cleanPhone = phoneNumber.replace('@c.us', '');

// ✅ NOUVEAU - Extraire le code pays
const customerCountryCode = PhoneNumberUtils.extractCountryCode(cleanPhone);

console.log(`📱 [OrderService] Numéro: ${cleanPhone}, Code pays: ${customerCountryCode}`);

// Ligne 417-420 - Ajouter le code pays dans orderData
const orderData: OrderData = {
  restaurant_id: restaurantId,
  phone_number: cleanPhone,
  customer_country_code: customerCountryCode, // ✅ NOUVEAU
  items: cart,
  total_amount: totalAmount,
  // ...
};
```

**TypeScript** : Ajouter le champ dans l'interface
```typescript
export interface OrderData {
  restaurant_id: number;
  phone_number: string;
  customer_country_code: string | null; // ✅ NOUVEAU
  items: any;
  total_amount: number;
  // ...
}
```

---

### **PHASE 4 - Modification BackOffice (15 min)** 🖥️

#### **4.1 - Créer service utilitaire Angular**

```typescript
// botResto/src/app/core/services/phone-number-utils.service.ts

import { Injectable } from '@angular/core';

interface CountryCodeConfig {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberUtilsService {

  private readonly COUNTRY_CODES: CountryCodeConfig[] = [
    { code: '224', name: 'Guinée', flag: '🇬🇳' },
    { code: '225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '221', name: 'Sénégal', flag: '🇸🇳' },
    { code: '223', name: 'Mali', flag: '🇲🇱' },
    { code: '33', name: 'France', flag: '🇫🇷' },
    { code: '32', name: 'Belgique', flag: '🇧🇪' },
    { code: '1', name: 'USA/Canada', flag: '🇺🇸' },
  ];

  /**
   * Obtient le nom du pays depuis le code
   */
  getCountryName(code: string): string {
    const country = this.COUNTRY_CODES.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  }

  /**
   * Formate un numéro pour WhatsApp selon le code pays
   */
  formatForWhatsApp(phoneNumber: string, countryCode: string): string {
    let cleaned = phoneNumber.replace(/[^\d]/g, '');

    // Si le numéro ne commence pas déjà par le code pays, l'ajouter
    if (!cleaned.startsWith(countryCode)) {
      // Enlever le 0 initial si présent (numéros locaux)
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = countryCode + cleaned;
    }

    return cleaned;
  }
}
```

#### **4.2 - Modifier `whatsapp-notification-france.service.ts`**

**Renommer le service** : `whatsapp-notification-france.service.ts` → `whatsapp-notification.service.ts`

```typescript
// AVANT (Ligne 184-220)
private cleanFrenchPhoneNumber(phone: string): string {
  // ❌ Assumait toujours France (33)
}

// APRÈS
private cleanPhoneNumber(phone: string, countryCode?: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');

  console.log(`📞 [WhatsApp] Original: ${phone}, Code pays: ${countryCode}`);

  // Enlever le + si présent
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Si code pays fourni, vérifier qu'il est présent
  if (countryCode) {
    if (!cleaned.startsWith(countryCode)) {
      // Enlever le 0 initial si présent
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = countryCode + cleaned;
    }
    console.log(`✅ [WhatsApp] Formatted with code ${countryCode}: ${cleaned}`);
    return cleaned;
  }

  // Sinon, le numéro est déjà au format international complet
  console.log(`✅ [WhatsApp] International number: ${cleaned}`);
  return cleaned;
}
```

**Modifier sendMessage** (Ligne 102) :
```typescript
async sendMessage(
  clientPhone: string,
  message: string,
  orderNumber?: string,
  countryCode?: string // ✅ NOUVEAU PARAMÈTRE
): Promise<boolean> {
  try {
    const cleanPhone = this.cleanPhoneNumber(clientPhone, countryCode);
    const chatId = `${cleanPhone}@c.us`;
    // ...
  }
}
```

**Modifier sendOrderStatusNotification** (Ligne 147) :
```typescript
async sendOrderStatusNotification(
  clientPhone: string,
  status: keyof MessageTemplateFrance,
  orderData: OrderDataFrance,
  countryCode?: string // ✅ NOUVEAU PARAMÈTRE
): Promise<boolean> {
  // ...
  const result = await this.sendMessage(
    clientPhone,
    message,
    orderData.orderNumber,
    countryCode // ✅ PASSER LE CODE PAYS
  );
  // ...
}
```

#### **4.3 - Modifier `france-orders.service.ts`**

```typescript
// Ligne 462 - Passer le code pays
const success = await this.whatsAppFranceService.sendOrderStatusNotification(
  orderData.phone_number,
  whatsappStatus,
  this.formatOrderDataForWhatsApp(orderData),
  orderData.customer_country_code // ✅ NOUVEAU
);
```

---

### **PHASE 5 - Migration données existantes (10 min)** 🔄

#### **5.1 - Script de migration pour remplir les codes pays manquants**

```sql
-- Migration des commandes existantes
-- Détecter automatiquement le code pays depuis le numéro

UPDATE france_orders
SET customer_country_code =
  CASE
    -- Codes 3 chiffres (Afrique)
    WHEN phone_number LIKE '224%' THEN '224'
    WHEN phone_number LIKE '225%' THEN '225'
    WHEN phone_number LIKE '221%' THEN '221'
    WHEN phone_number LIKE '223%' THEN '223'
    WHEN phone_number LIKE '226%' THEN '226'
    WHEN phone_number LIKE '227%' THEN '227'
    WHEN phone_number LIKE '228%' THEN '228'
    WHEN phone_number LIKE '229%' THEN '229'

    -- Codes 2 chiffres (Europe)
    WHEN phone_number LIKE '33%' THEN '33'
    WHEN phone_number LIKE '32%' THEN '32'
    WHEN phone_number LIKE '41%' THEN '41'
    WHEN phone_number LIKE '34%' THEN '34'
    WHEN phone_number LIKE '39%' THEN '39'

    -- Codes 1 chiffre
    WHEN phone_number LIKE '1%' THEN '1'
    WHEN phone_number LIKE '7%' THEN '7'

    ELSE NULL
  END
WHERE customer_country_code IS NULL;

-- Vérifier les résultats
SELECT
  customer_country_code,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT SUBSTRING(phone_number, 1, 5)) as phone_samples
FROM france_orders
GROUP BY customer_country_code
ORDER BY count DESC;
```

---

## 🧪 TESTS

### **Test 1 - Numéro français**
```
Input: "33753058254@c.us"
Expected country_code: "33"
Expected WhatsApp: "33753058254@c.us"
```

### **Test 2 - Numéro guinéen**
```
Input: "224622123456@c.us"
Expected country_code: "224"
Expected WhatsApp: "224622123456@c.us"
```

### **Test 3 - Numéro sénégalais**
```
Input: "221771234567@c.us"
Expected country_code: "221"
Expected WhatsApp: "221771234567@c.us"
```

### **Test 4 - Commande → Notification**
1. Client guinéen passe commande via bot
2. Vérifier que `customer_country_code = '224'` en base
3. Restaurant change le statut
4. Vérifier que le message WhatsApp est envoyé correctement

---

## 📊 ESTIMATION TEMPS

| Phase | Temps | Détails |
|-------|-------|---------|
| 1. Base de données | 5 min | ALTER TABLE + Index |
| 2. Utilitaire extraction | 15 min | PhoneNumberUtils.ts |
| 3. Modification Bot | 10 min | OrderService.ts |
| 4. Modification BackOffice | 15 min | Services WhatsApp |
| 5. Migration données | 10 min | UPDATE existantes |
| 6. Tests | 15 min | Tests multi-pays |
| **TOTAL** | **70 min** | ~1h10 |

---

## ✅ AVANTAGES

1. ✅ **Support multi-pays automatique** - Plus besoin de coder pour chaque pays
2. ✅ **Pas de régression** - Les numéros français continuent de fonctionner
3. ✅ **Données enrichies** - Statistiques par pays possibles
4. ✅ **Évolutif** - Ajouter un nouveau pays = 1 ligne dans le mapping
5. ✅ **Performance** - Index sur `customer_country_code` pour filtres rapides

---

## 🎯 LIVRABLES

### **Fichiers créés**
1. `supabase/functions/bot-resto-france-universel/utils/PhoneNumberUtils.ts`
2. `botResto/src/app/core/services/phone-number-utils.service.ts`
3. `supabase/migrations/YYYYMMDD_add_customer_country_code.sql`

### **Fichiers modifiés**
1. `supabase/functions/bot-resto-france-universel/services/OrderService.ts`
2. `botResto/src/app/core/services/whatsapp-notification-france.service.ts`
3. `botResto/src/app/core/services/france-orders.service.ts`

---

## 📝 NOTES IMPORTANTES

### **⚠️ Cas particuliers**

**Numéros locaux (sans indicatif)** :
- Si un client saisit un numéro local (ex: "0753058254")
- Le bot devra utiliser le `country_code` du restaurant pour le compléter
- Utiliser `france_restaurants.country_code` comme fallback

**Numéros invalides** :
- Si `extractCountryCode()` retourne `null`
- Logger un warning
- Stocker `customer_country_code = NULL`
- Utiliser le code pays du restaurant comme fallback

**Backward compatibility** :
- Les commandes existantes avec `customer_country_code = NULL` continueront de fonctionner
- La migration SQL remplira automatiquement les codes pays manquants

---

**Prêt pour implémentation !** 🚀
