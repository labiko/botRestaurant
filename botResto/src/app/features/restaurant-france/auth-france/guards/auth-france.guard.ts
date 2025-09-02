import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFranceService } from '../services/auth-france.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFranceGuard implements CanActivate {

  constructor(
    private authFranceService: AuthFranceService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authFranceService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          console.log('🔒 [AuthFranceGuard] Accès refusé - Redirection vers login');
          return this.router.createUrlTree(['/restaurant-france/auth-france/login-france']);
        }
      })
    );
  }
}