import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { DeliveryUser } from '../../../../../core/services/restaurant-orders.service';

@Component({
  selector: 'app-delivery-assignment-modal',
  templateUrl: './delivery-assignment-modal.component.html',
  styleUrls: ['./delivery-assignment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DeliveryAssignmentModalComponent implements OnInit {
  availableDeliveryUsers: DeliveryUser[] = [];
  selectedDeliveryUser: DeliveryUser | null = null;
  orderDetails: any = {};
  
  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  selectDeliveryUser(user: DeliveryUser) {
    this.selectedDeliveryUser = user;
  }

  async assignDelivery() {
    if (!this.selectedDeliveryUser) return;

    await this.modalController.dismiss({
      assigned: true,
      deliveryUser: this.selectedDeliveryUser
    });
  }

  async cancel() {
    await this.modalController.dismiss({
      assigned: false
    });
  }

  getStatusColor(isOnline: boolean): string {
    return isOnline ? 'success' : 'medium';
  }

  getStatusText(isOnline: boolean): string {
    return isOnline ? 'En ligne' : 'Hors ligne';
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    
    if (hasHalfStar) {
      stars.push('star-half');
    }
    
    while (stars.length < 5) {
      stars.push('star-outline');
    }
    
    return stars;
  }

  formatEarnings(earnings: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'GNF',
      minimumFractionDigits: 0 
    }).format(earnings);
  }
}