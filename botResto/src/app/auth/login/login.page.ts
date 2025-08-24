import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  userType: 'restaurant' | 'delivery' = 'restaurant';
  
  // Restaurant login
  restaurantEmail: string = '';
  restaurantPassword: string = '';
  
  // Delivery login
  deliveryPhone: string = '';
  deliveryCode: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Récupérer le type d'utilisateur depuis les query params
    this.route.queryParams.subscribe(params => {
      if (params['userType']) {
        this.userType = params['userType'];
      }
    });
  }

  async loginRestaurant() {
    // TODO: Implémenter la connexion restaurant via Supabase
    console.log('Login restaurant:', this.restaurantEmail);
    // this.router.navigate(['/restaurant/dashboard']);
  }

  async loginDelivery() {
    // TODO: Implémenter la connexion livreur
    console.log('Login delivery:', this.deliveryPhone);
    // this.router.navigate(['/delivery/dashboard']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}