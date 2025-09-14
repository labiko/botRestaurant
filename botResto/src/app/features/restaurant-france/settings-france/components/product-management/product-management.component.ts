import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModularConfigModalComponent } from './modular-config-modal.component';
import { UniversalProductModalComponent } from './universal-product-modal.component';
import { CategoryManagementModalComponent } from './category-management-modal.component';

import { 
  ProductManagementService, 
  FranceProduct, 
  ProductType, 
  MenuCategory,
  ProductVariant,
  ProductSize,
  ProductOption 
} from '../../../services/product-management.service';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss'],
  standalone: false
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  @ViewChild('categoriesContainer', { static: false }) categoriesContainer!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  products: FranceProduct[] = [];
  categories: MenuCategory[] = [];
  filteredProducts: FranceProduct[] = [];
  
  selectedCategory: string = 'all';
  searchTerm: string = '';
  isLoading = false;
  hideDeliveryInfo = false; // Flag pour masquer les infos de livraison
  isCreating = false; // Protection anti-double-soumission
  
  // Mock restaurant ID - should come from auth service
  restaurantId = 1;

  constructor(
    private productManagementService: ProductManagementService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadRestaurantConfig();
    this.loadData();
  }

  private loadRestaurantConfig() {
    // Charger la configuration du restaurant pour savoir si on doit masquer les infos de livraison
    this.productManagementService.getRestaurantConfig(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config: any) => {
          this.hideDeliveryInfo = config?.hide_delivery_info || false;
        },
        error: (error) => {
          console.error('Error loading restaurant config:', error);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadData() {
    const loading = await this.loadingController.create({
      message: 'Chargement des produits...'
    });
    await loading.present();

    try {
      // Load categories
      this.productManagementService.getMenuCategories(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (categories) => {
            this.categories = categories;
          },
          error: (error) => {
            console.error('Error loading categories:', error);
            this.presentToast('Erreur lors du chargement des catégories', 'danger');
          }
        });

      // Load products
      this.productManagementService.getRestaurantProducts(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (products) => {
            this.products = products;
            this.filterProducts();
          },
          error: (error) => {
            console.error('Error loading products:', error);
            this.presentToast('Erreur lors du chargement des produits', 'danger');
          }
        });

    } finally {
      loading.dismiss();
    }
  }

  private loadProducts() {
    // Reload products only (without loading indicator for modal refreshes)
    this.productManagementService.getRestaurantProducts(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filterProducts();
        },
        error: (error) => {
          console.error('Error reloading products:', error);
          this.presentToast('Erreur lors du rechargement des produits', 'danger');
        }
      });
  }

  onCategoryFilter(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterProducts();
  }

  onCategoryChipClick(categoryValue: string) {
    this.selectedCategory = categoryValue;
    this.filterProducts();
  }

  scrollCategoriesLeft() {
    const container = this.categoriesContainer.nativeElement;
    const scrollAmount = 200; // Pixels to scroll
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }

  scrollCategoriesRight() {
    const container = this.categoriesContainer.nativeElement;
    const scrollAmount = 200; // Pixels to scroll
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  async onConfigureModularProduct(product: FranceProduct) {
    const loading = await this.loadingController.create({
      message: 'Chargement de la configuration...'
    });
    await loading.present();

    try {
      // Charger les détails complets du produit modulaire
      this.productManagementService.getFullProductDetails(product.id, product.product_type)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (details) => {
            loading.dismiss();
            
            // Ouvrir le modal de configuration modulaire
            await this.showModularConfigModal(product, details);
          },
          error: (error) => {
            loading.dismiss();
            console.error('Error loading modular product details:', error);
            this.presentToast('Erreur lors du chargement de la configuration', 'danger');
          }
        });
    } catch (error) {
      loading.dismiss();
      this.presentToast('Erreur lors du chargement de la configuration', 'danger');
    }
  }

  private async showModularConfigModal(product: FranceProduct, details: any) {
    console.log('🔧 [ProductManagement] Ouverture du modal de configuration modulaire:', product.name, details);
    
    const modal = await this.modalController.create({
      component: ModularConfigModalComponent,
      componentProps: {
        product: product,
        details: details,
        hideDeliveryInfo: this.hideDeliveryInfo
      },
      cssClass: 'universal-product-modal',
      backdropDismiss: false
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('✅ Configuration mise à jour, rechargement des produits...');
      this.loadProducts();
    }
  }

  private async showSimpleConfigModal(product: FranceProduct, details: any) {
    // Créer un modal simple avec édition des prix de base
    const alert = await this.alertController.create({
      header: `Configuration: ${product.name}`,
      message: this.buildSimpleConfigMessage(product, details),
      inputs: [
        {
          name: 'priceOnSite',
          type: 'number',
          placeholder: 'Prix de base sur place (€)',
          value: product.price_on_site_base || 0,
          min: 0,
          attributes: {
            step: '0.10'
          }
        },
        {
          name: 'priceDelivery',
          type: 'number',
          placeholder: 'Prix de base livraison (€)',
          value: product.price_delivery_base || 0,
          min: 0,
          attributes: {
            step: '0.10'
          }
        }
      ],
      cssClass: 'simple-config-alert',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Sauvegarder prix de base',
          handler: (data) => {
            if (data.priceOnSite && data.priceDelivery) {
              this.productManagementService.updateSimpleProductPrices(
                product.id, 
                parseFloat(data.priceOnSite), 
                parseFloat(data.priceDelivery)
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  product.price_on_site_base = parseFloat(data.priceOnSite);
                  product.price_delivery_base = parseFloat(data.priceDelivery);
                  this.presentToast('Prix de base mis à jour', 'success');
                },
                error: (error) => {
                  console.error('Error updating base prices:', error);
                  this.presentToast('Erreur lors de la mise à jour des prix', 'danger');
                }
              });
            }
          }
        },
        {
          text: 'Gérer les tailles',
          handler: () => {
            this.manageSimpleSizes(product, details.sizes || []);
          }
        },
        {
          text: 'Gérer les options',
          handler: () => {
            this.manageSimpleOptions(product, details.options || []);
          }
        }
      ]
    });

    await alert.present();
  }

  private buildSimpleConfigMessage(product: FranceProduct, details: any): string {
    let message = `Configuration modulaire\n\n`;
    
    // Prix de base actuel
    message += `Prix actuels:\n`;
    const priceOnSite = product.price_on_site_base ? `${product.price_on_site_base}€` : 'Non défini';
    const priceDelivery = product.price_delivery_base ? `${product.price_delivery_base}€` : 'Non défini';
    message += `• Sur place: ${priceOnSite}\n`;
    message += `• Livraison: ${priceDelivery}\n\n`;
    
    // Statistiques
    if (details.sizes && details.sizes.length > 0) {
      const withDrink = details.sizes.filter((size: any) => size.includes_drink).length;
      message += `Tailles: ${details.sizes.length} configurées (${withDrink} avec boisson)\n`;
    }
    
    if (details.options && details.options.length > 0) {
      const activeOptions = details.options.filter((opt: any) => opt.is_active).length;
      message += `Options: ${activeOptions} actives sur ${details.options.length}\n`;
    }
    
    message += `\nModifiez les prix de base ci-dessous ou gérez les composants:`;
    return message;
  }

  private async manageSimpleSizes(product: FranceProduct, sizes: any[]) {
    let message = `📏 Tailles pour ${product.name}\n\n`;
    
    if (sizes.length === 0) {
      message += `Aucune taille configurée.\n\n`;
    } else {
      sizes.forEach((size, index) => {
        const drinkIcon = size.includes_drink ? '🥤' : '🚫';
        message += `${size.size_name}\n`;
        message += `   Sur place: ${size.price_on_site}€\n`;
        message += `   Livraison: ${size.price_delivery || 'N/A'}€\n`;
        message += `   Boisson: ${drinkIcon}\n\n`;
      });
    }

    const alert = await this.alertController.create({
      header: 'Tailles du produit',
      message,
      buttons: ['Fermer']
    });

    await alert.present();
  }

  private async manageSimpleOptions(product: FranceProduct, options: any[]) {
    let message = `⚙️ Options pour ${product.name}\n\n`;
    
    if (options.length === 0) {
      message += `Aucune option configurée.\n\n`;
    } else {
      options.forEach((option, index) => {
        const status = option.is_active ? '✅' : '❌';
        const required = option.is_required ? 'Obligatoire' : 'Optionnel';
        message += `${status} ${option.option_name}\n`;
        message += `   Groupe: ${option.option_group}\n`;
        message += `   ${required}\n`;
        message += `   Prix: ${option.price_modifier}€\n\n`;
      });
    }

    const alert = await this.alertController.create({
      header: 'Options du produit',
      message,
      buttons: ['Fermer']
    });

    await alert.present();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterProducts();
  }

  private filterProducts() {
    let filtered = this.products;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category_id && product.category_id.toString() === this.selectedCategory
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm))
      );
    }

    this.filteredProducts = filtered;
  }

  getProductTypeLabel(productType: ProductType): string {
    const labels = {
      'simple': 'Simple',
      'modular': 'Modulaire',
      'variant': 'Variantes',
      'composite': 'Composite'
    };
    return labels[productType] || productType;
  }

  getProductTypeColor(productType: ProductType): string {
    const colors = {
      'simple': 'success',
      'modular': 'warning',
      'variant': 'secondary',
      'composite': 'tertiary'
    };
    return colors[productType] || 'medium';
  }

  async onToggleProductStatus(product: FranceProduct) {
    console.log('CLAUDE_DEBUG onToggleProductStatus pour produit:', product.name);
    
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Voulez-vous ${product.is_active ? 'désactiver' : 'activer'} le produit "${product.name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('CLAUDE_DEBUG Annulation changement statut produit');
          }
        },
        {
          text: 'Confirmer',
          handler: () => {
            console.log('CLAUDE_DEBUG Confirmation changement statut produit');
            const newStatus = !product.is_active;
            
            this.productManagementService.updateProductStatus(product.id, newStatus)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  console.log('CLAUDE_DEBUG Statut produit mis à jour avec succès');
                  product.is_active = newStatus;
                  this.presentToast(
                    `Produit ${newStatus ? 'activé' : 'désactivé'}`, 
                    newStatus ? 'success' : 'warning'
                  );
                },
                error: (error) => {
                  console.error('CLAUDE_DEBUG ERREUR mise à jour statut produit:', error);
                  this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async onEditSimpleProductPrices(product: FranceProduct) {
    const inputs: any[] = [
      {
        name: 'priceOnSite',
        type: 'number',
        placeholder: 'Prix sur place (€)',
        value: product.price_on_site_base || 0,
        min: 0,
        attributes: {
          step: '0.10'
        }
      }
    ];

    // Only add delivery price input if delivery info is not hidden
    if (!this.hideDeliveryInfo) {
      inputs.push({
        name: 'priceDelivery',
        type: 'number',
        placeholder: 'Prix livraison (€)',
        value: product.price_delivery_base || 0,
        min: 0,
        attributes: {
          step: '0.10'
        }
      });
    }

    const alert = await this.alertController.create({
      header: this.hideDeliveryInfo ? 'Modifier le prix' : 'Modifier les prix',
      message: `Produit: ${product.name}`,
      inputs,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Sauvegarder',
          handler: (data) => {
            if (data.priceOnSite) {
              const priceDelivery = this.hideDeliveryInfo ? 
                (parseFloat(data.priceOnSite) + 1) : // Auto-calculate +1€ for delivery when hidden
                parseFloat(data.priceDelivery);

              this.productManagementService.updateSimpleProductPrices(
                product.id, 
                parseFloat(data.priceOnSite), 
                priceDelivery
              )
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  product.price_on_site_base = parseFloat(data.priceOnSite);
                  product.price_delivery_base = priceDelivery;
                  this.presentToast('Prix mis à jour', 'success');
                },
                error: (error) => {
                  console.error('Error updating prices:', error);
                  this.presentToast('Erreur lors de la mise à jour des prix', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Nouvelle fonction pour ouvrir la modale universelle adaptative
   */
  async onEditProduct(product: FranceProduct) {
    console.log('🔧 [ProductManagement] Ouverture modale universelle pour:', product.name);
    
    const modal = await this.modalController.create({
      component: UniversalProductModalComponent,
      componentProps: {
        product: product
      },
      backdropDismiss: false,
      cssClass: 'universal-product-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'save' && result.data) {
        console.log('💾 [ProductManagement] Sauvegarde des modifications:', result.data);
        this.saveProductChanges(product, result.data);
      } else {
        console.log('❌ [ProductManagement] Modification annulée');
      }
    });

    return await modal.present();
  }

  /**
   * Sauvegarder les modifications du produit selon son type
   */
  private async saveProductChanges(originalProduct: FranceProduct, updatedData: any) {
    const loading = await this.loadingController.create({
      message: 'Sauvegarde en cours...'
    });
    await loading.present();

    try {
      console.log('💾 [ProductManagement] Sauvegarde complète du produit ID:', originalProduct.id);
      console.log('📝 [ProductManagement] Données à sauvegarder:', updatedData);
      
      // Si produit composite avec composants, utiliser la fonction SQL spéciale
      if (originalProduct.product_type === 'composite' && updatedData.compositeItems) {
        console.log('🔧 [ProductManagement] Mise à jour produit composite avec composants');
        
        // Extraire les composants
        const compositeItems = updatedData.compositeItems;
        delete updatedData.compositeItems;
        
        // Utiliser la fonction SQL update_composite_product_complete via RPC
        await this.productManagementService.updateCompositeProduct(
          originalProduct.id,
          updatedData,
          compositeItems
        ).toPromise();
      } else {
        // Mise à jour standard pour les autres types
        await this.productManagementService.updateProduct(
          originalProduct.id,
          updatedData
        ).toPromise();
      }

      // Mettre à jour les données localement
      Object.assign(originalProduct, updatedData);
      
      await loading.dismiss();
      await this.presentToast('Produit mis à jour avec succès', 'success');
      
      // Recharger les produits pour avoir les données fraîches
      this.loadProducts();
      
    } catch (error) {
      await loading.dismiss();
      console.error('❌ [ProductManagement] Erreur sauvegarde:', error);
      await this.presentToast('Erreur lors de la sauvegarde', 'danger');
    }
  }

  /**
   * Dupliquer un produit existant
   */
  async onDuplicateProduct(product: FranceProduct) {
    console.log('🔄 [ProductManagement] === DÉBUT DUPLICATION ===');
    console.log('🔄 [ProductManagement] Nom du produit:', product.name);
    console.log('🔍 [ProductManagement] OBJET PRODUCT COMPLET:', product);
    console.log('🔍 [ProductManagement] category_id source:', product.category_id);
    console.log('🔍 [ProductManagement] restaurant_id source:', product.restaurant_id);
    console.log('🔍 [ProductManagement] product_type source:', product.product_type);
    console.log('🔄 [ProductManagement] === FIN DEBUG SOURCE ===');
    
    try {
      // 1. Cloner les données du produit (sans l'ID)
      const duplicatedProductData = {
        ...product,
        id: undefined, // Supprimer l'ID pour création
        name: `${product.name} (Copie)`, // Nom modifié
        created_at: undefined,
        updated_at: undefined
      };
      
      console.log('📝 [ProductManagement] Données dupliquées:', duplicatedProductData);
      
      // 2. Ouvrir la modal existante en mode duplication
      const modal = await this.modalController.create({
        component: UniversalProductModalComponent,
        componentProps: {
          product: duplicatedProductData,
          mode: 'duplicate' // Nouveau mode
        },
        backdropDismiss: false,
        cssClass: 'universal-product-modal'
      });

      modal.onDidDismiss().then((result) => {
        if (result.role === 'save' && result.data) {
          console.log('💾 [ProductManagement] Sauvegarde duplication:', result.data);
          this.saveNewProduct(result.data);
        } else {
          console.log('❌ [ProductManagement] Duplication annulée');
        }
      });

      return await modal.present();
      
    } catch (error) {
      console.error('❌ [ProductManagement] Erreur lors de la duplication:', error);
      await this.presentToast('Erreur lors de la duplication', 'danger');
    }
  }

  /**
   * Sauvegarder un nouveau produit (duplication)
   */
  private async saveNewProduct(productData: any) {
    // Protection anti-double-soumission
    if (this.isCreating) {
      console.log('⚠️ [ProductManagement] Création déjà en cours, ignorée');
      return;
    }

    this.isCreating = true;

    const loading = await this.loadingController.create({
      message: 'Création du produit dupliqué...'
    });
    await loading.present();

    try {
      console.log('💾 [ProductManagement] Création nouveau produit:', productData);
      
      // Créer nouveau produit via le service (méthode à ajouter)
      await this.productManagementService.createProduct(
        this.restaurantId, 
        productData
      ).toPromise();
      
      await loading.dismiss();
      await this.presentToast('Produit dupliqué avec succès', 'success');
      
      // Recharger la liste des produits
      this.loadProducts();
      
    } catch (error) {
      await loading.dismiss();
      console.error('❌ [ProductManagement] Erreur création produit:', error);
      await this.presentToast('Erreur lors de la création du produit', 'danger');
    } finally {
      // Toujours remettre le flag à false
      this.isCreating = false;
    }
  }

  async onViewProductDetails(product: FranceProduct) {
    const loading = await this.loadingController.create({
      message: 'Chargement des détails...'
    });
    await loading.present();

    try {
      this.productManagementService.getFullProductDetails(product.id, product.product_type)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (details) => {
            loading.dismiss();
            
            // Show product details in alert
            let message = `<strong>Type:</strong> ${this.getProductTypeLabel(product.product_type)}<br>`;
            
            // Prix sur place
            const priceOnSite = product.price_on_site_base ? `${product.price_on_site_base}€` : 'Non défini';
            message += `<strong>Prix sur place:</strong> ${priceOnSite}<br>`;
            
            // Prix livraison - masquer si hideDeliveryInfo est true
            if (!this.hideDeliveryInfo) {
              const priceDelivery = product.price_delivery_base ? `${product.price_delivery_base}€` : 'Non défini';
              message += `<strong>Prix livraison:</strong> ${priceDelivery}<br>`;
            }
            
            if (product.description) {
              message += `<strong>Description:</strong> ${product.description}<br>`;
            }

            // Add type-specific details
            switch (product.product_type) {
              case 'variant':
                if (details.variants && details.variants.length > 0) {
                  message += `<strong>Variantes:</strong> ${details.variants.length}<br>`;
                }
                break;
              case 'modular':
                if (details.options && details.options.length > 0) {
                  message += `<strong>Options:</strong> ${details.options.length}<br>`;
                }
                if (details.sizes && details.sizes.length > 0) {
                  message += `<strong>Tailles:</strong> ${details.sizes.length}<br>`;
                }
                break;
              case 'composite':
                if (details.compositeItems && details.compositeItems.length > 0) {
                  message += `<strong>Éléments:</strong> ${details.compositeItems.length}<br>`;
                }
                break;
            }

            const alert = await this.alertController.create({
              header: product.name,
              message,
              buttons: ['Fermer'],
              cssClass: 'product-details-alert'
            });
            
            await alert.present();
            
            // Enable HTML in alert message after presentation
            setTimeout(() => {
              const messageEl = document.querySelector('ion-alert .alert-message');
              if (messageEl) {
                messageEl.innerHTML = message;
              }
            }, 100);
          },
          error: (error) => {
            loading.dismiss();
            console.error('Error loading product details:', error);
            this.presentToast('Erreur lors du chargement des détails', 'danger');
          }
        });
    } catch (error) {
      loading.dismiss();
      this.presentToast('Erreur lors du chargement des détails', 'danger');
    }
  }

  async openCategoryManagement() {
    const modal = await this.modalController.create({
      component: CategoryManagementModalComponent,
      backdropDismiss: false,
      cssClass: 'category-management-modal'
    });

    modal.onDidDismiss().then(() => {
      // Recharger les catégories et produits pour refléter les changements
      this.loadData();
    });

    return await modal.present();
  }

  async onConfigureWorkflow(product: FranceProduct) {
    const alert = await this.alertController.create({
      header: 'Configuration Workflow',
      message: `Configuration du workflow pour: ${product.name}`,
      inputs: [
        {
          name: 'workflowType',
          type: 'text',
          placeholder: 'Type de workflow',
          value: product.workflow_type || ''
        },
        {
          name: 'requiresSteps',
          type: 'checkbox',
          label: 'Nécessite des étapes',
          checked: product.requires_steps
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Sauvegarder',
          handler: (data) => {
            this.productManagementService.updateProductWorkflow(
              product.id,
              data.workflowType,
              data.requiresSteps || false,
              null // TODO: Add steps config
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                product.workflow_type = data.workflowType;
                product.requires_steps = data.requiresSteps || false;
                this.presentToast('Workflow mis à jour', 'success');
              },
              error: (error) => {
                console.error('Error updating workflow:', error);
                this.presentToast('Erreur lors de la mise à jour du workflow', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  checkProductIncludesDrink(product: FranceProduct): void {
    this.productManagementService.checkProductIncludesDrink(product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (includesDrink) => {
          this.presentToast(
            `Ce produit ${includesDrink ? 'inclut' : 'n\'inclut pas'} de boisson`, 
            'primary'
          );
        },
        error: (error) => {
          console.error('Error checking drink inclusion:', error);
          this.presentToast('Erreur lors de la vérification', 'danger');
        }
      });
  }

  async getVariantCount(productId: number): Promise<number> {
    return new Promise((resolve) => {
      this.productManagementService.getVariantCount(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (count) => resolve(count),
          error: () => resolve(0)
        });
    });
  }

  async getModuleCount(productId: number): Promise<number> {
    return new Promise((resolve) => {
      this.productManagementService.getModuleCount(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (count) => resolve(count),
          error: () => resolve(0)
        });
    });
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