# 📋 PLAN DÉTAILLÉ - Template d'Affichage SANDWICHS pour TACOS

## 🎯 OBJECTIF
Faire en sorte que TACOS utilise **exactement le même template d'affichage** que SANDWICHS avec le format complet incluant composition et séparateurs.

## 🔧 ÉTAPES D'IMPLÉMENTATION

### **ÉTAPE 1: Analyser le Template SANDWICHS Existant**
**Fichier à analyser**: `UniversalBot.ts` - méthode d'affichage des produits
**Rechercher**: Comment SANDWICHS génère ce format exact avec séparateurs et composition

### **ÉTAPE 2: Créer le Template d'Affichage Unifié**
**Fichier**: `ProductQueryService.ts`
**Nouvelle méthode**:

```typescript
private formatProductDisplay(product: Product): string {
  // Template identique aux SANDWICHS
  const separator = "━━━━━━━━━━━━━━━━━━━━━";
  const icon = this.getProductIcon(product.category);
  const composition = product.composition || product.metadata?.originalData?.composition || '';
  
  return [
    separator,
    `🎯 ${icon} ${icon} ${product.name}`,
    composition ? `🧾 ${composition.toUpperCase()}` : '',
    `💰 ${product.basePrice} EUR - Tapez ${product.metadata?.displayOrder}`,
    separator,
    '' // Ligne vide
  ].filter(Boolean).join('\n');
}

private getProductIcon(category: string): string {
  const icons = {
    'tacos': '🌮',
    'sandwichs': '🥪',
    'pizzas': '🍕',
    'burgers': '🍔'
  };
  return icons[category] || '🍽️';
}
```

### **ÉTAPE 3: Modifier l'Expansion des Variantes**
**Fichier**: `ProductQueryService.ts`
**Méthode `expandProductVariants` ajustée**:

```typescript
private expandProductVariants(product: Product): Product[] {
  const sizes = product.metadata?.originalData?.france_product_sizes || [];
  
  return sizes.map((size: any, index: number) => ({
    ...product,
    id: `${product.id}_${size.id}`,
    name: `${product.name} ${size.size_name}`,
    basePrice: parseFloat(size.price_on_site || '0'),
    deliveryPrice: parseFloat(size.price_delivery || size.price_on_site || '0'),
    composition: product.composition, // ✅ Préserver la composition
    metadata: {
      ...product.metadata,
      sizeName: size.size_name,
      sizeId: size.id,
      displayOrder: index + 1,
      isExpandedVariant: true,
      formattedDisplay: this.formatProductDisplay({
        ...product,
        name: `${product.name} ${size.size_name}`,
        basePrice: parseFloat(size.price_on_site || '0'),
        metadata: { displayOrder: index + 1 }
      })
    }
  }));
}
```

### **ÉTAPE 4: Intégration dans l'Affichage Bot**
**Point d'intégration**: Là où les produits sont envoyés au format message WhatsApp
**Utiliser**: `product.metadata?.formattedDisplay` si disponible

### **ÉTAPE 5: Modification du Mapping Principal**
**Fichier**: `ProductQueryService.ts`
**Ligne**: 288-290 (méthode `mapToProducts`)

```typescript
private mapToProducts(data: any[], config: ProductQueryConfig): Product[] {
  const products = data.map(item => this.mapSingleProduct(item, config));
  
  // ✅ NOUVEAU: Expansion des variantes si nécessaire
  const expandedProducts: Product[] = [];
  
  for (const product of products) {
    if (this.shouldDisplayVariantsInline(product, config)) {
      expandedProducts.push(...this.expandProductVariants(product));
    } else {
      expandedProducts.push(product);
    }
  }
  
  return expandedProducts;
}

private shouldDisplayVariantsInline(product: Product, config?: ProductQueryConfig): boolean {
  // Condition simple: produit avec tailles ET catégorie alimentaire
  return product.metadata?.originalData?.france_product_sizes?.length > 0 &&
         ['tacos', 'pizzas', 'burgers'].includes(product.category);
}
```

## 🎯 RÉSULTAT ATTENDU EXACT

**TACOS avec template SANDWICHS**:
```
🌮 TACOS
📍 Prix sur place

━━━━━━━━━━━━━━━━━━━━━
🎯 🌮 🌮 TACOS M
🧾 VIANDE, CRUDITÉS, SAUCE
💰 8 EUR - Tapez 1

━━━━━━━━━━━━━━━━━━━━━
🎯 🌮 🌮 TACOS L
🧾 VIANDE, CRUDITÉS, SAUCE
💰 9.5 EUR - Tapez 2

━━━━━━━━━━━━━━━━━━━━━
🎯 🌮 🌮 TACOS XL
🧾 VIANDE, CRUDITÉS, SAUCE
💰 11 EUR - Tapez 3

━━━━━━━━━━━━━━━━━━━━━
```

## 🔒 GARANTIES SANS RÉGRESSION
- **Aucune modification** de `UniversalBot.ts` (logique de bypass)
- **Aucune modification** de base de données
- **Extension pure** du service existant
- **Rétrocompatibilité** totale

## 📊 IMPACT TECHNIQUE
- **Fichiers modifiés**: 1 seul (`ProductQueryService.ts`)
- **Lignes ajoutées**: ~50 lignes
- **Tests requis**: Workflow TACOS uniquement
- **Déploiement**: Edge Function seule

## 🔍 LOGS À AJOUTER POUR IDENTIFICATION

### Logs dans ProductQueryService.ts
```typescript
// Dans mapToProducts
console.log(`🔍 [DISPLAY_DEBUG] Mapping ${data.length} products for config:`, config);
console.log(`🔍 [DISPLAY_DEBUG] Checking shouldDisplayVariantsInline for each product`);

// Dans shouldDisplayVariantsInline  
console.log(`🔍 [DISPLAY_DEBUG] Product ${product.name}: has_sizes=${product.metadata?.originalData?.france_product_sizes?.length}, category=${product.category}`);

// Dans expandProductVariants
console.log(`🔍 [DISPLAY_DEBUG] Expanding ${product.name} into ${sizes.length} variants`);
```

### Logs dans UniversalBot.ts
```typescript
// Dans showProductsInCategory (ligne ~1750)
console.log(`🔍 [DISPLAY_DEBUG] showProductsInCategory called for category: ${category}`);
console.log(`🔍 [DISPLAY_DEBUG] Found ${products.length} products`);

// Avant le bypass (ligne ~1753)
if (products.length === 1) {
  console.log(`🔍 [DISPLAY_DEBUG] Single product detected: ${products[0].name}`);
  console.log(`🔍 [DISPLAY_DEBUG] Has variants: ${hasVariants}`);
  console.log(`🔍 [DISPLAY_DEBUG] Will bypass normal display: ${hasVariants}`);
}
```

## 🎯 STRATÉGIE D'IDENTIFICATION

1. **Ajouter les logs de debug**
2. **Tester avec TACOS** (workflow actuel)
3. **Tester avec SANDWICHS** (affichage normal)
4. **Identifier l'endroit exact** où les formats divergent
5. **Implémenter la solution** au bon endroit

Cette approche garantit de trouver le bon "android" (endroit) à modifier dans le code.