import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private router: Router) {}

  selectProfile(type: 'restaurant' | 'delivery') {
    // Navigation vers la page de login avec le type d'utilisateur
    this.router.navigate(['/auth/login'], { 
      queryParams: { userType: type } 
    });
  }

}
