import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
    private router: Router,
    private authService: AuthService
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
    try {
      const success = await this.authService.loginRestaurant(this.restaurantEmail, this.restaurantPassword);
      if (success) {
        this.router.navigate(['/restaurant/dashboard']);
      } else {
        // TODO: Show error toast
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }


  async loginDelivery() {
    try {
      const success = await this.authService.loginDelivery(this.deliveryPhone, this.deliveryCode);
      if (success) {
        this.router.navigate(['/delivery/dashboard']);
      } else {
        // TODO: Show error toast
        console.error('Login failed - Invalid phone or code');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}