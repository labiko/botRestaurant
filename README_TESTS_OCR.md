# 🧪 **TESTS DE COMPARAISON OCR - VERYFI vs OPENAI**

## 📋 **Vue d'ensemble**

Scripts de test pour comparer les performances de **Veryfi** (API spécialisée restaurants) avec **OpenAI Vision** sur nos images de menus de référence.

## 📁 **Fichiers créés**

```
C:\Users\diall\Documents\IonicProjects\Claude\botRestaurant\
├── test_veryfi_comparison.py      # Script de comparaison principal
├── setup_veryfi_test.py           # Guide de configuration Veryfi
└── README_TESTS_OCR.md            # Ce fichier
```

## 🚀 **Guide d'utilisation rapide**

### **ÉTAPE 1 : Configuration Veryfi (5 minutes)**

```bash
# Lancer le guide de configuration
python setup_veryfi_test.py
```

Le script vous guidera pour :
1. ✅ Créer un compte d'essai Veryfi (14 jours gratuits)
2. ✅ Récupérer vos clés API
3. ✅ Configurer l'environnement
4. ✅ Tester la connexion

### **ÉTAPE 2 : Lancer les tests de comparaison**

```bash
# Comparer Veryfi vs OpenAI sur toutes nos images
python test_veryfi_comparison.py
```

## 🔧 **Configuration Veryfi détaillée**

### **Option A : Variables d'environnement (recommandé)**

**Windows PowerShell :**
```powershell
$env:VERYFI_CLIENT_ID='votre-client-id'
$env:VERYFI_API_KEY='votre-api-key'
$env:VERYFI_USERNAME='votre-username'
```

**Windows CMD :**
```cmd
set VERYFI_CLIENT_ID=votre-client-id
set VERYFI_API_KEY=votre-api-key
set VERYFI_USERNAME=votre-username
```

### **Option B : Modification directe du script**

Ouvrez `test_veryfi_comparison.py` et modifiez :
```python
self.VERYFI_CLIENT_ID = "VOTRE_CLIENT_ID_ICI"
self.VERYFI_API_KEY = "VOTRE_API_KEY_ICI"
self.VERYFI_USERNAME = "VOTRE_USERNAME_ICI"
```

## 📊 **Images testées**

Le script teste automatiquement sur **4 menus de référence** :

| Image | Chemin | Description |
|-------|--------|-------------|
| **BURGERS** | `BOT-RESTO/BOT-UNIVERSEL/CATEGORIES/BURGERS/burgers.jpg` | 10 burgers sur 2 rangées |
| **ASSIETTES** | `BOT-RESTO/BOT-UNIVERSEL/CATEGORIES/ASSIETTES/assiete.jpg` | 4 assiettes + 1 bowl |
| **GOURMETS** | `BOT-RESTO/BOT-UNIVERSEL/CATEGORIES/GOURMETS/gourmet.jpg` | 5 burgers gourmets |
| **AUTRES** | `BOT-RESTO/BOT-UNIVERSEL/CATEGORIES/AUTRES/autres.jpg` | 10 burgers variés |

## 📈 **Métriques comparées**

Pour chaque image, le script compare :

| Métrique | Veryfi | OpenAI | Avantage attendu |
|----------|--------|--------|------------------|
| **Succès d'extraction** | ✅/❌ | ✅/❌ | Égalité probable |
| **Temps de traitement** | ~2-5s | ~2-3s | OpenAI légèrement plus rapide |
| **Produits détectés** | Nombre exact | Nombre exact | **Veryfi (spécialisé)** |
| **Précision des prix** | 99%+ annoncé | ~70-85% observé | **Veryfi** |
| **Structure des données** | Native JSON | Parsing requis | **Veryfi** |
| **Coût par image** | ~0.10€ | ~0.01€ | **OpenAI** |

## 📁 **Résultats générés**

Après exécution, consultez :

```
comparison_results/
├── burgers_comparison.json          # Résultats détaillés burgers
├── assiettes_comparison.json        # Résultats détaillés assiettes
├── gourmets_comparison.json         # Résultats détaillés gourmets
└── autres_comparison.json           # Résultats détaillés autres
```

### **Structure des fichiers résultats :**
```json
{
  "image": "burgers",
  "timestamp": "2025-09-25 18:30:00",
  "veryfi": {
    "success": true,
    "provider": "veryfi",
    "processing_time": 3.2,
    "extracted_data": {
      "total_products_detected": 10,
      "products": [...]
    }
  },
  "openai": {
    "success": true,
    "provider": "openai",
    "processing_time": 2.8,
    "extracted_data": {
      "total_products_detected": 9,
      "products": [...]
    }
  }
}
```

## 📋 **Critères d'évaluation**

### **🏆 Veryfi sera meilleur si :**
- ✅ Détecte **TOUS** les produits (y compris "180", "270")
- ✅ Prix **plus précis** (règle +1€ livraison respectée)
- ✅ **Structure native** sans parsing
- ✅ **Descriptions complètes** des produits

### **🏆 OpenAI sera meilleur si :**
- ✅ **Moins cher** (~10x moins)
- ✅ **Plus rapide**
- ✅ **Déjà intégré** dans notre projet
- ✅ **Flexibilité** du prompt

## 🎯 **Scénarios de décision**

### **Scenario A : Veryfi gagne clairement**
- **Précision 95%+ vs 70-80%** → Adopter Veryfi comme provider premium
- **Tous les produits détectés** → ROI positif malgré le coût

### **Scenario B : Résultats équivalents**
- **Même précision** → Garder OpenAI (moins cher)
- **Différences mineures** → Pas de changement

### **Scenario C : Veryfi décevant**
- **Pas mieux qu'OpenAI** → Abandonner Veryfi
- **Problèmes techniques** → Focus sur Google/Azure

## 🔍 **Analyse attendue**

D'après nos recherches, **Veryfi devrait exceller sur** :
- **Menus complexes** (BURGERS, GOURMETS)
- **Détection des prix** (sur place vs livraison)
- **Produits avec noms courts** ("180", "270")
- **Structure des catégories**

**OpenAI devrait rester compétitif sur** :
- **Menus simples** (ASSIETTES)
- **Vitesse de traitement**
- **Rapport qualité/prix**

## 🚀 **Lancement des tests**

```bash
# 1. Configuration (une seule fois)
python setup_veryfi_test.py

# 2. Tests complets (5-10 minutes)
python test_veryfi_comparison.py

# 3. Analyser les résultats dans comparison_results/
```

## 📞 **Support**

Si problème avec Veryfi :
- 📧 **Support Veryfi** : support@veryfi.com
- 📚 **Documentation** : https://docs.veryfi.com/
- 🆓 **Essai gratuit** : 14 jours, 100 documents

Les résultats de ces tests détermineront si nous intégrons Veryfi dans notre architecture modulaire finale ! 🎯