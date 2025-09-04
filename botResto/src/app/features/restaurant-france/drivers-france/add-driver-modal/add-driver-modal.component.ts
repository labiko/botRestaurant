import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { AuthFranceService } from '../../auth-france/services/auth-france.service';

export interface DriverFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  access_code: string;
  is_online: boolean;
  is_active: boolean;
}

@Component({
  selector: 'app-add-driver-modal',
  templateUrl: './add-driver-modal.component.html',
  styleUrls: ['./add-driver-modal.component.scss'],
  standalone: false
})
export class AddDriverModalComponent implements OnInit {
  driverForm!: FormGroup; // Utiliser ! pour dire à TypeScript que ce sera initialisé
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController,
    private whatsAppService: WhatsAppNotificationFranceService,
    private authFranceService: AuthFranceService
  ) {
    console.log('🔧 [AddDriverModal] Constructor appelé');
  }

  ngOnInit() {
    console.log('🚀 [AddDriverModal] ngOnInit appelé');
    try {
      // Initialiser le formulaire dans ngOnInit pour éviter les problèmes de détection de changements
      this.driverForm = this.createForm();
      console.log('📋 [AddDriverModal] Form créé avec succès:', this.driverForm.value);
      console.log('📋 [AddDriverModal] Form status:', this.driverForm.status);
      console.log('📋 [AddDriverModal] Form valid:', this.driverForm.valid);
    } catch (error) {
      console.error('❌ [AddDriverModal] Erreur création formulaire:', error);
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      phone_number: ['', [
        Validators.required,
        Validators.pattern(/^(06|07)\d{8}$/)
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
        // Générer le code d'accès automatiquement
        const accessCode = this.whatsAppService.generateAccessCode();
        
        const formData: DriverFormData = {
          first_name: this.driverForm.value.first_name.trim(),
          last_name: this.driverForm.value.first_name.trim(), // Utilise le prénom comme nom aussi
          phone_number: this.driverForm.value.phone_number.replace(/\s+/g, ''),
          email: undefined, // Plus de champ email
          access_code: accessCode,
          is_online: true, // Actif par défaut
          is_active: true  // En ligne par défaut
        };

        // Envoyer le code par WhatsApp
        const driverName = `${formData.first_name} ${formData.last_name}`;
        const currentUser = this.authFranceService.getCurrentUser();
        const restaurantName = currentUser?.name || currentUser?.restaurantName || 'Restaurant';
        
        console.log('📱 [AddDriverModal] Envoi du code WhatsApp...');
        const whatsAppSent = await this.whatsAppService.sendDriverAccessCode(
          formData.phone_number,
          driverName,
          accessCode,
          restaurantName,
          currentUser?.phoneNumber // Ajouter le numéro du restaurant
        );

        if (!whatsAppSent) {
          console.warn('⚠️ [AddDriverModal] Échec WhatsApp mais création continue');
          await this.showToast('Livreur créé mais erreur d\'envoi WhatsApp', 'warning');
        } else {
          console.log('✅ [AddDriverModal] Code WhatsApp envoyé avec succès');
        }

        await this.modalController.dismiss(formData, 'save');
        
      } catch (error) {
        console.error('❌ [AddDriverModal] Erreur lors de la sauvegarde:', error);
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
   * Format automatique du numéro de téléphone (06/07 uniquement)
   */
  onPhoneInput(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Supprimer non-chiffres
    
    // Ajouter le 0 si pas présent et commence par 6 ou 7
    if (value.length > 0 && !value.startsWith('0')) {
      if (value.startsWith('6') || value.startsWith('7')) {
        value = '0' + value;
      }
    }

    // Forcer 06 ou 07 seulement
    if (value.length >= 2 && value.startsWith('0')) {
      const secondDigit = value[1];
      if (secondDigit !== '6' && secondDigit !== '7') {
        // Si ce n'est ni 06 ni 07, on force à 06
        value = '06' + value.substring(2);
      }
    }

    // Limiter à 10 chiffres (06/07 + 8 chiffres)
    if (value.length > 10) {
      value = value.substring(0, 10);
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
    
    if (field?.hasError('pattern') && fieldName === 'phone_number') {
      return 'Format: 0612345678 ou 0712345678 (mobile français)';
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
    if (phone.length === 10 && (phone.startsWith('06') || phone.startsWith('07'))) {
      return `${phone.substring(0, 2)} ${phone.substring(2, 4)} ${phone.substring(4, 6)} ${phone.substring(6, 8)} ${phone.substring(8)}`;
    }
    return phone;
  }
}