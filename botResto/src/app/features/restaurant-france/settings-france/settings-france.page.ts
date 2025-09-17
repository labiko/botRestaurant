import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestaurantConfigService } from '../services/restaurant-config.service';
import { AuthFranceService } from '../auth-france/services/auth-france.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings-france',
  templateUrl: './settings-france.page.html',
  styleUrls: ['./settings-france.page.scss'],
  standalone: false
})
export class SettingsFrancePage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentTab: 'restaurant' | 'products' | 'workflows' | 'service-modes' | 'audio-notifications' = 'restaurant';
  restaurantName: string = 'Configuration Restaurant'; // Default name
  restaurantId: number;

  constructor(
    private restaurantConfigService: RestaurantConfigService,
    private authFranceService: AuthFranceService
  ) {
    // Récupérer l'ID du restaurant depuis la session
    const id = this.authFranceService.getCurrentRestaurantId();
    if (id === null) {
      console.error('❌ [SettingsFrance] Impossible de récupérer restaurant ID - utilisateur non connecté');
      throw new Error('Restaurant ID requis - utilisateur non connecté');
    }
    this.restaurantId = id;
  }

  ngOnInit() {
    this.loadRestaurantName();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRestaurantName() {
    this.restaurantConfigService.getRestaurantConfig(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.restaurantName = config.name || 'Configuration Restaurant';
        },
        error: (error) => {
          console.error('Error loading restaurant name:', error);
          // Keep default name on error
        }
      });
  }

  /**
   * Switch between tabs
   */
  switchTab(tab: 'restaurant' | 'products' | 'workflows' | 'service-modes' | 'audio-notifications') {
    this.currentTab = tab;
  }

  /**
   * Check if tab is active
   */
  isTabActive(tab: string): boolean {
    return this.currentTab === tab;
  }

  /**
   * Refresh all data - reload current tab components
   */
  refreshData() {
    // Force reloading of the current tab component by triggering Angular change detection
    // This will cause ngOnInit to be called again on the current tab component
    const currentTab = this.currentTab;
    this.currentTab = '' as any; // Temporarily hide component
    
    setTimeout(() => {
      this.currentTab = currentTab; // Restore component, triggering ngOnInit
    }, 50);
  }
}