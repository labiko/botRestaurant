# 🏗️ ARCHITECTURE BDD PIZZA YOLO 77 - SOLIDE & SCALABLE

## 📊 **ANALYSE DES MODÈLES IDENTIFIÉS**

Basé sur l'analyse complète des 10 catégories de menus Pizza Yolo 77 :

### **4 Modèles Architecturaux**
1. **MODULAIRE** : TACOS (choix obligatoires + suppléments)
2. **FIXE** : BURGERS, SANDWICHS, GOURMETS, SMASHS, ASSIETTES, NAANS
3. **VARIANTES** : POULET & SNACKS, ICE CREAM, DRINKS (portions/formats multiples)
4. **COMPOSITE** : MENU FAMILY (composition fixe multi-éléments)

---

## 🎯 **ARCHITECTURE RECOMMANDÉE : APPROCHE HYBRIDE**

### **1. Tables Principales**

```sql
-- RESTAURANTS
restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CATÉGORIES DE MENU
menu_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  name VARCHAR(255) NOT NULL, -- "TACOS", "BURGERS", "POULET & SNACKS"
  slug VARCHAR(100),
  display_order INTEGER,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true
);

-- PRODUITS UNIVERSELS
products (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  category_id INTEGER REFERENCES menu_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(8,2),
  product_type ENUM('simple', 'modular', 'variant', 'composite'),
  composition TEXT, -- Pour produits simples
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Gestion des Variantes (POULET, DRINKS, ICE CREAM)**

```sql
-- VARIANTES DE PRODUITS
product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  variant_name VARCHAR(255) NOT NULL, -- "4 PIÈCES", "8 PIÈCES MENU", "100ML", "500ML"
  price DECIMAL(8,2) NOT NULL,
  quantity INTEGER, -- 4, 8, 100, 500
  unit VARCHAR(20), -- "pièces", "ml", "cl", "l"
  is_menu BOOLEAN DEFAULT false, -- true si inclut frites+boisson
  includes_sides TEXT, -- "frites+boisson 33cl"
  display_order INTEGER
);
```

### **3. Gestion Modulaire (TACOS)**

```sql
-- OPTIONS POUR PRODUITS MODULAIRES
product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  option_group VARCHAR(100) NOT NULL, -- "viande", "supplement", "sauce", "taille"
  option_name VARCHAR(255) NOT NULL,
  price_modifier DECIMAL(8,2) DEFAULT 0, -- +2€ pour XL, +1€ pour bacon
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER
);

-- TAILLES POUR PRODUITS MODULAIRES
product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  size_name VARCHAR(10) NOT NULL, -- "M", "L", "XL"
  base_price DECIMAL(8,2) NOT NULL,
  display_order INTEGER
);
```

### **4. Gestion Composite (MENU FAMILY)**

```sql
-- COMPOSITION DES MENUS COMPOSITES
composite_items (
  id SERIAL PRIMARY KEY,
  composite_product_id INTEGER REFERENCES products(id),
  component_name VARCHAR(255) NOT NULL, -- "Wings", "Tenders", "Frites"
  quantity INTEGER NOT NULL, -- 6, 6, 2
  unit VARCHAR(20) -- "pièces", "portions"
);
```

---

## 🤖 **IMPLÉMENTATION DANS LE BOT WHATSAPP**

### **Logique de Traitement Universelle**

```typescript
interface ProductDisplay {
  id: number;
  name: string;
  price: number;
  type: 'simple' | 'modular' | 'variant' | 'composite';
  variants?: ProductVariant[];
  options?: ProductOption[];
  composition?: string;
}

// LOGIQUE UNIVERSELLE D'AFFICHAGE
const displayCategory = async (categoryId: number) => {
  const products = await getProductsByCategory(categoryId);
  
  return products.map(product => {
    switch (product.type) {
      case 'simple':
        return `${product.name} — ${product.price}€`;
        
      case 'variant':
        return product.variants.map((v, i) => 
          `  • ${v.variant_name} → ${v.price}€${v.is_menu ? ' (menu*)' : ''}`
        ).join('\n');
        
      case 'modular':
        return generateModularDisplay(product);
        
      case 'composite':
        return `${product.name} — ${product.price}€\n${product.composition}`;
    }
  });
};
```

### **Avantages de cette Architecture**

✅ **Scalabilité** : Ajouter un restaurant = copier la structure
✅ **Flexibilité** : Gère tous les types de produits identifiés  
✅ **Performance** : Requêtes optimisées par type
✅ **Maintenance** : Structure claire et logique
✅ **Évolution** : Facile d'ajouter de nouveaux types

---

## 📱 **EXEMPLES D'AFFICHAGE DANS LE BOT**

### **Exemple 1 : TACOS (Modulaire)**
```
🌮 TACOS

1️⃣ Menu Tacos M — 7€ (+ boisson)
2️⃣ Menu Tacos L — 8,50€ (+ boisson) 
3️⃣ Menu Tacos XL — 10€ (+ boisson)

Choisissez la taille puis la viande
Ex: "1,2" pour M + Merguez
```

### **Exemple 2 : BURGERS (Fixe)**
```
🍔 BURGERS

1️⃣ CHEESEBURGER — 5€
2️⃣ DOUBLE CHEESEBURGER — 6,50€
3️⃣ BIG CHEESE — 7,50€

Tapez le numéro de votre choix
```

### **Exemple 3 : WINGS (Variantes)**
```
🍗 WINGS

1️⃣ 4 pièces → 3,50€
2️⃣ 8 pièces (menu*) → 9€

*Menu = avec frites + boisson
```

---

## 🚀 **MIGRATION ET DÉPLOIEMENT**

### **Phase 1 : Structure de base**
1. Créer les tables principales
2. Importer Pizza Yolo 77 comme référence
3. Tester avec le bot existant

### **Phase 2 : Optimisation**
1. Ajouter indexes de performance
2. Optimiser les requêtes fréquentes
3. Cache des menus populaires

### **Phase 3 : Scalabilité**
1. Ajouter d'autres restaurants
2. Système de templates par type
3. Interface admin pour gestion

---

## 📋 **REQUÊTES SQL TYPES**

### **Récupérer menu d'une catégorie**
```sql
SELECT 
  p.*,
  COALESCE(
    json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL),
    '[]'
  ) as variants,
  COALESCE(
    json_agg(po.*) FILTER (WHERE po.id IS NOT NULL), 
    '[]'
  ) as options
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
LEFT JOIN product_options po ON p.id = po.product_id
WHERE p.category_id = ? AND p.is_active = true
GROUP BY p.id
ORDER BY p.display_order;
```

### **Performance estimée**
- ⚡ **~50ms** par requête de menu
- 🗄️ **~500MB** pour 50 restaurants
- 🔄 **Cache** : 90% de hit rate attendu

---

Cette architecture gère **tous les cas d'usage** identifiés chez Pizza Yolo tout en restant **extensible** pour d'autres restaurants avec des modèles différents.

*Architecture conçue pour Pizza Yolo 77 - Extensible à tous types de restaurants*