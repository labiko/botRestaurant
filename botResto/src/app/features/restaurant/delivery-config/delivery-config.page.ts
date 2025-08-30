import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeliveryConfigService, DeliveryConfig } from '../../../core/services/delivery-config.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-delivery-config',
  templateUrl: './delivery-config.page.html',
  styleUrls: ['./delivery-config.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DeliveryConfigPage implements OnInit {
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
  
  // Nouvelle propriété pour la devise du restaurant
  restaurantCurrency: string = 'GNF';
  
  constructor(
    private deliveryConfigService: DeliveryConfigService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    try {
      this.loading = true;
      const user = await this.authService.getCurrentUser();
      
      if (user?.restaurantId) {
        // Charger la configuration de livraison
        const existingConfig = await this.deliveryConfigService.getRestaurantConfig(
          user.restaurantId
        );
        
        if (existingConfig) {
          this.config = existingConfig;
        }
        
        // Charger la devise du restaurant
        this.restaurantCurrency = await this.deliveryConfigService.getRestaurantCurrency(
          user.restaurantId
        );
      }
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
    if (!this.isConfigValid()) {
      this.showStatus('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      this.saving = true;
      const user = await this.authService.getCurrentUser();
      
      if (!user?.restaurantId) {
        throw new Error('Restaurant ID non trouvé');
      }

      const success = await this.deliveryConfigService.saveRestaurantConfig(
        user.restaurantId,
        this.config
      );

      if (success) {
        this.showStatus('success', 'Configuration sauvegardée avec succès !');
      } else {
        throw new Error('Échec de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showStatus('error', 'Erreur lors de la sauvegarde de la configuration');
    } finally {
      this.saving = false;
    }
  }

  resetToDefaults() {
    this.config = {
      deliveryType: 'distance_based',
      fixedAmount: 5000,
      pricePerKm: 3000,
      roundUpDistance: true,
      freeDeliveryThreshold: 800000,
      maxDeliveryRadius: 25
    };
    this.showStatus('success', 'Configuration réinitialisée aux valeurs par défaut');
  }

  private showStatus(type: 'success' | 'error', text: string) {
    this.statusMessage = { type, text };
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.statusMessage = null;
    }, 5000);
  }
}