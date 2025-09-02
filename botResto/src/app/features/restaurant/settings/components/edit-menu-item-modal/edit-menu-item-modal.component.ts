import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { MenuItem, MenuService, UpdateMenuItemRequest } from '../../../../../core/services/menu.service';

@Component({
  selector: 'app-edit-menu-item-modal',
  templateUrl: './edit-menu-item-modal.component.html',
  styleUrls: ['./edit-menu-item-modal.component.scss'],
  standalone: false
})
export class EditMenuItemModalComponent implements OnInit {
  @Input() menuItem!: MenuItem;
  @Input() availableCategories: Array<{value: string, label: string, icon: string}> = [];

  editForm = {
    nom_plat: '',
    description: '',
    prix_display: null as number | null,
    categorie: '',
    photo_url: '',
    disponible: true
  };
  isLoading = false;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    // Use fallback categories if none provided
    if (this.availableCategories.length === 0) {
      this.availableCategories = this.menuService.getAvailableCategories();
    }

    if (this.menuItem) {
      this.editForm = {
        nom_plat: this.menuItem.nom_plat || '',
        description: this.menuItem.description || '',
        prix_display: this.menuItem.prix || null,
        categorie: this.menuItem.categorie || '',
        photo_url: this.menuItem.photo_url || '',
        disponible: this.menuItem.disponible ?? true
      };
    }
  }

  async close() {
    await this.modalController.dismiss();
  }

  async save() {
    if (!this.editForm.nom_plat || !this.editForm.categorie || !this.editForm.prix_display) {
      await this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      const updateData: UpdateMenuItemRequest = {};

      // Ne mettre à jour que les champs modifiés
      if (this.editForm.nom_plat !== this.menuItem.nom_plat) {
        updateData.nom_plat = this.editForm.nom_plat;
      }
      if (this.editForm.description !== (this.menuItem.description || '')) {
        updateData.description = this.editForm.description || undefined;
      }
      if (this.editForm.prix_display !== this.menuItem.prix) {
        updateData.prix = this.menuService.convertToBaseAmount(this.editForm.prix_display);
      }
      if (this.editForm.categorie !== this.menuItem.categorie) {
        updateData.categorie = this.editForm.categorie as any;
      }
      if (this.editForm.photo_url !== (this.menuItem.photo_url || '')) {
        updateData.photo_url = this.editForm.photo_url || undefined;
      }
      if (this.editForm.disponible !== this.menuItem.disponible) {
        updateData.disponible = this.editForm.disponible;
      }

      // Si aucun changement détecté
      if (Object.keys(updateData).length === 0) {
        await this.showToast('Aucune modification détectée', 'medium');
        await this.close();
        return;
      }

      const updatedItem = await this.menuService.updateMenuItem(this.menuItem.id, updateData);
      
      await this.showToast(`✅ "${updatedItem.nom_plat}" mis à jour avec succès`, 'success');
      
      // Fermer le modal et retourner l'item mis à jour
      await this.modalController.dismiss({
        updated: true,
        menuItem: updatedItem
      });

    } catch (error: any) {
      console.error('Error updating menu item:', error);
      const message = error.message || 'Erreur lors de la mise à jour du plat';
      await this.showToast(message, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  getCategoryIcon(category: string): string {
    const categoryData = this.availableCategories.find(cat => cat.value === category);
    return categoryData?.icon || 'restaurant';
  }

  getCurrencySymbol(): string {
    return this.menuService.getCurrency();
  }

  getCategoryLabel(category: string): string {
    const categoryData = this.availableCategories.find(cat => cat.value === category);
    return categoryData?.label || 'Catégorie';
  }

  formatPrice(amount: number): string {
    return this.menuService.formatPrice(amount);
  }

  removeImage(): void {
    this.editForm.photo_url = '';
  }

  isFormValid(): boolean {
    return !!(this.editForm.nom_plat && this.editForm.categorie && this.editForm.prix_display && this.editForm.prix_display > 0);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}