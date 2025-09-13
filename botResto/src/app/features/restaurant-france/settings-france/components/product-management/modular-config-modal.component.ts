import { Component, Input, OnInit, Inject } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ProductManagementService, FranceProduct } from '../../../services/product-management.service';

@Component({
  selector: 'app-modular-config-modal',
  templateUrl: './modular-config-modal.component.html',
  styleUrls: ['./modular-config-modal.component.scss'],
  standalone: false
})
export class ModularConfigModalComponent implements OnInit {
  @Input() product!: FranceProduct;
  @Input() details: any;
  @Input() hideDeliveryInfo: boolean = false;

  configForm!: FormGroup;
  isLoading = false;
  
  // Système d'onglets
  activeTab: 'sizes' | 'drinks' | 'meats' | 'sauces' | 'options' = 'sizes';
  
  // Boissons dynamiques basées sur le produit
  availableDrinks: string[] = [];
  drinkSizes: string[] = [];

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private productManagementService: ProductManagementService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.extractDrinkInformation();
  }

  private initializeForm() {
    // Prix de base - afficher les vraies valeurs ou vide si pas définies
    this.configForm = this.formBuilder.group({
      price_on_site_base: [this.product.price_on_site_base || ''],
      price_delivery_base: [this.product.price_delivery_base || ''],
      sizes: this.formBuilder.array([]),
      options: this.formBuilder.array([])
    });

    // Initialiser les tailles - Filtrer les doublons par précaution
    if (this.details.sizes) {
      const sizesArray = this.configForm.get('sizes') as FormArray;
      
      // Éliminer les doublons basés sur size_name + prix pour éviter l'affichage multiple
      const uniqueSizes = this.details.sizes.filter((size: any, index: number, array: any[]) => {
        return array.findIndex((s: any) => 
          s.size_name === size.size_name && 
          s.price_on_site === size.price_on_site &&
          s.price_delivery === size.price_delivery
        ) === index;
      });

      uniqueSizes.forEach((size: any) => {
        sizesArray.push(this.formBuilder.group({
          id: [size.id],
          size_name: [size.size_name],
          price_on_site: [size.price_on_site],
          price_delivery: [size.price_delivery || 0],
          includes_drink: [size.includes_drink],
          is_active: [size.is_active !== undefined ? size.is_active : true] // Par défaut actif si pas défini
        }));
      });
    }

    // Initialiser les options
    if (this.details.options) {
      const optionsArray = this.configForm.get('options') as FormArray;
      
      // Debug : voir les groupes d'options
      console.log('🔍 [Options] Groupes détectés:', 
        [...new Set(this.details.options.map((opt: any) => opt.option_group))]
      );
      
      this.details.options.forEach((option: any) => {
        console.log(`📝 [Option] ${option.option_name} - Groupe: "${option.option_group}"`);
        
        optionsArray.push(this.formBuilder.group({
          id: [option.id],
          option_name: [option.option_name],
          option_group: [option.option_group],
          price_modifier: [option.price_modifier],
          is_required: [option.is_required],
          is_active: [option.is_active]
        }));
      });
    }
  }

  get sizesFormArray() {
    return this.configForm.get('sizes') as FormArray;
  }

  get optionsFormArray() {
    return this.configForm.get('options') as FormArray;
  }

  // Méthodes de filtrage par groupe (insensible à la casse)
  private filterOptionsByGroup(options: any[], group: string): any[] {
    return options.filter(opt => {
      const optGroup = opt.option_group?.toLowerCase() || '';
      return optGroup.includes(group.toLowerCase());
    });
  }

  get meatOptions() { 
    // Cherche 'viande' ou 'meat' dans le groupe
    return this.optionsFormArray.value?.filter((opt: any) => {
      const group = opt.option_group?.toLowerCase() || '';
      return group.includes('viande') || group.includes('meat') || group.includes('protéine');
    }) || [];
  }
  
  get sauceOptions() { 
    // Cherche 'sauce' ou 'condiment' dans le groupe
    return this.optionsFormArray.value?.filter((opt: any) => {
      const group = opt.option_group?.toLowerCase() || '';
      return group.includes('sauce') || group.includes('condiment');
    }) || [];
  }
  
  get otherOptions() { 
    // Exclut viandes et sauces
    return this.optionsFormArray.value?.filter((opt: any) => {
      const group = opt.option_group?.toLowerCase() || '';
      return !group.includes('viande') && !group.includes('meat') && 
             !group.includes('sauce') && !group.includes('condiment') &&
             !group.includes('protéine');
    }) || [];
  }


  // Navigation onglets
  setActiveTab(tab: string | number | undefined) {
    if (tab && typeof tab === 'string' && (tab === 'sizes' || tab === 'drinks' || tab === 'meats' || tab === 'sauces' || tab === 'options')) {
      this.activeTab = tab as 'sizes' | 'drinks' | 'meats' | 'sauces' | 'options';
    }
  }

  // Extraire les informations de boissons depuis les tailles existantes
  private extractDrinkInformation() {
    if (!this.details?.sizes) return;

    // Collecter les tailles de boissons depuis les includes_drink des tailles
    const drinkSizesSet = new Set<string>();
    
    this.details.sizes.forEach((size: any) => {
      if (size.includes_drink) {
        // Pour TACOS, typiquement c'est 33CL, pour les gros menus peut être 1L5
        // On peut inférer depuis le nom de la taille ou avoir une logique
        if (size.size_name?.includes('M') || size.size_name?.includes('MENU M')) {
          drinkSizesSet.add('33CL');
        } else if (size.size_name?.includes('L') || size.size_name?.includes('XL')) {
          drinkSizesSet.add('1L5');
        } else {
          drinkSizesSet.add('33CL'); // Par défaut
        }
      }
    });

    this.drinkSizes = Array.from(drinkSizesSet);
    
    // Types de boissons standards (pourrait venir de la base de données)
    this.availableDrinks = [
      'Coca Cola',
      'Fanta',
      'Sprite', 
      'Eau',
      'Oasis',
      'Ice Tea'
    ];

    console.log('🥤 [DrinkExtraction] Tailles détectées:', this.drinkSizes);
    console.log('🥤 [DrinkExtraction] Boissons disponibles:', this.availableDrinks);
  }

  async saveConfiguration() {
    this.isLoading = true;
    
    const formValue = this.configForm.value;
    
    try {
      // Sauvegarder les prix de base
      await this.saveBasePrices(formValue);
      
      // Sauvegarder les tailles
      await this.saveSizes(formValue.sizes);
      
      // Sauvegarder les options
      await this.saveOptions(formValue.options);
      
      await this.presentToast('Configuration sauvegardée avec succès', 'success');
      this.dismiss(true);
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      await this.presentToast('Erreur lors de la sauvegarde', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private async saveBasePrices(formValue: any) {
    return new Promise((resolve, reject) => {
      this.productManagementService.updateSimpleProductPrices(
        this.product.id,
        formValue.price_on_site_base,
        formValue.price_delivery_base
      ).subscribe({
        next: () => resolve(true),
        error: (error: any) => reject(error)
      });
    });
  }

  private async saveSizes(sizes: any[]) {
    const promises = sizes.map(size => {
      if (size.id) {
        // Update existing size
        return new Promise((resolve, reject) => {
          this.productManagementService.updateProductSize(size.id, size).subscribe({
            next: () => resolve(true),
            error: (error: any) => reject(error)
          });
        });
      } else {
        // Create new size
        console.log('✅ [SaveSizes] Création nouvelle taille:', size.size_name);
        console.log('📝 [SaveSizes] Données à envoyer:', {
          product_id: this.product.id,
          size_name: size.size_name,
          price_on_site: size.price_on_site,
          price_delivery: size.price_delivery,
          includes_drink: size.includes_drink,
          display_order: 0
        });
        
        return new Promise((resolve, reject) => {
          this.productManagementService.createProductSize(this.product.id, {
            product_id: this.product.id,
            size_name: size.size_name,
            price_on_site: Number(size.price_on_site), // S'assurer que c'est un nombre
            price_delivery: size.price_delivery ? Number(size.price_delivery) : undefined, // S'assurer que c'est un nombre ou undefined
            includes_drink: Boolean(size.includes_drink), // S'assurer que c'est un boolean
            display_order: 0
          }).subscribe({
            next: (result) => {
              console.log('✅ [SaveSizes] Taille créée avec succès:', result);
              resolve(true);
            },
            error: (error: any) => {
              console.error('❌ [SaveSizes] Erreur création taille détaillée:', {
                error: error,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code
              });
              reject(error);
            }
          });
        });
      }
    });

    await Promise.all(promises);
  }

  private async saveOptions(options: any[]) {
    const promises = options.map(option => {
      if (option.id) {
        // Update existing option
        return new Promise((resolve, reject) => {
          this.productManagementService.updateProductOption(option.id, {
            option_name: option.option_name,
            option_group: option.option_group,
            price_modifier: Number(option.price_modifier),
            is_required: Boolean(option.is_required),
            is_active: Boolean(option.is_active),
            display_order: option.display_order || 0
          }).subscribe({
            next: () => {
              console.log('✅ [SaveOptions] Option mise à jour:', option.option_name);
              resolve(true);
            },
            error: (error: any) => {
              console.error('❌ [SaveOptions] Erreur mise à jour option:', error);
              reject(error);
            }
          });
        });
      } else {
        // Create new option
        return new Promise((resolve, reject) => {
          this.productManagementService.createProductOption(this.product.id, {
            product_id: option.product_id,
            option_name: option.option_name,
            option_group: option.option_group,
            price_modifier: Number(option.price_modifier),
            is_required: Boolean(option.is_required),
            max_selections: 1,
            display_order: option.display_order || 0,
            is_active: Boolean(option.is_active),
            group_order: 0
          }).subscribe({
            next: (result) => {
              console.log('✅ [SaveOptions] Nouvelle option créée:', result);
              resolve(true);
            },
            error: (error: any) => {
              console.error('❌ [SaveOptions] Erreur création option:', error);
              reject(error);
            }
          });
        });
      }
    });

    await Promise.all(promises);
  }

  addNewSize() {
    const sizesArray = this.configForm.get('sizes') as FormArray;
    
    // Héritage intelligent : copier la première taille comme template
    let templateSize = null;
    if (sizesArray.length > 0) {
      templateSize = sizesArray.at(0)?.value;
    }
    
    // Déterminer le nouveau nom de menu
    const currentSizes = sizesArray.controls.map(control => control.get('size_name')?.value);
    const menuLetters = ['M', 'L', 'XL', 'XXL', 'XXXL'];
    let newMenuName = 'MENU M'; // par défaut
    
    // Trouver la prochaine taille disponible
    for (const letter of menuLetters) {
      const menuName = `MENU ${letter}`;
      if (!currentSizes.includes(menuName)) {
        newMenuName = menuName;
        break;
      }
    }
    
    // Si template existe, hériter de ses propriétés
    const newSize = {
      id: [null],
      size_name: [newMenuName],
      price_on_site: [templateSize ? templateSize.price_on_site + 2 : 7], // +2€ par défaut
      price_delivery: [templateSize ? templateSize.price_delivery + 2 : 8], // +2€ par défaut  
      includes_drink: [templateSize ? templateSize.includes_drink : true], // même config boisson
      is_active: [true] // Nouvelle taille active par défaut
    };
    
    sizesArray.push(this.formBuilder.group(newSize));
  }

  removeSize(index: number) {
    const sizesArray = this.configForm.get('sizes') as FormArray;
    sizesArray.removeAt(index);
  }

  /**
   * Gère le changement de statut d'une taille avec sauvegarde automatique
   */
  async onSizeToggleChange(sizeIndex: number, event: any) {
    const isActive = event.detail.checked;
    const sizeForm = this.sizesFormArray.at(sizeIndex);
    const sizeId = sizeForm.get('id')?.value;
    const sizeName = sizeForm.get('size_name')?.value;
    
    console.log(`🔄 Toggle taille "${sizeName}" (ID: ${sizeId}) -> ${isActive ? 'ACTIF' : 'INACTIF'}`);
    
    if (sizeId) {
      // Taille existante - sauvegarder immédiatement en base
      this.productManagementService.updateProductSizeStatus(sizeId, isActive).subscribe({
        next: async () => {
          await this.presentToast(
            `Taille "${sizeName}" ${isActive ? 'activée' : 'désactivée'}`, 
            isActive ? 'success' : 'warning'
          );
        },
        error: async (error) => {
          console.error('Erreur mise à jour statut taille:', error);
          // Remettre l'ancien état en cas d'erreur
          sizeForm.get('is_active')?.setValue(!isActive, { emitEvent: false });
          await this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
        }
      });
    } else {
      // Nouvelle taille - juste mettre à jour le form (sera sauvé avec le reste)
      console.log(`📝 Nouvelle taille "${sizeName}" marquée comme ${isActive ? 'active' : 'inactive'}`);
    }
  }

  /**
   * Gère le changement de statut d'une option (viande, sauce, etc.) avec sauvegarde automatique
   */
  async onOptionToggleChange(option: any, event: any) {
    const isActive = event.detail.checked;
    const optionId = option.id;
    const optionName = option.option_name;
    
    console.log(`🔄 Toggle option "${optionName}" (ID: ${optionId}) -> ${isActive ? 'ACTIF' : 'INACTIF'}`);
    
    if (optionId) {
      // Option existante - sauvegarder immédiatement en base
      this.productManagementService.updateProductOptionStatus(optionId, isActive).subscribe({
        next: async () => {
          // Mettre à jour la valeur dans le FormArray
          const optionIndex = this.optionsFormArray.value.findIndex((opt: any) => opt.id === optionId);
          if (optionIndex !== -1) {
            const optionForm = this.optionsFormArray.at(optionIndex);
            optionForm.get('is_active')?.setValue(isActive);
          }
          
          await this.presentToast(
            `${optionName} ${isActive ? 'activé' : 'désactivé'}`, 
            isActive ? 'success' : 'warning'
          );
        },
        error: async (error) => {
          console.error('Erreur mise à jour statut option:', error);
          // Remettre l'ancien état en cas d'erreur
          const optionIndex = this.optionsFormArray.value.findIndex((opt: any) => opt.id === optionId);
          if (optionIndex !== -1) {
            const optionForm = this.optionsFormArray.at(optionIndex);
            optionForm.get('is_active')?.setValue(!isActive);
          }
          await this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
        }
      });
    }
  }

  addNewOption() {
    const optionsArray = this.configForm.get('options') as FormArray;
    optionsArray.push(this.formBuilder.group({
      id: [null],
      option_name: ['Nouvelle option'],
      option_group: ['Groupe'],
      price_modifier: [0],
      is_required: [false],
      is_active: [true]
    }));
  }

  removeOption(index: number) {
    const optionsArray = this.configForm.get('options') as FormArray;
    optionsArray.removeAt(index);
  }

  addNewMeat() {
    const optionsArray = this.configForm.get('options') as FormArray;
    optionsArray.push(this.formBuilder.group({
      id: [null],
      product_id: [this.product.id],
      option_name: ['Nouvelle viande'],
      option_group: ['VIANDES'],
      price_modifier: [0],
      is_required: [false],
      is_active: [true],
      display_order: [0],
      max_selections: [1],
      group_order: [0]
    }));
  }

  addNewSauce() {
    const optionsArray = this.configForm.get('options') as FormArray;
    optionsArray.push(this.formBuilder.group({
      id: [null],
      product_id: [this.product.id],
      option_name: ['Nouvelle sauce'],
      option_group: ['SAUCES'],
      price_modifier: [0],
      is_required: [false],
      is_active: [true],
      display_order: [0],
      max_selections: [1],
      group_order: [0]
    }));
  }

  dismiss(hasChanges: boolean = false) {
    this.modalController.dismiss(hasChanges);
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}