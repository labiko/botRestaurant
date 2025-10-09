import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthFranceService } from '../services/auth-france.service';
import { UniversalAuthService, Country } from '../../../../core/services/universal-auth.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

// Configuration des pays supportés
interface CountryConfig {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-login-france',
  templateUrl: './login-france.page.html',
  styleUrls: ['./login-france.page.scss'],
  standalone: false
})
export class LoginFrancePage implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  showLoginForm = false;
  selectedProfileType: 'restaurant' | 'driver' = 'restaurant';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  availableCountries: CountryConfig[] = [];
  private countriesSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authFranceService: AuthFranceService,
    private universalAuthService: UniversalAuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private location: Location
  ) {
    this.setupForm();
  }

  private setupForm() {
    this.loginForm = this.formBuilder.group({
      country_code_selector: ['33', [Validators.required]],
      phone: ['', [Validators.required, this.phoneValidator.bind(this)]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]]
    });
  }

  ngOnInit() {
    // Charger les pays disponibles depuis l'API
    this.countriesSubscription = this.universalAuthService.getSupportedCountries().subscribe(countries => {
      this.availableCountries = countries.map(country => ({
        code: country.phone_prefix, // Utiliser le prefix pour le select
        name: country.name,
        flag: country.flag
      }));

      // Définir le pays par défaut (France) si disponible
      if (this.availableCountries.length > 0 && !this.loginForm.get('country_code_selector')?.value) {
        const franceCountry = this.availableCountries.find(c => c.code === '33');
        if (franceCountry) {
          this.loginForm.patchValue({ country_code_selector: '33' });
        } else {
          this.loginForm.patchValue({ country_code_selector: this.availableCountries[0].code });
        }
      }
    });

    // Bloquer complètement la navigation arrière
    this.preventBackNavigation();

    // Vérifier si déjà connecté
    if (this.authFranceService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  /**
   * Empêcher la navigation arrière - Simple et efficace
   */
  private preventBackNavigation() {
    // Ajouter une entrée dans l'historique
    history.pushState(null, '', window.location.href);
    
    // Écouter l'événement popstate et rediriger vers la même page
    window.addEventListener('popstate', this.onPopState);
  }

  /**
   * Rediriger vers la même page au clic précédent
   */
  private onPopState = (event: PopStateEvent) => {
    // Ajouter immédiatement une nouvelle entrée pour le prochain clic
    history.pushState(null, '', window.location.href);
    
    // Rediriger vers la même page
    window.location.href = '/restaurant-france/auth-france/login-france';
  }

  ngOnDestroy() {
    // Nettoyer l'écouteur d'événement
    window.removeEventListener('popstate', this.onPopState);

    // Nettoyer la souscription aux pays
    if (this.countriesSubscription) {
      this.countriesSubscription.unsubscribe();
    }
  }

  /**
   * Sélection du profil utilisateur
   */
  selectProfile(profileType: 'restaurant' | 'driver') {
    this.selectedProfileType = profileType;
    this.showLoginForm = true;
    this.errorMessage = '';
    
    // Recréer le formulaire avec les nouvelles validations
    this.setupForm();
  }

  /**
   * Retour à la sélection de profil
   */
  goBack() {
    this.showLoginForm = false;
    this.errorMessage = '';
    this.loginForm.reset();
  }

  /**
   * Toggle affichage mot de passe
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Soumission du formulaire de connexion
   */
  async onLogin() {
    if (!this.loginForm.valid) {
      this.showFormErrors();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Logique simple : format local + indicatif
      const localNumber = this.loginForm.value.phone.trim();
      const selectedPrefix = this.loginForm.value.country_code_selector;

      // Convertir prefix vers code pays dynamiquement
      const countryCode = this.universalAuthService.getCountryCodeFromPrefix(selectedPrefix);

      if (!countryCode) {
        throw new Error('Pays non supporté');
      }

      // Formatage simple vers international
      const internationalNumber = this.universalAuthService.formatToInternational(localNumber, countryCode);

      console.log('🔐 [Login] Local:', localNumber, '→ International:', internationalNumber);

      const credentials = {
        phone: internationalNumber, // Numéro au format international
        password: this.loginForm.value.password,
        userType: this.selectedProfileType
      };


      const result = await this.authFranceService.login(credentials);

      if (result.success && result.user) {
        
        await this.showSuccessToast(`Connexion réussie ! Bienvenue ${result.user.name || result.user.firstName}`);
        
        // Redirection selon le type d'utilisateur
        if (result.redirectUrl) {
          this.router.navigate([result.redirectUrl]);
        } else {
          this.redirectToDashboard();
        }
      } else {
        console.error('❌ [LoginFrance] Échec connexion:', result.message);
        this.errorMessage = result.message || 'Erreur de connexion';
      }
    } catch (error) {
      console.error('❌ [LoginFrance] Erreur connexion:', error);
      this.errorMessage = 'Une erreur est survenue lors de la connexion';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Redirection vers le dashboard approprié
   */
  private redirectToDashboard() {
    const user = this.authFranceService.getCurrentUser();
    if (user) {
      if (user.type === 'restaurant') {
        this.router.navigate(['/restaurant-france/dashboard-france']);
      } else if (user.type === 'driver') {
        this.router.navigate(['/restaurant-france/delivery-france']);
      }
    } else {
      this.router.navigate(['/restaurant-france/orders-france']);
    }
  }

  /**
   * Validateur personnalisé pour le téléphone
   */
  private phoneValidator(control: any) {
    const phone = control.value;
    if (!phone) return null;

    // Validation numéro local uniquement (8-15 chiffres)
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return { phoneInvalid: 'Le numéro doit contenir entre 8 et 15 chiffres' };
    }

    return null;
  }

  /**
   * Validateur personnalisé pour le mot de passe
   */
  private passwordValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    // Pour les livreurs, code à 6 chiffres obligatoire
    if (this.selectedProfileType === 'driver') {
      if (!/^\d{6}$/.test(password)) {
        return { passwordInvalid: 'Code à 6 chiffres requis' };
      }
    }

    return null;
  }

  /**
   * Obtenir le texte d'aide pour le format attendu
   */
  getPhoneFormatHelp(): string {
    return '0612345678 ou 620123456';
  }

  /**
   * Obtenir le texte d'aide pour le mot de passe
   */
  getPasswordHelp(): string {
    if (this.selectedProfileType === 'driver') {
      return 'Code à 6 chiffres fourni par votre restaurant';
    }
    return 'Mot de passe de votre restaurant';
  }

  /**
   * Afficher les erreurs du formulaire
   */
  private showFormErrors() {
    const phoneControl = this.loginForm.get('phone');
    const passwordControl = this.loginForm.get('password');

    if (phoneControl?.invalid && phoneControl?.errors) {
      if (phoneControl.errors['required']) {
        this.errorMessage = 'Numéro de téléphone requis';
      } else if (phoneControl.errors['phoneInvalid']) {
        this.errorMessage = phoneControl.errors['phoneInvalid'];
      }
    } else if (passwordControl?.invalid && passwordControl?.errors) {
      if (passwordControl.errors['required']) {
        this.errorMessage = 'Mot de passe requis';
      } else if (passwordControl.errors['passwordInvalid']) {
        this.errorMessage = passwordControl.errors['passwordInvalid'];
      }
    }
  }

  /**
   * Afficher un message de succès
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success',
      cssClass: 'success-toast'
    });
    toast.present();
  }

  /**
   * Gestion du mot de passe oublié (livreurs uniquement)
   */
  async onForgotPassword() {
    // Uniquement pour les livreurs
    if (this.selectedProfileType !== 'driver') {
      return;
    }

    const localNumber = this.loginForm.get('phone')?.value;
    const selectedPrefix = this.loginForm.get('country_code_selector')?.value;

    if (!localNumber) {
      await this.showToast('Veuillez saisir votre numéro de téléphone', 'warning');
      return;
    }

    // Convertir prefix vers code pays dynamiquement (SYSTÈME UNIVERSEL)
    const countryCode = this.universalAuthService.getCountryCodeFromPrefix(selectedPrefix);

    if (!countryCode) {
      await this.showToast('Pays non supporté', 'danger');
      return;
    }

    // Formatage simple vers international (SYSTÈME UNIVERSEL)
    const internationalNumber = this.universalAuthService.formatToInternational(localNumber.trim(), countryCode);

    console.log('📞 [Code oublié] Local:', localNumber, '→ International:', internationalNumber);

    const loading = await this.loadingController.create({
      message: 'Envoi en cours...'
    });
    await loading.present();

    try {
      const result = await this.authFranceService.resendDriverAccessCode(internationalNumber);

      loading.dismiss();

      if (result.success) {
        await this.showToast(result.message || 'Code envoyé par WhatsApp', 'success');
      } else {
        await this.showToast(result.message || 'Erreur lors de l\'envoi', 'danger');
      }
    } catch (error) {
      loading.dismiss();
      await this.showToast('Erreur lors de l\'envoi', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

}