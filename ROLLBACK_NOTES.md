# 🔄 ROLLBACK NOTES - UniversalBot.ts

## 📝 MODIFICATIONS PERDUES LORS DU ROLLBACK

### ✅ CORRECTIONS IMPORTANTES À RETENIR :

1. **🔑 Clé API Corrigée (CRITIQUE)**
   - **Ligne 60** : `this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'`
   - **Problème** : `CUSTOM_SERVICE_ROLE_KEY` contenait une clé invalide
   - **Solution** : Utiliser directement la bonne clé JWT

2. **🔧 Champ bot_state dans createSessionForRestaurant**
   - **RETIRÉ** : `bot_state: 'CHOOSING_DELIVERY_MODE'` de l'INSERT local
   - **Raison** : Causait des conflits de format avec SessionManager
   - **NOTE** : Ce champ avait été ajouté pour corriger un autre bug - À SURVEILLER

### ❌ RÉGRESSIONS CAUSÉES PAR LES MODIFICATIONS :

1. **Session expirée après tapé "3"**
   - Workflow : `0164880605` → `1` → `3` → ❌ "Session expirée"
   - **Cause probable** : Mapping entre fonction locale et SessionManager incohérent

2. **Multiples tentatives de correction**
   - SessionManager.getSession() commenté puis restauré
   - Format session_data (string vs objet) 
   - Corruption de données en array de caractères

### 🎯 COMMIT DE ROLLBACK CIBLE :
- **Commit stable** : Avant les modifications de session management
- **Recherche** : Dernier commit où `0164880605` → modes livraison fonctionnait complètement

### ⚠️ LEÇONS APPRISES :
1. **Ne jamais modifier** plusieurs systèmes en même temps (session + API keys)
2. **Tester complètement** chaque workflow après modification
3. **Garder la cohérence** entre fonction locale et SessionManager
4. **Une seule approche** : Soit tout local, soit tout SessionManager

### 📋 ACTIONS POST-ROLLBACK :
1. ✅ Restaurer le fichier à un état stable
2. ⚠️ Re-appliquer UNIQUEMENT la correction de clé API si nécessaire
3. 🧪 Tester workflow complet : `numéro → mode → catégorie → produit`
4. 📝 Documenter l'état fonctionnel avant toute nouvelle modification

Date: 11 septembre 2025
Durée de debug: ~4 heures (inacceptable)