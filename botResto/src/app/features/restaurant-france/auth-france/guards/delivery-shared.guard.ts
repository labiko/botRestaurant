import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthFranceService } from '../services/auth-france.service';

@Injectable({
  providedIn: 'root'
})
export class DeliverySharedGuard implements CanActivate {

  constructor(
    private authFranceService: AuthFranceService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean | UrlTree> {
    // Attendre que l'auth service vérifie la session existante ou timeout après 3 secondes
    return this.authFranceService.currentUser$.pipe(
      // Attendre qu'on ait une valeur (null ou user) après vérification session
      filter(user => user !== undefined), // undefined = en cours de vérification
      take(1), // Prendre seulement la première valeur valide
      timeout(3000), // Timeout après 3 secondes max
      map(user => {
        console.log('🛡️ [DeliverySharedGuard] Vérification utilisateur:', user);
        
        if (user && (user.type === 'driver' || user.type === 'restaurant')) {
          console.log('✅ [DeliverySharedGuard] Accès autorisé - Type:', user.type);
          return true;
        } else {
          console.log('🚫 [DeliverySharedGuard] Non authentifié - Redirection login');
          return this.router.createUrlTree(['/restaurant-france/auth-france/login-france']);
        }
      }),
      catchError(error => {
        console.error('❌ [DeliverySharedGuard] Timeout ou erreur:', error);
        // En cas de timeout, rediriger vers login
        return of(this.router.createUrlTree(['/restaurant-france/auth-france/login-france']));
      })
    );
  }
}