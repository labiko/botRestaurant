import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SuperAdminAuthService } from '../../services/super-admin-auth.service';

@Component({
  selector: 'app-super-admin-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SuperAdminLoginPage implements OnInit {
  credentials = {
    email: '',
    password: '',
    mfaCode: ''
  };
  
  showMfaInput = false;
  showPassword = false;
  
  constructor(
    private router: Router,
    private authService: SuperAdminAuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Vérifier si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/super-admin/dashboard']);
    }
  }

  async login() {
    if (!this.credentials.email || !this.credentials.password) {
      await this.showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Connexion en cours...'
    });
    await loading.present();

    try {
      const result = await this.authService.login(
        this.credentials.email,
        this.credentials.password
      );

      if (result.requiresMfa) {
        this.showMfaInput = true;
        await loading.dismiss();
        await this.showToast('Code 2FA requis', 'warning');
      } else if (result.success) {
        await loading.dismiss();
        await this.showToast('Connexion réussie !', 'success');
        this.router.navigate(['/super-admin/dashboard']);
      } else {
        await loading.dismiss();
        await this.showToast(result.error || 'Identifiants incorrects', 'danger');
      }
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Erreur de connexion', 'danger');
    }
  }

  async verifyMfa() {
    if (!this.credentials.mfaCode) {
      await this.showToast('Veuillez entrer le code 2FA', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Vérification du code...'
    });
    await loading.present();

    try {
      const result = await this.authService.verifyMfa(this.credentials.mfaCode);
      
      if (result.success) {
        await loading.dismiss();
        await this.showToast('Authentification réussie !', 'success');
        this.router.navigate(['/super-admin/dashboard']);
      } else {
        await loading.dismiss();
        await this.showToast('Code incorrect', 'danger');
      }
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Erreur de vérification', 'danger');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}