# 🚨 PERFORMANCE ISSUE DETECTION - BOT WHATSAPP

**Date d'analyse :** 14/09/2025  
**Problème observé :** Bot met 5-10 secondes à répondre  
**Objectif :** Réduire le temps de réponse à 1-3 secondes  

## 📊 HISTORIQUE DES OPTIMISATIONS

### Optimisations précédentes (DÉJÀ APPLIQUÉES)
- ✅ Désactivation du système de polling GreenAPI
- ✅ Suppression du système add-queue des messages
- **Résultat :** Amélioration significative initiale

---

## 🔴 TOP 5 CAUSES DE LENTEUR IDENTIFIÉES

### 1. DÉLAIS ARTIFICIELS INUTILES 🕐 
**Impact :** 1-1.5 secondes  
**Localisation :**
```typescript
// simple-index.ts:2305
await new Promise(resolve => setTimeout(resolve, 500));

// CompositeWorkflowExecutor.ts:multiple occurrences
await new Promise(resolve => setTimeout(resolve, 1000));
```
**Solution :** Supprimer TOUS ces setTimeout qui n'apportent aucune valeur

### 2. REQUÊTES DB COMPLEXES NON OPTIMISÉES 📊
**Impact :** 2-4 secondes  
**Localisation :**
```typescript
// UniversalBot.ts - Requête avec multiples JOINs
.select(`
  *, 
  france_restaurants(*),
  france_products!inner(*),
  france_product_variants(*),
  france_menu_categories!inner(*)
`)
.eq('france_products.is_active', true)
.order('france_menu_categories.display_order')
.order('france_products.display_order')
```
**Solution :** Créer des vues matérialisées ou diviser en requêtes parallèles

### 3. GOOGLE PLACES API SANS TIMEOUT 🌍
**Impact :** 2-5 secondes (en cas de lenteur API)  
**Localisation :**
```typescript
// GooglePlacesService.ts - Aucun timeout configuré
const response = await fetch(url); // Peut bloquer indéfiniment
```
**Solution :** Ajouter timeout de 3 secondes maximum

### 4. PARSING JSON LOURD ET RÉPÉTÉ 🔄
**Impact :** 1-2 secondes  
**Localisation :**
```typescript
// SessionManager.ts:200 - Parse complet à chaque accès
const parsedSession = JSON.parse(JSON.stringify({
  ...existingSession,
  context: JSON.parse(existingSession.context || '{}')
}));
```
**Solution :** Implémenter cache mémoire pour sessions actives

### 5. LOGS EXCESSIFS EN PRODUCTION 📝
**Impact :** 0.5-1 seconde  
**Localisation :** Plus de 300 console.log par requête  
**Solution :** Système de log avec niveaux (DEBUG désactivé en prod)

---

## 🎯 PLAN D'ACTION DÉTAILLÉ

### PHASE 1 - GAINS IMMÉDIATS (30 minutes)
#### Action 1.1 : Supprimer tous les setTimeout artificiels
- **Fichiers concernés :**
  - `supabase/functions/webhook-whatsapp/simple-index.ts`
  - `supabase/functions/bot-resto-france-universel/services/CompositeWorkflowExecutor.ts`
- **Code à supprimer :**
  ```typescript
  // SUPPRIMER toutes les lignes comme :
  await new Promise(resolve => setTimeout(resolve, XXX));
  ```
- **Gain attendu :** -1.5 secondes

#### Action 1.2 : Désactiver logs DEBUG en production
- **Implémentation :**
  ```typescript
  const IS_PRODUCTION = Deno.env.get('ENVIRONMENT') === 'production';
  const log = IS_PRODUCTION ? () => {} : console.log;
  ```
- **Gain attendu :** -0.5 seconde

### PHASE 2 - OPTIMISATIONS BASE DE DONNÉES (2 heures)
#### Action 2.1 : Créer les index manquants
```sql
-- Index pour recherche de commandes
CREATE INDEX idx_orders_phone_status ON france_orders(phone_number, status);
CREATE INDEX idx_orders_created ON france_orders(created_at DESC);

-- Index pour produits actifs
CREATE INDEX idx_products_active ON france_products(restaurant_id, is_active);
CREATE INDEX idx_products_display ON france_products(display_order);

-- Index pour catégories
CREATE INDEX idx_categories_active ON france_menu_categories(restaurant_id, is_active);
```
- **Gain attendu :** -2 secondes

#### Action 2.2 : Créer vue matérialisée pour menu complet
```sql
CREATE MATERIALIZED VIEW restaurant_menu_view AS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  c.id as category_id,
  c.name as category_name,
  p.id as product_id,
  p.name as product_name,
  p.price,
  p.is_active
FROM france_restaurants r
JOIN france_menu_categories c ON c.restaurant_id = r.id
JOIN france_products p ON p.category_id = c.id
WHERE c.is_active = true AND p.is_active = true
ORDER BY c.display_order, p.display_order;

-- Rafraîchir toutes les heures
CREATE OR REPLACE FUNCTION refresh_menu_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY restaurant_menu_view;
END;
$$ LANGUAGE plpgsql;
```
- **Gain attendu :** -1.5 secondes

### PHASE 3 - PROTECTION CONTRE APIs EXTERNES (1 heure)
#### Action 3.1 : Ajouter timeouts sur toutes les APIs
```typescript
// GooglePlacesService.ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 3000);
try {
  const response = await fetch(url, { signal: controller.signal });
  // ...
} finally {
  clearTimeout(timeoutId);
}

// Alternative avec AbortSignal.timeout (Deno)
const response = await fetch(url, { 
  signal: AbortSignal.timeout(3000) 
});
```

#### Action 3.2 : Implémenter retry avec backoff
```typescript
async function fetchWithRetry(url: string, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(3000) });
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 100 * Math.pow(2, i)));
    }
  }
}
```
- **Gain attendu :** Protection contre blocages (-2 à -5 secondes en cas de lenteur)

### PHASE 4 - CACHE INTELLIGENT (3 heures)
#### Action 4.1 : Cache mémoire pour sessions
```typescript
class SessionCache {
  private cache = new Map<string, { data: any, expires: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string) {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL
    });
  }
}
```

#### Action 4.2 : Cache pour restaurants et produits fréquents
```typescript
const restaurantCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getRestaurantWithCache(id: number) {
  const cached = restaurantCache.get(id);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = await fetchRestaurantFromDB(id);
  restaurantCache.set(id, {
    data,
    expires: Date.now() + CACHE_DURATION
  });
  return data;
}
```
- **Gain attendu :** -1 seconde

---

## 📈 MÉTRIQUES DE PERFORMANCE

### Mesures actuelles
- **Temps de réponse moyen :** 5-10 secondes
- **P95 :** 12 secondes
- **P99 :** 15 secondes

### Objectifs après optimisation
- **Temps de réponse moyen :** 1-3 secondes (-70%)
- **P95 :** 4 secondes
- **P99 :** 6 secondes

---

## 🔍 MONITORING CONTINU

### Instrumentation à ajouter
```typescript
class PerformanceMonitor {
  private timers = new Map<string, number>();

  start(label: string) {
    this.timers.set(label, performance.now());
  }

  end(label: string) {
    const start = this.timers.get(label);
    if (!start) return;
    
    const duration = performance.now() - start;
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    this.timers.delete(label);
    
    // Alerter si trop lent
    if (duration > 3000) {
      console.error(`[PERF WARNING] ${label} took ${duration}ms!`);
    }
  }
}

// Usage
const perf = new PerformanceMonitor();
perf.start('fetch_menu');
// ... code ...
perf.end('fetch_menu');
```

### Points de mesure critiques
1. Temps total de traitement message
2. Temps requêtes DB
3. Temps APIs externes
4. Temps parsing/serialization
5. Temps envoi message WhatsApp

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Tous les setTimeout artificiels supprimés
- [ ] Index DB créés
- [ ] Timeouts ajoutés sur APIs externes
- [ ] Cache sessions implémenté
- [ ] Cache restaurants/produits actif
- [ ] Logs DEBUG désactivés en prod
- [ ] Monitoring performance en place
- [ ] Tests de charge effectués
- [ ] Temps de réponse < 3 secondes validé

---

## 📅 TIMELINE

| Phase | Durée estimée | Gain attendu | Priorité |
|-------|---------------|--------------|----------|
| Phase 1 - Gains immédiats | 30 min | -2 sec | HIGH |
| Phase 2 - Optimisations DB | 2h | -3.5 sec | HIGH |
| Phase 3 - Protection APIs | 1h | Protection | MEDIUM |
| Phase 4 - Cache intelligent | 3h | -1 sec | MEDIUM |

**Total :** 6h30 de travail pour **-70% de latence**

---

## 🚀 RÉSULTAT FINAL ATTENDU

**AVANT :** Bot répond en 5-10 secondes  
**APRÈS :** Bot répond en 1-3 secondes  

**Impact business :** Meilleure expérience utilisateur, plus de conversions, moins d'abandons.