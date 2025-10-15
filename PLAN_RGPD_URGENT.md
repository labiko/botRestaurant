# 🔒 PLAN RGPD URGENT - Actions Prioritaires

**Date de création** : 15/10/2025
**Objectif** : Mise en conformité RGPD minimale en 5-7 jours
**Niveau de risque actuel** : 🟠 MOYEN (Élevé si plainte client)

---

## 📊 VUE D'ENSEMBLE

### Statut actuel
- ❌ **Non conforme RGPD**
- ⚠️ **3 manquements critiques** (sanctions possibles)
- ✅ **Sécurité technique OK** (mots de passe hashés, HTTPS)

### Objectif du plan
- ✅ Conformité minimale en 7 jours maximum
- ✅ Zéro régression sur les fonctionnalités existantes
- ✅ Coût minimal (0€ si fait en interne)

---

## 🎯 LES 3 ACTIONS CRITIQUES (PAR ORDRE DE PRIORITÉ)

```
┌─────────────────────────────────────────────────────────────┐
│ ACTION 1 : POLITIQUE DE CONFIDENTIALITÉ (Jour 1-2)         │
│ Article concerné : Article 13 RGPD                          │
│ Risque si non fait : CRITIQUE - Sanction immédiate possible│
│ Temps estimé : 4-6 heures                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ACTION 2 : CONSENTEMENT EXPLICITE (Jour 2-3)               │
│ Article concerné : Article 6 RGPD (Base légale)            │
│ Risque si non fait : CRITIQUE - Collecte illégale          │
│ Temps estimé : 6-8 heures                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ACTION 3 : DROITS DES PERSONNES (Jour 4-7)                 │
│ Articles concernés : Articles 15, 16, 17 RGPD              │
│ Risque si non fait : MAJEUR - Non-conformité               │
│ Temps estimé : 12-16 heures                                 │
└─────────────────────────────────────────────────────────────┘
```

---

# 📋 ACTION 1 : POLITIQUE DE CONFIDENTIALITÉ

## 🎯 Objectif
Créer et publier une politique de confidentialité accessible et complète.

## 📜 Article RGPD concerné

### **Article 13 RGPD - Informations à fournir**

**Texte officiel** :
> "Lorsque des données à caractère personnel relatives à une personne concernée sont collectées auprès de cette personne, le responsable du traitement lui fournit, au moment où les données en question sont obtenues, toutes les informations suivantes..."

**En clair** :
Vous DEVEZ informer le client de :
- Qui collecte ses données (votre entreprise)
- Quelles données sont collectées (nom, téléphone, adresse)
- Pourquoi (traiter sa commande, livraison)
- Combien de temps elles sont gardées (3 ans)
- Ses droits (accès, suppression, etc.)

**Sanction si non-respect** :
- Jusqu'à **10 millions €** OU **2% du CA mondial**
- Pour PME : Sanctions proportionnelles mais réelles

---

## ✅ PLAN D'ACTION DÉTAILLÉ

### **Étape 1.1 : Créer la page politique de confidentialité** (2h)

**Fichier à créer** : `botResto/src/app/features/legal/privacy-policy/privacy-policy.page.html`

**Contenu complet** :

```html
<ion-header>
  <ion-toolbar color="primary">
    <ion-buttons slot="start">
      <ion-back-button></ion-back-button>
    </ion-buttons>
    <ion-title>Politique de Confidentialité</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <div class="privacy-content">

    <p class="last-update">Dernière mise à jour : 15/10/2025</p>

    <h2>1. Responsable de traitement</h2>
    <p>
      <strong>[Nom de votre entreprise]</strong><br>
      [Adresse complète]<br>
      SIRET : [Votre SIRET]<br>
      Email : contact@votre-restaurant.fr<br>
      Email RGPD : rgpd@votre-restaurant.fr
    </p>

    <h2>2. Données collectées</h2>
    <p>Nous collectons les données suivantes lors de votre commande :</p>
    <ul>
      <li><strong>Nom et prénom</strong> : Pour identifier votre commande</li>
      <li><strong>Numéro de téléphone</strong> : Pour vous contacter (WhatsApp)</li>
      <li><strong>Adresse de livraison</strong> : Pour livrer votre commande (si applicable)</li>
      <li><strong>Historique de commandes</strong> : Pour le suivi et la facturation</li>
      <li><strong>Données de paiement</strong> : Traitées par nos partenaires sécurisés</li>
    </ul>

    <h2>3. Finalités du traitement</h2>
    <p>Vos données sont utilisées uniquement pour :</p>
    <ul>
      <li>Traiter et préparer votre commande</li>
      <li>Effectuer la livraison (si demandée)</li>
      <li>Vous contacter pour le suivi de commande</li>
      <li>Respecter nos obligations légales (facturation, comptabilité)</li>
    </ul>
    <p><strong>Nous ne vendons JAMAIS vos données à des tiers.</strong></p>

    <h2>4. Base légale</h2>
    <p>Le traitement de vos données repose sur :</p>
    <ul>
      <li><strong>L'exécution du contrat</strong> : Votre commande constitue un contrat que nous devons honorer</li>
      <li><strong>Obligation légale</strong> : Conservation des données comptables (3 ans selon la loi française)</li>
      <li><strong>Votre consentement</strong> : Pour les communications marketing (si vous acceptez)</li>
    </ul>

    <h2>5. Destinataires des données</h2>
    <p>Vos données sont accessibles uniquement par :</p>
    <ul>
      <li><strong>Notre personnel</strong> : Pour préparer et gérer votre commande</li>
      <li><strong>Nos livreurs</strong> : Uniquement nom, téléphone et adresse (pour la livraison)</li>
      <li><strong>Nos sous-traitants</strong> :
        <ul>
          <li>Supabase (hébergement base de données - certifié RGPD, serveurs EU)</li>
          <li>Green API (service WhatsApp - vérifier certification)</li>
          <li>LengoPay (paiement en ligne - si applicable)</li>
        </ul>
      </li>
    </ul>

    <h2>6. Durée de conservation</h2>
    <p>Vos données sont conservées pendant :</p>
    <ul>
      <li><strong>3 ans</strong> après votre dernière commande (obligations comptables françaises)</li>
      <li><strong>Après 3 ans</strong> : Anonymisation automatique (nom → "Client anonymisé", téléphone → "ANONYMISÉ")</li>
      <li><strong>Commandes annulées</strong> : Supprimées après 1 an</li>
    </ul>

    <h2>7. Vos droits</h2>
    <p>Conformément au RGPD, vous disposez des droits suivants :</p>

    <h3>7.1. Droit d'accès (Article 15)</h3>
    <p>Vous pouvez demander une copie de toutes vos données.</p>

    <h3>7.2. Droit de rectification (Article 16)</h3>
    <p>Vous pouvez corriger vos données si elles sont incorrectes.</p>

    <h3>7.3. Droit à l'effacement / Droit à l'oubli (Article 17)</h3>
    <p>Vous pouvez demander la suppression de toutes vos données (sauf obligations légales de conservation comptable).</p>

    <h3>7.4. Droit à la portabilité (Article 20)</h3>
    <p>Vous pouvez recevoir vos données dans un format électronique (JSON, CSV).</p>

    <h3>7.5. Droit d'opposition (Article 21)</h3>
    <p>Vous pouvez vous opposer au traitement de vos données pour les communications marketing.</p>

    <h3>Comment exercer vos droits ?</h3>
    <p>Pour exercer l'un de ces droits, contactez-nous :</p>
    <ul>
      <li><strong>Email</strong> : rgpd@votre-restaurant.fr</li>
      <li><strong>Via WhatsApp</strong> : Tapez "mes données" dans la conversation</li>
      <li><strong>Courrier</strong> : [Adresse postale]</li>
    </ul>
    <p><strong>Délai de réponse</strong> : Maximum 1 mois après réception de votre demande.</p>

    <h2>8. Sécurité des données</h2>
    <p>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
    <ul>
      <li>Chiffrement des connexions (HTTPS/TLS)</li>
      <li>Mots de passe chiffrés (hashing sécurisé)</li>
      <li>Hébergement sécurisé (Supabase, serveurs EU)</li>
      <li>Accès restreint aux données (personnel autorisé uniquement)</li>
    </ul>

    <h2>9. Transferts internationaux</h2>
    <p>Vos données sont hébergées au sein de l'Union Européenne (Supabase - région eu-central-1).</p>
    <p>Aucun transfert hors UE n'est effectué sans garanties appropriées (clauses contractuelles types).</p>

    <h2>10. Cookies et technologies similaires</h2>
    <p>Notre application utilise uniquement des cookies techniques nécessaires au fonctionnement (session, authentification).</p>
    <p>Aucun cookie publicitaire ou de tracking n'est utilisé.</p>

    <h2>11. Modifications de la politique</h2>
    <p>Cette politique peut être modifiée. La date de dernière mise à jour est indiquée en haut de page.</p>
    <p>En cas de modification substantielle, vous serez informé par WhatsApp.</p>

    <h2>12. Réclamation auprès de la CNIL</h2>
    <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :</p>
    <ul>
      <li><strong>Site web</strong> : <a href="https://www.cnil.fr" target="_blank">www.cnil.fr</a></li>
      <li><strong>Courrier</strong> : CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
      <li><strong>Téléphone</strong> : 01 53 73 22 22</li>
    </ul>

    <h2>13. Contact</h2>
    <p>Pour toute question concernant cette politique ou vos données personnelles :</p>
    <ul>
      <li><strong>Email RGPD</strong> : rgpd@votre-restaurant.fr</li>
      <li><strong>Email général</strong> : contact@votre-restaurant.fr</li>
      <li><strong>Téléphone</strong> : [Votre numéro]</li>
    </ul>

  </div>
</ion-content>
```

**Style CSS** (`privacy-policy.page.scss`) :

```scss
.privacy-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .last-update {
    font-style: italic;
    color: var(--ion-color-medium);
    margin-bottom: 20px;
  }

  h2 {
    color: var(--ion-color-primary);
    margin-top: 30px;
    margin-bottom: 15px;
    font-size: 1.4em;
  }

  h3 {
    color: var(--ion-color-primary-shade);
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.1em;
  }

  p, li {
    line-height: 1.6;
    margin-bottom: 10px;
  }

  ul {
    margin-left: 20px;
    margin-bottom: 15px;
  }

  a {
    color: var(--ion-color-primary);
    text-decoration: underline;
  }

  strong {
    color: var(--ion-color-dark);
  }
}
```

---

### **Étape 1.2 : Ajouter le lien dans les mentions légales** (30min)

**Fichier à modifier** : Page d'accueil, footer, page paramètres

```html
<!-- Dans le footer ou menu -->
<ion-button fill="clear" [routerLink]="['/legal/privacy-policy']">
  Politique de confidentialité
</ion-button>
```

---

### **Étape 1.3 : Créer le module et routing** (30min)

**Fichier** : `legal-routing.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule { }
```

---

### **✅ Checklist Étape 1**

- [ ] Créer la page `privacy-policy.page.html`
- [ ] Ajouter le style `privacy-policy.page.scss`
- [ ] Créer le module Angular
- [ ] Ajouter le routing
- [ ] Remplacer `[Nom de votre entreprise]` par vos vraies infos
- [ ] Ajouter le lien dans le footer/menu
- [ ] Tester l'accès à la page
- [ ] Commit + Push

---

# 📋 ACTION 2 : CONSENTEMENT EXPLICITE

## 🎯 Objectif
Obtenir le consentement explicite du client AVANT de collecter ses données.

## 📜 Article RGPD concerné

### **Article 6 RGPD - Licéité du traitement**

**Texte officiel** :
> "Le traitement n'est licite que si, et dans la mesure où, au moins une des conditions suivantes est remplie :
> a) la personne concernée a consenti au traitement de ses données à caractère personnel..."

**En clair** :
Vous ne pouvez PAS collecter de données sans :
- Soit un consentement clair et explicite (case à cocher, bouton "J'accepte")
- Soit une base légale (contrat, obligation légale)

**Ce qui est INTERDIT** :
- ❌ Collecter des données sans informer
- ❌ Cases pré-cochées
- ❌ Consentement implicite ("en utilisant ce service...")

**Sanction si non-respect** :
- Jusqu'à **20 millions €** OU **4% du CA mondial**

---

## ✅ PLAN D'ACTION DÉTAILLÉ

### **Étape 2.1 : Modifier le bot WhatsApp - Ajout écran consentement** (4h)

**Fichier à modifier** : `supabase/functions/bot-resto-france-universel/core/UniversalBot.ts`

**Logique à implémenter** :

```typescript
// Dans la méthode handleMessage()

// ÉTAPE 0 : VÉRIFIER LE CONSENTEMENT GDPR (AVANT TOUT)
if (!session.gdpr_consent_given) {
  return this.handleGDPRConsent(phoneNumber, message, session);
}

// Reste du code existant...
```

**Nouvelle méthode à ajouter** :

```typescript
private async handleGDPRConsent(
  phoneNumber: string,
  message: string,
  session: any
): Promise<string> {

  // Si premier message, afficher l'écran de consentement
  if (!session.gdpr_consent_shown) {

    // Marquer comme affiché
    await this.updateSession(phoneNumber, {
      gdpr_consent_shown: true,
      updated_at: new Date().toISOString()
    });

    return `🔒 **Bienvenue chez ${this.config.restaurantName} !**

Avant de commencer, nous devons vous informer :

📋 **Données collectées** :
• Votre nom
• Votre numéro de téléphone
• Votre adresse de livraison (si applicable)

🎯 **Utilisation** :
Ces données servent uniquement à :
• Traiter votre commande
• Effectuer la livraison
• Vous contacter pour le suivi

🔒 **Vos droits** :
Vous pouvez à tout moment :
• Accéder à vos données (tapez "mes données")
• Les modifier ou les supprimer
• Recevoir une copie

📄 **Plus d'infos** : https://votre-site.fr/politique-confidentialite

⚠️ **Votre consentement est nécessaire pour continuer.**

Tapez **OUI** pour accepter et commander.
Tapez **NON** pour refuser.`;
  }

  // Traiter la réponse
  const response = message.toLowerCase().trim();

  if (response === 'oui' || response === 'yes' || response === 'ok' || response === 'accepte') {

    // Enregistrer le consentement avec timestamp
    await this.updateSession(phoneNumber, {
      gdpr_consent_given: true,
      gdpr_consent_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Aussi enregistrer dans la table clients si elle existe
    await this.saveGDPRConsent(phoneNumber);

    return `✅ **Merci !**

Votre consentement a été enregistré.

Vous pouvez maintenant commander ! 🍕

Tapez **resto** pour voir les restaurants disponibles.`;
  }

  if (response === 'non' || response === 'no' || response === 'refuse') {

    // Supprimer la session
    await this.deleteSession(phoneNumber);

    return `❌ **Consentement refusé**

Sans votre consentement, nous ne pouvons malheureusement pas traiter de commande.

Si vous changez d'avis, vous pouvez nous recontacter à tout moment.

Merci de votre compréhension ! 👋`;
  }

  // Réponse invalide
  return `⚠️ **Réponse non reconnue**

Veuillez répondre :
• **OUI** pour accepter
• **NON** pour refuser`;
}

/**
 * Enregistrer le consentement GDPR en base
 */
private async saveGDPRConsent(phoneNumber: string): Promise<void> {
  try {
    // Vérifier si le client existe déjà
    const { data: existing } = await this.supabase
      .from('france_gdpr_consents')
      .select('id')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    const consentData = {
      phone_number: phoneNumber,
      consent_given: true,
      consent_date: new Date().toISOString(),
      consent_method: 'whatsapp',
      ip_address: null, // WhatsApp ne fournit pas l'IP
      user_agent: 'WhatsApp Bot'
    };

    if (existing) {
      // Mettre à jour
      await this.supabase
        .from('france_gdpr_consents')
        .update(consentData)
        .eq('id', existing.id);
    } else {
      // Créer
      await this.supabase
        .from('france_gdpr_consents')
        .insert(consentData);
    }

  } catch (error) {
    console.error('❌ Erreur enregistrement consentement GDPR:', error);
  }
}
```

---

### **Étape 2.2 : Créer la table de consentements** (1h)

**Fichier SQL** : `supabase/migrations/create_gdpr_consents.sql`

```sql
-- ========================================================================
-- TABLE france_gdpr_consents
-- Stockage des consentements GDPR (Article 7 RGPD - Preuve du consentement)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.france_gdpr_consents (
  id BIGSERIAL PRIMARY KEY,
  phone_number VARCHAR NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  consent_method VARCHAR NOT NULL, -- 'whatsapp', 'web', 'app'
  consent_withdrawn_date TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par téléphone
CREATE INDEX idx_gdpr_consents_phone ON public.france_gdpr_consents(phone_number);

-- Commentaires
COMMENT ON TABLE public.france_gdpr_consents IS 'Stockage des consentements GDPR (Article 7 - Preuve du consentement)';
COMMENT ON COLUMN public.france_gdpr_consents.consent_method IS 'Méthode d''obtention du consentement (whatsapp, web, app)';
COMMENT ON COLUMN public.france_gdpr_consents.consent_withdrawn_date IS 'Date de retrait du consentement si applicable';
```

**Exécuter en DEV puis PROD** via SQL Editor Supabase.

---

### **Étape 2.3 : Ajouter colonne dans france_orders** (30min)

**Fichier SQL** : `supabase/migrations/add_gdpr_consent_to_orders.sql`

```sql
-- Ajouter la référence au consentement GDPR dans les commandes
ALTER TABLE public.france_orders
ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.france_orders.gdpr_consent_date IS 'Date du consentement GDPR pour cette commande';
```

---

### **Étape 2.4 : Modifier la session pour inclure le consentement** (30min)

**Table** : `whatsapp_sessions_france`

```sql
-- Ajouter colonnes de consentement
ALTER TABLE public.whatsapp_sessions_france
ADD COLUMN IF NOT EXISTS gdpr_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gdpr_consent_shown BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.whatsapp_sessions_france.gdpr_consent_given IS 'Client a accepté le consentement GDPR';
COMMENT ON COLUMN public.whatsapp_sessions_france.gdpr_consent_date IS 'Date d''acceptation du consentement';
COMMENT ON COLUMN public.whatsapp_sessions_france.gdpr_consent_shown IS 'Écran de consentement déjà affiché';
```

---

### **✅ Checklist Étape 2**

- [ ] Créer la table `france_gdpr_consents` en DEV
- [ ] Créer la table `france_gdpr_consents` en PROD
- [ ] Ajouter colonnes `gdpr_consent_*` dans `whatsapp_sessions_france` (DEV)
- [ ] Ajouter colonnes `gdpr_consent_*` dans `whatsapp_sessions_france` (PROD)
- [ ] Ajouter colonne `gdpr_consent_date` dans `france_orders` (DEV)
- [ ] Ajouter colonne `gdpr_consent_date` dans `france_orders` (PROD)
- [ ] Implémenter `handleGDPRConsent()` dans le bot
- [ ] Implémenter `saveGDPRConsent()` dans le bot
- [ ] Tester avec un nouveau client
- [ ] Tester réponse "OUI"
- [ ] Tester réponse "NON"
- [ ] Vérifier enregistrement en base
- [ ] Deploy bot universel en DEV
- [ ] Tester en DEV
- [ ] Deploy bot universel en PROD (après validation)

---

# 📋 ACTION 3 : DROITS DES PERSONNES

## 🎯 Objectif
Permettre aux clients d'exercer leurs droits RGPD (accès, rectification, suppression, portabilité).

## 📜 Articles RGPD concernés

### **Article 15 - Droit d'accès**

**Texte officiel** :
> "La personne concernée a le droit d'obtenir du responsable du traitement la confirmation que des données à caractère personnel la concernant sont ou ne sont pas traitées..."

**En clair** :
Le client peut demander : "Quelles données avez-vous sur moi ?"
Vous devez lui fournir TOUTES ses données dans un délai de **1 mois maximum**.

---

### **Article 16 - Droit de rectification**

**Texte officiel** :
> "La personne concernée a le droit d'obtenir du responsable du traitement, dans les meilleurs délais, la rectification des données à caractère personnel la concernant qui sont inexactes..."

**En clair** :
Le client peut corriger ses données (nom mal orthographié, mauvaise adresse, etc.).

---

### **Article 17 - Droit à l'effacement ("droit à l'oubli")**

**Texte officiel** :
> "La personne concernée a le droit d'obtenir du responsable du traitement l'effacement, dans les meilleurs délais, de données à caractère personnel la concernant..."

**En clair** :
Le client peut demander la suppression de TOUTES ses données.

**Exception** : Vous pouvez refuser si vous avez une obligation légale (ex: facturation = 3 ans de conservation obligatoire).

---

### **Article 20 - Droit à la portabilité**

**Texte officiel** :
> "Les personnes concernées ont le droit de recevoir les données à caractère personnel les concernant qu'elles ont fournies à un responsable du traitement, dans un format structuré, couramment utilisé et lisible par machine..."

**En clair** :
Le client peut demander ses données dans un format électronique (JSON, CSV, Excel).

---

## ✅ PLAN D'ACTION DÉTAILLÉ

### **Étape 3.1 : Commandes WhatsApp pour exercer les droits** (6h)

**Fichier à modifier** : `UniversalBot.ts`

**Nouvelles commandes à ajouter** :

```typescript
// Dans handleMessage(), après vérification consentement

// Commandes GDPR (disponibles à tout moment)
if (message.toLowerCase() === 'mes données' || message.toLowerCase() === 'mes donnees') {
  return this.handleDataAccessRequest(phoneNumber);
}

if (message.toLowerCase().startsWith('modifier mon nom')) {
  return this.handleNameUpdate(phoneNumber, message);
}

if (message.toLowerCase() === 'supprimer mes données' || message.toLowerCase() === 'supprimer mes donnees') {
  return this.handleDataDeletionRequest(phoneNumber);
}

if (message.toLowerCase() === 'exporter mes données' || message.toLowerCase() === 'exporter mes donnees') {
  return this.handleDataExportRequest(phoneNumber);
}

if (message.toLowerCase() === 'aide rgpd' || message.toLowerCase() === 'rgpd') {
  return this.showGDPRHelp();
}
```

---

### **Étape 3.2 : Implémenter le droit d'accès (Article 15)** (2h)

```typescript
/**
 * DROIT D'ACCÈS (Article 15 RGPD)
 * Afficher toutes les données du client
 */
private async handleDataAccessRequest(phoneNumber: string): Promise<string> {
  try {

    // 1. Récupérer toutes les commandes du client
    const { data: orders, error: ordersError } = await this.supabase
      .from('france_orders')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // 2. Récupérer le consentement GDPR
    const { data: consent } = await this.supabase
      .from('france_gdpr_consents')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    // 3. Récupérer la session
    const { data: session } = await this.supabase
      .from('whatsapp_sessions_france')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    // 4. Formater la réponse
    const orderCount = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const lastOrderDate = orders && orders.length > 0 ? orders[0].created_at : 'Aucune';

    return `📊 **VOS DONNÉES PERSONNELLES**

👤 **Informations de base** :
• Téléphone : ${phoneNumber}
• Nom : ${session?.customer_name || 'Non renseigné'}

📋 **Historique** :
• Nombre de commandes : ${orderCount}
• Total dépensé : ${totalSpent.toFixed(2)} €
• Dernière commande : ${lastOrderDate}

🔒 **Consentement RGPD** :
• Consentement donné : ${consent?.consent_given ? 'Oui' : 'Non'}
• Date : ${consent?.consent_date || 'N/A'}

⏱️ **Conservation** :
• Durée : 3 ans après dernière commande
• Après : Anonymisation automatique

📄 **Détails complets** :
Pour recevoir une copie complète de toutes vos données au format électronique, tapez :
**exporter mes données**

✏️ **Modifier vos données** :
• Tapez : **modifier mon nom [nouveau nom]**

🗑️ **Supprimer vos données** :
• Tapez : **supprimer mes données**

❓ **Questions ?**
Email : rgpd@votre-restaurant.fr`;

  } catch (error) {
    console.error('❌ Erreur droit d\'accès:', error);
    return `❌ Une erreur est survenue lors de la récupération de vos données.

Veuillez contacter : rgpd@votre-restaurant.fr`;
  }
}
```

---

### **Étape 3.3 : Implémenter le droit de rectification (Article 16)** (1h)

```typescript
/**
 * DROIT DE RECTIFICATION (Article 16 RGPD)
 * Modifier le nom du client
 */
private async handleNameUpdate(phoneNumber: string, message: string): Promise<string> {
  try {

    // Extraire le nouveau nom
    const newName = message.replace(/modifier mon nom/i, '').trim();

    if (!newName || newName.length < 2) {
      return `⚠️ **Format incorrect**

Utilisez : **modifier mon nom [Votre nouveau nom]**

Exemple : modifier mon nom Jean Dupont`;
    }

    // Mettre à jour dans la session
    const { error: sessionError } = await this.supabase
      .from('whatsapp_sessions_france')
      .update({
        customer_name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', phoneNumber);

    if (sessionError) throw sessionError;

    // Mettre à jour dans toutes les commandes futures (optionnel)
    // Note: On ne modifie PAS les commandes passées (intégrité historique)

    return `✅ **Nom mis à jour**

Votre nouveau nom : **${newName}**

Il sera utilisé pour vos prochaines commandes.

💡 Note : Les commandes passées conservent l'ancien nom pour l'intégrité de l'historique.`;

  } catch (error) {
    console.error('❌ Erreur rectification nom:', error);
    return `❌ Impossible de mettre à jour votre nom.

Contactez : rgpd@votre-restaurant.fr`;
  }
}
```

---

### **Étape 3.4 : Implémenter le droit à l'effacement (Article 17)** (2h)

```typescript
/**
 * DROIT À L'EFFACEMENT / DROIT À L'OUBLI (Article 17 RGPD)
 * Supprimer toutes les données du client
 */
private async handleDataDeletionRequest(phoneNumber: string): Promise<string> {
  try {

    // 1. Vérifier si le client a des commandes récentes (< 3 ans)
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const { data: recentOrders, error: checkError } = await this.supabase
      .from('france_orders')
      .select('id, created_at, status')
      .eq('phone_number', phoneNumber)
      .gte('created_at', threeYearsAgo.toISOString())
      .limit(1);

    if (checkError) throw checkError;

    // Si commandes récentes, on doit les conserver pour obligations comptables
    if (recentOrders && recentOrders.length > 0) {
      return `⚠️ **Suppression impossible pour le moment**

Vous avez des commandes de moins de 3 ans.

📜 **Obligation légale** :
La loi française nous oblige à conserver les données de facturation pendant 3 ans (Article L123-22 du Code de commerce).

🔒 **Alternative - Anonymisation** :
Nous pouvons anonymiser vos données immédiatement :
• Nom → "Client anonymisé"
• Téléphone → "ANONYMISÉ"
• Adresse → "ANONYMISÉ"

Vos commandes seront conservées de façon anonyme uniquement pour la comptabilité.

✅ **Pour confirmer l'anonymisation**, tapez :
**confirmer anonymisation**

❓ **Questions ?** rgpd@votre-restaurant.fr`;
    }

    // Aucune commande récente = Suppression totale possible
    return `🗑️ **Suppression de vos données**

Vous n'avez aucune commande récente (< 3 ans).

⚠️ **ATTENTION : Cette action est IRRÉVERSIBLE**

Nous allons supprimer :
• Toutes vos commandes
• Votre historique
• Vos données personnelles
• Votre consentement GDPR

✅ **Pour confirmer la suppression totale**, tapez :
**confirmer suppression totale**

❌ **Pour annuler**, tapez :
**annuler**`;

  } catch (error) {
    console.error('❌ Erreur demande suppression:', error);
    return `❌ Erreur lors de la vérification de vos données.

Contactez : rgpd@votre-restaurant.fr`;
  }
}

/**
 * Confirmer l'anonymisation
 */
private async confirmAnonymization(phoneNumber: string): Promise<string> {
  try {
    // Anonymiser les commandes
    const { error: ordersError } = await this.supabase
      .from('france_orders')
      .update({
        customer_name: 'Client anonymisé',
        phone_number: 'ANONYMISE',
        delivery_address: 'ANONYMISE',
        notes: null,
        additional_notes: null
      })
      .eq('phone_number', phoneNumber);

    if (ordersError) throw ordersError;

    // Supprimer le consentement GDPR
    await this.supabase
      .from('france_gdpr_consents')
      .delete()
      .eq('phone_number', phoneNumber);

    // Supprimer la session
    await this.supabase
      .from('whatsapp_sessions_france')
      .delete()
      .eq('phone_number', phoneNumber);

    return `✅ **Anonymisation effectuée**

Vos données personnelles ont été anonymisées avec succès.

Les données de facturation (montants, dates) sont conservées de façon anonyme pour nos obligations légales.

Merci d'avoir utilisé notre service ! 👋`;

  } catch (error) {
    console.error('❌ Erreur anonymisation:', error);
    return `❌ Erreur lors de l'anonymisation.

Contactez : rgpd@votre-restaurant.fr`;
  }
}

/**
 * Confirmer la suppression totale
 */
private async confirmTotalDeletion(phoneNumber: string): Promise<string> {
  try {

    // Supprimer toutes les commandes
    await this.supabase
      .from('france_orders')
      .delete()
      .eq('phone_number', phoneNumber);

    // Supprimer le consentement
    await this.supabase
      .from('france_gdpr_consents')
      .delete()
      .eq('phone_number', phoneNumber);

    // Supprimer la session
    await this.supabase
      .from('whatsapp_sessions_france')
      .delete()
      .eq('phone_number', phoneNumber);

    return `✅ **Suppression totale effectuée**

Toutes vos données ont été définitivement supprimées.

Nous n'avons plus aucune information vous concernant.

Au revoir et merci ! 👋`;

  } catch (error) {
    console.error('❌ Erreur suppression totale:', error);
    return `❌ Erreur lors de la suppression.

Contactez : rgpd@votre-restaurant.fr`;
  }
}
```

---

### **Étape 3.5 : Implémenter le droit à la portabilité (Article 20)** (1h)

```typescript
/**
 * DROIT À LA PORTABILITÉ (Article 20 RGPD)
 * Exporter toutes les données au format JSON
 */
private async handleDataExportRequest(phoneNumber: string): Promise<string> {
  try {

    // Récupérer toutes les données
    const { data: orders } = await this.supabase
      .from('france_orders')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    const { data: consent } = await this.supabase
      .from('france_gdpr_consents')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    const { data: session } = await this.supabase
      .from('whatsapp_sessions_france')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    // Créer l'export JSON
    const exportData = {
      export_date: new Date().toISOString(),
      phone_number: phoneNumber,
      customer_name: session?.customer_name || null,
      gdpr_consent: {
        consent_given: consent?.consent_given || false,
        consent_date: consent?.consent_date || null,
        consent_method: consent?.consent_method || null
      },
      orders: orders || [],
      statistics: {
        total_orders: orders?.length || 0,
        total_spent: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        first_order_date: orders && orders.length > 0 ? orders[orders.length - 1].created_at : null,
        last_order_date: orders && orders.length > 0 ? orders[0].created_at : null
      }
    };

    // Envoyer l'export par email (fonction à implémenter)
    // OU créer un lien de téléchargement temporaire
    // Pour l'instant, on informe l'utilisateur

    return `📦 **Export de vos données**

Vos données ont été préparées au format JSON.

📊 **Résumé** :
• ${exportData.statistics.total_orders} commande(s)
• ${exportData.statistics.total_spent.toFixed(2)} € dépensé(s)
• Première commande : ${exportData.statistics.first_order_date || 'N/A'}

📧 **Réception** :
Un email avec le fichier JSON sera envoyé à l'adresse associée à votre compte dans les prochaines minutes.

💡 Si vous n'avez pas d'email enregistré, contactez :
rgpd@votre-restaurant.fr

Le fichier contiendra :
• Toutes vos commandes
• Vos informations personnelles
• Votre historique de consentement`;

  } catch (error) {
    console.error('❌ Erreur export données:', error);
    return `❌ Erreur lors de la préparation de l'export.

Contactez : rgpd@votre-restaurant.fr`;
  }
}
```

---

### **Étape 3.6 : Aide RGPD** (30min)

```typescript
/**
 * Afficher l'aide sur les droits RGPD
 */
private showGDPRHelp(): string {
  return `🔒 **VOS DROITS RGPD**

Vous disposez des droits suivants :

📊 **DROIT D'ACCÈS**
Tapez : **mes données**
→ Voir toutes vos données

✏️ **DROIT DE RECTIFICATION**
Tapez : **modifier mon nom [nouveau nom]**
→ Corriger vos informations

🗑️ **DROIT À L'EFFACEMENT**
Tapez : **supprimer mes données**
→ Supprimer toutes vos données

📦 **DROIT À LA PORTABILITÉ**
Tapez : **exporter mes données**
→ Recevoir vos données au format JSON

❓ **QUESTIONS ?**
Email : rgpd@votre-restaurant.fr
Réponse sous 1 mois maximum

📄 **Politique complète** :
https://votre-site.fr/politique-confidentialite

🏛️ **Réclamation CNIL** :
Si vous estimez que vos droits ne sont pas respectés :
www.cnil.fr`;
}
```

---

### **✅ Checklist Étape 3**

- [ ] Ajouter commande "mes données" dans le bot
- [ ] Implémenter `handleDataAccessRequest()`
- [ ] Ajouter commande "modifier mon nom" dans le bot
- [ ] Implémenter `handleNameUpdate()`
- [ ] Ajouter commande "supprimer mes données" dans le bot
- [ ] Implémenter `handleDataDeletionRequest()`
- [ ] Implémenter `confirmAnonymization()`
- [ ] Implémenter `confirmTotalDeletion()`
- [ ] Ajouter commande "exporter mes données" dans le bot
- [ ] Implémenter `handleDataExportRequest()`
- [ ] Ajouter commande "aide rgpd" dans le bot
- [ ] Implémenter `showGDPRHelp()`
- [ ] Tester chaque commande en DEV
- [ ] Deploy bot en DEV
- [ ] Tests complets en DEV
- [ ] Deploy bot en PROD

---

# 📊 PLANNING RÉCAPITULATIF

## Semaine de mise en conformité

```
┌─────────────────────────────────────────────────────────────┐
│ JOUR 1-2 : ACTION 1 - POLITIQUE DE CONFIDENTIALITÉ         │
│ • Créer la page HTML/CSS (2h)                               │
│ • Ajouter routing et liens (1h)                             │
│ • Remplacer infos génériques par vraies données (1h)        │
│ • Tester et déployer (1h)                                   │
│ Total : 4-6 heures                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ JOUR 2-3 : ACTION 2 - CONSENTEMENT EXPLICITE               │
│ • Créer tables SQL GDPR (1h)                                │
│ • Modifier bot - écran consentement (3h)                    │
│ • Tester workflow complet (1h)                              │
│ • Deploy DEV puis PROD (1h)                                 │
│ Total : 6-8 heures                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ JOUR 4-7 : ACTION 3 - DROITS DES PERSONNES                 │
│ • Implémenter droit d'accès (2h)                            │
│ • Implémenter droit de rectification (1h)                   │
│ • Implémenter droit à l'effacement (2h)                     │
│ • Implémenter droit à la portabilité (1h)                   │
│ • Ajouter aide RGPD (30min)                                 │
│ • Tests complets toutes commandes (2h)                      │
│ • Deploy DEV puis PROD (1h)                                 │
│ Total : 12-16 heures                                        │
└─────────────────────────────────────────────────────────────┘
```

**TOTAL ESTIMÉ : 22-30 heures de développement**

---

# ✅ CHECKLIST GLOBALE DE CONFORMITÉ

## Conformité minimale (urgent)

- [ ] **Politique de confidentialité publiée et accessible**
- [ ] **Consentement explicite implémenté dans le bot**
- [ ] **Droits des personnes implémentés (accès, rectification, suppression, portabilité)**
- [ ] **Email RGPD créé** (rgpd@votre-restaurant.fr)
- [ ] **Tests complets effectués**
- [ ] **Déployé en production**

## Conformité complète (recommandé)

- [ ] Registre des traitements créé
- [ ] DPA signés avec sous-traitants (Supabase, Green API)
- [ ] Politique de rétention automatique (3 ans)
- [ ] Script d'anonymisation automatique
- [ ] Formation équipe aux bonnes pratiques RGPD
- [ ] Procédure en cas de violation de données

---

# 📞 SUPPORT ET RESSOURCES

## En cas de problème technique

1. **Vérifier les logs** de la fonction bot
2. **Tester en DEV** avant PROD
3. **Rollback possible** si régression

## Ressources RGPD

- **CNIL - Guide RGPD** : https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- **Modèles CNIL** : https://www.cnil.fr/fr/modeles
- **Texte officiel RGPD** : https://eur-lex.europa.eu/eli/reg/2016/679/oj

## Contact avocat (si nécessaire)

Pour validation juridique finale :
- Budget : 500-1500€ pour relecture
- Recommandé si CA > 100k€/an

---

# 🎯 APRÈS LA MISE EN CONFORMITÉ

## À faire régulièrement

- **Tous les 6 mois** : Vérifier que les sous-traitants sont toujours conformes
- **Tous les ans** : Mettre à jour la politique de confidentialité si changements
- **En cas d'incident** : Notification CNIL sous 72h si violation de données

## Améliorations futures (optionnel)

- [ ] Audit RGPD complet par un DPO externe
- [ ] Certification ISO 27001 (sécurité)
- [ ] PIA (Privacy Impact Assessment) si traitement à risque élevé

---

**FIN DU PLAN RGPD URGENT**

Voulez-vous que je commence l'implémentation de l'une de ces actions ?
