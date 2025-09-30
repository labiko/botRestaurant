import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.page.html',
  styleUrls: ['./payment-callback.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PaymentCallbackPage implements OnInit {
  status: 'loading' | 'success' | 'cancel' | 'error' = 'loading';
  sessionId?: string;
  orderNumber?: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const route = this.router.url;
    const params = this.route.snapshot.queryParams;

    if (route.includes('success')) {
      this.sessionId = params['session_id'];
      await this.verifyPayment(this.sessionId);
    } else if (route.includes('cancel')) {
      this.showCancelAnimation();
    }
  }

  async verifyPayment(sessionId?: string) {
    // TODO: Appel API pour vérifier le statut
    // Pour l'instant, on simule un succès
    setTimeout(() => {
      this.status = 'success';
      this.orderNumber = '3009-0003'; // Exemple
      this.autoRedirect();
    }, 1000);
  }

  showCancelAnimation() {
    setTimeout(() => {
      this.status = 'cancel';
    }, 500);
  }

  autoRedirect() {
    setTimeout(() => {
      this.router.navigate(['/restaurant-france/orders-france']);
    }, 3000);
  }

  retryPayment() {
    this.router.navigate(['/restaurant-france/orders-france']);
  }
}
