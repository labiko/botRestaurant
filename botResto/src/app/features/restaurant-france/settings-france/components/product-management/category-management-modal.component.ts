import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  ProductManagementService, 
  MenuCategory 
} from '../../../services/product-management.service';

@Component({
  selector: 'app-category-management-modal',
  templateUrl: './category-management-modal.component.html',
  styleUrls: ['./category-management-modal.component.scss'],
  standalone: false
})
export class CategoryManagementModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  categoryForm!: FormGroup;
  categories: MenuCategory[] = [];
  isLoading = false;
  
  // Mock restaurant ID - should come from auth service
  restaurantId = 1;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private productManagementService: ProductManagementService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: ['🍽️'],
      display_order: [this.getNextDisplayOrder()],
      is_active: [true]
    });
  }

  private getNextDisplayOrder(): number {
    if (this.categories.length === 0) return 1;
    return Math.max(...this.categories.map(c => c.display_order || 0)) + 1;
  }

  private async loadCategories() {
    this.isLoading = true;
    
    this.productManagementService.getMenuCategories(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          this.isLoading = false;
          // Update display order for new category
          this.categoryForm.patchValue({
            display_order: this.getNextDisplayOrder()
          });
        },
        error: (error) => {
          console.error('❌ [CategoryManagement] Erreur chargement catégories:', error);
          this.presentToast('Erreur lors du chargement des catégories', 'danger');
          this.isLoading = false;
        }
      });
  }

  async onAddCategory() {
    if (this.categoryForm.invalid) {
      this.presentToast('Veuillez remplir tous les champs requis', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Création de la catégorie...'
    });
    await loading.present();

    const formData = this.categoryForm.value;
    
    this.productManagementService.createMenuCategory(this.restaurantId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (newCategory) => {
          this.categories.push(newCategory);
          this.categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          
          // Reset form
          this.categoryForm.reset({
            name: '',
            icon: '🍽️',
            display_order: this.getNextDisplayOrder(),
            is_active: true
          });
          
          await loading.dismiss();
          await this.presentToast(`Catégorie "${newCategory.name}" créée avec succès`, 'success');
        },
        error: async (error) => {
          console.error('❌ [CategoryManagement] Erreur création:', error);
          await loading.dismiss();
          await this.presentToast('Erreur lors de la création de la catégorie', 'danger');
        }
      });
  }

  async onEditCategory(category: MenuCategory) {
    const alert = await this.alertController.create({
      header: 'Modifier la catégorie',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nom',
          value: category.name
        },
        {
          name: 'icon',
          type: 'text',
          placeholder: 'Icône',
          value: category.icon || '🍽️'
        },
        {
          name: 'display_order',
          type: 'number',
          placeholder: 'Ordre',
          value: category.display_order || 1
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Enregistrer',
          handler: async (data) => {
            if (data.name && data.name.trim()) {
              await this.updateCategory(category.id, {
                name: data.name.trim(),
                icon: data.icon || '🍽️',
                display_order: parseInt(data.display_order) || category.display_order
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async updateCategory(categoryId: number, updates: Partial<MenuCategory>) {
    const loading = await this.loadingController.create({
      message: 'Mise à jour...'
    });
    await loading.present();

    this.productManagementService.updateMenuCategory(categoryId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async () => {
          // Update local data
          const index = this.categories.findIndex(c => c.id === categoryId);
          if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...updates };
            this.categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          }
          
          await loading.dismiss();
          await this.presentToast('Catégorie mise à jour avec succès', 'success');
        },
        error: async (error) => {
          console.error('❌ [CategoryManagement] Erreur mise à jour:', error);
          await loading.dismiss();
          await this.presentToast('Erreur lors de la mise à jour', 'danger');
        }
      });
  }

  async onToggleCategoryStatus(category: MenuCategory) {
    const newStatus = !category.is_active;
    const action = newStatus ? 'activer' : 'désactiver';
    
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Voulez-vous ${action} la catégorie "${category.name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: () => {
            this.updateCategory(category.id, { is_active: newStatus });
          }
        }
      ]
    });

    await alert.present();
  }

  trackByCategory(index: number, category: MenuCategory): number {
    return category.id;
  }

  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}