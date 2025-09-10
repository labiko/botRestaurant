# 📋 PLAN DÉTAILLÉ : Système de Templates Universel
*Inspiré du PizzaDisplayService*

## 🏗️ ARCHITECTURE GÉNÉRALE

**Créer un `UniversalDisplayService` sur le même modèle que `PizzaDisplayService`**

## 📁 1. NOUVEAU SERVICE : `UniversalDisplayService.ts`

```typescript
// 🌍 SERVICE D'AFFICHAGE UNIVERSEL POUR TOUS TYPES DE PRODUITS
// SOLID : Single Responsibility - Gestion de l'affichage adaptatif
// Inspiré de PizzaDisplayService mais généralisé

export class UniversalDisplayService {
  private displayConfig: any = null;
  private restaurantSettings: any = null;
  
  constructor(
    private messageSender: IMessageSender,
    private supabaseUrl: string,
    private supabaseKey: string
  ) {}

  // Configuration par type de produit
  private getDefaultTemplates(): any {
    return {
      simple: {
        enabled: true,
        show_composition: true,
        format: "{displayNumber} *{name}* — {composition} — {price}"
      },
      composite: {
        enabled: true,
        show_workflow: true,
        format: "{displayNumber} *{name}* - {price}"
      },
      variant: {
        enabled: true,
        show_description: true,
        format: "{displayNumber} *{name}* - {description} - {price}"
      },
      modular: {
        enabled: true,
        show_options_count: true,
        format: "{displayNumber} *{name}* ({options_count} options) - {price}"
      }
    };
  }
}
```

## 📋 2. STRUCTURE DE CONFIGURATION

**Table : `france_product_display_configs`** (qui existe déjà)
```sql
-- Étendre avec nouvelles colonnes pour templates universels
ALTER TABLE france_product_display_configs ADD COLUMN IF NOT EXISTS 
  template_config JSONB DEFAULT NULL;

-- Exemple de template_config:
{
  "simple": {
    "enabled": true,
    "show_composition": true,
    "format": "{displayNumber} *{name}* — {composition} — {price}",
    "separator": " — "
  },
  "composite": {
    "enabled": true,
    "show_workflow": true, 
    "format": "{displayNumber} *{name}* - {price}",
    "apply_existing_workflow": true
  }
}
```

## 🎯 3. MÉTHODES PRINCIPALES

### 3.1 Configuration et Détection
```typescript
// Charger config restaurant (comme PizzaDisplayService)
async loadRestaurantConfig(restaurantId: number): Promise<boolean>

// Déterminer le template selon product_type
getTemplateForProduct(product: any): string

// Vérifier si utiliser template custom
shouldUseCustomTemplate(productType: string, categorySlug: string): boolean
```

### 3.2 Templates par Type
```typescript
// Template pour produits SIMPLES (vos pâtes)
private formatSimpleProduct(product: any, displayNumber: string, priceText: string): string {
  if (product.composition) {
    return `${displayNumber} *${product.name}* — ${product.composition} — ${priceText}`;
  }
  return `${displayNumber} *${product.name}* - ${priceText}`;
}

// Template pour produits COMPOSITES (préserver workflow existant)
private formatCompositeProduct(product: any, displayNumber: string, priceText: string): string {
  return `${displayNumber} *${product.name}* - ${priceText}`;
}

// Template pour VARIANTES
private formatVariantProduct(product: any, displayNumber: string, priceText: string): string {
  let line = `${displayNumber} *${product.name}*`;
  if (product.description) line += ` - ${product.description}`;
  line += ` - ${priceText}`;
  return line;
}

// Template pour MODULAIRES  
private formatModularProduct(product: any, displayNumber: string, priceText: string): string {
  const optionsCount = product.france_product_options?.length || 0;
  return `${displayNumber} *${product.name}* (${optionsCount} options) - ${priceText}`;
}
```

## 🔄 4. INTÉGRATION DANS `UniversalBot.ts`

### 4.1 Initialisation (comme PizzaDisplayService)
```typescript
// Dans le constructeur de UniversalBot
private universalDisplayService: UniversalDisplayService;

constructor(...) {
  // Initialiser le service d'affichage universel
  this.universalDisplayService = new UniversalDisplayService(
    messageSender,
    this.supabaseUrl,
    this.supabaseKey
  );
}
```

### 4.2 Modification de `showProductsInCategory`
```typescript
// AVANT (ligne 1631-1639) : Format unique pour tous
let productLine = `${displayNumber} *${product.name}*`;
if (product.description) {
  productLine += ` - ${product.description}`;
}
if (priceText) {
  productLine += ` - ${priceText}`;
}

// APRÈS : Délégation au service universel
const productLine = await this.universalDisplayService.formatProduct(
  product, 
  displayNumber, 
  priceText, 
  category.slug,
  session.restaurantId
);
```

## 🎛️ 5. MÉTHODE PRINCIPALE : `formatProduct`

```typescript
async formatProduct(
  product: any,
  displayNumber: string, 
  priceText: string,
  categorySlug: string,
  restaurantId: number
): Promise<string> {
  
  // 1. Charger config si pas déjà fait
  if (!this.displayConfig) {
    await this.loadRestaurantConfig(restaurantId);
  }
  
  // 2. Déterminer le template selon product_type
  const productType = product.product_type || 'simple';
  
  // 3. Vérifier si template custom activé
  if (!this.shouldUseCustomTemplate(productType, categorySlug)) {
    // Fallback sur affichage existant
    return this.formatDefault(product, displayNumber, priceText);
  }
  
  // 4. Appliquer template selon type
  switch(productType) {
    case 'simple':
      return this.formatSimpleProduct(product, displayNumber, priceText);
    case 'composite':
      return this.formatCompositeProduct(product, displayNumber, priceText);
    case 'variant':
      return this.formatVariantProduct(product, displayNumber, priceText);
    case 'modular':
      return this.formatModularProduct(product, displayNumber, priceText);
    default:
      return this.formatDefault(product, displayNumber, priceText);
  }
}
```

## ✅ 6. PRÉSERVATION DE L'EXISTANT

- **🍕 Pizzas** : Garder `PizzaDisplayService` intact
- **🔄 Workflows** : Préserver tous les workflows composites existants
- **📱 Compatibilité** : Fallback sur affichage actuel si template désactivé

## 🎯 7. RÉSULTATS ATTENDUS

### Pâtes (simple) :
```
⿡ BOLOGNAISEXX — sauce bolognaise, tomates, parmesan — 8.5€
⿢ CARBONARA — crème fraîche, lardons, parmesan, œuf — 8.5€
```

### Pizzas (composite) :
```
🍕 PIZZA COMPLÈTE - 12€ - 15€  (garde workflow existant)
```

### Boissons (variant) :
```
🥤 COCA-COLA - Boisson rafraîchissante - 2€ - 3€
```

## 🚀 8. PHASES D'IMPLÉMENTATION

1. **Phase 1** : Créer `UniversalDisplayService`
2. **Phase 2** : Implémenter templates de base
3. **Phase 3** : Intégrer dans `showProductsInCategory`
4. **Phase 4** : Tester avec pâtes d'abord
5. **Phase 5** : Étendre aux autres types progressivement

---

**Ce plan respecte exactement l'architecture du `PizzaDisplayService` mais généralisé pour tous les types de produits !**