import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

export interface DriverFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  password: string;
}

@Component({
  selector: 'app-add-driver-modal',
  templateUrl: './add-driver-modal.component.html',
  styleUrls: ['./add-driver-modal.component.scss'],
  standalone: false
})
export class AddDriverModalComponent implements OnInit {
  driverForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.driverForm = this.createForm();
  }

  ngOnInit() {}

  private createForm(): FormGroup {
    return this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      phone_number: ['', [
        Validators.required,
        Validators.pattern(/^33[67]\d{8}$/)
      ]],
      email: ['', [
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]]
    });
  }

  /**
   * Fermer la modale sans sauvegarder
   */
  dismiss() {
    this.modalController.dismiss();
  }

  /**
   * Sauvegarder et fermer la modale
   */
  async save() {
    if (this.driverForm.valid) {
      this.isLoading = true;
      
      try {
        const formData: DriverFormData = {
          first_name: this.driverForm.value.first_name.trim(),
          last_name: this.driverForm.value.last_name.trim(),
          phone_number: this.driverForm.value.phone_number.replace(/\s+/g, ''),
          email: this.driverForm.value.email?.trim() || undefined,
          password: this.driverForm.value.password
        };

        await this.modalController.dismiss(formData, 'save');
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        await this.showToast('Erreur lors de la création du livreur', 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      await this.showToast('Veuillez corriger les erreurs du formulaire', 'warning');
      this.markFormGroupTouched();
    }
  }

  /**
   * Toggle visibilité mot de passe
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Format automatique du numéro de téléphone
   */
  onPhoneInput(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Supprimer non-chiffres
    
    // Ajouter le préfixe 33 si pas présent
    if (value.length > 0 && !value.startsWith('33')) {
      if (value.startsWith('0')) {
        value = '33' + value.substring(1);
      } else if (value.startsWith('6') || value.startsWith('7')) {
        value = '33' + value;
      }
    }

    // Limiter à 11 chiffres (33 + 9 chiffres)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    this.driverForm.patchValue({ phone_number: value });
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.driverForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength']?.requiredLength;
      return `Maximum ${maxLength} caractères autorisés`;
    }
    
    if (field?.hasError('email')) {
      return 'Format email invalide';
    }
    
    if (field?.hasError('pattern') && fieldName === 'phone_number') {
      return 'Format: 33612345678 (mobile français)';
    }
    
    return '';
  }

  /**
   * Vérifier si un champ a des erreurs
   */
  hasError(fieldName: string): boolean {
    const field = this.driverForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched() {
    Object.keys(this.driverForm.controls).forEach(key => {
      const control = this.driverForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Afficher un toast
   */
  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Formater l'affichage du téléphone
   */
  get formattedPhone(): string {
    const phone = this.driverForm.get('phone_number')?.value || '';
    if (phone.length === 11 && phone.startsWith('33')) {
      return `+33 ${phone.substring(2, 3)} ${phone.substring(3, 5)} ${phone.substring(5, 7)} ${phone.substring(7, 9)} ${phone.substring(9)}`;
    }
    return phone;
  }
}