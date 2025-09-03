import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthFranceService } from '../services/auth-france.service';
import { PhoneFormatService } from '../../../../core/services/phone-format.service';
import { Location } from '@angular/common';

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

  constructor(
    private formBuilder: FormBuilder,
    private authFranceService: AuthFranceService,
    private phoneFormatService: PhoneFormatService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private location: Location
  ) {
    this.setupForm();
  }

  private setupForm() {
    this.loginForm = this.formBuilder.group({
      phone: ['', [Validators.required, this.phoneValidator.bind(this)]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]]
    });
  }

  ngOnInit() {
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
  }

  /**
   * Sélection du profil utilisateur
   */
  selectProfile(profileType: 'restaurant' | 'driver') {
    console.log('🎯 [LoginFrance] Profil sélectionné:', profileType);
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
      const credentials = {
        phone: this.loginForm.value.phone.trim(),
        password: this.loginForm.value.password,
        userType: this.selectedProfileType
      };

      console.log(`🔐 [LoginFrance] Tentative connexion ${this.selectedProfileType}:`, credentials.phone);

      const result = await this.authFranceService.login(credentials);

      if (result.success && result.user) {
        console.log('✅ [LoginFrance] Connexion réussie:', result.user);
        
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

    // Pour les livreurs, utiliser les règles strictes
    if (this.selectedProfileType === 'driver') {
      const validation = this.phoneFormatService.isValidDriverPhone(phone);
      return validation.valid ? null : { phoneInvalid: validation.message };
    }

    // Pour les restaurants, validation plus souple
    if (phone.length < 10) {
      return { phoneInvalid: 'Numéro trop court' };
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
    if (this.selectedProfileType === 'driver') {
      return this.phoneFormatService.getPhoneFormatExample();
    }
    return 'Numéro de téléphone du restaurant';
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
   * FONCTION DEBUG - Auto-remplissage Jean Dupont (livreur)
   */
  debugFillJeanCredentials() {
    // Sélectionner le profil livreur
    this.selectProfile('driver');
    
    // Attendre que le formulaire soit mis à jour
    setTimeout(() => {
      this.loginForm.patchValue({
        phone: '0667326357',
        password: '123456'
      });
    }, 100);
  }
}