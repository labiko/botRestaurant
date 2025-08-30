import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RestaurantAdmin, RestaurantOrder } from '../services/super-admin-restaurant.service';
import { SuperAdminRestaurantService } from '../services/super-admin-restaurant.service';

@Component({
  selector: 'app-restaurant-orders-modal',
  templateUrl: './restaurant-orders-modal.component.html',
  styleUrls: ['./restaurant-orders-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RestaurantOrdersModalComponent implements OnInit {
  @Input() restaurant!: RestaurantAdmin;
  
  orders: RestaurantOrder[] = [];
  historyOrders: RestaurantOrder[] = [];
  loading = true;
  selectedTab: 'active' | 'history' = 'active';
  
  constructor(
    private modalController: ModalController,
    private restaurantService: SuperAdminRestaurantService
  ) {}

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    try {
      this.loading = true;
      this.orders = await this.restaurantService.getRestaurantOrders(this.restaurant.id);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadHistoryOrders() {
    try {
      this.loading = true;
      this.historyOrders = await this.restaurantService.getRestaurantOrdersHistory(this.restaurant.id);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      this.loading = false;
    }
  }

  async selectTab(tab: string | number | undefined) {
    if (!tab || typeof tab !== 'string' || (tab !== 'active' && tab !== 'history')) return;
    
    this.selectedTab = tab as 'active' | 'history';
    if (tab === 'history' && this.historyOrders.length === 0) {
      await this.loadHistoryOrders();
    }
  }

  getCurrentOrders(): RestaurantOrder[] {
    return this.selectedTab === 'active' ? this.orders : this.historyOrders;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'preparation': 'En préparation',
      'en_preparation': 'En préparation', // Support ancien format
      'prete': 'Prête',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'en_attente': 'warning',
      'confirmee': 'primary',
      'preparation': 'secondary',
      'en_preparation': 'secondary', // Support ancien format
      'prete': 'success',
      'en_livraison': 'tertiary',
      'livree': 'success',
      'terminee': 'success',
      'annulee': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  formatCurrency(amount: number): string {
    if (!amount || isNaN(amount)) return '0 GNF';
    return new Intl.NumberFormat('fr-GN').format(amount) + ' GNF';
  }

  formatPrice(amount: number): string {
    if (!amount || isNaN(amount)) return '0 GNF';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'GNF',
      minimumFractionDigits: 0 
    }).format(amount);
  }


  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openGoogleMaps(latitude: number, longitude: number, customerName: string) {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=16&hl=fr`;
      window.open(url, '_blank');
    }
  }

  openWhatsApp(phone: string) {
    if (phone) {
      // Remove any non-digit characters and ensure proper format
      const cleanPhone = phone.replace(/\D/g, '');
      let formattedPhone = cleanPhone;
      
      // Add country code if not present
      if (!formattedPhone.startsWith('224') && formattedPhone.length === 9) {
        formattedPhone = '224' + formattedPhone;
      }
      
      const url = `https://wa.me/${formattedPhone}`;
      window.open(url, '_blank');
    }
  }

  getDeliveryModeText(mode: string): string {
    const modeMap: Record<string, string> = {
      'sur_place': 'Sur place',
      'emporter': 'À emporter',
      'a_emporter': 'À emporter', // Support ancien format
      'livraison': 'Livraison'
    };
    return modeMap[mode] || mode;
  }

  getPaymentModeText(mode: string): string {
    const modeMap: Record<string, string> = {
      'maintenant': 'Payé',
      'fin_repas': 'À payer sur place',
      'recuperation': 'À payer au retrait',
      'livraison': 'À payer à la livraison'
    };
    return modeMap[mode] || mode;
  }
}