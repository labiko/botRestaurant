import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UniversalAuthService } from '../../../../core/services/universal-auth.service';
import { AuthFranceService } from '../../auth-france/services/auth-france.service';
import { SupabaseFranceService } from '../../../../core/services/supabase-france.service';
import { WhatsAppNotificationFranceService } from '../../../../core/services/whatsapp-notification-france.service';
import { PhoneNumberUtilsService } from '../../../../core/services/phone-number-utils.service';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-invite-client-modal',
  templateUrl: './invite-client-modal.component.html',
  styleUrls: ['./invite-client-modal.component.scss'],
  standalone: false
})
export class InviteClientModalComponent implements OnInit, OnDestroy {
  inviteForm!: FormGroup;
  availableCountries: CountryConfig[] = [];
  private countriesSubscription?: Subscription;

  private restaurantId: number | null = null;
  private restaurantWhatsAppNumber: string | null = null;
  private restaurantName: string | null = null;
  private restaurantCountryCode: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private universalAuthService: UniversalAuthService,
    private authFranceService: AuthFranceService,
    private supabaseFranceService: SupabaseFranceService,
    private whatsAppService: WhatsAppNotificationFranceService,
    private phoneNumberUtils: PhoneNumberUtilsService
  ) {}

  async ngOnInit() {
    await this.loadRestaurantInfo();

    this.countriesSubscription = this.universalAuthService.getSupportedCountries().subscribe(countries => {
      this.availableCountries = countries.map(country => ({
        code: country.phone_prefix,
        name: country.name,
        flag: country.flag
      }));

      if (!this.inviteForm) {
        this.inviteForm = this.createForm();
      }

      if (this.availableCountries.length > 0 && this.inviteForm) {
        const franceCountry = this.availableCountries.find(c => c.code === '33');
        if (franceCountry) {
          this.inviteForm.patchValue({ country_code_selector: '33' });
        } else {
          this.inviteForm.patchValue({ country_code_selector: this.availableCountries[0].code });
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.countriesSubscription) {
      this.countriesSubscription.unsubscribe();
    }
  }

  /**
   * Charger les informations du restaurant avec country_code
   */
  private async loadRestaurantInfo(): Promise<void> {
    try {
      const currentUser = this.authFranceService.getCurrentUser();

      if (!currentUser || currentUser.type !== 'restaurant') {
        console.error('❌ Aucun restaurant connecté');
        return;
      }

      this.restaurantId = currentUser.restaurantId;
      this.restaurantName = currentUser.name || null;

      const { data: restaurant, error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .select('whatsapp_number, phone, country_code')
        .eq('id', this.restaurantId)
        .single();

      if (error || !restaurant) {
        console.error('❌ Impossible de charger les infos restaurant:', error);
        return;
      }

      this.restaurantWhatsAppNumber = restaurant.whatsapp_number || restaurant.phone;
      this.restaurantCountryCode = restaurant.country_code;

      console.log('✅ Restaurant connecté:', {
        id: this.restaurantId,
        name: this.restaurantName,
        whatsapp: this.restaurantWhatsAppNumber,
        countryCode: this.restaurantCountryCode
      });

    } catch (error) {
      console.error('❌ Erreur loadRestaurantInfo:', error);
    }
  }

  /**
   * Formate un numéro de téléphone avec le code pays
   * MÊME LOGIQUE QUE cleanPhoneNumber du WhatsAppNotificationFranceService
   */
  private formatPhoneWithCountryCode(phone: string, countryCode: string): string {
    console.log('📞 formatPhoneWithCountryCode - Input:', { phone, countryCode });

    // 1. Obtenir le phone_prefix depuis le country_code
    const country = this.universalAuthService.getCountryByCode(countryCode);

    if (!country) {
      console.error('❌ Pays non supporté:', countryCode);
      return phone; // Retourner tel quel en cas d'erreur
    }

    const phonePrefix = country.phone_prefix; // Ex: "33" pour FR, "224" pour GN
    console.log('📱 Phone prefix trouvé:', phonePrefix);

    // 2. Nettoyer le numéro (enlever caractères spéciaux)
    let cleaned = phone.replace(/[^\d+]/g, '');

    // 3. Enlever le + si présent
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // 4. Vérifier si le numéro commence déjà par le prefix
    if (cleaned.startsWith(phonePrefix)) {
      console.log('✅ Numéro déjà au format international:', cleaned);
      return cleaned;
    }

    // 5. Enlever le 0 initial si présent (format local)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // 6. Ajouter le prefix
    const formatted = phonePrefix + cleaned;
    console.log('✅ Numéro formaté:', formatted);

    return formatted;
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      country_code_selector: ['33', [Validators.required]],
      phone_number: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(/^\d{8,15}$/)
      ]]
    });
  }

  onCountryChange() {
    this.inviteForm.patchValue({ phone_number: '' });
  }

  onPhoneInput(event: any) {
    const rawValue = event.target.value;
    const cleaned = rawValue.replace(/\s/g, '');
    const truncated = cleaned.length > 15 ? cleaned.substring(0, 15) : cleaned;
    this.inviteForm.patchValue({ phone_number: truncated }, { emitEvent: false });
  }

  getFinalPhoneNumber(): string {
    const localNumber = this.inviteForm.get('phone_number')?.value || '';
    const selectedPrefix = this.inviteForm.get('country_code_selector')?.value;

    if (!localNumber) {
      return '';
    }

    try {
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

  async save() {
    if (this.inviteForm.invalid) return;

    if (!this.restaurantId || !this.restaurantWhatsAppNumber || !this.restaurantCountryCode) {
      console.error('❌ Informations restaurant manquantes');
      this.modalController.dismiss({ success: false });
      return;
    }

    try {
      // 1. Formater le numéro du client
      const localNumber = this.inviteForm.value.phone_number;
      const selectedPrefix = this.inviteForm.value.country_code_selector;

      const countryCode = this.universalAuthService.getCountryCodeFromPrefix(selectedPrefix);
      if (!countryCode) {
        throw new Error('Pays non supporté');
      }

      const clientPhoneNumber = this.universalAuthService.formatToInternational(localNumber, countryCode);

      // 2. Formater le numéro du restaurant avec son country_code (CRITIQUE)
      const restaurantFormattedNumber = this.formatPhoneWithCountryCode(
        this.restaurantWhatsAppNumber,
        this.restaurantCountryCode
      );

      console.log('🏪 Restaurant number formatted:', {
        original: this.restaurantWhatsAppNumber,
        countryCode: this.restaurantCountryCode,
        formatted: restaurantFormattedNumber
      });

      // 3. Construire le lien du restaurant vers le bot
      const botWhatsAppNumber = environment.botWhatsAppNumber.replace(/^\+/, '');
      const botLink = `https://wa.me/${botWhatsAppNumber}?text=${encodeURIComponent(restaurantFormattedNumber)}`;

      // 4. Formater le numéro du bot pour l'affichage (ex: +33 7 53 05 82 54)
      const formattedBotNumber = botWhatsAppNumber.replace(/^(\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '+$1 $2 $3 $4 $5 $6');

      // 5. Construire le message à envoyer au client
      const message = `🍽 Bonjour !

📱 Enregistrez notre numéro :
${formattedBotNumber}

👉 Puis cliquez pour commander :
${botLink}

${this.restaurantName || 'Votre restaurant'}`;

      console.log('📱 Message WhatsApp généré:', {
        clientPhone: `+${clientPhoneNumber}`,
        botNumber: botWhatsAppNumber,
        restaurantNumber: restaurantFormattedNumber,
        botLink: botLink,
        message: message
      });

      // 6. Enregistrer l'invitation en base (plusieurs envois autorisés)
      const { error: insertError } = await this.supabaseFranceService.client
        .from('whatsapp_client_invitations')
        .insert({
          restaurant_id: this.restaurantId,
          client_phone_number: `+${clientPhoneNumber}`,
          invited_by: this.restaurantName
        });

      if (insertError) {
        console.error('❌ Erreur insertion invitation:', insertError);
        throw insertError;
      }

      // 7. Envoyer le message WhatsApp au client via Green API
      console.log('📤 [InviteClient] Envoi WhatsApp au client...');

      // Extraire l'indicatif téléphonique du numéro client
      const phonePrefix = this.phoneNumberUtils.extractCountryCode(clientPhoneNumber);

      const whatsAppSent = await this.whatsAppService.sendMessage(
        clientPhoneNumber,
        message,
        undefined,
        phonePrefix ?? undefined
      );

      if (whatsAppSent) {
        console.log('✅ [InviteClient] Message WhatsApp envoyé avec succès');
      } else {
        console.warn('⚠️ [InviteClient] Échec envoi WhatsApp');
      }

      // 8. Fermer la modal (SANS toast)
      this.modalController.dismiss({
        success: whatsAppSent,
        clientPhone: `+${clientPhoneNumber}`,
        messageSent: whatsAppSent
      });

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      this.modalController.dismiss({ success: false });
    }
  }

  /**
   * Détecter si on est sur tablette (768px - 1024px)
   */
  isTablet(): boolean {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= 768 && width <= 1024;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  hasError(fieldName: string): boolean {
    const field = this.inviteForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.inviteForm.get(fieldName);

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
}
