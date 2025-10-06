import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { AuthFranceService } from '../../auth-france/services/auth-france.service';
import { UniversalAuthService } from '../../../../core/services/universal-auth.service';

// Configuration des pays supportés pour le formulaire livreur
interface CountryConfig {
  code: string;
  name: string;
  flag: string;
}

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
  availableCountries: CountryConfig[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController,
    private whatsAppService: WhatsAppNotificationFranceService,
    private authFranceService: AuthFranceService,
    private universalAuthService: UniversalAuthService
  ) {
    console.log('🔧 [AddDriverModal] Constructor appelé');
  }

  ngOnInit() {
    console.log('🚀 [AddDriverModal] ngOnInit appelé');
    try {
      // Charger les pays disponibles depuis UniversalAuthService
      this.availableCountries = [
        { code: '33', name: 'France', flag: '🇫🇷' },
        { code: '224', name: 'Guinée', flag: '🇬🇳' },
        { code: '225', name: 'Côte d\'Ivoire', flag: '🇨🇮' }
      ];

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

        // Construire le numéro final avec UniversalAuthService
        const rawPhoneNumber = this.driverForm.value.phone_number;
        const selectedCode = this.driverForm.value.country_code_selector;

        // Convertir le code pays sélectionné vers le format UniversalAuthService
        const countryCode = selectedCode === '33' ? 'FR' :
                           selectedCode === '224' ? 'GN' :
                           selectedCode === '225' ? 'CI' : null;

        // Générer tous les formats possibles
        const phoneFormats = this.universalAuthService.generatePhoneFormats(rawPhoneNumber, countryCode || undefined);

        // Utiliser le format international (commence par l'indicatif pays)
        const finalPhoneNumber = phoneFormats.find(format => format.startsWith(selectedCode)) || `${selectedCode}${rawPhoneNumber}`;

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
   * Nettoyage et validation du numéro avec UniversalAuthService
   */
  onPhoneInput(event: any) {
    const rawValue = event.target.value;

    // Normaliser le numéro avec UniversalAuthService
    const normalized = this.universalAuthService.normalizePhoneNumber(rawValue);

    // Détecter automatiquement le pays si possible
    const detectedCountry = this.universalAuthService.detectCountryFromPhone(normalized);
    if (detectedCountry) {
      // Mettre à jour automatiquement le sélecteur de pays
      const countryCode = detectedCountry === 'FR' ? '33' :
                         detectedCountry === 'GN' ? '224' :
                         detectedCountry === 'CI' ? '225' : null;

      if (countryCode) {
        this.driverForm.patchValue({
          country_code_selector: countryCode
        }, { emitEvent: false });
      }
    }

    // Limiter à 15 chiffres max
    const truncated = normalized.length > 15 ? normalized.substring(0, 15) : normalized;
    this.driverForm.patchValue({ phone_number: truncated }, { emitEvent: false });
  }

  /**
   * Obtenir le numéro final avec UniversalAuthService
   */
  getFinalPhoneNumber(): string {
    const phoneValue = this.driverForm.get('phone_number')?.value || '';
    const selectedCode = this.driverForm.get('country_code_selector')?.value;

    if (!phoneValue) {
      return '';
    }

    // Générer tous les formats possibles avec UniversalAuthService
    const countryCode = selectedCode === '33' ? 'FR' :
                       selectedCode === '224' ? 'GN' :
                       selectedCode === '225' ? 'CI' : null;

    if (countryCode) {
      const formats = this.universalAuthService.generatePhoneFormats(phoneValue, countryCode);
      // Retourner le format international le plus approprié
      const internationalFormat = formats.find(f => f.startsWith(selectedCode));
      if (internationalFormat) {
        const selectedCountry = this.availableCountries.find(c => c.code === selectedCode);
        return `${selectedCountry?.flag || ''} +${internationalFormat}`;
      }
    }

    return `+${selectedCode}${phoneValue}`;
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