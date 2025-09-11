# 📚 **DOCUMENTATION COMPLÈTE - TYPES DE WORKFLOW BOT RESTAURANT**

---

## **🎯 INTRODUCTION**

Ce document explique tous les types de produits et workflows disponibles dans le bot restaurant, avec leurs comportements et messages associés.

---

# **1. PRODUITS SIMPLES** 

## **📋 Configuration :**
```sql
product_type: 'simple'
workflow_type: null
requires_steps: false
steps_config: null
```

## **🔄 Comportement :**
- **Sélection** → **Ajout direct au panier**
- **Aucune étape intermédiaire**

## **💬 Messages affichés :**

### **Sélection produit :**
```
🍰 TIRAMISU - 4.50€
```

### **Confirmation ajout :**
```
✅ TIRAMISU ajouté au panier !
💰 4.50€

🛒 Tapez "00" pour voir votre commande
🍽️ Tapez "0" pour continuer vos achats
```

## **📝 Exemples d'usage :**
- Desserts (Tiramisu, Brownies)
- Boissons simples
- Snacks sans options

---

# **2. PRODUITS MODULAIRES**

## **📋 Configuration :**
```sql
product_type: 'modular'
workflow_type: 'modular_selection' (optionnel)
requires_steps: false
+ france_product_sizes (tailles)
+ france_product_options (options par groupe)
```

## **🔄 Comportement :**
- **Sélection** → **Choix taille** → **Choix options** → **Récap quantité** → **Panier**

## **💬 Messages affichés :**

### **1. Sélection produit :**
```
🌮 TACOS
📍 Pizza Yolo 77

━━━━━━━━━━━━━━━━━━━━━
🎯 TACOS

💰 Choisissez votre taille:
   🔸 MENU M (7 EUR) - Tapez 1
   🔸 MENU L (9 EUR) - Tapez 2
   🔸 MENU XL (11 EUR) - Tapez 3

💡 Choisissez votre option: tapez le numéro
```

### **2. Choix des options :**
```
🌮 TACOS MENU M - Étape 1/3

🥩 VIANDES (Choisissez 2 max)

1️⃣ Poulet
2️⃣ Bœuf haché
3️⃣ Merguez
4️⃣ Mixte

💡 Tapez les numéros de votre choix (ex: 1,2)
```

### **3. Récapitulatif final :**
```
📝 *RÉCAPITULATIF TACOS*

🔸 Taille: MENU M
🥩 Viandes: Poulet, Bœuf haché  
🌶️ Sauces: Harissa, Blanche

💰 Prix unitaire: 7€

📝 Ex: 1 pour 1 produit, 1,1 pour 2 fois le même produit
```

## **📝 Exemples d'usage :**
- TACOS (tailles M/L/XL + viandes + sauces)
- Produits avec variations de prix selon taille

---

# **3. PRODUITS COMPOSITES**

## **📋 Configuration :**
```sql
product_type: 'composite'
workflow_type: 'composite_workflow'
requires_steps: true
steps_config: {...}
+ france_product_options (groupes d'options)
```

## **🔄 Comportement :**
- **Sélection** → **Étapes configurées** → **Récap professionnel** → **Boutons d'action**

## **💬 Messages affichés :**

### **1. Sélection produit + Étapes :**
```
📋 *POULET* - Étape 1/1

📋 *BOISSON 33CL INCLUSE*

1️⃣ 🥤 7 UP
2️⃣ 🍒 7UP CHERRY
3️⃣ 🌴 7UP TROPICAL
4️⃣ 🥤 COCA COLA
5️⃣ ⚫ COCA ZERO
6️⃣ 💧 EAU MINÉRALE
7️⃣ 🧊 ICE TEA
8️⃣ 🍓 MIRANDA FRAISE
9️⃣ 🏝️ MIRANDA TROPICAL
🔟 🌺 OASIS TROPICAL
1️⃣1️⃣ 💎 PERRIER
1️⃣2️⃣ 🍊 TROPICO

💡 Tapez le numéro de votre choix
```

### **2. Récapitulatif professionnel :**
```
✅ *POULET configuré avec succès !*

🍽 *POULET (5.5 EUR)*
• Boisson 33CL incluse: 7 UP

*Que souhaitez-vous faire ?*
1 Ajouter au panier
2 Recommencer
0 Retour menu
```

### **3. Actions utilisateur :**
- **Tapez "1"** → Ajout au panier avec quantité
- **Tapez "2"** → Recommencer la configuration  
- **Tapez "0"** → Retour au menu

## **📝 Exemples d'usage :**
- PANINI (avec boisson incluse)
- Produits avec workflow personnalisé
- Produits nécessitant un récap structuré

---

# **4. MENU PIZZA SPÉCIAL**

## **📋 Configuration :**
```sql
product_type: varies
workflow_type: 'menu_pizza_selection'
requires_steps: true
```

## **🔄 Comportement :**
- **Sélection** → **Workflow pizza spécialisé** → **Suppléments** → **Récap**

## **💬 Messages affichés :**
```
🍕 Menu Pizza - Configuration

[Messages spécifiques au workflow pizza]
```

## **📝 Exemples d'usage :**
- Menu Pizza avec suppléments spéciaux
- Workflow pizza personnalisé

---

# **5. PRODUITS AVEC VARIANTES**

## **📋 Configuration :**
```sql
product_type: varies
workflow_type: null
requires_steps: false
+ france_product_variants (variantes)
```

## **🔄 Comportement :**
- **Sélection** → **Choix variante** → **Ajout panier**

## **💬 Messages affichés :**
```
🍕 PIZZA MARGHERITA

Choisissez votre taille:
1️⃣ Petite (8€)
2️⃣ Moyenne (12€) 
3️⃣ Grande (16€)

💡 Tapez le numéro de votre choix
```

## **📝 Exemples d'usage :**
- Pizzas avec tailles différentes
- Produits avec déclinaisons simples

---

# **📊 TABLEAU RÉCAPITULATIF**

| **Type** | **Étapes** | **Format Récap** | **Boutons** | **Usage Principal** |
|----------|------------|------------------|-------------|-------------------|
| **Simple** | 0 | Ajout direct | Panier/Menu | Desserts, boissons |
| **Modular** | Variables | Récap quantité | Quantité | TACOS multi-étapes |
| **Composite** | Configurées | Récap professionnel | 1/2/0 | PANINI avec options |
| **Menu Pizza** | Spécialisées | Format pizza | Spéciaux | Menus pizza |
| **Variantes** | 1 | Simple | Basiques | Pizzas tailles |

---

# **🎯 RECOMMANDATIONS D'USAGE**

## **✅ Utilisez COMPOSITE pour :**
- Produits avec options incluses (boissons, sauces)
- Workflow nécessitant un récap professionnel
- Interface avec boutons d'action clairs

## **✅ Utilisez MODULAR pour :**
- Produits avec tailles ET options multiples
- Workflows complexes multi-étapes
- Prix variables selon les choix

## **✅ Utilisez SIMPLE pour :**
- Produits sans options
- Ajout rapide au panier
- Desserts et boissons de base

---

**📝 Cette documentation couvre tous les types de workflow disponibles dans le bot restaurant. Chaque type a ses avantages selon le cas d'usage spécifique.**