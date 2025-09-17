# 📋 PLAN DE REFACTORING - OPTIMISATION CLIENTS SUPABASE

## 🔴 PROBLÈME IDENTIFIÉ - DÉGRADATION PROGRESSIVE

**❌ DIAGNOSTIC INITIAL (INCORRECT) :**
- Pensait : Pool de connexions saturé
- Réalité : Connexions DB normales (~11 connexions)

**✅ VRAI PROBLÈME - DÉGRADATION EDGE FUNCTION :**
- **20+ créations de clients Supabase** dans `UniversalBot.ts`
- Chaque message crée 5-10 nouveaux clients + imports
- **Bot rapide 0-10 minutes** après redéploiement
- **Bot lent après 10+ minutes** d'utilisation
- **Dégradation progressive** de performance

### **CAUSES RÉELLES :**

#### 1️⃣ **ACCUMULATION D'OBJETS EN MÉMOIRE**
```typescript
// Chaque message crée des objets qui ne sont pas garbage collectés
const { createClient } = await import(...); // 20+ fois
const supabase = createClient(...); // 20+ clients créés
// Mémoire qui s'accumule progressivement
```

#### 2️⃣ **EVENT LOOP SATURATION**
- Imports async répétés qui s'empilent
- Promises qui traînent
- Callbacks qui s'accumulent

#### 3️⃣ **CACHE/REGISTRY MODULE CORRUPTION**
- Deno module cache qui se corrompt
- Registry esm.sh qui devient lent

## ✅ SOLUTION : UN SEUL CLIENT RÉUTILISÉ

---

## PHASE 1 : ANALYSE ET PRÉPARATION

### 1.1 Identification des problèmes
```typescript
// ❌ PROBLÈME ACTUEL - Dans UniversalBot.ts
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
// Répété 20+ fois !
```

### 1.2 Services affectés
| Service | État | Action nécessaire |
|---------|------|------------------|
| `UniversalBot.ts` | ❌ 20+ occurrences | Refactoring complet |
| `SessionManager.ts` | ✅ OK | Client dans constructor |
| `ProductQueryService.ts` | ✅ OK | Client dans constructor |
| `ConfigurationManager.ts` | ✅ OK | Client dans constructor |
| `CompositeWorkflowExecutor.ts` | ❌ Créations multiples | À vérifier |
| `OrderService.ts` | ❌ Créations multiples | À vérifier |

---

## PHASE 2 : SOLUTION PROGRESSIVE

### 2.1 Étape 1 : Ajouter méthode getSupabaseClient
```typescript
// Dans UniversalBot.ts
class UniversalBot {
  private supabaseClient: any = null; // Lazy loading

  // NOUVELLE MÉTHODE - Ajouter au début de la classe
  private async getSupabaseClient() {
    if (!this.supabaseClient) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey);
      console.log('✅ [UniversalBot] Client Supabase unique créé');
    }
    return this.supabaseClient;
  }
}
```

### 2.2 Pattern de remplacement
```typescript
// AVANT (dans chaque méthode)
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// APRÈS
const supabase = await this.getSupabaseClient();
```

---

## PHASE 3 : ORDRE DE REFACTORING

### Priorité 1 - Méthodes les plus appelées (Impact maximum)
1. **`handleProductSelection()`** - Ligne ~1424
   - Appelée à chaque sélection de produit
   - Impact : TRÈS ÉLEVÉ

2. **`showMenuAfterDeliveryModeChoice()`** - Ligne ~1154
   - Appelée après choix mode livraison
   - Impact : ÉLEVÉ

3. **`getCategoryNameFromProduct()`** - Ligne ~124
   - Appelée pour récupérer catégorie
   - Impact : ÉLEVÉ

4. **`getRestaurantName()`** - Ligne ~2458
   - Appelée régulièrement
   - Impact : MOYEN

### Priorité 2 - Méthodes moyennement utilisées
5. **`loadAndSetRestaurantContext()`** - Ligne ~651
6. **`handleRestaurantSelection()`** - Ligne ~807
7. **`handleDiscoverRestaurants()`** - Ligne ~2958

### Priorité 3 - Méthodes moins critiques
8. Autres occurrences dans UniversalBot.ts

---

## PHASE 4 : TESTS DE NON-RÉGRESSION

### Tests après CHAQUE modification
```bash
# Test 1 : Workflow basique
1. Envoyer "resto"
2. Vérifier liste restaurants
3. Temps de réponse < 2s

# Test 2 : Sélection restaurant
1. Choisir restaurant (ex: "1")
2. Vérifier affichage menu
3. Vérifier catégories

# Test 3 : Ajout panier
1. Sélectionner produit
2. Ajouter au panier
3. Vérifier récap

# Test 4 : Annulation
1. Taper "annuler"
2. Vérifier réinitialisation
```

### Monitoring connexions DB
```sql
-- Avant modification
SELECT count(*) as connexions_avant,
       application_name,
       state
FROM pg_stat_activity
GROUP BY application_name, state;

-- Après modification (devrait diminuer)
SELECT count(*) as connexions_apres,
       application_name,
       state
FROM pg_stat_activity
GROUP BY application_name, state;
```

---

## PHASE 5 : VALIDATION FINALE

### Métriques de succès
- [ ] Connexions DB < 20 (au lieu de 100+)
- [ ] Temps de réponse < 2s constant
- [ ] Pas de memory leak après 1h
- [ ] 0 régression fonctionnelle

### Tests complets
1. **Workflow complet** : `resto` → sélection → panier → mode → paiement
2. **Géolocalisation** : Test avec coordonnées GPS
3. **Annulation** : Test "annuler" à différentes étapes
4. **Charge** : 10 messages rapides successifs
5. **Sessions multiples** : 3-4 utilisateurs simultanés

---

## RISQUES ET MITIGATION

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|---------|------------|
| Régression fonctionnelle | Moyen | Élevé | Tests après chaque modification |
| Connexion qui expire | Faible | Moyen | Implement reconnection logic |
| Memory leak | Faible | Élevé | Monitor mémoire Edge Function |
| Erreurs de scope `this` | Moyen | Moyen | Bien vérifier contexte des appels |
| Timeout première connexion | Faible | Faible | Pré-charger au démarrage |

---

## TIMELINE ESTIMÉE

| Phase | Durée | Description |
|-------|-------|-------------|
| Préparation | 30 min | Ajout getSupabaseClient() |
| Refactoring P1 | 1h | 4 méthodes prioritaires |
| Tests P1 | 30 min | Validation priorité 1 |
| Refactoring P2 | 1h | Méthodes secondaires |
| Tests P2 | 30 min | Validation priorité 2 |
| Refactoring P3 | 30 min | Reste des méthodes |
| Validation finale | 30 min | Tests complets |
| **TOTAL** | **4-5h** | Avec tests complets |

---

## COMMANDES UTILES

```bash
# Redéployer après modifications
supabase functions deploy bot-resto-france-universel --no-verify-jwt

# Voir les logs en temps réel
supabase functions logs bot-resto-france-universel --tail

# Vérifier les métriques
# Dashboard : https://supabase.com/dashboard/project/vywbhlnzvfqtiurwmrac/functions
```

---

## NOTES IMPORTANTES

⚠️ **NE PAS** :
- Modifier toutes les méthodes d'un coup
- Déployer sans tester
- Ignorer les logs d'erreur

✅ **TOUJOURS** :
- Tester après chaque modification
- Vérifier les connexions DB
- Garder une copie de sauvegarde
- Documenter les changements

---

## STATUT : EN ATTENTE

Date création : 17/01/2025
Dernière mise à jour : 17/01/2025 - 10h30 (Diagnostic corrigé)
Statut : **À COMMENCER**

---

## 📊 HISTORIQUE DES DÉCOUVERTES

### **17/01/2025 - 09h00 :** Découverte problème lenteur
- Bot lent après redéploiement
- Suspicion : accumulation connexions DB

### **17/01/2025 - 09h30 :** Test redéploiement
- Redéploiement → Bot rapide immédiatement
- Confirmation : Problème côté Edge Function

### **17/01/2025 - 10h00 :** Diagnostic connexions DB
- Vérification pg_stat_activity
- Résultat : Seulement ~11 connexions (normal)
- Conclusion : PAS un problème de connexions DB

### **17/01/2025 - 10h30 :** Identification vraie cause
- **Pattern observé** : Rapide 0-10min, lent après 10+min
- **Cause confirmée** : Dégradation progressive Edge Function
- **Solutions** : Éliminer créations multiples clients + imports répétés