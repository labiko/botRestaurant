# 🔐 TEST DU FLUX D'AUTHENTIFICATION

## 📋 SCÉNARIOS DE TEST

### **TEST 1 : Accès sans authentification**
1. **Aller sur** : `http://localhost:3000/`
2. **Résultat attendu** : Redirection automatique vers `/login`
3. **Vérification** : URL devient `http://localhost:3000/login`

### **TEST 2 : Page login accessible**
1. **Aller sur** : `http://localhost:3000/login`
2. **Résultat attendu** : Page de connexion s'affiche
3. **Vérification** : Formulaire visible avec champs email/password

### **TEST 3 : Connexion réussie**
1. **Sur** : `/login`
2. **Saisir** :
   - Email : `admin@menuai.com`
   - Password : `admin123`
3. **Cliquer** : "Se connecter"
4. **Résultat attendu** : Redirection vers `/` (page principale)
5. **Vérifications** :
   - Cookie `auth_token` créé
   - Navbar affiche email + bouton déconnexion
   - Accès aux pages protégées

### **TEST 4 : Session persistante**
1. **Après connexion** : Rafraîchir la page (F5)
2. **Résultat attendu** : Reste connecté
3. **Vérification** : Pas de redirection vers `/login`

### **TEST 5 : Déconnexion**
1. **Cliquer** : Bouton "🚪 Déconnexion" dans la navbar
2. **Résultat attendu** : Redirection vers `/login`
3. **Vérifications** :
   - Cookie `auth_token` supprimé
   - localStorage vidé
   - Navbar ne montre plus l'utilisateur

### **TEST 6 : Token expiré (simulation)**
1. **Dans DevTools** : Application → Cookies → Supprimer `auth_token`
2. **Naviguer vers** : `http://localhost:3000/`
3. **Résultat attendu** : Redirection vers `/login`

### **TEST 7 : Protection des routes**
1. **Sans être connecté** : Essayer d'accéder à `/production-sync`
2. **Résultat attendu** : Redirection vers `/login`

---

## 🛠️ OUTILS DE DEBUG

### **Vérifier le cookie** (DevTools) :
```javascript
// Dans la console du navigateur
document.cookie
```

### **Vérifier localStorage** :
```javascript
// Dans la console du navigateur
localStorage.getItem('auth_user')
localStorage.getItem('auth_expires_at')
```

### **Vérifier logs serveur** :
- Logs middleware dans la console Next.js
- Messages `[MIDDLEWARE]` pour traçabilité

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Redirection automatique vers `/login` si non connecté
- [ ] Page `/login` accessible sans token
- [ ] Connexion avec credentials corrects fonctionne
- [ ] Cookie `auth_token` créé avec TTL 2H
- [ ] Redirection vers `/` après connexion
- [ ] Navbar affiche utilisateur connecté
- [ ] Session persiste après rafraîchissement
- [ ] Déconnexion supprime token et redirige
- [ ] Pages protégées inaccessibles sans token
- [ ] Token expiré déclenche déconnexion automatique

---

## 🔧 PRÉREQUIS POUR LES TESTS

1. **Base de données** : Exécuter `create_login_table.sql` en DEV
2. **Serveur** : `npm run dev` dans menu-ai-admin
3. **Navigateur** : DevTools ouverts pour monitoring

---

**🎯 Si tous les tests passent, le système d'authentification est opérationnel !**