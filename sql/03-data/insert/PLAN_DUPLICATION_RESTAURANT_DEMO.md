# 📋 PLAN DE DUPLICATION - Restaurant Démo (010101010)

## 🎯 Objectif

Créer un **restaurant fictif de démonstration** basé sur les données d'OCV pour permettre des démos clients sans impacter les données de production.

---

## 📊 Analyse des données OCV (Restaurant source - ID: 16)

### **Restaurant principal**
- ✅ Nom : Le Nouveau O'CV Moissy
- ✅ Slug : le-nouveau-ocv-moissy
- ✅ Téléphone : 33160640099
- ✅ Adresse : 37 Pl. du 14 Juillet 1789, 77550 Moissy-Cramayel
- ✅ Zone de livraison : 8 km
- ✅ Frais de livraison : 2,50€
- ✅ Horaires : 7j/7 de 11h00 à 23h59

### **Menu complet**
- ✅ **21 catégories** de menu
- ✅ **90 produits simples**
- ✅ **16 produits composites** (avec workflows)
- ✅ **4 produits variants**
- ✅ **Total : 110 produits**

### **Tables impliquées**
1. `france_restaurants` - Restaurant principal
2. `france_menu_categories` - Catégories de menu
3. `france_products` - Tous les produits
4. `france_composite_items` - Éléments pour produits composites
5. `france_product_options` - Options de personnalisation
6. `restaurant_vitrine_settings` - Paramètres vitrine (si existe)

---

## 🎨 Caractéristiques du Restaurant Démo

### **Identité**
- **Nom** : Restaurant Démo
- **Slug** : restaurant-demo
- **Téléphone** : 010101010
- **WhatsApp** : 010101010
- **Adresse** : 123 Avenue de la Démo, 75001 Paris
- **Ville** : Paris
- **Code postal** : 75001

### **Paramètres techniques**
- **Zone de livraison** : 10 km (plus large pour démo)
- **Frais de livraison** : 0€ (gratuit pour démo)
- **Commande minimum** : 0€ (aucun minimum)
- **Statut** : Actif
- **Horaires** : 24h/24, 7j/7 (toujours ouvert pour démo)
- **Coordonnées GPS** : Paris Centre (48.8566, 2.3522)
- **Deployment Status** : demo
- **Subscription** : active (perpetual)

### **Marqueurs visuels**
- **Badge "DEMO"** visible
- **Prefix sur tous les produits** : "[DEMO]" dans le nom
- **Couleur spéciale** : Badge orange pour identifier facilement

---

## 📝 Plan de duplication - 5 étapes

### **ÉTAPE 1 : Créer le restaurant de base**

```sql
INSERT INTO france_restaurants (
    name, slug, phone, whatsapp_number,
    address, city, postal_code,
    latitude, longitude,
    delivery_zone_km, min_order_amount, delivery_fee,
    is_active, business_hours,
    deployment_status, subscription_status,
    country_code, currency, timezone
) VALUES (
    'Restaurant Démo 🎭',
    'restaurant-demo',
    '010101010',
    '010101010',
    '123 Avenue de la Démo',
    'Paris',
    '75001',
    48.8566,
    2.3522,
    10,
    0.00,
    0.00,
    true,
    '{"lundi": {"isOpen": true, "opening": "00:00", "closing": "23:59"}, ...}',
    'demo',
    'active',
    'FR',
    'EUR',
    'Europe/Paris'
) RETURNING id;
```

**Note** : Récupérer l'ID généré pour les étapes suivantes.

---

### **ÉTAPE 2 : Dupliquer les catégories de menu**

```sql
-- Dupliquer les 21 catégories d'OCV vers le restaurant démo
INSERT INTO france_menu_categories (
    restaurant_id, name, icon, display_order,
    is_active, created_at, updated_at
)
SELECT
    [NOUVEAU_RESTAURANT_ID], -- ID du restaurant démo
    name,
    icon,
    display_order,
    is_active,
    NOW(),
    NOW()
FROM france_menu_categories
WHERE restaurant_id = 16; -- ID d'OCV
```

**Mapping nécessaire** : Créer une table temporaire pour mapper les anciens ID de catégories vers les nouveaux.

---

### **ÉTAPE 3 : Dupliquer les produits**

```sql
-- Dupliquer les 110 produits (simples + composites + variants)
WITH category_mapping AS (
    -- Mapping ancien_id → nouveau_id des catégories
    SELECT
        old_cat.id as old_category_id,
        new_cat.id as new_category_id
    FROM france_menu_categories old_cat
    JOIN france_menu_categories new_cat
        ON old_cat.name = new_cat.name
        AND old_cat.restaurant_id = 16
        AND new_cat.restaurant_id = [NOUVEAU_RESTAURANT_ID]
)
INSERT INTO france_products (
    restaurant_id, category_id,
    name, description, icon,
    price_on_site_base, price_delivery_base,
    product_type, is_active, display_order,
    steps_config, created_at, updated_at
)
SELECT
    [NOUVEAU_RESTAURANT_ID],
    cm.new_category_id,
    '[DEMO] ' || fp.name, -- Prefix DEMO
    fp.description,
    fp.icon,
    fp.price_on_site_base,
    fp.price_delivery_base,
    fp.product_type,
    fp.is_active,
    fp.display_order,
    fp.steps_config,
    NOW(),
    NOW()
FROM france_products fp
JOIN category_mapping cm ON fp.category_id = cm.old_category_id
WHERE fp.restaurant_id = 16;
```

**Mapping nécessaire** : Créer une table temporaire pour mapper les anciens ID de produits vers les nouveaux.

---

### **ÉTAPE 4 : Dupliquer les éléments composites**

```sql
-- Dupliquer les éléments pour les 16 produits composites
WITH product_mapping AS (
    -- Mapping ancien_id → nouveau_id des produits
    SELECT
        old_prod.id as old_product_id,
        new_prod.id as new_product_id
    FROM france_products old_prod
    JOIN france_products new_prod
        ON REPLACE(new_prod.name, '[DEMO] ', '') = old_prod.name
        AND old_prod.restaurant_id = 16
        AND new_prod.restaurant_id = [NOUVEAU_RESTAURANT_ID]
)
INSERT INTO france_composite_items (
    composite_product_id, option_id,
    step_number, is_required, max_selections,
    created_at, updated_at
)
SELECT
    pm.new_product_id,
    fci.option_id, -- ATTENTION : Les option_id peuvent aussi nécessiter un mapping
    fci.step_number,
    fci.is_required,
    fci.max_selections,
    NOW(),
    NOW()
FROM france_composite_items fci
JOIN product_mapping pm ON fci.composite_product_id = pm.old_product_id;
```

**⚠️ ATTENTION** : Les `option_id` dans `france_composite_items` référencent probablement `france_product_options`. Il faudra aussi dupliquer cette table.

---

### **ÉTAPE 5 : Dupliquer les options de produits**

```sql
-- Dupliquer toutes les options de personnalisation
INSERT INTO france_product_options (
    name, icon, price_modifier,
    option_type, is_active, display_order,
    created_at, updated_at
)
SELECT
    '[DEMO] ' || name,
    icon,
    price_modifier,
    option_type,
    is_active,
    display_order,
    NOW(),
    NOW()
FROM france_product_options
WHERE id IN (
    SELECT DISTINCT fci.option_id
    FROM france_composite_items fci
    JOIN france_products fp ON fci.composite_product_id = fp.id
    WHERE fp.restaurant_id = 16
);
```

**Mapping nécessaire** : Mapper les anciens `option_id` vers les nouveaux pour corriger `france_composite_items`.

---

## ⚠️ Points d'attention critiques

### **1. Gestion des ID et mappings**

Les tables ont des relations par ID. Il faut :
- ✅ Créer des **tables temporaires de mapping** pour chaque entité dupliquée
- ✅ Mettre à jour les **foreign keys** dans les tables dépendantes
- ✅ Vérifier l'**intégrité référentielle** après duplication

### **2. Produits composites et workflows**

Les produits composites utilisent :
- `steps_config` (JSON) : Contient la configuration des étapes de personnalisation
- `france_composite_items` : Liste les options disponibles par étape
- `france_product_options` : Options globales réutilisables

**Action** : Vérifier que les `option_id` dans `steps_config` correspondent aux nouveaux IDs après duplication.

### **3. Vitrine (si applicable)**

Si OCV a une vitrine configurée dans `restaurant_vitrine_settings`, il faudra aussi la dupliquer.

### **4. Commandes de test**

Pour les démos, il peut être utile de créer quelques **commandes fictives** dans `france_orders` pour montrer l'historique.

---

## 🚀 Stratégie d'exécution

### **Option A : Script SQL manuel (Recommandé pour DEV d'abord)**

1. Créer le script SQL complet
2. Tester en DEV
3. Vérifier l'intégrité des données
4. Exécuter en PROD

### **Option B : Fonction SQL automatisée**

Créer une fonction PostgreSQL `duplicate_restaurant(source_id, new_phone)` qui :
- Gère automatiquement tous les mappings
- Retourne le nouvel ID de restaurant
- Inclut des transactions (ROLLBACK en cas d'erreur)

---

## 📦 Livrables

1. **Script SQL** : `DUPLICATION_RESTAURANT_DEMO.sql`
2. **Script de vérification** : `VERIFY_RESTAURANT_DEMO.sql`
3. **Documentation** : Comment utiliser le restaurant de démo
4. **Script de nettoyage** : Pour supprimer le restaurant démo si besoin

---

## 🎯 Utilisation du restaurant démo

### **Pour les démos clients**

1. ✅ Afficher le QR code avec le numéro **010101010**
2. ✅ Scanner → Bot WhatsApp détecte le restaurant démo
3. ✅ Menu complet fonctionnel (identique à OCV)
4. ✅ Commande de test sans impact sur la prod
5. ✅ Badge "[DEMO]" visible sur tous les produits

### **Avantages**

- ✅ Menu complet et réaliste (basé sur OCV)
- ✅ Aucun risque sur les données clients réelles
- ✅ Numéro fictif facilement identifiable (010101010)
- ✅ Workflow de commande identique à la production
- ✅ Réutilisable pour tous les futurs prospects

---

## ✅ Prochaines étapes

1. Valider ce plan avec l'utilisateur
2. Créer le script SQL de duplication
3. Tester en DEV
4. Exécuter en PROD
5. Tester le QR code de démo
6. Créer l'affiche pour le restaurant démo

---

**Date de création** : 2025-10-19
**Restaurant source** : Le Nouveau O'CV Moissy (ID: 16)
**Restaurant cible** : Restaurant Démo (Téléphone: 010101010)
