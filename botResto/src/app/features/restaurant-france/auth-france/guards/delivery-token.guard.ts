import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, take, timeout, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthFranceService } from '../services/auth-france.service';
import { DeliveryTokenService } from '../../../../core/services/delivery-token.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryTokenGuard implements CanActivate {

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryTokenService: DeliveryTokenService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    // Récupérer le token depuis les query params
    const token = route.queryParams['token'];
    
    // Si un token est présent, tenter l'authentification par token
    if (token) {
      console.log('🔑 [DeliveryTokenGuard] Token détecté, tentative d\'authentification:', token);
      
      return this.deliveryTokenService.validateAndAuthenticateToken(token).pipe(
        map(result => {
          if (result.success && result.driver) {
            console.log('✅ [DeliveryTokenGuard] Authentification par token réussie');
            // Le service a déjà mis à jour l'utilisateur dans authFranceService
            return true;
          } else {
            console.log('❌ [DeliveryTokenGuard] Token invalide, redirection login');
            return this.router.createUrlTree(['/restaurant-france/auth-france/login-france']);
          }
        }),
        catchError(error => {
          console.error('❌ [DeliveryTokenGuard] Erreur validation token:', error);
          return of(this.router.createUrlTree(['/restaurant-france/auth-france/login-france']));
        })
      );
    }
    
    // Si pas de token, vérifier l'authentification normale
    console.log('🛡️ [DeliveryTokenGuard] Pas de token, vérification auth normale');
    
    return this.authFranceService.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1),
      timeout(3000),
      map(user => {
        if (user && user.type === 'driver') {
          console.log('✅ [DeliveryTokenGuard] Accès autorisé - Livreur authentifié');
          return true;
        } else if (user && user.type === 'restaurant') {
          console.log('🏪 [DeliveryTokenGuard] Redirection restaurant');
          return this.router.createUrlTree(['/restaurant-france/dashboard-france']);
        } else {
          console.log('🚫 [DeliveryTokenGuard] Non authentifié - Redirection login');
          return this.router.createUrlTree(['/restaurant-france/auth-france/login-france']);
        }
      }),
      catchError(error => {
        console.error('❌ [DeliveryTokenGuard] Timeout ou erreur:', error);
        return of(this.router.createUrlTree(['/restaurant-france/auth-france/login-france']));
      })
    );
  }
}