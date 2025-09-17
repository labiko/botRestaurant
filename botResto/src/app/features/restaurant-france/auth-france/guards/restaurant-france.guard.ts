import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFranceService } from '../services/auth-france.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantFranceGuard implements CanActivate {

  constructor(
    private authFranceService: AuthFranceService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authFranceService.currentUser$.pipe(
      map(user => {
        if (user && user.type === 'restaurant') {
          return true;
        } else if (user && user.type === 'driver') {
          return this.router.createUrlTree(['/restaurant-france/delivery-france']);
        } else {
          return this.router.createUrlTree(['/restaurant-france/auth-france/login-france']);
        }
      })
    );
  }
}