# 🤖 Configuration OCR pour Vercel

## Variables d'environnement à configurer sur Vercel

### **Variables OCR requises :**

```bash
# Configuration de base
OCR_DEFAULT_PROVIDER=openai

# OpenAI Vision (Provider principal)
OPENAI_API_KEY=sk-proj-votre-clé-openai-ici
OPENAI_MODEL=gpt-4o

# Google Vision API (Optionnel - Phase 2)
GOOGLE_VISION_API_KEY=votre-clé-google-vision-ici
GOOGLE_VISION_PROJECT_ID=votre-project-id-google-ici

# Azure Cognitive Services (Optionnel - Phase 2)
AZURE_COGNITIVE_API_KEY=votre-clé-azure-ici
AZURE_COGNITIVE_ENDPOINT=https://votre-region.api.cognitive.microsoft.com
```

## 🚀 **Instructions de déploiement Vercel**

### **1. Variables prioritaires (Phase 1)**
Pour que OCR Smart Onboarding fonctionne immédiatement :

```bash
OCR_DEFAULT_PROVIDER=openai
OPENAI_API_KEY=sk-proj-[VOTRE_CLÉ_OPENAI]
OPENAI_MODEL=gpt-4o
```

### **2. Variables optionnelles (Phase 2+)**
Pour activer les providers additionnels plus tard :

```bash
GOOGLE_VISION_API_KEY=[VOTRE_CLÉ_GOOGLE]
GOOGLE_VISION_PROJECT_ID=[VOTRE_PROJECT_ID]
AZURE_COGNITIVE_API_KEY=[VOTRE_CLÉ_AZURE]
AZURE_COGNITIVE_ENDPOINT=[VOTRE_ENDPOINT_AZURE]
```

## 📋 **Checklist de déploiement**

- [ ] ✅ **OPENAI_API_KEY** configurée sur Vercel
- [ ] ✅ **OCR_DEFAULT_PROVIDER=openai** configuré
- [ ] ✅ **OPENAI_MODEL=gpt-4o** configuré
- [ ] 🔄 **Variables Google** (optionnel)
- [ ] 🔄 **Variables Azure** (optionnel)

## 🔧 **Configuration automatique**

L'architecture OCR détecte automatiquement les providers disponibles :

- **Si OpenAI configuré** → Utilise OpenAI Vision
- **Si Google configuré** → Ajoute Google Vision aux options
- **Si Azure configuré** → Ajoute Azure Cognitive aux options
- **Auto-fallback** → Utilise le meilleur provider disponible

## 🏗️ **Architecture mise en place**

```
src/lib/ocr/
├── config.ts                 ✅ Variables Vercel
├── ocr-service.ts            ✅ Auto-détection providers
├── providers/
│   └── openai-provider.ts    ✅ OpenAI Vision
└── interfaces/
    └── ocr-provider.interface.ts ✅ Interface commune
```

## 📊 **Coûts estimés**

| Provider | Coût/image | Précision | Vitesse |
|----------|------------|-----------|---------|
| **OpenAI Vision** | ~0.01€ | 90% | ~15-20s |
| Google Vision | ~0.005€ | 85% | ~5-10s |
| Azure Cognitive | ~0.003€ | 80% | ~3-8s |

**Recommandation** : OpenAI Vision pour l'équilibre précision/coût optimal.

## 🎯 **Test de fonctionnement**

Une fois déployé sur Vercel avec OpenAI configuré :

1. Aller sur `/ocr-onboarding/upload`
2. Upload une image de menu
3. L'OCR devrait extraire automatiquement les produits
4. Continuer le workflow en 5 étapes

**L'architecture est prête pour la production !** 🚀