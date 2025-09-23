import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ProductManagementService, CompositeItem, ProductOption } from '../../../services/product-management.service';

interface ModalConfig {
  showBasicInfo: boolean;
  showPricing: boolean;
  showComposition: boolean;
  showComponents: boolean;
  showWorkflow: boolean;
  showSteps: boolean;
  showJsonConfig: boolean;
}

@Component({
  selector: 'app-universal-product-modal',
  templateUrl: './universal-product-modal.component.html',
  styleUrls: ['./universal-product-modal.component.scss'],
  standalone: false
})
export class UniversalProductModalComponent implements OnInit {
  @Input() product: any;
  @Input() mode: 'edit' | 'duplicate' = 'edit'; // Nouveau paramètre
  
  productForm!: FormGroup;
  modalConfig: ModalConfig = {
    showBasicInfo: true,
    showPricing: true,
    showComposition: true,
    showComponents: false,
    showWorkflow: false,
    showSteps: false,
    showJsonConfig: false
  };
  
  selectedTab = 'info';
  compositeItems: CompositeItem[] = [];
  productOptions: ProductOption[] = [];
  groupedOptions: { [key: string]: ProductOption[] } = {};

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private productManagementService: ProductManagementService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    console.log('🔍 [UniversalModal] Produit reçu:', this.product);
    console.log('🔍 [UniversalModal] Mode:', this.mode);
    this.analyzeProduct();
    this.populateForm();
    this.loadCompositeItems();
    this.loadProductOptions();
  }

  private initializeForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      composition: [''],
      display_order: [0],
      is_active: [true],
      price_on_site_base: ['', [Validators.required, Validators.min(0)]],
      price_delivery_base: ['', [Validators.required, Validators.min(0)]],
      product_type: ['simple'],
      workflow_type: [''],
      requires_steps: [false],
      steps_config: [''],
      category_id: [null] // ✅ AJOUT: champ category_id manquant
    });
  }

  private analyzeProduct() {
    console.log('🔍 [UniversalModal] Analyse du produit pour adapter l\'interface');
    
    if (!this.product) {
      console.log('❌ [UniversalModal] Aucun produit fourni');
      return;
    }

    // Réinitialiser la configuration
    this.modalConfig = {
      showBasicInfo: true,
      showPricing: true,
      showComposition: true,
      showComponents: false,
      showWorkflow: false,
      showSteps: false,
      showJsonConfig: false
    };

    // Adaptation selon le type de produit
    if (this.product.product_type === 'composite') {
      console.log('✅ [UniversalModal] Produit composite détecté - activation workflow');
      this.modalConfig.showComponents = true;
      this.modalConfig.showWorkflow = true;
    }

    // Activation spéciale pour les workflows universels
    if (this.product.workflow_type === 'universal_workflow_v2') {
      console.log('✅ [UniversalModal] Workflow universel v2 détecté - activation onglet composants');
      this.modalConfig.showComponents = true;
    }
    
    if (this.product.requires_steps) {
      console.log('✅ [UniversalModal] Étapes requises - activation configuration étapes');
      this.modalConfig.showSteps = true;
    }
    
    if (this.product.steps_config && this.product.steps_config !== null) {
      console.log('✅ [UniversalModal] Configuration JSON détectée - activation éditeur avancé');
      this.modalConfig.showJsonConfig = true;
    }

    console.log('🎯 [UniversalModal] Configuration finale:', this.modalConfig);
  }

  private populateForm() {
    if (!this.product) return;

    console.log('🔍 [UniversalModal] category_id du produit source:', this.product.category_id);

    this.productForm.patchValue({
      name: this.product.name || '',
      description: this.product.description || '',
      composition: this.product.composition || '',
      display_order: this.product.display_order || 0,
      is_active: this.product.is_active !== false,
      price_on_site_base: this.product.price_on_site_base || 0,
      price_delivery_base: this.product.price_delivery_base || 0,
      product_type: this.product.product_type || 'simple',
      workflow_type: this.product.workflow_type || '',
      requires_steps: this.product.requires_steps || false,
      steps_config: this.product.steps_config ? JSON.stringify(this.product.steps_config, null, 2) : '',
      category_id: this.product.category_id || null // ✅ AJOUT: Duplication du category_id
    });

    console.log('📝 [UniversalModal] Formulaire peuplé avec les données produit');
  }

  onTabChange(tab: string) {
    this.selectedTab = tab;
    console.log('📋 [UniversalModal] Changement d\'onglet:', tab);
  }

  async onSave() {
    if (this.productForm.invalid) {
      console.log('❌ [UniversalModal] Formulaire invalide');
      const alert = await this.alertController.create({
        header: 'Erreur de validation',
        message: 'Veuillez vérifier tous les champs obligatoires.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const formData = this.productForm.value;
    
    // Parse JSON config si présent
    if (formData.steps_config) {
      try {
        formData.steps_config = JSON.parse(formData.steps_config);
      } catch (e) {
        console.log('⚠️ [UniversalModal] Erreur parsing JSON config:', e);
        formData.steps_config = null;
      }
    }

    console.log('💾 [UniversalModal] Sauvegarde des données:', formData);

    // Ajouter les composants si produit composite
    if (this.product.product_type === 'composite') {
      formData.compositeItems = this.compositeItems;
      console.log('📦 [UniversalModal] Composants inclus:', this.compositeItems);
      console.log('🎯 [UniversalModal] Options modifiées localement (non sauvées automatiquement):', this.productOptions);
    }

    // Retourner les données mises à jour
    this.modalController.dismiss(formData, 'save');
  }

  onCancel() {
    console.log('❌ [UniversalModal] Annulation');
    this.modalController.dismiss(null, 'cancel');
  }

  // Getters pour les templates
  get showInfoTab() { return this.modalConfig.showBasicInfo; }
  get showPricingTab() { return this.modalConfig.showPricing; }
  get showComponentsTab() { return this.modalConfig.showComponents; }
  get showWorkflowTab() { return this.modalConfig.showWorkflow; }
  get showConfigTab() { return this.modalConfig.showJsonConfig; }

  // Méthodes pour gérer les composants
  private async loadCompositeItems() {
    if (!this.product || this.product.product_type !== 'composite') {
      return;
    }

    console.log('📦 [UniversalModal] Chargement des éléments composites pour le produit:', this.product.id);

    this.productManagementService.getCompositeItems(this.product.id).subscribe({
      next: (items) => {
        this.compositeItems = items || [];
        console.log('✅ [UniversalModal] Éléments composites chargés:', this.compositeItems);
      },
      error: (error) => {
        console.error('❌ [UniversalModal] Erreur chargement composants:', error);
        this.compositeItems = [];
      }
    });
  }

  // Méthodes pour gérer les options détaillées
  private async loadProductOptions() {
    if (!this.product || this.product.product_type !== 'composite') {
      return;
    }

    console.log('🎯 [UniversalModal] Chargement des options détaillées pour le produit:', this.product.id);

    this.productManagementService.getProductOptions(this.product.id).subscribe({
      next: (options) => {
        this.productOptions = options || [];
        this.groupOptionsByGroup();
        console.log('✅ [UniversalModal] Options détaillées chargées:', this.productOptions);
        console.log('📁 [UniversalModal] Options groupées:', this.groupedOptions);
      },
      error: (error) => {
        console.error('❌ [UniversalModal] Erreur chargement options:', error);
        this.productOptions = [];
        this.groupedOptions = {};
      }
    });
  }

  // Grouper les options par option_group
  private groupOptionsByGroup() {
    this.groupedOptions = {};
    this.productOptions.forEach(option => {
      if (!this.groupedOptions[option.option_group]) {
        this.groupedOptions[option.option_group] = [];
      }
      this.groupedOptions[option.option_group].push(option);
    });

    // Trier chaque groupe par display_order
    Object.keys(this.groupedOptions).forEach(groupKey => {
      this.groupedOptions[groupKey].sort((a, b) => a.display_order - b.display_order);
    });
  }

  // Obtenir les clés des groupes triées
  getOptionGroupKeys(): string[] {
    return Object.keys(this.groupedOptions).sort();
  }

  // Obtenir l'icône pour un groupe d'options
  getGroupIcon(groupName: string): string {
    if (groupName.toLowerCase().includes('plat') || groupName.toLowerCase().includes('viande')) {
      return 'restaurant';
    }
    if (groupName.toLowerCase().includes('boisson') || groupName.toLowerCase().includes('drink')) {
      return 'wine';
    }
    if (groupName.toLowerCase().includes('sauce')) {
      return 'water';
    }
    return 'options';
  }

  // Obtenir l'icône pour une option spécifique
  getOptionIcon(optionName: string): string {
    const name = optionName.toLowerCase();
    if (name.includes('burger') || name.includes('viande')) {
      return '🍔';
    }
    if (name.includes('pizza')) {
      return '🍕';
    }
    if (name.includes('coca') || name.includes('cola')) {
      return '🥤';
    }
    if (name.includes('eau') || name.includes('water')) {
      return '💧';
    }
    if (name.includes('jus') || name.includes('juice')) {
      return '🧃';
    }
    return '📌';
  }

  // Obtenir le label de type de groupe (Obligatoire/Optionnel)
  getGroupTypeLabel(options: ProductOption[]): string {
    const hasRequired = options.some(opt => opt.is_required);
    return hasRequired ? 'Obligatoire' : 'Optionnel';
  }

  // Obtenir le label de sélection pour un groupe
  getGroupSelectionLabel(options: ProductOption[]): string {
    if (options.length === 0) return '';
    const maxSelections = Math.max(...options.map(opt => opt.max_selections));
    return `${maxSelections} choix`;
  }

  // Ajouter une option à un groupe spécifique
  async addOptionToGroup(groupKey: string) {
    const alert = await this.alertController.create({
      header: `Ajouter une option - ${groupKey}`,
      inputs: [
        {
          name: 'option_name',
          type: 'text',
          placeholder: 'Nom de l\'option (ex: Coca, Burger)'
        },
        {
          name: 'price_modifier',
          type: 'number',
          placeholder: 'Prix modificateur (€)',
          min: 0,
          value: 0
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ajouter',
          handler: (data) => {
            if (data.option_name && data.option_name.trim()) {
              this.createNewOption(groupKey, data.option_name.trim(), parseFloat(data.price_modifier) || 0);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Créer une nouvelle option
  private async createNewOption(groupKey: string, optionName: string, priceModifier: number) {
    try {
      const maxDisplayOrder = Math.max(
        ...this.groupedOptions[groupKey].map(opt => opt.display_order),
        0
      );

      // Déterminer le group_order basé sur l'ordre des groupes existants
      const existingGroupOrders = new Set(
        Object.values(this.groupedOptions).flat().map(opt => opt.group_order || 0)
      );
      const groupOrder = this.groupedOptions[groupKey].length > 0
        ? this.groupedOptions[groupKey][0].group_order
        : Math.max(...existingGroupOrders, 0) + 1;

      const optionData = {
        product_id: this.product.id,
        option_group: groupKey,
        option_name: optionName,
        price_modifier: priceModifier,
        is_required: false,
        max_selections: 1,
        display_order: maxDisplayOrder + 1,
        is_active: true,
        group_order: groupOrder
      };

      console.log('💾 [UniversalModal] Création option en base:', optionData);

      // Sauvegarder en base de données
      this.productManagementService.createProductOption(this.product.id, optionData).subscribe({
        next: (createdOption) => {
          // Ajouter l'option créée (avec son ID) à l'interface
          this.groupedOptions[groupKey].push(createdOption);
          this.productOptions.push(createdOption);

          console.log('✅ [UniversalModal] Option créée avec succès:', createdOption);
        },
        error: (error) => {
          console.error('❌ [UniversalModal] Erreur création option en base:', error);
        }
      });

    } catch (error) {
      console.error('❌ [UniversalModal] Erreur création option:', error);
    }
  }

  // Supprimer une option avec confirmation
  async deleteOption(option: ProductOption) {
    const alert = await this.alertController.create({
      header: 'Supprimer l\'option',
      message: `Êtes-vous sûr de vouloir supprimer "${option.option_name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.removeOptionFromGroup(option);
          }
        }
      ]
    });
    await alert.present();
  }

  // Retirer une option du groupe
  private removeOptionFromGroup(option: ProductOption) {
    // Retirer de la liste groupée
    const groupOptions = this.groupedOptions[option.option_group];
    const groupIndex = groupOptions.findIndex(opt => opt.id === option.id);
    if (groupIndex > -1) {
      groupOptions.splice(groupIndex, 1);
    }

    // Retirer de la liste principale
    const mainIndex = this.productOptions.findIndex(opt => opt.id === option.id);
    if (mainIndex > -1) {
      this.productOptions.splice(mainIndex, 1);
    }

    console.log('🗑️ [UniversalModal] Option supprimée:', option.option_name);
  }


  async addCompositeItem() {
    const alert = await this.alertController.create({
      header: 'Ajouter un composant',
      inputs: [
        {
          name: 'component_name',
          type: 'text',
          placeholder: 'Nom du composant (ex: Burger)'
        },
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'Quantité',
          min: 0,
          value: 1
        },
        {
          name: 'unit',
          type: 'text',
          placeholder: 'Unité (ex: pièce, portion, cl)',
          value: 'pièce'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ajouter',
          handler: (data) => {
            if (data.component_name && data.quantity > 0) {
              const newItem: CompositeItem = {
                id: Date.now(), // ID temporaire
                composite_product_id: this.product.id,
                component_name: data.component_name,
                quantity: parseFloat(data.quantity),
                unit: data.unit || 'pièce'
              };
              this.compositeItems.push(newItem);
              console.log('✅ [UniversalModal] Composant ajouté:', newItem);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editCompositeItem(item: CompositeItem, index: number) {
    const alert = await this.alertController.create({
      header: 'Modifier le composant',
      inputs: [
        {
          name: 'component_name',
          type: 'text',
          value: item.component_name,
          placeholder: 'Nom du composant'
        },
        {
          name: 'quantity',
          type: 'number',
          value: item.quantity,
          placeholder: 'Quantité',
          min: 0
        },
        {
          name: 'unit',
          type: 'text',
          value: item.unit,
          placeholder: 'Unité'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Enregistrer',
          handler: (data) => {
            if (data.component_name && data.quantity > 0) {
              this.compositeItems[index] = {
                ...item,
                component_name: data.component_name,
                quantity: parseFloat(data.quantity),
                unit: data.unit || 'pièce'
              };
              console.log('✅ [UniversalModal] Composant modifié:', this.compositeItems[index]);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  removeCompositeItem(index: number) {
    this.compositeItems.splice(index, 1);
    console.log('🗑️ [UniversalModal] Composant supprimé à l\'index:', index);
  }

  // Méthodes pour gérer les options détaillées
  async editProductOption(option: ProductOption) {
    const alert = await this.alertController.create({
      header: 'Modifier l\'option',
      inputs: [
        {
          name: 'option_name',
          type: 'text',
          value: option.option_name,
          placeholder: 'Nom de l\'option'
        },
        {
          name: 'price_modifier',
          type: 'number',
          value: option.price_modifier,
          placeholder: 'Prix (+/-)',
          min: 0
        },
        {
          name: 'max_selections',
          type: 'number',
          value: option.max_selections,
          placeholder: 'Nombre max de sélections',
          min: 1
        },
        {
          name: 'display_order',
          type: 'number',
          value: option.display_order,
          placeholder: 'Ordre d\'affichage',
          min: 0
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Enregistrer',
          handler: (data) => {
            if (data.option_name && data.price_modifier !== undefined) {
              // Mettre à jour l'option dans le tableau local
              const optionIndex = this.productOptions.findIndex(opt => opt.id === option.id);
              if (optionIndex !== -1) {
                this.productOptions[optionIndex] = {
                  ...option,
                  option_name: data.option_name,
                  price_modifier: parseFloat(data.price_modifier),
                  max_selections: parseInt(data.max_selections),
                  display_order: parseInt(data.display_order)
                };

                // Recalculer les groupes
                this.groupOptionsByGroup();
                console.log('✅ [UniversalModal] Option modifiée:', this.productOptions[optionIndex]);

                // Mettre à jour en base de données
                this.productManagementService.updateProductOption(option.id, {
                  option_name: data.option_name,
                  price_modifier: parseFloat(data.price_modifier),
                  max_selections: parseInt(data.max_selections),
                  display_order: parseInt(data.display_order)
                }).subscribe({
                  next: () => console.log('✅ [UniversalModal] Option mise à jour en base'),
                  error: (error) => console.error('❌ [UniversalModal] Erreur mise à jour option:', error)
                });
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProductOption(option: ProductOption) {
    const alert = await this.alertController.create({
      header: 'Supprimer l\'option',
      message: `Êtes-vous sûr de vouloir supprimer l'option "${option.option_name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          handler: () => {
            // Supprimer de la liste locale
            const optionIndex = this.productOptions.findIndex(opt => opt.id === option.id);
            if (optionIndex !== -1) {
              this.productOptions.splice(optionIndex, 1);
              // Recalculer les groupes
              this.groupOptionsByGroup();
              console.log('🗑️ [UniversalModal] Option supprimée localement:', option.option_name);

              // Supprimer en base de données
              this.productManagementService.deleteProductOption(option.id).subscribe({
                next: () => console.log('✅ [UniversalModal] Option supprimée en base'),
                error: (error) => console.error('❌ [UniversalModal] Erreur suppression option:', error)
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Nouvelles méthodes pour l'édition inline
  toggleOptionStatus(option: ProductOption) {
    console.log('🔄 [UniversalModal] Toggle statut option:', option.option_name, 'vers:', !option.is_active);

    // Mettre à jour localement
    option.is_active = !option.is_active;

    // Sauvegarder en base
    this.productManagementService.updateProductOption(option.id, { is_active: option.is_active }).subscribe({
      next: () => {
        console.log('✅ [UniversalModal] Statut option mis à jour en base');
      },
      error: (error) => {
        console.error('❌ [UniversalModal] Erreur mise à jour statut:', error);
        // Revenir à l'état précédent en cas d'erreur
        option.is_active = !option.is_active;
      }
    });
  }

  updateOptionPrice(option: ProductOption, event: any) {
    const newPrice = parseFloat(event.target.value);

    if (isNaN(newPrice) || newPrice < 0) {
      console.log('⚠️ [UniversalModal] Prix invalide, annulation');
      event.target.value = option.price_modifier; // Restaurer l'ancienne valeur
      return;
    }

    if (newPrice === option.price_modifier) {
      console.log('ℹ️ [UniversalModal] Prix inchangé');
      return;
    }

    console.log('💰 [UniversalModal] Mise à jour prix option:', option.option_name, 'de', option.price_modifier, 'vers', newPrice);

    const oldPrice = option.price_modifier;
    option.price_modifier = newPrice;

    // Sauvegarder en base
    this.productManagementService.updateProductOption(option.id, { price_modifier: newPrice }).subscribe({
      next: () => {
        console.log('✅ [UniversalModal] Prix option mis à jour en base');
      },
      error: (error) => {
        console.error('❌ [UniversalModal] Erreur mise à jour prix:', error);
        // Revenir à l'ancien prix en cas d'erreur
        option.price_modifier = oldPrice;
        event.target.value = oldPrice;
      }
    });
  }
}