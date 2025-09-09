# 🍕 SCÉNARIOS D'UTILISATION DES MENUS PIZZA

## 📋 SCÉNARIO 1 : MENU 1 (3 PIZZAS JUNIORS - 25€)

**Client:** Tape "4" (sélectionne Menu Pizza)

**Bot:** 
```
📋 MENU PIZZA

1. 📋 MENU 1 - 3 pizzas Junior - 25€
2. 📋 MENU 2 - 2 pizzas Sénior + 1 boisson 1.5L - 25€
3. 📋 MENU 3 - 1 pizza Mega + nuggets/wings + boisson - 32€
4. 📋 MENU 4 - 1 pizza Sénior + 2 boissons + wings/nuggets - 22€

Tapez le numéro de votre choix
```

**Client:** Tape "1"

**Bot:** 
```
🍕 MENU 1 - Choisissez 3 pizzas JUNIOR
Prix du menu: 25€

PIZZAS DISPONIBLES (Taille Junior):
1. 🍕 CLASSICA - 8€
2. 🍕 REINE - 9€
3. 🍕 DIVA - 9€
4. 🍕 NAPOLITAINE - 8€
5. 🍕 TONINO - 10€
6. 🌶️ ORIENTALE - 10€
7. 🦐 FRUITS DE MER - 12€
8. 🥬 VÉGÉTARIENNE - 9€
9. 🍕 CAMPIONE - 10€
10. 🍕 4 SAISONS - 10€
11. 👑 ROYALE - 11€
12. 🗽 NEW YORK - 11€
13. 🌴 MIAMI - 10€
14. 🍖 BARBECUE - 11€
15. 🐔 CHICKEN - 11€
16. 🧀 4 FROMAGES - 10€
17. 🌺 FLORIDA - 10€
18. 🍍 HAWAIENNE - 9€
19. 🎰 NEVADA - 11€
20. 🌮 MEXICO - 11€

📝 Tapez les 3 numéros séparés par des virgules
Ex: 1,2,5 pour CLASSICA, REINE et TONINO
```

**Client:** Tape "2,6,15"

**Bot:**
```
✅ MENU 1 - Confirmation

Vous avez choisi:
• Pizza 1: REINE (Junior)
• Pizza 2: ORIENTALE (Junior)  
• Pizza 3: CHICKEN (Junior)

Prix total du menu: 25€
(au lieu de 30€ si achetées séparément)

Confirmer l'ajout au panier?
1. ✅ Oui, ajouter au panier
2. ❌ Non, choisir d'autres pizzas
```

**Client:** Tape "1"

**Bot:**
```
✅ MENU 1 ajouté au panier!

Que voulez-vous faire?
1. Continuer mes achats
2. Voir le panier (99)
3. Vider le panier (00)
```

---

## 📋 SCÉNARIO 2 : MENU 2 (2 PIZZAS SÉNIOR + 1 BOISSON 1.5L - 25€)

**Client:** Tape "2"

**Bot:**
```
🍕 MENU 2 - Étape 1/2
Choisissez 2 pizzas SÉNIOR

PIZZAS DISPONIBLES (Taille Sénior):
1. 🍕 CLASSICA - 11€
2. 🍕 REINE - 12€
3. 🍕 DIVA - 12€
4. 🍕 NAPOLITAINE - 11€
5. 🍕 TONINO - 13€
6. 🌶️ ORIENTALE - 13€
7. 🦐 FRUITS DE MER - 15€
8. 🥬 VÉGÉTARIENNE - 12€
9. 🍕 CAMPIONE - 13€
10. 🍕 4 SAISONS - 13€
[Liste complète des 33 pizzas...]

📝 Tapez les 2 numéros séparés par des virgules
Ex: 1,8 pour CLASSICA et VÉGÉTARIENNE
```

**Client:** Tape "8,16"

**Bot:**
```
✅ Pizzas sélectionnées:
• VÉGÉTARIENNE (Sénior)
• 4 FROMAGES (Sénior)

🥤 MENU 2 - Étape 2/2
Choisissez votre boisson 1.5L:

1. 🥤 COCA COLA 1.5L
2. ⚫ COCA ZERO 1.5L
3. 🧡 FANTA 1.5L
4. 🍊 OASIS 1.5L

Tapez le numéro de votre choix
```

**Client:** Tape "1"

**Bot:**
```
✅ MENU 2 - Confirmation

Votre menu:
• Pizza 1: VÉGÉTARIENNE (Sénior)
• Pizza 2: 4 FROMAGES (Sénior)
• Boisson: COCA COLA 1.5L

Prix total du menu: 25€
(au lieu de 29€ si achetés séparément)

Confirmer l'ajout au panier?
1. ✅ Oui, ajouter au panier
2. ❌ Non, recommencer
```

---

## 📋 SCÉNARIO 3 : MENU 3 (1 PIZZA MEGA + NUGGETS/WINGS + BOISSON - 32€)

**Client:** Tape "3"

**Bot:**
```
🍕 MENU 3 - Étape 1/3
Choisissez votre pizza MEGA

PIZZAS DISPONIBLES (Taille Mega):
1. 🍕 CLASSICA - 18€
2. 🍕 REINE - 19€
3. 🍕 DIVA - 19€
[...]
20. 🌮 MEXICO - 21€
[Liste complète des 33 pizzas...]

📝 Tapez le numéro de votre choix
```

**Client:** Tape "20"

**Bot:**
```
✅ Pizza sélectionnée: MEXICO (Mega)

🍗 MENU 3 - Étape 2/3
Choisissez votre accompagnement:

1. 🍗 14 NUGGETS
2. 🍗 12 WINGS

Tapez le numéro de votre choix
```

**Client:** Tape "2"

**Bot:**
```
✅ Pizza: MEXICO (Mega)
✅ Accompagnement: 12 WINGS

🥤 MENU 3 - Étape 3/3
Choisissez votre boisson 1.5L:

1. 🥤 COCA COLA 1.5L
2. ⚫ COCA ZERO 1.5L
3. 🧡 FANTA 1.5L
4. 🍊 OASIS 1.5L

Tapez le numéro de votre choix
```

**Client:** Tape "3"

**Bot:**
```
✅ MENU 3 - Confirmation

Votre menu:
• Pizza: MEXICO (Mega)
• Accompagnement: 12 WINGS
• Boisson: FANTA 1.5L

Prix total du menu: 32€
(au lieu de 38€ si achetés séparément)

Confirmer l'ajout au panier?
1. ✅ Oui, ajouter au panier
2. ❌ Non, recommencer
```

---

## 📋 SCÉNARIO 4 : MENU 4 (1 PIZZA SÉNIOR + 2 BOISSONS 33CL + WINGS/NUGGETS - 22€)

**Client:** Sélectionne MENU 4

**Bot:** (Après sélection taille unique)
```
🍕 MENU 4 - Choix de la pizza

Choisissez votre pizza SÉNIOR:
1. 🍕 CLASSICA
2. 🍕 REINE
[...]
33. 🍔 BIG BURGER
```

**Client:** Tape "33" (BIG BURGER)

**Bot:**
```
✅ Pizza: BIG BURGER

🥤 MENU 4 - Choix de la 1ère boisson

Choisissez votre 1ère boisson 33CL:
1. 🥤 COCA COLA
2. ⚫ COCA ZERO
3. 🍋 7UP
4. 🍒 7UP CHERRY
5. 🌴 7UP TROPICAL
6. 🍑 ICE TEA
7. 🍓 MIRANDA FRAISE
8. 🥭 MIRANDA TROPICAL
9. 🍊 OASIS TROPICAL
10. 💧 EAU MINÉRALE
11. 💎 PERRIER
12. 🌺 TROPICO
```

**Client:** Tape "1" (COCA COLA)

**Bot:**
```
✅ Pizza: BIG BURGER
✅ Boisson 1: COCA COLA

🥤 MENU 4 - Choix de la 2ème boisson

Choisissez votre 2ème boisson 33CL:
[même liste]
```

**Client:** Tape "6" (ICE TEA)

**Bot:**
```
✅ Pizza: BIG BURGER
✅ Boisson 1: COCA COLA
✅ Boisson 2: ICE TEA

🍗 MENU 4 - Choix de l'accompagnement

Choisissez votre accompagnement:
1. 🍗 6 WINGS
2. 🍗 8 NUGGETS
```

**Client:** Tape "2" (NUGGETS)

**Bot:**
```
✅ MENU 4 ajouté au panier!

📝 Récapitulatif:
- Pizza: BIG BURGER (Sénior)
- Boisson 1: COCA COLA 33CL
- Boisson 2: ICE TEA 33CL
- Accompagnement: 8 NUGGETS
Prix: 22€

Que voulez-vous faire?
1. Continuer mes achats
2. Voir le panier
3. Passer commande
```

---

## 🎯 POINTS CLÉS DU WORKFLOW

1. **Affichage direct** : Les menus s'affichent directement avec leur prix et composition
2. **Sélection multiple** : Pour les pizzas multiples, saisie en une fois (ex: "1,3,5")
3. **Prix individuels visibles** : Chaque pizza affiche son prix pour information
4. **Workflow étapes** : Pizzas → Boissons → Accompagnements (selon le menu)
5. **Confirmation finale** : Récapitulatif avec économie réalisée
6. **Prix fixe** : Le prix du menu ne change pas selon les choix
7. **Tailles forcées** : Junior/Sénior/Mega selon le menu choisi