# 📚 INDEX DES SCRIPTS SQL - Bot Restaurant

## 📁 STRUCTURE DU PROJET

```
sql/
├── automation/          # 🤖 Scripts d'automatisation
├── diagnostics/        # 🔍 Scripts de diagnostic  
├── fixes/             # 🔧 Scripts de correction
├── migrations/        # 📦 Migrations de structure
└── INDEX.md          # 📚 Ce fichier
```

## 🤖 AUTOMATION - Scripts d'automatisation

### **Fichier principal**
- `create_corrected_automation_functions.sql` - **Fonctions d'automatisation V4.0**

### **Documentation** 
- `PREREQUISITES.md` - Prérequis techniques
- `USAGE_GUIDE.md` - Guide d'utilisation pratique

### **Fonctions disponibles :**
```sql
-- Fonction principale (V4.0)
configure_category_workflow(category_name, config_type, source_category, force_execution)

-- Fonctions auxiliaires
copy_working_config(source_category, target_category)
apply_composite_config(category_name, include_drinks) 
apply_simple_config(category_name)
fix_category_configuration(category_name)
```

### **Modes supportés :**
- `'copy_from'` - Copie config d'une catégorie fonctionnelle ✅ **RECOMMANDÉ**
- `'simple'` - Configuration basique sans options ✅ 
- `'composite'` - Configuration avancée avec workflow ⚠️

## 🔍 DIAGNOSTICS - Scripts d'analyse

### **Diagnostics généraux**
- `diagnostic_simple_with_drinks_33cl.sql` - Vue d'ensemble toutes catégories
- `diagnostic_templates.sql` - Templates de diagnostic

### **Diagnostics spécifiques**
- `diagnostic_sandwichs_existant.sql` - État SANDWICHS + boissons 33CL
- `diagnostic_gourmets_config.sql` - Analyse config GOURMETS (référence)
- `diagnostic_perte_donnees.sql` - Analyse de perte de données

## 🔧 FIXES - Scripts de correction

### **Corrections automatisation**
- `fix_sandwichs_configuration.sql` - Remet SANDWICHS en simple
- `fix_sandwichs_complete_reset.sql` - Reset complet SANDWICHS
- `fix_burgers_automation.sql` - Correction automatisation BURGERS

### **Corrections workflows**
- `fix_tacos_workflow_clean.sql` - Nettoyage workflow TACOS
- `fix_tacos_sauces_workflow.sql` - Workflow sauces TACOS
- `fix_tacos_boissons_format_correct.sql` - Format boissons TACOS
- `fix_sauces_selection_multiple.sql` - Sélection multiple sauces

### **Corrections données**
- `fix_boissons.sql` - Corrections catégorie boissons
- `fix_includes_drink.sql` - Flag includes_drink
- `fix_chicken_box_numbering.sql` - Numérotation CHICKEN BOX
- `fix_gourmet_remove_sizes.sql` - Suppression tailles GOURMETS

### **Corrections techniques**
- `fix_session_table_bot_state.sql` - Table sessions bot
- `fix_pending_assignments.sql` - Assignations en attente
- `fix_delivery_radius.sql` - Rayon de livraison

### **Corrections templates**
- `fix_workflow_templates_final.sql` - Templates finaux
- `fix_workflow_templates_safe.sql` - Templates sécurisés
- `fix_workflow_templates_simple.sql` - Templates simples
- `fix_workflow_templates_structure.sql` - Structure templates

## 📦 MIGRATIONS - Évolutions de structure

*Aucun fichier actuellement - Dossier préparé pour futures migrations*

## 🚀 DÉMARRAGE RAPIDE

### **1. Installation système complet**
```sql
\i sql/automation/create_corrected_automation_functions.sql
```

### **2. Diagnostic global**  
```sql
\i sql/diagnostics/diagnostic_simple_with_drinks_33cl.sql
```

### **3. Configuration catégorie avec boissons**
```sql
SELECT configure_category_workflow('MA_CATEGORIE', 'copy_from', 'GOURMETS');
```

### **4. Configuration catégorie simple**
```sql
SELECT configure_category_workflow('MA_CATEGORIE', 'simple');
```

## 📋 CHECKLIST UTILISATION

### **Avant toute modification :**
- [ ] Lire `automation/PREREQUISITES.md`
- [ ] Exécuter diagnostic approprié
- [ ] Identifier catégorie source fonctionnelle (pour copy_from)
- [ ] Faire backup si modification importante

### **Après modification :**
- [ ] Vérifier résultat en SQL
- [ ] Tester dans le bot WhatsApp  
- [ ] Documenter changements dans ce fichier

## ⚠️ RÈGLES DE SÉCURITÉ

1. **TOUJOURS** diagnostiquer avant modifier
2. **PRIVILÉGIER** copy_from pour reproduire du fonctionnel
3. **TESTER** en bot après chaque modification
4. **DOCUMENTER** tous les changements
5. **BACKUP** avant modifications importantes

## 🎯 CAS D'USAGE FRÉQUENTS

### **Nouvelle catégorie avec choix boissons**
```sql
-- Copier depuis GOURMETS qui fonctionne
SELECT configure_category_workflow('NOUVELLE_CAT', 'copy_from', 'GOURMETS');
```

### **Catégorie cassée à réparer**
```sql
-- Nettoyer puis reconfigurer
SELECT fix_category_configuration('CAT_CASSEE');
SELECT configure_category_workflow('CAT_CASSEE', 'copy_from', 'GOURMETS');
```

### **Catégorie simple sans choix**
```sql
-- Desserts, boissons, etc.
SELECT configure_category_workflow('DESSERTS', 'simple');
```

---

## 📞 SUPPORT

- **Documentation** : Lire `automation/USAGE_GUIDE.md`
- **Prérequis** : Voir `automation/PREREQUISITES.md`  
- **Diagnostic** : Utiliser scripts dans `diagnostics/`
- **Correction** : Utiliser scripts dans `fixes/`