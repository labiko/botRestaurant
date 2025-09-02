import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthFranceService } from '../services/auth-france.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login-france',
  templateUrl: './login-france.page.html',
  styleUrls: ['./login-france.page.scss'],
  standalone: false
})
export class LoginFrancePage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  showLoginForm = false;
  selectedProfileType: 'restaurant' | 'driver' = 'restaurant';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authFranceService: AuthFranceService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private location: Location
  ) {
    this.loginForm = this.formBuilder.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(1)]]
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
   * Empêcher la navigation arrière
   */
  private preventBackNavigation() {
    // Ajouter une entrée dans l'historique
    history.pushState(null, '', window.location.href);
    
    // Écouter l'événement popstate (navigation arrière/avant)
    window.addEventListener('popstate', this.onPopState);
  }

  /**
   * Gestionnaire pour l'événement popstate
   */
  private onPopState = (event: PopStateEvent) => {
    // Remettre l'utilisateur sur la page actuelle
    history.pushState(null, '', window.location.href);
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
    
    // Reset du formulaire
    this.loginForm.reset();
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
   * Afficher les erreurs du formulaire
   */
  private showFormErrors() {
    if (this.loginForm.get('phone')?.invalid) {
      this.errorMessage = 'Veuillez saisir un numéro de téléphone valide';
    } else if (this.loginForm.get('password')?.invalid) {
      this.errorMessage = 'Veuillez saisir votre mot de passe';
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
}