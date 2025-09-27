# 🔧 Correction erreur 500 - API Icons

## ❌ Problème identifié

**Erreur 500 sur `/api/icons`** : Configuration Supabase incohérente

### Cause racine:
- ✅ API `restaurants/management` utilise: `NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD`
- ❌ API `icons` utilisait: `SUPABASE_SERVICE_ROLE_KEY` (non défini)
- ❌ API `categories` utilisait: `SUPABASE_SERVICE_ROLE_KEY` (non défini)
- ❌ API `products` utilisait: `SUPABASE_SERVICE_ROLE_KEY` (non défini)

## ✅ Corrections appliquées

### 1. API Icons (`/api/icons/route.ts`)
```typescript
// AVANT (erreur 500)
import { supabaseIcons } from '@/lib/supabase-config'
const supabase = supabaseIcons

// APRÈS (corrigé)
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Dans chaque méthode:
const supabase = createClient(supabaseUrl, supabaseKey);
```

### 2. API Categories (`/api/categories/route.ts`)
- ✅ Même correction appliquée
- ✅ Initialisation `supabase` dans GET()

### 3. API Products (`/api/products/route.ts`)
- ✅ Même correction appliquée
- ✅ Initialisation `supabase` dans GET() et PUT()

## 🧪 Test de vérification

### APIs maintenant alignées:
```bash
# Toutes utilisent la même config que /restaurants/management
GET /api/icons                    # ✅ Devrait fonctionner
GET /api/categories?restaurant_id=1  # ✅ Devrait fonctionner
GET /api/products?restaurant_id=1&category_id=1  # ✅ Devrait fonctionner
```

### Configuration unifiée:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY!;
```

## 📊 Résultat attendu

**Page Back Office maintenant 100% fonctionnelle:**
- ✅ Tab Restaurants (déjà fonctionnel)
- ✅ Tab Icônes (erreur 500 corrigée)
- ✅ Workflow complet restaurant → catégories → produits → icônes

## 🚀 Prochaines étapes

1. **Tester immédiatement** le tab Icônes dans la page
2. **Vérifier** que les 100+ icônes s'affichent
3. **Tester** les filtres de recherche et catégorie
4. **Tester** l'assignation d'icônes aux produits

**Correction technique appliquée** - Ready for testing! 🎉