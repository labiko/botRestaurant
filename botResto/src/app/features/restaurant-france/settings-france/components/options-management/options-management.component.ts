import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductManagementService } from '../../../services/product-management.service';
import { AuthFranceService } from '../../../auth-france/services/auth-france.service';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ProductOption {
  id: number;
  product_id: number;
  option_group: string;
  option_name: string;
  price_modifier: number;
  is_required: boolean;
  max_selections: number;
  display_order: number;
  is_active: boolean;
  group_order: number;
  france_products?: {
    restaurant_id: number;
    name: string;
    france_menu_categories: {
      name: string;
    };
  };
}

interface UniqueOption {
  id: string;
  name: string;
  group: string;
  price_modifier: number;
  is_active: boolean;
  productIds: number[];
  affectedProducts: number;
  isEditing?: boolean;
  originalName?: string; // Stocker le nom original avant édition
  productDetails?: Array<{productName: string, categoryName: string}>; // Détails des produits associés
}

@Component({
  selector: 'app-options-management',
  templateUrl: './options-management.component.html',
  styleUrls: ['./options-management.component.scss'],
  standalone: false
})
export class OptionsManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = false;
  restaurantId: number;

  // Système de tabs
  activeTab: 'meats' | 'sauces' | 'supplements' | 'beverages' = 'meats';

  // Options par groupe (format unique)
  meatOptions: UniqueOption[] = [];
  sauceOptions: UniqueOption[] = [];
  supplementOptions: UniqueOption[] = [];
  beverageOptions: UniqueOption[] = [];

  // Options brutes pour référence
  private rawOptions: ProductOption[] = [];

  // 🆕 Système dynamique des groupes
  dynamicGroups: string[] = [];
  groupCounts: {[key: string]: number} = {};
  dynamicGroupsOptions: {[key: string]: UniqueOption[]} = {};

  constructor(
    private productManagementService: ProductManagementService,
    private authFranceService: AuthFranceService,
    private toastController: ToastController
  ) {
    // Récupérer l'ID du restaurant depuis la session
    const id = this.authFranceService.getCurrentRestaurantId();
    if (id === null) {
      console.error('❌ [OptionsManagement] Impossible de récupérer restaurant ID');
      throw new Error('Restaurant ID requis');
    }
    this.restaurantId = id;
  }

  ngOnInit() {
    this.loadAllOptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllOptions() {
    this.isLoading = true;

    // Charger toutes les options du restaurant
    this.productManagementService.getAllProductOptions(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          this.rawOptions = options;
          console.log(`📥 [OptionsManagement] Raw options chargées: ${options.length} options totales`);

          // 🆕 Charger les groupes dynamiques
          this.loadDynamicGroups(options);

          // Maintenir le comportement existant
          this.categorizeAndDeduplicateOptions(options);
          this.isLoading = false;
          console.log('✅ [OptionsManagement] Options chargées et dédupliquées:', {
            viandes: this.meatOptions.length,
            sauces: this.sauceOptions.length,
            supplements: this.supplementOptions.length,
            boissons: this.beverageOptions.length,
            rawOptionsCount: this.rawOptions.length,
            dynamicGroups: this.dynamicGroups.length
          });
        },
        error: (error) => {
          console.error('❌ [OptionsManagement] Erreur chargement options:', error);
          this.isLoading = false;
          this.showErrorToast('Erreur lors du chargement des options');
        }
      });
  }

  private categorizeAndDeduplicateOptions(options: ProductOption[]) {
    // Séparer les boissons et les autres options
    const beverageOptions = options.filter(option =>
      option.option_group.toLowerCase().includes('boisson')
    );
    const nonBeverageOptions = options.filter(option =>
      !option.option_group.toLowerCase().includes('boisson')
    );

    // Créer les groupes pour déduplication
    const meatOptionsRaw: ProductOption[] = [];
    const sauceOptionsRaw: ProductOption[] = [];
    const supplementOptionsRaw: ProductOption[] = [];

    // Catégoriser les options brutes
    nonBeverageOptions.forEach(option => {
      const group = option.option_group.toLowerCase();

      if (group.includes('viande') || group.includes('protéine') || group.includes('meat')) {
        meatOptionsRaw.push(option);
      } else if (group.includes('sauce') || group.includes('condiment')) {
        sauceOptionsRaw.push(option);
      } else {
        supplementOptionsRaw.push(option);
      }
    });

    // Déduplicquer chaque groupe
    this.meatOptions = this.deduplicateOptions(meatOptionsRaw);
    this.sauceOptions = this.deduplicateOptions(sauceOptionsRaw);
    this.supplementOptions = this.deduplicateOptions(supplementOptionsRaw);
    this.beverageOptions = this.deduplicateOptions(beverageOptions);

    // Trier par nom
    this.meatOptions.sort((a, b) => a.name.localeCompare(b.name));
    this.sauceOptions.sort((a, b) => a.name.localeCompare(b.name));
    this.supplementOptions.sort((a, b) => a.name.localeCompare(b.name));
    this.beverageOptions.sort((a, b) => a.name.localeCompare(b.name));
  }

  private deduplicateOptions(options: ProductOption[]): UniqueOption[] {
    const uniqueOptions = new Map<string, UniqueOption>();

    options.forEach(option => {
      const cleanKey = this.cleanOptionName(option.option_name);

      // Utiliser le nom nettoyé en minuscules comme clé unique
      const mapKey = cleanKey.toLowerCase();

      if (!uniqueOptions.has(mapKey)) {
        // Créer les détails du premier produit
        const productDetails = [];
        if (option.france_products) {
          productDetails.push({
            productName: option.france_products.name,
            categoryName: option.france_products.france_menu_categories?.name || 'Sans catégorie'
          });
        }

        uniqueOptions.set(mapKey, {
          id: `unique_${mapKey.replace(/\s+/g, '_')}`,
          name: cleanKey, // Utiliser le nom nettoyé et normalisé
          group: option.option_group,
          price_modifier: option.price_modifier,
          is_active: option.is_active,
          productIds: [option.product_id],
          affectedProducts: 1,
          isEditing: false,
          productDetails: productDetails
        });
      } else {
        const existing = uniqueOptions.get(mapKey)!;
        existing.productIds.push(option.product_id);
        existing.affectedProducts++;
        // Garder is_active = true si au moins un produit l'a actif
        existing.is_active = existing.is_active || option.is_active;

        // Ajouter les détails du produit s'ils n'existent pas déjà
        if (option.france_products && existing.productDetails) {
          const productName = option.france_products.name;
          const categoryName = option.france_products.france_menu_categories?.name || 'Sans catégorie';
          const alreadyExists = existing.productDetails.some(
            detail => detail.productName === productName && detail.categoryName === categoryName
          );
          if (!alreadyExists) {
            existing.productDetails.push({ productName, categoryName });
          }
        }
      }
    });

    return Array.from(uniqueOptions.values());
  }

  cleanOptionName(name: string): string {
    // Supprimer tous les émojis et caractères spéciaux du début
    let cleanName = name
      // Supprimer émojis numéros
      .replace(/^[0-9️⃣🔟]+\s*/, '')
      // Supprimer tous les autres émojis du début (including 🍗, 🥩, etc.)
      .replace(/^[\u{1F300}-\u{1F9FF}]+\s*/gu, '')
      // Supprimer espaces multiples
      .replace(/\s+/g, ' ')
      .trim();

    // Normaliser la casse pour comparaison (première lettre majuscule)
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

    return cleanName;
  }

  getActiveCount(options: UniqueOption[]): number {
    return options.filter(option => option.is_active).length;
  }

  /**
   * Navigation entre les tabs
   */
  switchTab(tab: string | number | undefined) {
    if (tab && typeof tab === 'string') {
      // 🆕 Support des groupes dynamiques
      if (this.dynamicGroups.includes(tab)) {
        this.activeTab = tab as any; // Permettre les groupes dynamiques
        console.log(`🔄 [OptionsManagement] Switch to dynamic tab: ${tab}`);
        return;
      }

      // 🔄 Support des tabs statiques existants
      if (tab === 'meats' || tab === 'sauces' || tab === 'supplements' || tab === 'beverages') {
        this.activeTab = tab as 'meats' | 'sauces' | 'supplements' | 'beverages';
        console.log(`🔄 [OptionsManagement] Switch to static tab: ${tab}`);
      }
    }
  }

  async onOptionToggle(uniqueOption: UniqueOption, event: any) {
    const isActive = event.detail.checked;

    console.log(`🔄 [OptionsManagement] Toggle unique option "${uniqueOption.name}": ${isActive} (${uniqueOption.affectedProducts} produits)`);

    try {
      // Mettre à jour TOUTES les instances de cette option sur tous les produits
      await this.updateUniqueOption(uniqueOption, isActive);

      // Mettre à jour localement
      uniqueOption.is_active = isActive;

      const message = isActive ?
        `✅ "${uniqueOption.name}" activée sur ${uniqueOption.affectedProducts} produit(s)` :
        `❌ "${uniqueOption.name}" désactivée sur ${uniqueOption.affectedProducts} produit(s)`;

      this.showSuccessToast(message);

    } catch (error) {
      console.error('❌ [OptionsManagement] Erreur toggle option unique:', error);

      // Restaurer l'état précédent en cas d'erreur
      uniqueOption.is_active = !isActive;

      this.showErrorToast('Erreur lors de la modification de l\'option');
    }
  }

  private async updateUniqueOption(uniqueOption: UniqueOption, isActive: boolean): Promise<void> {
    // Trouver toutes les options brutes correspondantes et les mettre à jour
    // Pour le toggle, on utilise le nom affiché car il n'y a pas de modification du nom
    const relatedOptions = this.rawOptions.filter(option =>
      this.cleanOptionName(option.option_name).toLowerCase() === uniqueOption.name.toLowerCase() &&
      uniqueOption.productIds.includes(option.product_id)
    );

    const updatePromises = relatedOptions.map(option =>
      this.productManagementService.updateProductOptionStatus(option.id, isActive).toPromise()
    );

    await Promise.all(updatePromises);

    // Mettre à jour les options brutes localement aussi
    relatedOptions.forEach(option => {
      option.is_active = isActive;
    });
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Édition inline - Démarrer l'édition
   */
  startEditing(option: UniqueOption) {
    // Arrêter toute autre édition en cours
    [...this.meatOptions, ...this.sauceOptions, ...this.supplementOptions, ...this.beverageOptions]
      .forEach(opt => {
        opt.isEditing = false;
        delete opt.originalName; // Nettoyer les noms originaux des autres éditions
      });

    // Stocker le nom original avant modification
    option.originalName = option.name;
    console.log(`🎬 [OptionsManagement] Début édition - Nom original stocké: "${option.originalName}"`);

    // Démarrer l'édition de cette option
    option.isEditing = true;

    // Focus automatique sur le champ d'édition après le rendu
    setTimeout(() => {
      const editInput = document.querySelector('ion-input.editing-input ion-input') as HTMLElement;
      if (editInput) {
        editInput.focus();
      }
    }, 100);
  }

  /**
   * Édition inline - Sauvegarder le nom
   */
  async saveOptionName(option: UniqueOption) {
    console.log(`🔄 [OptionsManagement] saveOptionName appelé pour: "${option.name}"`);

    if (!option.name.trim()) {
      console.log(`❌ [OptionsManagement] Nom vide détecté`);
      this.showErrorToast('Le nom ne peut pas être vide');
      return;
    }

    // Récupérer le nom original stocké au début de l'édition
    const originalName = option.originalName || option.name;
    console.log(`🔍 [OptionsManagement] Comparaison noms - Original: "${originalName}", Nouveau: "${option.name.trim()}"`);

    // Si le nom n'a pas changé, juste arrêter l'édition
    if (option.name.trim() === originalName) {
      console.log(`ℹ️ [OptionsManagement] Aucun changement détecté, arrêt édition`);
      option.isEditing = false;
      delete option.originalName; // Nettoyer
      return;
    }

    try {
      console.log(`🚀 [OptionsManagement] Début mise à jour pour "${option.name}" (${option.affectedProducts} produits)`);

      // Mettre à jour le nom sur toutes les instances
      await this.updateOptionName(option, option.name.trim(), originalName);

      option.isEditing = false;
      delete option.originalName; // Nettoyer après succès
      console.log(`✅ [OptionsManagement] Modification terminée avec succès`);
      this.showSuccessToast(`Nom modifié: "${option.name}"`);

    } catch (error) {
      console.error('❌ [OptionsManagement] Erreur modification nom:', error);
      this.showErrorToast('Erreur lors de la modification du nom');
      // Restaurer le nom original en cas d'erreur
      if (option.originalName) {
        option.name = option.originalName;
        delete option.originalName;
      }
    }
  }

  private getOriginalOptionName(uniqueOption: UniqueOption): string {
    console.log(`🔍 [OptionsManagement] getOriginalOptionName pour: "${uniqueOption.name}"`);
    console.log(`📊 [OptionsManagement] ProductIds: [${uniqueOption.productIds.join(', ')}]`);

    // Trouver une option brute correspondante pour récupérer le nom original
    const relatedOption = this.rawOptions.find(option =>
      this.cleanOptionName(option.option_name).toLowerCase() === uniqueOption.name.toLowerCase() &&
      uniqueOption.productIds.includes(option.product_id)
    );

    if (relatedOption) {
      const originalName = this.cleanOptionName(relatedOption.option_name);
      console.log(`✅ [OptionsManagement] Option trouvée - Nom brut: "${relatedOption.option_name}", Nom nettoyé: "${originalName}"`);
      return originalName;
    } else {
      console.log(`⚠️ [OptionsManagement] Aucune option brute trouvée, utilise nom affiché: "${uniqueOption.name}"`);
      return uniqueOption.name;
    }
  }

  private async updateOptionName(uniqueOption: UniqueOption, newName: string, originalName: string): Promise<void> {
    console.log(`🔍 [OptionsManagement] updateOptionName - Recherche options pour nom original: "${originalName}"`);
    console.log(`📊 [OptionsManagement] Total rawOptions: ${this.rawOptions.length}`);
    console.log(`📊 [OptionsManagement] ProductIds ciblés: [${uniqueOption.productIds.join(', ')}]`);

    // Trouver toutes les options brutes correspondantes en utilisant le nom ORIGINAL
    const relatedOptions = this.rawOptions.filter(option =>
      this.cleanOptionName(option.option_name).toLowerCase() === originalName.toLowerCase() &&
      uniqueOption.productIds.includes(option.product_id)
    );

    console.log(`🎯 [OptionsManagement] Options trouvées: ${relatedOptions.length}`);
    relatedOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ID: ${option.id}, Produit: ${option.product_id}, Nom actuel: "${option.option_name}"`);
    });

    if (relatedOptions.length === 0) {
      console.warn(`⚠️ [OptionsManagement] Aucune option trouvée pour la mise à jour !`);
      return;
    }

    // Mettre à jour le nom sur toutes les instances
    const updatePromises = relatedOptions.map((option, index) => {
      // Conserver la numérotation émoji si elle existe
      const numberPrefix = option.option_name.match(/^[0-9️⃣🔟]+\s*/)?.[0] || '';
      const newOptionName = numberPrefix + newName;

      console.log(`🔄 [OptionsManagement] Mise à jour ${index + 1}/${relatedOptions.length} - ID: ${option.id}, "${option.option_name}" → "${newOptionName}"`);

      return this.productManagementService.updateProductOptionName(option.id, newOptionName).toPromise();
    });

    console.log(`⏳ [OptionsManagement] Attente de ${updatePromises.length} mises à jour...`);
    await Promise.all(updatePromises);

    // Mettre à jour les options brutes localement
    relatedOptions.forEach(option => {
      const numberPrefix = option.option_name.match(/^[0-9️⃣🔟]+\s*/)?.[0] || '';
      const oldName = option.option_name;
      option.option_name = numberPrefix + newName;
      console.log(`🔄 [OptionsManagement] Mise à jour locale - "${oldName}" → "${option.option_name}"`);
    });

    console.log(`✅ [OptionsManagement] updateOptionName terminé - ${relatedOptions.length} options mises à jour`);
  }

  /**
   * Suppression d'une option
   */
  async deleteOption(option: UniqueOption) {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer "${option.name}" ?\n` +
      `Cette action supprimera l'option de ${option.affectedProducts} produit(s).`
    );

    if (!confirmation) return;

    try {
      // Supprimer toutes les instances de cette option
      await this.deleteUniqueOption(option);

      // Supprimer de l'interface
      this.removeOptionFromUI(option);

      this.showSuccessToast(`"${option.name}" supprimée de ${option.affectedProducts} produit(s)`);

    } catch (error) {
      console.error('❌ [OptionsManagement] Erreur suppression option:', error);
      this.showErrorToast('Erreur lors de la suppression de l\'option');
    }
  }

  private async deleteUniqueOption(uniqueOption: UniqueOption): Promise<void> {
    // Trouver toutes les options brutes correspondantes
    const relatedOptions = this.rawOptions.filter(option =>
      this.cleanOptionName(option.option_name).toLowerCase() === uniqueOption.name.toLowerCase() &&
      uniqueOption.productIds.includes(option.product_id)
    );

    // Supprimer toutes les instances
    const deletePromises = relatedOptions.map(option =>
      this.productManagementService.deleteProductOption(option.id).toPromise()
    );

    await Promise.all(deletePromises);

    // Supprimer des options brutes locales
    relatedOptions.forEach(option => {
      const index = this.rawOptions.indexOf(option);
      if (index > -1) {
        this.rawOptions.splice(index, 1);
      }
    });
  }

  private removeOptionFromUI(option: UniqueOption) {
    // Supprimer de l'array approprié
    let index = this.meatOptions.indexOf(option);
    if (index > -1) {
      this.meatOptions.splice(index, 1);
      return;
    }

    index = this.sauceOptions.indexOf(option);
    if (index > -1) {
      this.sauceOptions.splice(index, 1);
      return;
    }

    index = this.supplementOptions.indexOf(option);
    if (index > -1) {
      this.supplementOptions.splice(index, 1);
      return;
    }

    index = this.beverageOptions.indexOf(option);
    if (index > -1) {
      this.beverageOptions.splice(index, 1);
    }
  }

  // ❌ Méthode addNewOption supprimée pour éviter les options orphelines
  // Les options doivent être créées depuis l'interface de gestion des produits

  // 🆕 ========== SYSTÈME DYNAMIQUE DES GROUPES ==========

  /**
   * Charger dynamiquement les groupes d'options depuis les données
   */
  private loadDynamicGroups(options: ProductOption[]) {
    // Extraire tous les groupes uniques
    const uniqueGroups = [...new Set(options
      .map(option => option.option_group)
      .filter(group => group && group.trim() !== '')
    )];

    this.dynamicGroups = uniqueGroups.sort();

    // 🆕 Définir l'onglet par défaut avec le premier groupe dynamique
    if (this.dynamicGroups.length > 0) {
      this.activeTab = this.dynamicGroups[0] as any;
    }

    // Organiser les options par groupe dynamique
    this.organizeDynamicGroups(options);

    // Calculer les compteurs
    this.calculateGroupCounts();

    console.log('📊 [OptionsManagement] Groupes dynamiques chargés:', {
      groups: this.dynamicGroups,
      counts: this.groupCounts,
      activeTab: this.activeTab
    });
  }

  /**
   * Organiser les options par groupe dynamique
   */
  private organizeDynamicGroups(options: ProductOption[]) {
    this.dynamicGroupsOptions = {};

    this.dynamicGroups.forEach(group => {
      const groupOptions = options.filter(option => option.option_group === group);
      this.dynamicGroupsOptions[group] = this.deduplicateOptions(groupOptions);
    });
  }

  /**
   * Calculer le nombre d'options par groupe
   */
  private calculateGroupCounts() {
    this.groupCounts = {};
    this.dynamicGroups.forEach(group => {
      this.groupCounts[group] = this.dynamicGroupsOptions[group]?.length || 0;
    });
  }

  /**
   * Obtenir un nom d'affichage pour un groupe
   */
  getGroupDisplayName(group: string): string {
    const displayNames: {[key: string]: string} = {
      'Boisson 33CL incluse': 'BOISSONS INCLUSES',
      'Boissons': 'BOISSONS',
      'Plats': 'PLATS',
      'garniture': 'GARNITURES',
      'Entrees': 'ENTRÉES',
      'Supplement': 'SUPPLÉMENTS'
    };
    return displayNames[group] || group.toUpperCase();
  }

  /**
   * Obtenir une icône pour un groupe
   */
  getGroupIcon(group: string): string {
    const groupLower = group.toLowerCase();

    if (groupLower.includes('boisson')) return '🥤';
    if (groupLower.includes('plat')) return '🍽️';
    if (groupLower.includes('garniture')) return '🍟';
    if (groupLower.includes('entree')) return '🥗';
    if (groupLower.includes('supplement')) return '➕';
    if (groupLower.includes('viande') || groupLower.includes('meat')) return '🥩';
    if (groupLower.includes('sauce')) return '🌶️';
    if (groupLower.includes('dessert')) return '🍰';

    return '📋'; // Icône par défaut
  }

  /**
   * Obtenir les options d'un groupe dynamique
   */
  getDynamicGroupOptions(group: string): UniqueOption[] {
    return this.dynamicGroupsOptions[group] || [];
  }

  /**
   * Obtenir le nombre d'options actives dans un groupe dynamique
   */
  getDynamicGroupActiveCount(group: string): number {
    const options = this.getDynamicGroupOptions(group);
    return options.filter(option => option.is_active).length;
  }
}