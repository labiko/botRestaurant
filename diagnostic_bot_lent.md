# 🩺 DIAGNOSTIC BOT LENT - Guide Express

## 🚨 QUAND UTILISER
**Seulement quand vous constatez une lenteur > 10 secondes**

## ⚡ DIAGNOSTIC RAPIDE (2 minutes)

### ÉTAPE 1 : Vérifier Queues GreenAPI
1. Aller sur https://console.green-api.com/instanceList/7105313693
2. Menu → "Queue"
3. Noter les compteurs :
   - **Outgoing Queue :** ___ messages
   - **Incoming Queue :** ___ webhooks

### ÉTAPE 2 : Analyser & Agir

#### Si Queues > 10 messages
```
✅ CAUSE TROUVÉE : Surcharge queues
✅ SOLUTION : Nettoyer les queues
✅ ACTION : ClearMessagesQueue + ClearWebhooksQueue
✅ RÉSULTAT : Bot redevient rapide en 30s
```

#### Si Queues vides (< 5 messages)
```
⚠️ CAUSE : Problème Supabase ou DB
⚠️ SOLUTION : Attendre ou redéployer
⚠️ ACTION :
   - Attendre 2-3 minutes
   - Si persist → Redéployer bot-resto-france-universel
   - Si persist → Vérifier logs Supabase
```

## 📊 HISTORIQUE DES DIAGNOSTICS

| Date | Heure | Lenteur | Outgoing | Incoming | Action | Résultat |
|------|-------|---------|----------|----------|--------|----------|
| | | s | msg | webhooks | | |
| | | s | msg | webhooks | | |
| | | s | msg | webhooks | | |

## 🎯 STATISTIQUES
- **Lenteurs causées par queues :** ___/___
- **Lenteurs causées par Supabase :** ___/___
- **Efficacité nettoyage queues :** ___%