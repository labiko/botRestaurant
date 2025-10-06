import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RestaurantConfigService, RestaurantConfig, BusinessHours, RestaurantBotConfig } from '../../../services/restaurant-config.service';
import { AuthFranceService } from '../../../auth-france/services/auth-france.service';
import { PhoneNumberUtilsService } from '../../../../../core/services/phone-number-utils.service';
import { SupabaseFranceService } from '../../../../../core/services/supabase-france.service';
import { PrintService } from '../../../../../core/services/print.service';
import { CurrencyService, AVAILABLE_CURRENCIES } from '../../../../../core/services/currency.service';

@Component({
  selector: 'app-restaurant-config',
  templateUrl: './restaurant-config.component.html',
  styleUrls: ['./restaurant-config.component.scss'],
  standalone: false
})
export class RestaurantConfigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  restaurantForm!: FormGroup;
  botForm!: FormGroup;

  // Expose Object.keys to template
  Object = Object;
  // Expose available currencies to template
  availableCurrencies = Object.values(AVAILABLE_CURRENCIES);

  restaurantConfig: RestaurantConfig | null = null;
  botConfig: RestaurantBotConfig | null = null;

  isLoading = false;
  hideDeliveryInfo = false; // Flag pour masquer les infos de livraison
  private currentCountryCode: string = '33'; // Country code du restaurant chargé depuis la base
  autoPrintEnabled = false; // Toggle pour l'impression automatique
  
  weekDays = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' }
  ];
  
  businessHours: BusinessHours = {};

  restaurantId: number;

  // Structure simple pour les horaires - PAS DE DONNÉES EN DUR !
  simpleWeekDays = [
    { key: 'lundi', label: 'Lundi', isOpen: false, opening: '09:00', closing: '22:00', isToday: false },
    { key: 'mardi', label: 'Mardi', isOpen: false, opening: '09:00', closing: '22:00', isToday: false },
    { key: 'mercredi', label: 'Mercredi', isOpen: false, opening: '09:00', closing: '22:00', isToday: false },
    { key: 'jeudi', label: 'Jeudi', isOpen: false, opening: '09:00', closing: '22:00', isToday: false },
    { key: 'vendredi', label: 'Vendredi', isOpen: false, opening: '09:00', closing: '22:00', isToday: false },
    { key: 'samedi', label: 'Samedi', isOpen: false, opening: '09:00', closing: '22:00', isToday: false },
    { key: 'dimanche', label: 'Dimanche', isOpen: false, opening: '09:00', closing: '22:00', isToday: false }
  ];

  constructor(
    private fb: FormBuilder,
    private restaurantConfigService: RestaurantConfigService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authFranceService: AuthFranceService,
    private phoneNumberUtils: PhoneNumberUtilsService,
    private supabaseFranceService: SupabaseFranceService,
    private printService: PrintService,
    public currencyService: CurrencyService
  ) {
    // Récupérer l'ID du restaurant depuis la session
    const id = this.authFranceService.getCurrentRestaurantId();
    if (id === null) {
      console.error('❌ [RestaurantConfig] Impossible de récupérer restaurant ID - utilisateur non connecté');
      throw new Error('Restaurant ID requis - utilisateur non connecté');
    }
    this.restaurantId = id;

    this.initializeForms();
    this.initializeBusinessHours();
    this.initializeSimpleHours();
  }

  ngOnInit() {
    this.loadRestaurantData();
    // Charger l'état du toggle impression automatique
    this.autoPrintEnabled = this.printService.getAutoPrintEnabled();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms() {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      whatsapp_number: ['', [Validators.required]],
      address: [''],
      city: [''],
      postal_code: [''],
      delivery_zone_km: [5],
      min_order_amount: [0],
      delivery_fee: [2.50],
      is_active: [true],
      is_exceptionally_closed: [false],
      timezone: ['Europe/Paris', [Validators.required]],
      currency: ['EUR']
    });

    this.botForm = this.fb.group({
      brand_name: ['', [Validators.required]],
      welcome_message: ['', [Validators.required]],
      cartEnabled: [true],
      deliveryEnabled: [true],
      paymentDeferred: [true],
      locationDetection: [false],
      multiLanguage: [false],
      loyaltyProgram: [false]
    });
  }

  private initializeBusinessHours() {
    this.weekDays.forEach((day, index) => {
      // Set some days as open by default for demonstration
      const isOpenDefault = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'].includes(day.key);
      
      this.businessHours[day.key] = {
        isOpen: isOpenDefault,
        opening: '11:00',
        closing: '22:00'
      };
    });
    
    // Set Sunday and today's special hours for demonstration
    if (this.businessHours['dimanche']) {
      this.businessHours['dimanche'] = {
        isOpen: true,
        opening: '18:00',
        closing: '02:00'
      };
    }
  }

  private async loadRestaurantData() {
    const loading = await this.loadingController.create({
      message: 'Chargement des données...'
    });
    await loading.present();

    try {
      // Load restaurant config
      this.restaurantConfigService.getRestaurantConfig(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (config) => {
            this.restaurantConfig = config;
            this.hideDeliveryInfo = config?.hide_delivery_info || false;

            // Update form validators based on hideDeliveryInfo
            this.updateDeliveryFieldsValidators();

            // Stocker le country_code
            this.currentCountryCode = config.country_code || '33';

            // Extraire numéros locaux (enlever l'indicatif)
            const phoneLocal = this.extractLocalNumber(config.phone || '', this.currentCountryCode);
            const whatsappLocal = this.extractLocalNumber(config.whatsapp_number || '', this.currentCountryCode);

            this.restaurantForm.patchValue({
              ...config,
              phone: phoneLocal,
              whatsapp_number: whatsappLocal
            });
            
            if (config.business_hours) {
              this.businessHours = { ...this.businessHours, ...config.business_hours };
              // Populate simpleWeekDays with real database data
              this.populateSimpleWeekDaysFromDB(config.business_hours);
            }
          },
          error: (error) => {
            console.error('Error loading restaurant config:', error);
            this.presentToast('Erreur lors du chargement de la configuration', 'danger');
          }
        });

      // Load bot config
      this.restaurantConfigService.getBotConfig(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (botConfig) => {
            this.botConfig = botConfig;
            this.botForm.patchValue({
              brand_name: botConfig.brand_name,
              welcome_message: botConfig.welcome_message,
              ...botConfig.features
            });
          },
          error: (error) => {
            console.error('Error loading bot config:', error);
            this.presentToast('Erreur lors du chargement de la configuration bot', 'danger');
          }
        });

    } finally {
      loading.dismiss();
    }
  }

  /**
   * Update delivery fields validators based on hideDeliveryInfo flag
   */
  private updateDeliveryFieldsValidators() {
    const deliveryFields = ['delivery_zone_km', 'min_order_amount', 'delivery_fee'];
    
    deliveryFields.forEach(fieldName => {
      const control = this.restaurantForm.get(fieldName);
      if (control) {
        if (this.hideDeliveryInfo) {
          // Remove validators when delivery info is hidden
          control.clearValidators();
        } else {
          // Add validators when delivery info is visible
          if (fieldName === 'delivery_zone_km') {
            control.setValidators([Validators.required, Validators.min(1)]);
          } else {
            control.setValidators([Validators.required, Validators.min(0)]);
          }
        }
        control.updateValueAndValidity();
      }
    });
  }

  async onSaveRestaurantConfig() {
    if (this.restaurantForm.invalid) {
      this.presentToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sauvegarde...'
    });
    await loading.present();

    try {
      const phoneLocal = this.restaurantForm.get('phone')?.value;
      const whatsappLocal = this.restaurantForm.get('whatsapp_number')?.value;

      // Formater avec l'indicatif du restaurant (déjà en base)
      const phoneFinal = this.formatPhoneWithCountryCode(phoneLocal, this.currentCountryCode);
      const whatsappFinal = this.formatPhoneWithCountryCode(whatsappLocal, this.currentCountryCode);

      // Sauvegarder directement avec Supabase
      const { error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .update({
          phone: phoneFinal,
          whatsapp_number: whatsappFinal
        })
        .eq('id', this.restaurantId);

      if (error) throw error;

      await this.presentToast('Numéros de téléphone sauvegardés', 'success');

    } catch (error) {
      console.error('Error saving restaurant config:', error);
      this.presentToast('Erreur lors de la sauvegarde', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async onSaveBusinessHours() {
    const loading = await this.loadingController.create({
      message: 'Sauvegarde des horaires...'
    });
    await loading.present();

    try {
      this.restaurantConfigService.updateBusinessHours(this.restaurantId, this.businessHours)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.presentToast('Horaires sauvegardés', 'success');
          },
          error: (error) => {
            console.error('Error saving business hours:', error);
            this.presentToast('Erreur lors de la sauvegarde des horaires', 'danger');
          },
          complete: () => {
            loading.dismiss();
          }
        });
    } catch (error) {
      loading.dismiss();
      this.presentToast('Erreur lors de la sauvegarde des horaires', 'danger');
    }
  }

  async onSaveBotConfig() {
    if (this.botForm.invalid) {
      this.presentToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sauvegarde de la configuration bot...'
    });
    await loading.present();

    try {
      const formValue = this.botForm.value;
      const { brand_name, welcome_message, ...features } = formValue;

      // Update welcome message
      this.restaurantConfigService.updateWelcomeMessage(this.restaurantId, welcome_message)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update features
            this.restaurantConfigService.updateBotFeatures(this.restaurantId, features)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.presentToast('Configuration bot sauvegardée', 'success');
                },
                error: (error) => {
                  console.error('Error saving bot features:', error);
                  this.presentToast('Erreur lors de la sauvegarde des fonctionnalités', 'danger');
                },
                complete: () => {
                  loading.dismiss();
                }
              });
          },
          error: (error) => {
            console.error('Error saving welcome message:', error);
            this.presentToast('Erreur lors de la sauvegarde du message de bienvenue', 'danger');
            loading.dismiss();
          }
        });
    } catch (error) {
      loading.dismiss();
      this.presentToast('Erreur lors de la sauvegarde', 'danger');
    }
  }

  async onToggleRestaurantStatus() {
    // Get current status before the toggle changes
    const currentStatus = this.restaurantForm.get('is_active')?.value;
    const newStatus = !currentStatus;
    
    // Immediately revert the toggle to prevent visual change
    this.restaurantForm.patchValue({ is_active: currentStatus }, { emitEvent: false });
    
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Voulez-vous ${currentStatus ? 'fermer' : 'ouvrir'} le restaurant ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            // Keep current status
            this.restaurantForm.patchValue({ is_active: currentStatus }, { emitEvent: false });
          }
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.restaurantConfigService.updateRestaurantStatus(this.restaurantId, newStatus)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  // Apply the new status after successful update
                  this.restaurantForm.patchValue({ is_active: newStatus }, { emitEvent: false });
                  this.presentToast(
                    `Restaurant ${newStatus ? 'ouvert' : 'fermé'}`, 
                    newStatus ? 'success' : 'warning'
                  );
                },
                error: (error) => {
                  console.error('Error updating restaurant status:', error);
                  // Revert to original status on error
                  this.restaurantForm.patchValue({ is_active: currentStatus }, { emitEvent: false });
                  this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async onToggleExceptionalClosure() {
    const newStatus = this.restaurantForm.get('is_exceptionally_closed')?.value;
    
    const alert = await this.alertController.create({
      header: 'Fermeture exceptionnelle',
      message: newStatus 
        ? '⚠️ Voulez-vous fermer exceptionnellement le restaurant ?\n\nCette fermeture aura priorité sur les horaires d\'ouverture.' 
        : 'Voulez-vous désactiver la fermeture exceptionnelle ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            // Revert to previous state
            this.restaurantForm.patchValue({ is_exceptionally_closed: !newStatus }, { emitEvent: false });
          }
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.restaurantConfigService.updateExceptionalClosureStatus(this.restaurantId, newStatus)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.presentToast(
                    newStatus 
                      ? '⚠️ Fermeture exceptionnelle activée' 
                      : '✅ Fermeture exceptionnelle désactivée', 
                    newStatus ? 'warning' : 'success'
                  );
                },
                error: (error) => {
                  console.error('Error updating exceptional closure status:', error);
                  // Revert on error
                  this.restaurantForm.patchValue({ is_exceptionally_closed: !newStatus }, { emitEvent: false });
                  this.presentToast('Erreur lors de la mise à jour de la fermeture exceptionnelle', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  onBusinessHourToggle(day: string) {
    this.businessHours[day].isOpen = !this.businessHours[day].isOpen;
  }

  onDayToggleChange(dayKey: string) {
    // The toggle value is automatically updated via [(ngModel)]
    // This method can be used for additional logic if needed
    console.log(`Day ${dayKey} toggle changed to:`, this.businessHours[dayKey].isOpen);
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

  // Check if a day is today
  isToday(dayKey: string): boolean {
    const today = new Date().getDay();
    const dayMap: {[key: string]: number} = {
      'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3, 
      'jeudi': 4, 'vendredi': 5, 'samedi': 6
    };
    return today === dayMap[dayKey];
  }

  // Calculate duration between opening and closing times
  calculateDuration(dayKey: string): string {
    const hours = this.businessHours[dayKey];
    if (!hours.opening || !hours.closing) return '--';
    
    const [openHour, openMin] = hours.opening.split(':').map(Number);
    const [closeHour, closeMin] = hours.closing.split(':').map(Number);
    
    let duration = (closeHour * 60 + closeMin) - (openHour * 60 + openMin);
    
    // Handle overnight closing (e.g., 23h → 2h)
    if (duration < 0) {
      duration += 24 * 60;
    }
    
    const durationHours = Math.floor(duration / 60);
    const durationMinutes = duration % 60;
    
    if (durationMinutes === 0) {
      return `${durationHours}h`;
    } else {
      return `${durationHours}h${durationMinutes.toString().padStart(2, '0')}`;
    }
  }

  // Get overall restaurant status
  getOverallStatus(): boolean {
    if (!this.restaurantForm.get('is_active')?.value) return false;
    
    const today = new Date().getDay();
    const dayKeys = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const todayKey = dayKeys[today];
    
    return this.businessHours[todayKey]?.isOpen || false;
  }

  // Apply quick templates
  async applyTemplate(template: string) {
    const alert = await this.alertController.create({
      header: 'Appliquer le template',
      message: `Voulez-vous appliquer le template "${template.toUpperCase()}" à tous les jours ouverts ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Appliquer',
          handler: () => {
            let templateTimes: {open: string, close: string};
            
            switch (template) {
              case 'classic':
                templateTimes = {open: '11:00', close: '22:00'};
                break;
              case 'fastfood':
                templateTimes = {open: '10:00', close: '23:00'};
                break;
              case 'evening':
                templateTimes = {open: '18:00', close: '02:00'};
                break;
              default:
                return;
            }

            // Apply template to all open days
            this.weekDays.forEach(day => {
              if (this.businessHours[day.key].isOpen) {
                this.businessHours[day.key].opening = templateTimes.open;
                this.businessHours[day.key].closing = templateTimes.close;
              }
            });

            this.presentToast(`Template ${template} appliqué avec succès`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  // Handle time input changes
  onTimeChange(dayKey: string, timeType: 'opening' | 'closing', event: any) {
    this.businessHours[dayKey][timeType] = event.detail.value;
  }

  // ======================================
  // NOUVELLES METHODES POUR STRUCTURE SIMPLE
  // ======================================

  initializeSimpleHours() {
    const today = new Date().getDay();
    const dayKeys = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const todayKey = dayKeys[today];
    
    this.simpleWeekDays.forEach(day => {
      day.isToday = (day.key === todayKey);
    });
  }

  // Populate simpleWeekDays with REAL DATA from database
  populateSimpleWeekDaysFromDB(businessHours: any) {
    this.simpleWeekDays.forEach(day => {
      if (businessHours[day.key]) {
        day.isOpen = businessHours[day.key].isOpen || false;
        day.opening = businessHours[day.key].opening || '09:00';
        day.closing = businessHours[day.key].closing || '22:00';
      }
    });
    
    // Réappliquer la détection du jour actuel après le chargement des données
    this.initializeSimpleHours();
  }

  calculateSimpleDuration(opening: string, closing: string): string {
    if (!opening || !closing) return '--';
    
    const [openHour, openMin] = opening.split(':').map(Number);
    const [closeHour, closeMin] = closing.split(':').map(Number);
    
    let duration = (closeHour * 60 + closeMin) - (openHour * 60 + openMin);
    
    // Handle overnight closing (e.g., 23h → 2h)
    if (duration < 0) {
      duration += 24 * 60;
    }
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
  }

  applySimpleTemplate(template: string) {
    let templateTimes: {open: string, close: string};
    
    switch (template) {
      case 'classic':
        templateTimes = {open: '11:00', close: '22:00'};
        break;
      case 'fastfood':
        templateTimes = {open: '10:00', close: '23:00'};
        break;
      case 'evening':
        templateTimes = {open: '18:00', close: '02:00'};
        break;
      default:
        return;
    }

    // Apply template to all open days
    this.simpleWeekDays.forEach(day => {
      if (day.isOpen) {
        day.opening = templateTimes.open;
        day.closing = templateTimes.close;
      }
    });

    this.presentToast(`Template ${template} appliqué avec succès`, 'success');
  }

  async onSaveSimpleBusinessHours() {
    const loading = await this.loadingController.create({
      message: 'Sauvegarde des horaires...'
    });
    await loading.present();

    try {
      // Convert simple structure to database format
      const businessHours: any = {};
      this.simpleWeekDays.forEach(day => {
        businessHours[day.key] = {
          isOpen: day.isOpen,
          opening: day.opening,
          closing: day.closing
        };
      });

      // Save to database using existing method
      this.restaurantConfigService.updateBusinessHours(this.restaurantId, businessHours)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            loading.dismiss();
            this.presentToast('Horaires sauvegardés avec succès', 'success');
          },
          error: (error: any) => {
            loading.dismiss();
            console.error('Error saving business hours:', error);
            this.presentToast('Erreur lors de la sauvegarde', 'danger');
          }
        });

    } catch (error) {
      loading.dismiss();
      console.error('Error saving business hours:', error);
      this.presentToast('Erreur lors de la sauvegarde', 'danger');
    }
  }

  /**
   * Extrait le numéro local à partir d'un numéro international
   */
  private extractLocalNumber(fullNumber: string, countryCode: string): string {
    if (!fullNumber) return '';

    // Enlever l'indicatif pays
    if (fullNumber.startsWith(countryCode)) {
      return '0' + fullNumber.substring(countryCode.length);
    }

    return fullNumber;
  }

  /**
   * Formate un numéro local avec l'indicatif pays
   */
  private formatPhoneWithCountryCode(localNumber: string, countryCode: string): string {
    let cleaned = localNumber.replace(/\D/g, '');

    // Enlever 0 initial si présent
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    return `${countryCode}${cleaned}`;
  }

  // Méthode pour gérer le changement du toggle impression automatique
  onToggleAutoPrint(): void {
    this.printService.setAutoPrintEnabled(this.autoPrintEnabled);

    const message = this.autoPrintEnabled
      ? 'Impression automatique activée'
      : 'Impression automatique désactivée';

    this.presentToast(message, 'success');
  }
}