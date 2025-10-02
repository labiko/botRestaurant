import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { AuthFranceService } from '../../auth-france/services/auth-france.service';
import { PhoneNumberUtilsService, CountryCodeConfig } from '../../../../core/services/phone-number-utils.service';

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
  availableCountries: CountryCodeConfig[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController,
    private whatsAppService: WhatsAppNotificationFranceService,
    private authFranceService: AuthFranceService,
    private phoneNumberUtils: PhoneNumberUtilsService
  ) {
    console.log('🔧 [AddDriverModal] Constructor appelé');
  }

  ngOnInit() {
    console.log('🚀 [AddDriverModal] ngOnInit appelé');
    try {
      // Charger les pays disponibles
      this.availableCountries = this.phoneNumberUtils.getAllCountryCodes();

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
      country_code_selector: ['33', [Validators.required]], // Par défaut France
      phone_number: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(/^\d{8,15}$/)
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

        // Construire le numéro final : indicatif + numéro local
        const selectedCode = this.driverForm.value.country_code_selector;
        let localNumber = this.driverForm.value.phone_number.replace(/\s+/g, '');

        // Enlever le 0 initial si présent (numéros locaux français: 0612345678 → 612345678)
        if (localNumber.startsWith('0')) {
          localNumber = localNumber.substring(1);
        }

        const finalPhoneNumber = `${selectedCode}${localNumber}`;

        const formData: DriverFormData = {
          first_name: this.driverForm.value.first_name.trim(),
          last_name: this.driverForm.value.first_name.trim(), // Utilise le prénom comme nom aussi
          phone_number: finalPhoneNumber, // Numéro final avec indicatif
          email: undefined, // Plus de champ email
          access_code: accessCode,
          is_online: true, // Actif par défaut
          is_active: true  // En ligne par défaut
        };

        console.log('📞 [AddDriverModal] Numéro final construit:', finalPhoneNumber);

        // Envoyer le code par WhatsApp
        const driverName = `${formData.first_name} ${formData.last_name}`;
        const currentUser = this.authFranceService.getCurrentUser();
        const restaurantName = currentUser?.name || currentUser?.restaurantName || 'Restaurant';

        // Le code pays est celui sélectionné dans le select
        const driverCountryCode = selectedCode;

        console.log('📱 [AddDriverModal] Envoi du code WhatsApp...');
        const whatsAppSent = await this.whatsAppService.sendDriverAccessCode(
          formData.phone_number,
          driverName,
          accessCode,
          restaurantName,
          currentUser?.phoneNumber, // Ajouter le numéro du restaurant
          driverCountryCode // Code pays du livreur
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
   * Gestion du changement de pays
   */
  onCountryChange() {
    // Réinitialiser le champ téléphone quand on change de pays
    console.log('🌍 [AddDriverModal] Pays changé:', this.driverForm.get('country_code_selector')?.value);
  }

  /**
   * Nettoyage et validation du numéro local
   */
  onPhoneInput(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Supprimer non-chiffres

    // Limiter à 15 chiffres max
    if (value.length > 15) {
      value = value.substring(0, 15);
    }

    this.driverForm.patchValue({ phone_number: value }, { emitEvent: false });
  }

  /**
   * Obtenir le numéro final avec indicatif
   */
  getFinalPhoneNumber(): string {
    const selectedCode = this.driverForm.get('country_code_selector')?.value;
    let localNumber = this.driverForm.get('phone_number')?.value || '';

    if (!selectedCode || !localNumber) {
      return '';
    }

    // Enlever le 0 initial si présent
    if (localNumber.startsWith('0')) {
      localNumber = localNumber.substring(1);
    }

    const selectedCountry = this.availableCountries.find(c => c.code === selectedCode);
    if (!selectedCountry) {
      return '';
    }

    return `${selectedCountry.flag} ${selectedCode}${localNumber}`;
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
      return 'Format: Numéro local sans indicatif (ex: 0612345678, 620123456)';
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

}