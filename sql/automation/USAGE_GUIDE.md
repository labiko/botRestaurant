# 🚀 GUIDE D'UTILISATION - Système d'automatisation

## 📋 WORKFLOW RECOMMANDÉ

### 1️⃣ **DIAGNOSTIC INITIAL**
```sql
-- Analyser l'état actuel de toutes les catégories
\i sql/diagnostics/diagnostic_simple_with_drinks_33cl.sql

-- Analyser une catégorie spécifique
\i sql/diagnostics/diagnostic_sandwichs_existant.sql
```

### 2️⃣ **INSTALLATION DES FONCTIONS**
```sql
-- Installer/Mettre à jour toutes les fonctions d'automatisation
\i sql/automation/create_corrected_automation_functions.sql
```

### 3️⃣ **CONFIGURATION DES CATÉGORIES**

#### **CAS 1 : Copier une configuration qui fonctionne** (RECOMMANDÉ)
```sql
-- Copier GOURMETS (qui fonctionne) vers SANDWICHS
SELECT configure_category_workflow('SANDWICHS', 'copy_from', 'GOURMETS');

-- Copier vers d'autres catégories
SELECT configure_category_workflow('BURGERS', 'copy_from', 'GOURMETS');
SELECT configure_category_workflow('PANINI', 'copy_from', 'GOURMETS');
```

#### **CAS 2 : Configuration simple (sans choix)**
```sql
-- Pour des catégories sans options (desserts, boissons)
SELECT configure_category_workflow('DESSERTS', 'simple');
SELECT configure_category_workflow('ICE CREAM', 'simple');
```

#### **CAS 3 : Corriger une catégorie cassée**
```sql
-- Nettoyer et remettre en simple
SELECT fix_category_configuration('CATEGORY_CASSÉE');
```

### 4️⃣ **VALIDATION**
```sql
-- Vérifier qu'une catégorie a été correctement configurée
SELECT 
    p.name, p.product_type, p.workflow_type, 
    COUNT(fpo.id) as nb_options
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id  
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'sandwichs'
GROUP BY p.name, p.product_type, p.workflow_type;
```

### 5️⃣ **TEST FONCTIONNEL**
- Ouvrir WhatsApp
- Taper `resto` pour reset
- Sélectionner la catégorie modifiée  
- Vérifier le comportement attendu

## 🎯 MODES DISPONIBLES

### `'copy_from'` - Copie d'une configuration
```sql
-- Syntaxe
configure_category_workflow('CIBLE', 'copy_from', 'SOURCE')

-- Exemples
configure_category_workflow('SANDWICHS', 'copy_from', 'GOURMETS')
configure_category_workflow('BURGERS', 'copy_from', 'SMASHS')  

-- Résultat : CIBLE aura exactement la même config que SOURCE
```

### `'simple'` - Configuration basique
```sql
-- Syntaxe  
configure_category_workflow('CATEGORIE', 'simple')

-- Exemple
configure_category_workflow('DESSERTS', 'simple')

-- Résultat : Sélection → Ajout direct au panier (pas d'options)
```

### `'composite'` - Configuration avancée
```sql
-- Syntaxe (avec protection)
configure_category_workflow('CATEGORIE', 'composite')

-- Syntaxe (forcer)  
configure_category_workflow('CATEGORIE', 'composite', NULL, true)

-- ⚠️ Attention : Peut créer un workflow incomplet !
```

## 📊 EXEMPLES CONCRETS

### **Scénario 1 : Nouvelle catégorie avec boissons**
```sql
-- 1. Diagnostiquer
SELECT * FROM france_menu_categories WHERE slug = 'nouvelle_categorie';

-- 2. Copier depuis GOURMETS (qui marche)
SELECT configure_category_workflow('NOUVELLE_CATEGORIE', 'copy_from', 'GOURMETS');

-- 3. Vérifier  
-- Test bot : Sélection → Choix 12 boissons → Ajout panier
```

### **Scénario 2 : Réparer une catégorie cassée**
```sql
-- 1. Identifier le problème
SELECT p.product_type, p.workflow_type, COUNT(fpo.id) 
FROM france_products p 
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'categorie_cassee'
GROUP BY p.product_type, p.workflow_type;

-- 2. Nettoyer
SELECT fix_category_configuration('CATEGORIE_CASSEE');

-- 3. Reconfigurer proprement
SELECT configure_category_workflow('CATEGORIE_CASSEE', 'copy_from', 'GOURMETS');
```

### **Scénario 3 : Catégorie simple sans options**
```sql
-- Pour des produits qui n'ont pas besoin de choix
SELECT configure_category_workflow('DESSERTS', 'simple');
SELECT configure_category_workflow('BOISSONS', 'simple');
```

## 🔍 FONCTIONS UTILITAIRES

### **Diagnostic d'une catégorie**
```sql
-- État des produits d'une catégorie
SELECT 
    c.name as categorie,
    COUNT(p.id) as nb_produits,
    COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) as composite,
    COUNT(CASE WHEN p.product_type = 'simple' THEN 1 END) as simple,
    COUNT(fpo.id) as nb_options
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id  
WHERE c.slug = 'MA_CATEGORIE'
GROUP BY c.name;
```

### **Lister les catégories qui marchent**
```sql
-- Identifier les catégories avec options de boissons (= qui marchent)
SELECT 
    c.name,
    COUNT(DISTINCT p.id) as nb_produits,
    COUNT(fpo.id) as nb_options
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id
JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE fpo.option_group ILIKE '%boisson%'
GROUP BY c.name
ORDER BY nb_options DESC;
```

## ⚠️ TROUBLESHOOTING

### **Erreur : "Catégorie non trouvée"**
```sql
-- Vérifier l'existence  
SELECT id, name, slug FROM france_menu_categories WHERE name ILIKE '%MON_NOM%';
```

### **Erreur : "Pas de composite_items"**
```sql
-- Utiliser copy_from au lieu de composite
SELECT configure_category_workflow('MA_CATEGORIE', 'copy_from', 'GOURMETS');
```

### **Bot ne propose pas les boissons**
```sql
-- Vérifier la configuration
SELECT p.product_type, p.workflow_type, p.requires_steps 
FROM france_products p 
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'ma_categorie' LIMIT 1;

-- Si simple au lieu de composite, refaire la copie
SELECT configure_category_workflow('MA_CATEGORIE', 'copy_from', 'GOURMETS');
```