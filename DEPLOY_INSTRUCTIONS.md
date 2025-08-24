# Instructions de Déploiement - Bot Restaurant WhatsApp

## 🗄️ Déploiement de la Base de Données

### 1. Accéder à Supabase Dashboard
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet : `vgxcrwgzcfyebetpinoh`

### 2. Exécuter le Script SQL
- Cliquez sur "SQL Editor" dans la barre latérale
- Cliquez sur "New query" 
- Copiez et collez tout le contenu du fichier `setup_database.sql`
- Cliquez sur "Run" pour exécuter

### 3. Vérifier les Tables
Dans l'onglet "Table editor", vous devriez voir :
- ✅ `restaurants` (7 restaurants de Conakry)
- ✅ `menus` (plats pour chaque restaurant)
- ✅ `clients` (table vide, se remplit avec les utilisateurs)
- ✅ `commandes` (table vide, se remplit avec les commandes)
- ✅ `sessions` (gestion des conversations)
- ✅ `logs_webhook` (logs des interactions)

## 🚀 Déploiement de la Function Edge

⚠️ **Note**: Le déploiement CLI rencontre une erreur d'autorisation. Utilisez l'interface web.

### Via l'Interface Web Supabase (RECOMMANDÉ)
1. Allez sur "Edge Functions" dans le dashboard Supabase
2. Cliquez sur "Create a new function"
3. Nom: `webhook-whatsapp`
4. Copiez TOUT le contenu du fichier `supabase/functions/webhook-whatsapp/index.ts`
5. Cliquez sur "Deploy function"

**⚠️ IMPORTANT**: Le fichier `index.ts` contient maintenant l'architecture complète avec:
- Intégration base de données (repositories)
- Tous les handlers avec injection de dépendances
- Orchestrateur de conversations
- Gestion complète des sessions et commandes

### Code GitHub Disponible
📂 **Repository**: https://github.com/labiko/botRestaurant.git
- Commit complet avec toute l'architecture
- Script SQL d'initialisation
- Documentation complète

## 🔧 Configuration des Variables

Vérifiez que ces secrets sont configurés dans "Project Settings" > "Environment Variables":
- ✅ `GREEN_API_INSTANCE_ID` = `7105303512`
- ✅ `GREEN_API_TOKEN` = `[votre token]`
- ✅ `BOT_PHONE_NUMBER` = `224623542219`
- ✅ `SUPABASE_URL` = (généré automatiquement)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (généré automatiquement)

## 🌐 Configuration Webhook Green API

1. Allez sur https://console.green-api.com
2. Sélectionnez votre instance `7105303512`
3. Dans "Webhook", configurez :
   - Webhook URL: `https://vgxcrwgzcfyebetpinoh.supabase.co/functions/v1/webhook-whatsapp`
   - Enable webhooks: ✅
   - Types d'événements : `incomingMessageReceived`, `stateInstanceChanged`

## ✅ Tests

### Test 1: Santé de la Function
Visitez: `https://vgxcrwgzcfyebetpinoh.supabase.co/functions/v1/webhook-whatsapp/health`

Réponse attendue:
```json
{
  "status": "ok",
  "whatsapp_instance_state": "authorized",
  "database_connected": true,
  "version": "2.0.0-complete"
}
```

### Test 2: WhatsApp
Envoyez un message au numéro `+224 623 542 219`:
- Message: `resto`
- Réponse attendue: Menu de bienvenue avec options

### Test 3: Base de données
Vérifiez dans Supabase que :
- Les restaurants s'affichent correctement
- Les sessions se créent lors des interactions
- Les logs se remplissent

## 🏆 Workflow Complet de Test

1. **Accueil** : "resto" → Menu de bienvenue
2. **Restaurants** : "2" → Liste des restaurants  
3. **Sélection** : "1" → Restaurant Le Damier sélectionné
4. **Menu** : Affichage du menu avec prix
5. **Commande** : "1,3" → Salade César + Poulet Yassa
6. **Confirmation** : "oui" → Confirmation du panier
7. **Mode** : "3" → Livraison
8. **Position** : Partager position GPS → Calcul des frais
9. **Validation** : "oui" → Confirmation livraison  
10. **Paiement** : "1" → Paiement maintenant
11. **Finalisation** : Commande créée en base de données

## 📊 Monitoring

- **Logs** : Supabase Dashboard > Edge Functions > webhook-whatsapp > Logs
- **Base de données** : Table editor pour voir les données en temps réel
- **Green API** : Console pour voir les messages échangés

## 🔧 Debug

Si problèmes:
1. Vérifier les logs de la fonction
2. Vérifier l'état de l'instance WhatsApp 
3. Vérifier que la base de données est accessible
4. Tester l'endpoint `/health`

## 🎯 Statut du Déploiement

- [x] Base de données créée avec restaurants de Conakry
- [x] Tous les repositories implémentés
- [x] Architecture SOLID complète  
- [x] Handlers intégrés avec base de données
- [x] Function Edge prête au déploiement
- [ ] **À FAIRE: Exécuter le script SQL sur Supabase**
- [ ] **À FAIRE: Déployer la function via l'interface web**
- [ ] **À FAIRE: Tester le workflow complet**