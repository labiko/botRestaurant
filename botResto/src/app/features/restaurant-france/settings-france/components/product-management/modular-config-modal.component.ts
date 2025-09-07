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

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private productManagementService: ProductManagementService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    // Prix de base - toujours inclure les deux champs comme demandé
    this.configForm = this.formBuilder.group({
      price_on_site_base: [this.product.price_on_site_base || 0],
      price_delivery_base: [this.product.price_delivery_base || 0],
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
          includes_drink: [size.includes_drink]
        }));
      });
    }

    // Initialiser les options
    if (this.details.options) {
      const optionsArray = this.configForm.get('options') as FormArray;
      this.details.options.forEach((option: any) => {
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
        // Create new size - would need createProductSize method
        console.log('New size creation not implemented yet:', size);
        return Promise.resolve(true);
      }
    });

    await Promise.all(promises);
  }

  private async saveOptions(options: any[]) {
    const promises = options.map(option => {
      if (option.id) {
        // Update existing option - would need updateProductOption method
        console.log('Option update not implemented yet:', option);
        return Promise.resolve(true);
      } else {
        // Create new option - would need createProductOption method
        console.log('New option creation not implemented yet:', option);
        return Promise.resolve(true);
      }
    });

    await Promise.all(promises);
  }

  addNewSize() {
    const sizesArray = this.configForm.get('sizes') as FormArray;
    sizesArray.push(this.formBuilder.group({
      id: [null],
      size_name: ['Nouvelle taille'],
      price_on_site: [0],
      price_delivery: [0],
      includes_drink: [false]
    }));
  }

  removeSize(index: number) {
    const sizesArray = this.configForm.get('sizes') as FormArray;
    sizesArray.removeAt(index);
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