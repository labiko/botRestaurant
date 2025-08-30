import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DeliveryConfigService, DeliveryConfig } from '../../../core/services/delivery-config.service';
import { SuperAdminRestaurantService, RestaurantAdmin } from '../services/super-admin-restaurant.service';

@Component({
  selector: 'app-delivery-config',
  templateUrl: './delivery-config.page.html',
  styleUrls: ['./delivery-config.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DeliveryConfigPage implements OnInit {
  // Restaurant selection
  restaurants: RestaurantAdmin[] = [];
  filteredRestaurants: RestaurantAdmin[] = [];
  selectedRestaurant: RestaurantAdmin | null = null;
  selectedRestaurantId: string | null = null;
  searchTerm: string = '';
  cameFromRestaurantSettings: boolean = false;
  
  // Delivery configuration
  config: DeliveryConfig = {
    deliveryType: 'distance_based',
    fixedAmount: 5000,
    pricePerKm: 3000,
    roundUpDistance: true,
    freeDeliveryThreshold: 800000,
    maxDeliveryRadius: 25
  };
  
  loading = true;
  saving = false;
  statusMessage: { type: 'success' | 'error', text: string } | null = null;
  
  // Devise du restaurant
  restaurantCurrency: string = 'GNF';
  
  constructor(
    private deliveryConfigService: DeliveryConfigService,
    private restaurantService: SuperAdminRestaurantService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Check if we came from restaurant-settings with a selected restaurant
    const state = history.state;
    if (state && state.restaurant) {
      // Directly set the selected restaurant and load its config
      this.selectedRestaurant = state.restaurant;
      this.selectedRestaurantId = state.restaurant.id;
      this.cameFromRestaurantSettings = true;
      await this.loadConfig();
      this.loading = false;
    } else if (state && state.restaurantId) {
      // Fallback for old implementation
      await this.loadRestaurants();
      const restaurant = this.restaurants.find(r => r.id === state.restaurantId);
      if (restaurant) {
        await this.selectRestaurant(restaurant);
      }
    } else {
      // No restaurant selected, show the restaurant selector
      await this.loadRestaurants();
    }
  }
  
  async loadRestaurants() {
    try {
      this.loading = true;
      this.restaurants = await this.restaurantService.getAllRestaurants();
      this.filteredRestaurants = [...this.restaurants];
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error);
      this.showStatus('error', 'Erreur lors du chargement des restaurants');
    } finally {
      this.loading = false;
    }
  }
  
  filterRestaurants() {
    if (!this.searchTerm) {
      this.filteredRestaurants = [...this.restaurants];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRestaurants = this.restaurants.filter(r => 
        (r.name || r.nom || '').toLowerCase().includes(term) ||
        (r.address || '').toLowerCase().includes(term)
      );
    }
  }
  
  async selectRestaurant(restaurant: RestaurantAdmin) {
    this.selectedRestaurant = restaurant;
    this.selectedRestaurantId = restaurant.id;
    await this.loadConfig();
  }
  
  clearSelection() {
    this.selectedRestaurant = null;
    this.selectedRestaurantId = null;
    this.config = {
      deliveryType: 'distance_based',
      fixedAmount: 5000,
      pricePerKm: 3000,
      roundUpDistance: true,
      freeDeliveryThreshold: 800000,
      maxDeliveryRadius: 25
    };
    this.restaurantCurrency = 'GNF';
  }

  async loadConfig() {
    if (!this.selectedRestaurantId) return;
    
    try {
      this.loading = true;
      
      // Charger la configuration de livraison
      const existingConfig = await this.deliveryConfigService.getRestaurantConfig(
        this.selectedRestaurantId
      );
      
      if (existingConfig) {
        this.config = existingConfig;
      } else {
        // Try to get default config from restaurant data
        const defaultConfig = await this.deliveryConfigService.getDefaultConfigFromRestaurant(
          this.selectedRestaurantId
        );
        if (defaultConfig) {
          this.config = defaultConfig;
        }
      }
      
      // Charger la devise du restaurant
      this.restaurantCurrency = await this.deliveryConfigService.getRestaurantCurrency(
        this.selectedRestaurantId
      );
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      this.showStatus('error', 'Erreur lors du chargement de la configuration');
    } finally {
      this.loading = false;
    }
  }

  onDeliveryTypeChange() {
    // Reset simulation when type changes
    this.updateSimulation();
  }

  updateSimulation() {
    // Method called when form values change to update the simulation
    // The simulation is automatically updated through data binding
  }

  simulateDistanceFee(distance: number, subtotal: number): number {
    return this.deliveryConfigService.simulateDeliveryFee(this.config, distance, subtotal);
  }

  isConfigValid(): boolean {
    if (!this.config.deliveryType) return false;
    
    if (this.config.deliveryType === 'fixed') {
      return !!(this.config.fixedAmount && this.config.fixedAmount > 0);
    }
    
    if (this.config.deliveryType === 'distance_based') {
      return !!(this.config.pricePerKm && this.config.pricePerKm > 0);
    }
    
    return false;
  }

  async saveConfig() {
    if (!this.selectedRestaurantId) {
      this.showStatus('error', 'Veuillez sélectionner un restaurant');
      return;
    }
    
    if (!this.isConfigValid()) {
      this.showStatus('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      this.saving = true;
      
      const success = await this.deliveryConfigService.saveRestaurantConfig(
        this.selectedRestaurantId,
        this.config
      );
      
      if (success) {
        this.showStatus('success', '✅ Configuration sauvegardée avec succès');
      } else {
        this.showStatus('error', 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showStatus('error', 'Erreur lors de la sauvegarde de la configuration');
    } finally {
      this.saving = false;
    }
  }

  private showStatus(type: 'success' | 'error', text: string) {
    this.statusMessage = { type, text };
    setTimeout(() => {
      this.statusMessage = null;
    }, 3000);
  }

  goBack() {
    if (this.selectedRestaurant) {
      // Return to restaurant settings with the selected restaurant
      this.router.navigate(['/super-admin/restaurant-settings'], {
        state: { restaurant: this.selectedRestaurant }
      });
    } else {
      this.router.navigate(['/super-admin/restaurants']);
    }
  }

  getCurrencySymbol(): string {
    const symbols: { [key: string]: string } = {
      'GNF': 'FG',
      'XOF': 'CFA',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[this.restaurantCurrency] || this.restaurantCurrency;
  }

  getRestaurantInitials(): string {
    if (!this.selectedRestaurant) return '??';
    const name = (this.selectedRestaurant.name || this.selectedRestaurant.nom || '').trim();
    if (!name) return '??';
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}