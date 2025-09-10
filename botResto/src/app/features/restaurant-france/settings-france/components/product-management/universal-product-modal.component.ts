import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ProductManagementService, CompositeItem } from '../../../services/product-management.service';

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
    this.analyzeProduct();
    this.populateForm();
    this.loadCompositeItems();
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
      steps_config: ['']
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
      steps_config: this.product.steps_config ? JSON.stringify(this.product.steps_config, null, 2) : ''
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
}