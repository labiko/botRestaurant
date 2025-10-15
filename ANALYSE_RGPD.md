# 🔒 ANALYSE RGPD - Bot Restaurant + Back Office

Date : 2025-10-15

## ✅ POINTS CONFORMES

### 1. **Sécurité technique**
- ✅ Mots de passe hashés (`password_hash` pour restaurants/livreurs)
- ✅ Supabase (hébergeur certifié RGPD - serveurs EU disponibles)
- ✅ Tokens sécurisés pour assignation livreurs
- ✅ Connexions HTTPS/chiffrées

### 2. **Minimisation des données**
- ✅ Collecte limitée aux données nécessaires au service
- ✅ Pas de collecte excessive d'informations personnelles

### 3. **Finalité claire**
- ✅ Données utilisées uniquement pour la gestion de commandes
- ✅ Pas de revente ou utilisation secondaire visible

---

## ❌ MANQUEMENTS CRITIQUES RGPD

### 1. **Absence de consentement explicite** ⚠️ CRITIQUE
**Problème** :
- Aucun mécanisme de consentement avant collecte de données
- Pas de case "J'accepte la politique de confidentialité"
- Client non informé de l'utilisation de ses données

**Article violé** : Article 6 RGPD (Base légale du traitement)

**Solution requise** :
```
Étape 1 du bot WhatsApp :
"Bienvenue ! En utilisant ce service, vous acceptez notre politique de confidentialité.
Vos données (nom, téléphone, adresse) seront utilisées uniquement pour traiter votre commande.
Tapez OUI pour accepter, NON pour refuser."
```

---

### 2. **Absence de politique de confidentialité** ⚠️ CRITIQUE
**Problème** :
- Aucune politique de confidentialité accessible
- Client ne sait pas :
  - Quelles données sont collectées
  - Combien de temps elles sont conservées
  - Qui y a accès
  - Comment exercer ses droits

**Article violé** : Article 13 RGPD (Information des personnes)

**Solution requise** :
- Créer une page `/politique-confidentialite` sur votre site vitrine
- Lien envoyé au client lors de la première interaction
- Contenu obligatoire :
  - Identité du responsable de traitement
  - Données collectées et finalités
  - Durée de conservation
  - Droits des personnes (accès, rectification, suppression)
  - Contact pour exercer les droits

---

### 3. **Absence des droits des personnes** ⚠️ CRITIQUE
**Problème** :
- Aucun mécanisme pour :
  - ❌ Accès aux données (Article 15)
  - ❌ Rectification (Article 16)
  - ❌ Suppression / Droit à l'oubli (Article 17)
  - ❌ Portabilité (Article 20)
  - ❌ Opposition au traitement (Article 21)

**Solution requise** :
Ajouter dans le bot WhatsApp :
```
Commandes spéciales :
- "mes données" → Voir toutes ses données
- "modifier mon nom" → Changer son nom
- "supprimer mes données" → Suppression complète
- "exporter mes données" → Recevoir fichier JSON
```

**Alternative** :
- Page web `/mes-donnees` avec formulaire
- Email dédié : `rgpd@votre-restaurant.fr`

---

### 4. **Conservation illimitée des données** ⚠️ MAJEUR
**Problème** :
- Données conservées indéfiniment
- Pas de suppression automatique des anciennes commandes

**Article violé** : Article 5(1)(e) RGPD (Limitation de la conservation)

**Solution requise** :
```sql
-- Politique recommandée :
- Commandes actives : conservation illimitée
- Commandes terminées : 3 ans (obligations comptables françaises)
- Commandes annulées : 1 an
- Après expiration : anonymisation ou suppression

-- Script d'anonymisation automatique
CREATE FUNCTION anonymize_old_orders()
RETURNS void AS $$
BEGIN
  UPDATE france_orders
  SET
    customer_name = 'Client anonymisé',
    phone_number = 'ANONYMISE',
    delivery_address = 'ANONYMISE',
    notes = NULL,
    additional_notes = NULL
  WHERE
    status IN ('livree', 'servie', 'recuperee')
    AND created_at < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;
```

---

### 5. **Sous-traitants non vérifiés** ⚠️ MAJEUR
**Problème** :
- **Green API** (WhatsApp) : Conformité RGPD non vérifiée
- **LengoPay** : Conformité RGPD non vérifiée
- Pas de DPA (Data Processing Agreement) visible

**Article violé** : Article 28 RGPD (Responsabilité des sous-traitants)

**Solution requise** :
1. Vérifier certification RGPD de Green API
2. Signer un DPA avec chaque sous-traitant
3. Vérifier localisation des serveurs (UE ou pays adéquat)

**Alternatives conformes** :
- WhatsApp Business API officiel (Meta - DPA disponible)
- Twilio (certifié RGPD)

---

### 6. **Absence de registre des traitements** ⚠️ MAJEUR
**Problème** :
- Pas de documentation des traitements de données

**Article violé** : Article 30 RGPD (Registre des activités)

**Solution requise** :
Créer un document recensant :
- Finalité : Gestion de commandes restaurant
- Catégories de données : nom, téléphone, adresse, commandes
- Destinataires : Restaurant, livreurs
- Durée de conservation : 3 ans
- Mesures de sécurité : chiffrement, hashing

---

### 7. **Transferts internationaux** ⚠️ À VÉRIFIER
**Problème** :
- Green API : Serveurs localisés où ?
- Supabase : Région configurée EU ?

**Article violé** : Article 44-50 RGPD (Transferts hors UE)

**Solution requise** :
- Vérifier que Supabase est configuré sur région EU (eu-central-1)
- Vérifier localisation serveurs Green API
- Si hors UE : Clauses contractuelles types requises

---

## 🎯 ACTIONS PRIORITAIRES (par ordre d'urgence)

### 🔴 URGENT (Risque de sanctions)
1. **Créer politique de confidentialité** (1-2 jours)
2. **Ajouter consentement explicite dans bot** (1 jour)
3. **Vérifier localisation serveurs Supabase/Green API** (1 heure)

### 🟠 IMPORTANT (Conformité complète)
4. **Implémenter droits des personnes** (3-5 jours)
   - Page "Mes données"
   - Suppression compte
   - Export données
5. **Créer politique de rétention** (1 jour)
6. **Script anonymisation automatique** (2 jours)

### 🟡 RECOMMANDÉ (Bonnes pratiques)
7. **Registre des traitements** (2 heures)
8. **DPA avec sous-traitants** (variable)
9. **Nommer un DPO** si >250 employés (ou recommandé)

---

## 💰 RISQUES FINANCIERS

**Sanctions RGPD** :
- Jusqu'à **20 millions €** OU **4% du CA mondial annuel**
- Pour PME : Sanctions proportionnelles mais possibles
- Plainte client = Enquête CNIL automatique

**Probabilité sanction actuelle** : Moyenne
- Pas de signalement = Faible risque immédiat
- Si plainte client = Risque élevé

---

## 📋 TEMPLATE POLITIQUE DE CONFIDENTIALITÉ

```markdown
# Politique de Confidentialité - [Nom Restaurant]

## 1. Responsable de traitement
[Nom entreprise]
[Adresse]
Email : rgpd@votre-restaurant.fr

## 2. Données collectées
- Nom et prénom
- Numéro de téléphone
- Adresse de livraison (si applicable)
- Historique de commandes

## 3. Finalités
- Traitement de vos commandes
- Livraison des repas
- Service client

## 4. Base légale
- Exécution du contrat (commande)
- Consentement pour communications marketing (si applicable)

## 5. Destinataires
- Personnel du restaurant
- Livreurs (pour livraison uniquement)
- Sous-traitants : Green API (WhatsApp), Supabase (hébergement)

## 6. Durée de conservation
- 3 ans après dernière commande (obligations comptables)
- Anonymisation automatique après expiration

## 7. Vos droits
Vous disposez des droits suivants :
- Droit d'accès à vos données
- Droit de rectification
- Droit à l'effacement (droit à l'oubli)
- Droit à la portabilité
- Droit d'opposition

Pour exercer vos droits : rgpd@votre-restaurant.fr

## 8. Réclamation
Vous pouvez introduire une réclamation auprès de la CNIL :
www.cnil.fr
```

---

## 🔧 MODIFICATIONS TECHNIQUES NÉCESSAIRES

### Bot WhatsApp - Ajout consentement
```typescript
// Dans le workflow initial
if (!session.gdpr_consent) {
  return `🔒 Bienvenue !

Pour utiliser ce service, nous collectons :
- Votre nom
- Votre numéro de téléphone
- Votre adresse de livraison

Ces données servent uniquement à traiter votre commande.
Politique complète : https://votre-site.fr/politique-confidentialite

Tapez OUI pour accepter et continuer.
Tapez NON pour refuser.`;
}
```

### Base de données - Ajout colonnes RGPD
```sql
-- Table customers (si existe)
ALTER TABLE france_orders ADD COLUMN gdpr_consent_date TIMESTAMP;
ALTER TABLE france_orders ADD COLUMN data_retention_date TIMESTAMP;

-- Fonction anonymisation
CREATE OR REPLACE FUNCTION anonymize_expired_orders()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE france_orders
  SET
    customer_name = 'ANONYMISE',
    phone_number = 'ANONYMISE',
    delivery_address = 'ANONYMISE',
    notes = NULL
  WHERE
    status IN ('livree', 'servie', 'recuperee', 'annulee')
    AND created_at < NOW() - INTERVAL '3 years'
    AND customer_name != 'ANONYMISE';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Tâche automatique (à configurer dans Supabase)
-- Exécuter anonymize_expired_orders() chaque mois
```

---

## ✅ CHECKLIST CONFORMITÉ RGPD

### Légal
- [ ] Politique de confidentialité rédigée
- [ ] Mentions légales sur site web
- [ ] CGV/CGU incluant clause RGPD
- [ ] Registre des traitements créé
- [ ] DPA signés avec sous-traitants

### Technique
- [ ] Consentement explicite implémenté
- [ ] Page "Mes données" fonctionnelle
- [ ] Suppression compte implémentée
- [ ] Export données (portabilité) implémenté
- [ ] Anonymisation automatique configurée
- [ ] Serveurs localisés UE vérifiés
- [ ] Chiffrement en place ✅
- [ ] Logs d'accès sécurisés

### Organisationnel
- [ ] Contact RGPD désigné (email rgpd@...)
- [ ] Processus réponse droits des personnes (délai 1 mois)
- [ ] Formation équipe aux bonnes pratiques
- [ ] Procédure en cas de violation de données

---

## 📚 RESSOURCES UTILES

- CNIL Guide RGPD : https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- Générateur politique de confidentialité : https://www.cnil.fr/fr/modele/politique-de-confidentialite
- Registre des traitements : https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement

---

## 🎯 CONCLUSION

**Statut actuel** : ⚠️ NON CONFORME RGPD

**Niveau de risque** : 🟠 MOYEN
- Risque immédiat : Faible (si pas de plainte)
- Risque si plainte client : Élevé

**Temps nécessaire conformité minimale** : 5-7 jours
**Budget estimé** :
- Développement technique : 3-5 jours dev
- Rédaction légale : 0€ (templates CNIL) ou 500-1500€ (avocat)
- Audit complet : 2000-5000€ (optionnel)

**Recommandation** : Mettre en conformité dans les 30 jours.
