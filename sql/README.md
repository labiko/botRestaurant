# 📁 SQL Scripts - Bot Restaurant

## Structure des dossiers

```
sql/
├── automation/           # Scripts d'automatisation 
├── diagnostics/         # Scripts de diagnostic
├── fixes/              # Scripts de correction
├── migrations/         # Migrations de base de données
└── README.md           # Ce fichier
```

## 📋 Guide d'utilisation

### 1. Automatisation
- **Objectif** : Configurer automatiquement les catégories de produits
- **Localisation** : `automation/`

### 2. Diagnostics  
- **Objectif** : Analyser l'état des données avant modification
- **Localisation** : `diagnostics/`

### 3. Corrections
- **Objectif** : Réparer des configurations cassées
- **Localisation** : `fixes/`

### 4. Migrations
- **Objectif** : Modifications de structure de base de données
- **Localisation** : `migrations/`

## ⚠️ Règles d'utilisation

1. **TOUJOURS** exécuter un diagnostic avant automatisation
2. **TOUJOURS** faire un backup avant modification importante
3. **TESTER** sur un environnement de dev si possible
4. **DOCUMENTER** les changements dans ce README