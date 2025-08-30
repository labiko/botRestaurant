import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SuperAdminAuthService } from '../services/super-admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminAuthGuard implements CanActivate {
  
  constructor(
    private authService: SuperAdminAuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/super-admin/auth/login']);
      return false;
    }

    // Vérifier la validité de la session
    const isValidSession = await this.authService.validateSession();
    if (!isValidSession) {
      await this.authService.logout();
      this.router.navigate(['/super-admin/auth/login']);
      return false;
    }

    // Renouveler la session pour l'activité
    this.authService.refreshSession();

    return true;
  }
}