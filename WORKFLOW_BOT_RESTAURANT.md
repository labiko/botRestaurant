# 🤖 WORKFLOWS DÉTAILLÉS - Bot Restaurant WhatsApp
## Scénarios Complets d'Utilisation

---

## 🎯 RÈGLES UX UNIVERSELLES

1. **Réponses toujours numérotées** (ex. 1,1,3)
2. **Quantité = répéter le numéro** (1,1,1 = 3× le plat #1)
3. **Récapitulatif obligatoire** avant chaque validation
4. **Si NON au récap** → proposer : 1) Supprimer 2) Ajouter 3) Tout annuler
5. **"annuler" ❌ à tout moment** → retour Accueil
6. **Pagination des listes longues** : 5 éléments/page + mot-clé "suivant"

---

## 📋 WORKFLOW A — ACCUEIL & CHOIX DU RESTAURANT

### A1. Démarrage de la conversation

**Client tape:** `resto`

**Bot répond:**
```
🍽️ Bienvenue chez Bot Resto Conakry!

Comment souhaitez-vous trouver votre restaurant?

1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴
⭐ Restaurant Le Damier (si favori existe)

Répondez avec le numéro de votre choix.
```

### A2. Option 1 - Restos près de vous 📍

**Client répond:** `1`

**Bot demande:**
```
📍 Pour voir les restaurants proches, partagez votre position WhatsApp.

Cliquez sur 📎 → Position → Position actuelle
```

**Client partage sa position**

**Bot calcule les distances et affiche:**
```
📍 Restaurants proches de vous:

1️⃣ Le Petit Bistro (0.5 km) - Ouvert ✅
2️⃣ Chez Mariama (1.2 km) - Ouvert ✅
3️⃣ Restaurant Le Damier (2.0 km) - Ouvert ✅
4️⃣ La Terrasse (3.1 km) - Fermé 🔴
5️⃣ Le Bambou (4.5 km) - Ouvert ✅

Tapez le numéro du restaurant souhaité.
Tapez 'suivant' pour voir plus de restaurants.
```

### A3. Option 2 - Tous les restos 🍴

**Client répond:** `2`

**Bot affiche:**
```
🍴 Nos restaurants partenaires (Page 1/3):

1️⃣ Restaurant Le Damier
2️⃣ Le Petit Bistro
3️⃣ Chez Mariama
4️⃣ La Terrasse
5️⃣ Le Bambou

Tapez le numéro du restaurant souhaité.
Tapez 'suivant' pour la page suivante.
```

### A4. Option ⭐ - Restaurant Favori

**Client sélectionne le favori**

**Bot répond:**
```
⭐ Accès rapide à votre restaurant favori!

📍 Restaurant Le Damier
🕒 Ouvert jusqu'à 22h00
⏱️ Temps d'attente actuel: ~15 min

Chargement du menu...
```

---

## 🛒 WORKFLOW B — CONSTRUCTION DU PANIER

### B1. Affichage du menu

**Après sélection du restaurant:**
```
📋 Menu du jour - Restaurant Le Damier

🥗 ENTRÉES
1️⃣ Salade César - 35,000 GNF
2️⃣ Avocat aux crevettes - 45,000 GNF

🍖 PLATS PRINCIPAUX
3️⃣ Poulet Yassa - 65,000 GNF
4️⃣ Poisson Braisé - 75,000 GNF
5️⃣ Riz Gras - 55,000 GNF

Tapez 'suivant' pour desserts et boissons

💡 Pour commander: envoyez les numéros
Ex: 1,3,3 = 1 salade + 2 poulets
```

### B2. Client compose sa commande

**Client tape:** `1,3,3,5`

**Bot interprète et calcule:**
- 1× Salade César (35,000)
- 2× Poulet Yassa (130,000)
- 1× Riz Gras (55,000)

### B3. Récapitulatif obligatoire

**Bot affiche:**
```
🛒 Votre panier:

• 1× Salade César - 35,000 GNF
• 2× Poulet Yassa - 130,000 GNF
• 1× Riz Gras - 55,000 GNF

────────────────────
💰 Sous-total: 220,000 GNF

✅ Confirmer cette commande? (OUI/NON)
```

### B4. Si le client dit NON

**Client tape:** `NON`

**Bot propose:**
```
Que souhaitez-vous faire?

1️⃣ Supprimer un article
2️⃣ Ajouter d'autres articles
3️⃣ Tout annuler et recommencer

Répondez avec votre choix.
```

#### B4.1 Supprimer un article

**Client tape:** `1`

**Bot affiche:**
```
Quel article supprimer?

1️⃣ Salade César (1×)
2️⃣ Poulet Yassa (2×)
3️⃣ Riz Gras (1×)

Tapez le numéro de l'article à retirer.
```

#### B4.2 Ajouter des articles

**Client tape:** `2`

**Bot réaffiche le menu et permet d'ajouter**

### B5. Confirmation finale

**Client tape:** `OUI`

**Bot passe au choix du mode**

---

## 📦 WORKFLOW C — CHOIX DU MODE

### C0. Question initiale

**Après confirmation du panier:**
```
📦 Comment souhaitez-vous récupérer votre commande?

1️⃣ Sur place 🍽️ (manger au restaurant)
2️⃣ À emporter 📦 (récupérer et partir)
3️⃣ Livraison 🛵 (recevoir chez vous)

Répondez avec votre choix.
```

---

## 🍽️ WORKFLOW C1 — SUR PLACE

### C1.1 Choix du paiement

**Client tape:** `1`

**Bot répond:**
```
🍽️ Commande sur place confirmée!

💳 Quand souhaitez-vous payer?

1️⃣ Maintenant (Orange Money/Wave)
2️⃣ À la fin du repas (sur place)

Répondez avec votre choix.
```

### C1.2a Si paiement maintenant

**Client tape:** `1`

**Bot affiche:**
```
💳 Choisissez votre méthode de paiement:

1️⃣ Orange Money
2️⃣ Wave

Total à payer: 220,000 GNF
```

[Workflow paiement mobile...]

### C1.2b Si paiement fin du repas

**Client tape:** `2`

**Bot confirme:**
```
✅ Commande #2024-001 confirmée!

📍 Restaurant Le Damier
📱 Montrez ce numéro à l'accueil
⏱️ Table prête dans ~10-15 minutes
💰 À payer sur place: 220,000 GNF

Nous vous attendons!

Tapez 'annuler' si vous devez modifier.
```

---

## 📦 WORKFLOW C2 — À EMPORTER

### C2.1 Choix du paiement

**Client tape:** `2`

**Bot répond:**
```
📦 Commande à emporter confirmée!

💳 Quand souhaitez-vous payer?

1️⃣ Maintenant (Orange Money/Wave)
2️⃣ À la récupération (au restaurant)

Répondez avec votre choix.
```

### C2.2 Confirmation

**Bot affiche:**
```
✅ Commande #2024-002 confirmée!

📍 À récupérer: Restaurant Le Damier
📍 Adresse: Quartier Taouyah, Conakry
⏱️ Prête dans ~20-25 minutes
💰 Total à payer: 220,000 GNF

📲 Nous vous enverrons un message quand c'est prêt!

Tapez 'annuler' si vous devez modifier.
```

### C2.3 Notification quand prêt

**20 minutes plus tard:**
```
🔔 Votre commande #2024-002 est prête!

📍 Restaurant Le Damier
📦 À récupérer au comptoir
💰 Montant: 220,000 GNF (si pas encore payé)

Merci de venir la chercher rapidement 🙏
```

---

## 🛵 WORKFLOW C3 — LIVRAISON

### C3.1 Demande de position

**Client tape:** `3`

**Bot demande:**
```
🛵 Pour calculer les frais de livraison, partagez votre position.

Cliquez sur 📎 → Position → Position actuelle

Ou tapez votre adresse complète.
```

### C3.2 Client partage sa position

**Bot vérifie et calcule:**

#### Cas 1: Commande sous le minimum

```
⚠️ Désolé, le minimum pour livraison est 25,000 GNF
Votre panier: 20,000 GNF

Que souhaitez-vous faire?

1️⃣ Ajouter des articles (5,000 GNF minimum)
2️⃣ Choisir 'À emporter' à la place
3️⃣ Annuler la commande

Répondez avec votre choix.
```

#### Cas 2: Distance trop élevée

```
⚠️ Désolé, votre adresse est hors zone de livraison.
Distance: 12 km (maximum: 10 km)

Que souhaitez-vous faire?

1️⃣ Choisir 'À emporter' à la place
2️⃣ Choisir un autre restaurant plus proche
3️⃣ Annuler la commande

Répondez avec votre choix.
```

#### Cas 3: Livraison gratuite (commande > seuil)

```
📍 Adresse de livraison confirmée
📌 Kipé, Ratoma, Conakry (3.2 km)

🛒 Sous-total: 220,000 GNF
🎉 Livraison: GRATUITE! ✅
   (commande supérieure à 100,000 GNF)
────────────────────
💰 Total final: 220,000 GNF

✅ Confirmer cette livraison? (OUI/NON)
```

#### Cas 4: Livraison payante

```
📍 Adresse de livraison confirmée
📌 Cosa, Ratoma, Conakry (5 km)

🛒 Sous-total: 85,000 GNF
🚚 Frais de livraison: 15,000 GNF
   (5 km × 3,000 GNF/km)
────────────────────
💰 Total final: 100,000 GNF

✅ Confirmer cette livraison? (OUI/NON)
```

### C3.3 Choix du paiement

**Client tape:** `OUI`

**Bot demande:**
```
💳 Mode de paiement pour la livraison:

1️⃣ Payer maintenant (Orange Money/Wave)
2️⃣ Payer à la livraison (cash)

Total à payer: 100,000 GNF

Répondez avec votre choix.
```

### C3.4 Confirmation finale

```
✅ Commande #2024-003 confirmée!

🛵 LIVRAISON EN COURS
📍 Adresse: Cosa, Ratoma, Conakry
⏱️ Arrivée estimée: 30-40 minutes
👤 Livreur: Attribution en cours...

📲 Nous vous contacterons à l'approche!

Tapez 'suivi' pour voir le statut.
Tapez 'annuler' si urgent (5 min max).
```

### C3.5 Mises à jour de statut

**15 minutes plus tard:**
```
🔔 Mise à jour commande #2024-003

👨‍🍳 En préparation dans la cuisine
👤 Livreur assigné: Mamadou B.
📱 Contact livreur: 625-XX-XX-XX

⏱️ Départ prévu dans ~10 minutes
```

**30 minutes plus tard:**
```
🔔 Votre livreur est en route! 🛵

👤 Mamadou B. arrive dans ~10 minutes
📱 Il vous contactera à l'arrivée

💰 Montant à payer: 100,000 GNF (si cash)

Merci de préparer l'appoint si possible 🙏
```

---

## ⭐ WORKFLOW D — SYSTÈME DE FAVORIS

### D1. Proposition après première commande réussie

**Après confirmation de livraison/récupération:**
```
⭐ Souhaitez-vous enregistrer Restaurant Le Damier comme favori?

Vous pourrez y accéder plus rapidement la prochaine fois!

Répondez OUI ou NON
```

### D2. Si client accepte

**Client tape:** `OUI`

**Bot confirme:**
```
⭐ Restaurant Le Damier enregistré comme favori!

La prochaine fois, tapez simplement 'resto' et vous verrez l'option ⭐ en premier.

Merci pour votre commande! 
Bon appétit! 🍽️
```

### D3. Prochaine utilisation avec favori

**Client tape:** `resto`

**Bot affiche:**
```
🍽️ Bon retour chez Bot Resto!

⭐ Restaurant Le Damier (Favori) - Accès rapide
1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴

Répondez avec votre choix.
```

---

## ❌ WORKFLOW E — ANNULATION

### E1. Annulation à tout moment

**Client tape:** `annuler` (à n'importe quel moment)

**Bot répond:**
```
❌ Commande annulée.

Que souhaitez-vous faire?

1️⃣ Recommencer avec un autre restaurant
2️⃣ Quitter

Répondez avec votre choix.
```

### E2. Annulation après confirmation (délai de grâce)

**Si dans les 5 minutes après confirmation:**
```
✅ Commande #2024-003 annulée avec succès.

Aucun frais ne sera prélevé.

Que souhaitez-vous faire?

1️⃣ Nouvelle commande
2️⃣ Quitter

Répondez avec votre choix.
```

**Si après 5 minutes:**
```
⚠️ Désolé, votre commande est déjà en préparation.

Pour annuler, contactez directement le restaurant:
📱 Restaurant Le Damier: 625-XX-XX-XX

Numéro commande: #2024-003
```

---

## 🔴 WORKFLOW F — GESTION DES ERREURS

### F1. Restaurant fermé

**Si client choisit un restaurant fermé:**
```
🔴 Désolé, Restaurant La Terrasse est actuellement fermé.

🕒 Horaires d'ouverture:
Lun-Ven: 11h00 - 22h00
Sam-Dim: 12h00 - 23h00

Voulez-vous:

1️⃣ Voir d'autres restaurants ouverts
2️⃣ Programmer une commande pour plus tard
3️⃣ Quitter

Répondez avec votre choix.
```

### F2. Rupture de stock

**Si un plat n'est plus disponible:**
```
⚠️ Désolé, "Poisson Braisé" n'est plus disponible.

Alternatives suggérées:
1️⃣ Poulet Braisé - 65,000 GNF
2️⃣ Crevettes Grillées - 85,000 GNF
3️⃣ Retirer de la commande

Répondez avec votre choix.
```

### F3. Problème de paiement

**Si échec du paiement mobile:**
```
❌ Échec du paiement Orange Money.

Que souhaitez-vous faire?

1️⃣ Réessayer avec Orange Money
2️⃣ Essayer avec Wave
3️⃣ Payer à la livraison/récupération
4️⃣ Annuler la commande

Répondez avec votre choix.
```

### F4. Timeout d'inactivité

**Après 5 minutes sans réponse:**
```
⏰ Êtes-vous toujours là?

Votre session va expirer dans 2 minutes.
Tapez un numéro pour continuer ou 'annuler' pour quitter.
```

**Après 7 minutes (expiration):**
```
⏰ Session expirée pour inactivité.

Votre panier a été sauvegardé.
Tapez 'resto' pour reprendre votre commande.

À bientôt! 👋
```

---

## 📊 WORKFLOW G — SUIVI DE COMMANDE

### G1. Demande de statut

**Client tape:** `suivi`

**Bot répond selon le statut:**

**Statut: En attente**
```
📋 Commande #2024-003

⏳ En attente de confirmation du restaurant
⏱️ Réponse attendue dans ~2 minutes

Patientez...
```

**Statut: En préparation**
```
📋 Commande #2024-003

👨‍🍳 En préparation dans la cuisine
⏱️ Prête dans ~15 minutes
📍 Restaurant Le Damier

Tout se passe bien! 
```

**Statut: En livraison**
```
📋 Commande #2024-003

🛵 En cours de livraison
👤 Livreur: Mamadou B.
📱 Contact: 625-XX-XX-XX
⏱️ Arrivée dans ~10 minutes
📍 Destination: Cosa, Ratoma

Le livreur vous contactera à l'arrivée.
```

---

## 💬 EXEMPLES DE CONVERSATIONS COMPLÈTES

### Exemple 1: Commande simple avec livraison gratuite

```
Client: resto
Bot: [Menu accueil avec options]

Client: 1
Bot: [Demande position]

Client: [Partage position]
Bot: [Liste 5 restos proches]

Client: 2
Bot: [Menu de Chez Mariama]

Client: 1,1,3,3,5
Bot: [Récap panier 155,000 GNF]

Client: oui
Bot: [Choix du mode]

Client: 3
Bot: [Demande position livraison]

Client: [Partage position]
Bot: [Livraison gratuite car > 100,000]

Client: oui
Bot: [Choix paiement]

Client: 2
Bot: [Confirmation finale avec détails livraison]
```

### Exemple 2: Utilisation du favori et modification panier

```
Client: resto
Bot: [Menu avec ⭐ favori en premier]

Client: ⭐
Bot: [Accès direct menu favori]

Client: 2,4,4
Bot: [Récap panier]

Client: non
Bot: [Options modification]

Client: 1
Bot: [Liste articles à supprimer]

Client: 2
Bot: [Nouveau récap sans 1 poulet]

Client: oui
Bot: [Suite du workflow...]
```

---

## 📱 FORMATS DE MESSAGES

### Messages avec emojis structurés
- Titre: Emoji + Texte
- Sections: Emoji de catégorie
- Actions: Numéro emoji (1️⃣ 2️⃣ 3️⃣)
- Statuts: ✅ ⏳ 🔴 ⚠️
- Montants: 💰
- Séparateurs: ─────────

### Structure type d'un message
```
[EMOJI TITRE] Titre principal

[EMOJI SECTION] Section
• Point 1
• Point 2

────────────
[EMOJI TOTAL] Information importante

[EMOJI ACTION] Question ou action
```

---

## 🔄 BOUCLES DE RÉTROACTION

1. **Après chaque étape critique:**
   - Confirmation explicite requise
   - Possibilité de revenir en arrière

2. **Points de non-retour:**
   - Après 5 minutes de confirmation commande
   - Après attribution du livreur
   - Après début de préparation cuisine

3. **Sauvegardes automatiques:**
   - Panier sauvegardé 30 minutes
   - Favoris permanents
   - Historique commandes conservé

---

## ✅ CHECKLIST VALIDATION UX

- [ ] Tous les messages sont numérotés
- [ ] Les récaps sont clairs et complets
- [ ] "Annuler" fonctionne partout
- [ ] Pagination à 5 éléments max
- [ ] Messages d'erreur informatifs
- [ ] Confirmations avant actions critiques
- [ ] Temps estimés réalistes
- [ ] Montants toujours visibles
- [ ] Contact restaurant/livreur fourni
- [ ] Statuts mis à jour en temps réel