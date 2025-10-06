import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { AuthFranceService } from '../../auth-france/services/auth-france.service';
import { UniversalAuthService, Country } from '../../../../core/services/universal-auth.service';
import { Subscription } from 'rxjs';

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
export class AddDriverModalComponent implements OnInit, OnDestroy {
  driverForm!: FormGroup; // Utiliser ! pour dire à TypeScript que ce sera initialisé
  isLoading = false;
  availableCountries: CountryConfig[] = [];
  private countriesSubscription?: Subscription;

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
      // Charger les pays disponibles depuis l'API
      this.countriesSubscription = this.universalAuthService.getSupportedCountries().subscribe(countries => {
        this.availableCountries = countries.map(country => ({
          code: country.phone_prefix, // Utiliser le prefix pour le select
          name: country.name,
          flag: country.flag
        }));

        // Initialiser le formulaire après chargement des pays
        if (!this.driverForm) {
          this.driverForm = this.createForm();
          console.log('📋 [AddDriverModal] Form créé avec succès:', this.driverForm.value);
        }

        // Définir le pays par défaut (France) si disponible
        if (this.availableCountries.length > 0 && this.driverForm) {
          const franceCountry = this.availableCountries.find(c => c.code === '33');
          if (franceCountry) {
            this.driverForm.patchValue({ country_code_selector: '33' });
          } else {
            this.driverForm.patchValue({ country_code_selector: this.availableCountries[0].code });
          }
        }
      });
    } catch (error) {
      console.error('❌ [AddDriverModal] Erreur création formulaire:', error);
    }
  }

  ngOnDestroy() {
    // Nettoyer la souscription aux pays
    if (this.countriesSubscription) {
      this.countriesSubscription.unsubscribe();
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

        // Logique simple : format local + indicatif
        const localNumber = this.driverForm.value.phone_number;
        const selectedPrefix = this.driverForm.value.country_code_selector;

        // Convertir prefix vers code pays dynamiquement
        const countryCode = this.universalAuthService.getCountryCodeFromPrefix(selectedPrefix);

        if (!countryCode) {
          throw new Error('Pays non supporté');
        }

        // Formatage simple vers international
        const finalPhoneNumber = this.universalAuthService.formatToInternational(localNumber, countryCode);

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
        const driverCountryCode = countryCode;

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
   * Nettoyage simple du numéro saisi
   */
  onPhoneInput(event: any) {
    const rawValue = event.target.value;

    // Nettoyer les espaces uniquement
    const cleaned = rawValue.replace(/\s/g, '');

    // Limiter à 15 chiffres max
    const truncated = cleaned.length > 15 ? cleaned.substring(0, 15) : cleaned;
    this.driverForm.patchValue({ phone_number: truncated }, { emitEvent: false });
  }

  /**
   * Obtenir le numéro final formaté pour affichage
   */
  getFinalPhoneNumber(): string {
    const localNumber = this.driverForm.get('phone_number')?.value || '';
    const selectedPrefix = this.driverForm.get('country_code_selector')?.value;

    if (!localNumber) {
      return '';
    }

    try {
      // Convertir prefix vers code pays dynamiquement
      const countryCode = this.universalAuthService.getCountryCodeFromPrefix(selectedPrefix);

      if (countryCode) {
        const internationalNumber = this.universalAuthService.formatToInternational(localNumber, countryCode);
        const selectedCountry = this.availableCountries.find(c => c.code === selectedPrefix);
        return `${selectedCountry?.flag || ''} +${internationalNumber}`;
      }
    } catch (error) {
      // En cas d'erreur, afficher tel quel
    }

    return `+${selectedPrefix}${localNumber}`;
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