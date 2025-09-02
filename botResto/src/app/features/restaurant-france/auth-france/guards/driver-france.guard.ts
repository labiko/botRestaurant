import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFranceService } from '../services/auth-france.service';

@Injectable({
  providedIn: 'root'
})
export class DriverFranceGuard implements CanActivate {

  constructor(
    private authFranceService: AuthFranceService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authFranceService.currentUser$.pipe(
      map(user => {
        if (user && user.type === 'driver') {
          return true;
        } else if (user && user.type === 'restaurant') {
          console.log('🔒 [DriverFranceGuard] Accès refusé - Utilisateur restaurant');
          return this.router.createUrlTree(['/restaurant-france/dashboard-france']);
        } else {
          console.log('🔒 [DriverFranceGuard] Accès refusé - Non authentifié');
          return this.router.createUrlTree(['/restaurant-france/auth-france/login-france']);
        }
      })
    );
  }
}