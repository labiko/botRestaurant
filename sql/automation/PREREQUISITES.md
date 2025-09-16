# 📋 PRÉREQUIS - Script d'automatisation

## 🎯 Fonction : `configure_category_workflow()`

### 📦 DÉPENDANCES OBLIGATOIRES

#### 1. **STRUCTURE DE BASE DE DONNÉES**
```sql
-- Tables principales requises :
- france_menu_categories (id, name, slug, restaurant_id)
- france_products (id, category_id, name, product_type, workflow_type, requires_steps, steps_config)
- france_product_options (id, product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, group_order)
- france_composite_items (id, composite_product_id, component_name, quantity, unit)
- france_product_variants (id, product_id, variant_name, quantity, unit, price_on_site)
```

#### 2. **FONCTIONS AUXILIAIRES**
```sql
-- Fonctions requises en base :
- apply_composite_config(category_name TEXT, include_drinks BOOLEAN)
- apply_simple_config(category_name TEXT)  
- copy_working_config(source_category TEXT, target_category TEXT)
- fix_category_configuration(category_name TEXT)
```

#### 3. **DONNÉES DE RÉFÉRENCE**
```sql
-- Pour le mode 'copy_from' :
- Au moins UNE catégorie source avec configuration complète
- Exemple : GOURMETS avec product_options de boissons
- Boissons 33CL dans la catégorie BOISSONS/DRINKS
```

### 🔧 CONFIGURATION MINIMALE

#### **MODE 'simple'**
```sql
-- Prérequis minimaux :
SELECT configure_category_workflow('DESSERTS', 'simple');
```
- ✅ Catégorie existante
- ✅ Produits dans la catégorie

#### **MODE 'composite'** 
```sql
-- Prérequis étendus :
SELECT configure_category_workflow('TACOS', 'composite', NULL, true);
```
- ✅ Catégorie existante  
- ✅ Produits dans la catégorie
- ✅ Boissons 33CL disponibles
- ⚠️ Risque : Workflow incomplet sans composite_items

#### **MODE 'copy_from'** (RECOMMANDÉ)
```sql
-- Prérequis optimaux :
SELECT configure_category_workflow('SANDWICHS', 'copy_from', 'GOURMETS');
```
- ✅ Catégorie source existante et FONCTIONNELLE
- ✅ Catégorie cible existante
- ✅ Configuration source complète (product_options + steps_config)

### 🛡️ VALIDATIONS INTÉGRÉES

#### **Vérifications automatiques :**
1. **Existence des catégories** : Erreur si catégorie introuvable
2. **Protection composite** : Refuse si pas de composite_items (sauf force)
3. **Validation copy_from** : Vérifie que source_category est fourni
4. **Nettoyage sécurisé** : Supprime seulement la catégorie cible

### ⚠️ RISQUES ET MITIGATION

#### **RISQUE FAIBLE :**
- **copy_from** : Copie une config qui fonctionne ✅
- **simple** : Remet en état basique ✅

#### **RISQUE MOYEN :**
- **composite sans force** : Refuse si config incomplète ⚠️

#### **RISQUE ÉLEVÉ :**
- **composite avec force=true** : Peut créer workflow cassé 🚨

### 📝 CHECKLIST AVANT EXÉCUTION

```sql
-- 1. Vérifier l'état actuel
SELECT * FROM diagnostic_category_state('MA_CATEGORIE');

-- 2. Identifier une source qui fonctionne (pour copy_from)
SELECT * FROM diagnostic_working_categories();

-- 3. Exécuter avec le mode approprié
SELECT configure_category_workflow('MA_CATEGORIE', 'copy_from', 'SOURCE_QUI_MARCHE');

-- 4. Vérifier le résultat
SELECT * FROM diagnostic_category_state('MA_CATEGORIE');
```

### 🎯 BONNES PRATIQUES

1. **TOUJOURS** diagnostiquer avant modification
2. **PRIVILÉGIER** copy_from pour reproduire du fonctionnel
3. **TESTER** le résultat dans le bot après modification
4. **DOCUMENTER** les changements effectués