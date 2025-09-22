# 🧪 COMMANDES DE TEST - MENU AI MODIFIER

## Commandes à tester sur l'environnement DEV

### ✅ Duplication de produits
```
Duplique L'AMERICAIN en MINI AMERICAIN à 8€
```

### ✅ Ajout de nouvelle boisson
```
Ajouter Coca Cherry 33CL - 2.50€ dans BOISSONS
```

### ✅ Modification de prix
```
Changer prix AMERICAIN de 13.50€ à 14€
```

### ✅ Duplication avec un autre nom
```
Duplique la PIZZA MARGHERITA en MINI MARGHERITA à 6€
```

## 📋 Checklist de tests

### Interface Web
- [ ] Page se charge correctement
- [ ] Sélecteur d'environnement fonctionne
- [ ] Boutons d'exemple remplissent le champ commande
- [ ] Interface responsive

### Analyse IA
- [ ] API analyze-command répond correctement
- [ ] IA génère du SQL valide
- [ ] Aperçu des modifications s'affiche
- [ ] Score de confiance calculé

### Exécution SQL
- [ ] Validation des commandes dangereuses
- [ ] Confirmation pour l'environnement PROD
- [ ] Exécution réussie sur DEV
- [ ] Message de succès affiché
- [ ] Logs enregistrés dans sql_execution_log

### Sécurité
- [ ] Commande DROP bloquée
- [ ] Commande TRUNCATE bloquée
- [ ] Commande DELETE bloquée
- [ ] Confirmation double pour PROD

## 🚀 Workflow de test recommandé

1. **Démarrer l'application**
   ```bash
   cd menu-ai-admin
   npm run dev
   ```

2. **Test environnement DEV**
   - Sélectionner "DÉVELOPPEMENT"
   - Tester chaque commande d'exemple
   - Vérifier le SQL généré
   - Exécuter et vérifier le succès

3. **Test sécurité**
   - Essayer une commande dangereuse : "DROP TABLE restaurants"
   - Vérifier que c'est bloqué

4. **Test environnement PROD**
   - Basculer sur "PRODUCTION"
   - Vérifier l'alerte visuelle
   - Tester une commande (ne pas exécuter)
   - Vérifier la confirmation double

## 📊 Résultats attendus

### Pour "Duplique L'AMERICAIN en MINI AMERICAIN à 8€"

**SQL généré :**
```sql
BEGIN;

INSERT INTO menu_items (
  name, description, product_type, price_on_site_base,
  price_delivery_base, workflow_type, requires_steps,
  steps_config, composition, display_order, category_id,
  restaurant_id
)
SELECT
  'MINI AMERICAIN' as name,
  description,
  product_type,
  8.00 as price_on_site_base,
  9.00 as price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config,
  composition,
  (SELECT COALESCE(MAX(display_order), 0) + 1 FROM menu_items WHERE category_id = 1) as display_order,
  category_id,
  restaurant_id
FROM menu_items
WHERE name = 'L''AMERICAIN' AND restaurant_id = 1;

COMMIT;
```

**Aperçu :**
- Action: Duplication du produit L'AMERICAIN
- Produit source: L'AMERICAIN - 13.50€
- Nouveau produit: MINI AMERICAIN - 8.00€
- Confiance: >90%

## ⚠️ Points d'attention

1. **Données template** : S'assurer que le fichier data.txt est bien chargé
2. **Clés API** : Vérifier que OpenAI et Supabase sont configurés
3. **Permissions** : S'assurer que la fonction execute_sql existe dans Supabase
4. **IDs corrects** : Vérifier que l'IA utilise les bons IDs de restaurant/catégorie