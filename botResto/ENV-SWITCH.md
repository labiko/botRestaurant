# 🔧 BASCULE ENVIRONNEMENT LOCAL - SIMPLE !

## 📋 **Comment basculer entre DEV et PROD en local**

### **MÉTHODE SIMPLE** ⭐
Modifier **UNE SEULE LIGNE** dans le fichier :
`botResto/src/app/config/environment-config.ts`

```typescript
export const CURRENT_ENVIRONMENT: 'DEV' | 'PROD' = 'DEV';  // ← Changer ici !
```

- **DEV** → Base de développement
- **PROD** → Base de production

### **REDÉMARRER L'APP**
```bash
ionic serve
```

## 🎯 **AVANTAGES HYBRIDES**
- ✅ **Local** : Simple bascule DEV/PROD dans le code
- ✅ **Vercel** : Variables d'environnement automatiques
- ✅ **Merge safe** : Pas de conflit lors des merges

## 🎯 **ENVIRONNEMENTS**

| Fichier | Base Supabase | Usage |
|---------|---------------|-------|
| `.env.dev` | DEV | Développement local |
| `.env.prod` | PROD | Tests locaux avec données prod |
| `.env.local` | **Actif** | Configuration courante |

## 🚨 **IMPORTANT**
- `.env.local` est ignoré par Git
- Toujours redémarrer après changement
- DEV par défaut si pas de `.env.local`