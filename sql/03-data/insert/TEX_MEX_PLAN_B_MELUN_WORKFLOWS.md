# TEX MEX - Plan B Melun - Workflows par produit

## ✅ TYPE 1 : PRODUITS SIMPLES (6 produits) - product_type: 'simple'

**Pas de workflow - Ajout direct au panier**

1. **PETITE FRITES** - 2.30€
   - Composition : "Accompagnées de sauce maison."
   - Workflow : AUCUN

2. **GRANDE FRITES** - 3.00€
   - Composition : "Accompagnées de sauce maison."
   - Workflow : AUCUN

3. **FRITES CHEDDAR BACON L** - 4.00€
   - Composition : ""
   - Workflow : AUCUN

4. **FRITES CHEDDAR BACON XL** - 6.50€
   - Composition : ""
   - Workflow : AUCUN

5. **BAMBINO TEX MEX** - 5.50€
   - Composition : "4 Nuggets ou 4 mozza sticks + Frites + 1 kinder surprise + 1 Caprisun."
   - Workflow : AUCUN

6. **BAMBINO CHEESE** - 5.50€
   - Composition : "1 Cheese burger + Frites + 1 kinder surprise + 1 Caprisun."
   - Workflow : AUCUN

---

## ✅ TYPE 2 : PRODUITS 1 STEP SAUCE (14 produits) - product_type: 'composite'

**Workflow identique pour tous :**
- **Step 1** : "votre sauce" - Option_group: "Sauce" - Required: true - Max: 1
- **14 sauces** : ANDALOUSE, CHILI THAI, BIGGY BURGER, MOUTARDE, CURRY, FISH TO FISH, ALGERIENNE, MAYONNAISE, HARISSA, KETCHUP, BARBECUE, BLANCHE, SAMOURAI, POIVRE

### **À 5.00€ :**

7. **4 TENDERS** - 5.00€
   - Composition : "4 Pièces."

8. **4 CHICKEN WINGS** - 5.00€
   - Composition : "4 Pièces."

9. **4 NUGGETS** - 5.00€
   - Composition : "4 Pièces."

10. **4 MOZZA STICKS** - 5.00€
    - Composition : ""

11. **DUO MIXTE 4PCS** - 5.00€
    - Composition : "4 Pièces mixte."

12. **4 JALAPENOS** - 5.00€
    - Composition : "4 Pièces."

13. **4 ONION RINGS** - 5.00€
    - Composition : "4 Pièces."

14. **4 BOUCHEES CAMEMBERT** - 5.00€
    - Composition : "4 Pièces."

### **À 8.50€ :**

15. **8 TENDERS** - 8.50€
    - Composition : "8 Pièces."

16. **8 CHICKEN WINGS** - 8.50€
    - Composition : "8 Pièces."

17. **8 NUGGETS** - 8.50€
    - Composition : "8 Pièces."

18. **8 MOZZA STICKS** - 8.50€
    - Composition : ""

19. **8 JALAPENOS** - 8.50€
    - Composition : ""

20. **8 BOUCHEES CAMEMBERT** - 8.50€
    - Composition : "8 Pièces."

---

## ✅ TYPE 3A : DUO MIXTE 8PCS (8.50€) - 1 STEP - product_type: 'composite'

**Workflow :**
- **Step 1** : "vos 2 tex mex" - Option_group: "Tex Mex" - Required: true - Max: 2
- **4 options** :
  - 4 MOZZARELLA STICKS (0€)
  - 4 NUGGETS (0€)
  - 4 CHICKEN WINGS (0€)
  - 4 TENDERS (0€)

21. **DUO MIXTE 8PCS** - 8.50€
    - Composition : "8 Pièces mixte."
    - Workflow : 1 step (choix 2 tex mex parmi 4)

---

## ✅ TYPE 3B : DUO MIXTE 8PCS MENU (11.20€) - 2 STEPS - product_type: 'composite'

**Workflow :**
- **Step 1** : "vos 2 tex mex" - Option_group: "Tex Mex" - Required: true - Max: 2
  - 4 MOZZARELLA STICKS (0€)
  - 4 NUGGETS (0€)
  - 4 CHICKEN WINGS (0€)
  - 4 TENDERS (0€)
- **Step 2** : "votre boisson 33cl" - Option_group: "Boisson 33cl" - Required: true - Max: 1
  - COCA COLA 33CL (0€)
  - ICE TEA 33CL (0€)
  - PERRIER 33CL (0€)
  - COCA COLA ZERO 33CL (0€)
  - OASIS 33CL (0€)

22. **MENU DUO MIXTE 8PCS** - 11.20€
    - Composition : "8 Pièces mixte + Frites + 1 Boisson 33cl au choix."
    - Workflow : 2 steps (2 tex mex + boisson)
    Required: true - Max: 1
  - COCA COLA 33CL (0€)
  - ICE TEA 33CL (0€)
  - PERRIER 33CL (0€)
  - COCA COLA ZERO 33CL (0€)
  - OASIS 33CL (0€)
---

## ✅ TYPE 3C : MENU 8 ONION RINGS (11.20€) - 2 STEPS - product_type: 'composite'

**Workflow :**
- **Step 1** : "votre sauce" - Option_group: "Sauce" - Required: true - Max: 1
  - 14 sauces (0€)
- **Step 2** : "votre boisson 33cl" - Option_group: "Boisson 33cl" - Required: true - Max: 1
  - 12 boissons (0€) : COCA COLA 33CL, COCA COLA ZERO 33CL, COCA COLA CHERRY 33CL, FANTA ORANGE 33CL, FANTA EXOTIQUE 33CL, ICE TEA 33CL, OASIS 33CL, 7 UP MOJITO 33CL, PERRIER 33CL, TROPICO 33CL, SPRITE 33CL, EAU 33CL

23. **MENU 8 ONION RINGS** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."
    - Workflow : 2 steps (sauce + boisson)

---

## ✅ TYPE 4 : MENUS 3 STEPS (6 produits à 11.20€) - product_type: 'composite'

**Workflow identique pour tous :**
- **Step 1** : "votre accompagnement" - Option_group: "Accompagnement" - Required: true - Max: 1
  - FRITES (0€)
  - FRITES CHEDDAR BACON (+2.50€)
- **Step 2** : "votre sauce" - Option_group: "Sauce" - Required: true - Max: 1
  - 14 sauces (0€)
- **Step 3** : "votre boisson 33cl" - Option_group: "Boisson 33cl" - Required: true - Max: 1
  - 12 boissons (0€)

24. **MENU 8 TENDERS** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."
  -ACCOMPAGNEMENT (FRITES),FRITES CHEDDAR BACON ( 2.5€ )
   - 12 boissons (0€)
    - 14 sauces (0€)- Max: 1
25. **MENU 8 JALAPENOS** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."
    -ACCOMPAGNEMENT (FRITES),FRITES CHEDDAR BACON ( 2.5€ )
   - 12 boissons (0€)
    - 14 sauces (0€)- Max: 1

26. **MENU 8 CHICKEN WINGS** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."

27. **MENU 8 NUGGETS** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."
33cl" - Required: true - Max: 1
  - 12 boissons (0€)
    - 14 sauces (0€)- Max: 1

28. **MENU 8 BOUCHEES CAMEMBERT** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."
33cl" - Required: true - Max: 1
  - 12 boissons (0€)
    - 14 sauces (0€)- Max: 1

29. **MENU 8 MOZZA STICKS** - 11.20€
    - Composition : "8 Pièces + Frites + 1 Boisson 33cl au choix."
33cl" - Required: true - Max: 1
  - 12 boissons (0€)
    - 14 sauces (0€)- Max: 1

---

## 📊 RÉSUMÉ

**Total produits : 29**

**Par type :**
- TYPE 1 : 6 produits simples (sans workflow)
- TYPE 2 : 14 produits avec 1 step sauce
- TYPE 3A : 1 produit avec 1 step (2 tex mex)
- TYPE 3B : 1 produit avec 2 steps (2 tex mex + boisson)
- TYPE 3C : 1 produit avec 2 steps (sauce + boisson)
- TYPE 4 : 6 produits avec 3 steps (accompagnement + sauce + boisson)

**Total options estimé : ~334**
- 196 sauces (14 produits × 14 sauces)
- 8 tex mex (2 produits × 4 options)
- 5 boissons DUO MIXTE 11.20€
- 26 options MENU ONION RINGS (14 + 12)
- 168 options menus 3 steps (6 produits × 28 options)

---

## ⚠️ POINTS À VALIDER

1. **MENU DUO MIXTE 8PCS** : Le nom doit-il être différent du "DUO MIXTE 8PCS" (8.50€) pour éviter la confusion ?
   - Suggestion : "MENU DUO MIXTE 8PCS" ou garder tel quel ?

2. **BOISSONS DUO MIXTE 11.20€** : Seulement 5 boissons (pas les 12 standard) - confirmé ?

3. **Prix livraison** : Toujours identiques aux prix sur place (Plan B Melun) ?
