import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleService, RestaurantSchedule, RestaurantStatus } from '../../../core/services/schedule.service';
import { DeliveryService, DeliveryUser, CreateDeliveryUserRequest, WhatsAppResponse } from '../../../core/services/delivery.service';
import { MenuService, MenuItem, CreateMenuItemRequest, MenuItemsStats } from '../../../core/services/menu.service';
import { ModalController, ToastController, AlertController } from '@ionic/angular';

interface RestaurantCategory {
  id?: string;
  restaurant_id: string;
  category_key: string;
  category_name: string;
  emoji: string;
  ordre: number;
  active: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit, OnDestroy {
  restaurantStatus: RestaurantStatus | null = null;
  schedule: RestaurantSchedule[] = [];
  weekDays = this.scheduleService.getWeekDays();
  currentStatus: string = 'ouvert';
  tempCloseReason: string = '';
  currentCurrency: string = 'GNF';
  availableCurrencies = [
    { code: 'GNF', name: 'Franc Guinéen' },
    { code: 'XOF', name: 'Franc CFA' },
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'Dollar US' }
  ];
  
  // Delivery modes configuration
  deliveryModes = {
    allow_dine_in: true,
    allow_takeaway: true,
    allow_delivery: true
  };
  deliveryModesUpdateSuccess = false;
  
  // Payment modes configuration
  paymentModes = {
    allow_pay_now: true,
    allow_pay_later: true
  };
  paymentModesUpdateSuccess = false;
  
  // Navigation
  currentTab: 'restaurant' | 'drivers' | 'menus' | 'delivery' | 'categories' = 'restaurant';
  
  // Delivery management
  drivers: DeliveryUser[] = [];
  newDriver = {
    name: '',
    phone: ''
  };
  isLoadingDrivers = false;
  
  // Menu management
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  menuStats: MenuItemsStats | null = null;
  selectedCategory: string = 'all';
  availableCategories: Array<{value: string, label: string, icon: string, active: boolean}> = [];
  newMenuItem = {
    nom_plat: '',
    description: '',
    prix_display: null as number | null,
    categorie: '',
    photo_url: '',
    ordre_affichage: 0
  };
  isLoadingMenuItems = false;
  showNewMenuItemForm = false;

  // Categories management
  restaurantCategories: RestaurantCategory[] = [];
  categoriesStats = {
    total: 0,
    active: 0,
    inactive: 0
  };
  newCategory = {
    category_key: '',
    category_name: '',
    emoji: '',
    ordre: 1
  };
  isLoadingCategories = false;
  showNewCategoryForm = false;
  editingCategory: RestaurantCategory | null = null;
  showEmojiPicker = false;
  availableEmojis = ['🍕', '🍔', '🥪', '🌮', '🍝', '🥗', '🍽️', '🫓', '🍟', '🥤', '🍰', '🥘', '🍜', '🌯', '🥙', '🍛', '🍱', '🍣', '🍤', '🥟'];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private deliveryService: DeliveryService,
    private menuService: MenuService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    console.log('🏁 ngOnInit - Devise initiale:', this.currentCurrency);
    
    const user = this.authService.getCurrentUser();
    if (!user || user.type !== 'restaurant') {
      this.router.navigate(['/auth/login'], { queryParams: { userType: 'restaurant' } });
      return;
    }

    await this.loadRestaurantData(user.restaurantId || 'default-id');
    
    console.log('🏁 ngOnInit - Devise finale:', this.currentCurrency);
    
    // Ne pas charger les livreurs automatiquement, seulement si l'utilisateur clique sur l'onglet
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadRestaurantData(restaurantId: string) {
    try {
      this.restaurantStatus = await this.scheduleService.getRestaurantStatus(restaurantId);
      this.schedule = await this.scheduleService.getRestaurantSchedule(restaurantId);
      
      if (this.restaurantStatus) {
        this.currentStatus = this.restaurantStatus.status;
        this.tempCloseReason = '';
      }

      // Charger la devise depuis la base de données
      await this.loadRestaurantCurrency(restaurantId);

      // Charger les modes de livraison depuis la base de données
      await this.loadDeliveryModes(restaurantId);

      // Charger les modes de paiement depuis la base de données
      await this.loadPaymentModes(restaurantId);

      // Charger les catégories pour les formulaires de menu ET pour l'affichage
      await this.loadCategoriesForMenus();

      this.ensureCompleteSchedule();
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    }
  }

  private ensureCompleteSchedule() {
    this.weekDays.forEach(day => {
      const existingDay = this.schedule.find(s => s.day_of_week === day.value);
      if (!existingDay) {
        this.schedule.push({
          restaurant_id: this.restaurantStatus?.id || 'default-id',
          day_of_week: day.value,
          open_time: '09:00',
          close_time: '22:00',
          is_closed: false
        });
      }
    });

    this.schedule.sort((a, b) => a.day_of_week - b.day_of_week);
  }

  async updateStatus() {
    if (!this.restaurantStatus) return;

    try {
      await this.scheduleService.updateRestaurantStatus(
        this.restaurantStatus.id,
        this.currentStatus,
        this.currentStatus === 'temporairement_ferme' ? this.tempCloseReason : undefined
      );

      this.restaurantStatus.status = this.currentStatus as any;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }


  async toggleDayClosed(dayIndex: number, event: any) {
    this.schedule[dayIndex].is_closed = !event.detail.checked;
    await this.saveScheduleAutomatically();
  }

  async onTimeChange(dayIndex: number, field: 'open_time' | 'close_time', event: any) {
    this.schedule[dayIndex][field] = event.detail.value;
    await this.saveScheduleAutomatically();
  }

  private async saveScheduleAutomatically() {
    if (!this.restaurantStatus) return;

    try {
      await this.scheduleService.updateSchedule(this.restaurantStatus.id, this.schedule);
      console.log('✅ Horaires sauvegardées automatiquement');
      
      // Afficher un toast de confirmation subtil
      const toast = await this.toastController.create({
        message: '✅ Horaires mises à jour',
        duration: 1000,
        position: 'top',
        color: 'success',
        cssClass: 'auto-save-toast'
      });
      await toast.present();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde automatique:', error);
      
      // Afficher un toast d'erreur
      const errorToast = await this.toastController.create({
        message: '❌ Erreur de sauvegarde',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ouvert': return 'success';
      case 'ferme': return 'danger';
      case 'temporairement_ferme': return 'warning';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ouvert': return 'Ouvert';
      case 'ferme': return 'Fermé';
      case 'temporairement_ferme': return 'Temporairement fermé';
      default: return status;
    }
  }

  /**
   * Vérifie si le restaurant est ouvert manuellement (malgré les horaires)
   */
  isManuallyOpen(): boolean {
    if (!this.restaurantStatus) return false;
    
    // Si le statut est 'ouvert' mais que selon les horaires il devrait être fermé
    return this.restaurantStatus.status === 'ouvert' && !this.restaurantStatus.is_open_now;
  }

  /**
   * Affiche un message simple pour l'ouverture manuelle
   */
  async showManualOpenInfo() {
    const alert = await this.alertController.create({
      header: 'ℹ️ Restaurant ouvert pour consultation',
      message: 'Restaurant ouvert hors horaires normaux.\n\n' +
               '👀 Les clients peuvent voir votre menu et horaires\n' +
               '⏰ Les commandes ne seront possibles que pendant vos heures d\'ouverture définies\n\n' +
               '✅ Cela permet aux clients de découvrir votre restaurant.',
      buttons: ['Compris']
    });
    await alert.present();
  }


  getDayName(dayOfWeek: number): string {
    return this.weekDays.find(d => d.value === dayOfWeek)?.name || '';
  }

  goBack() {
    this.router.navigate(['/restaurant/dashboard']);
  }

  // Nouvelles méthodes pour l'interface moderne

  // Vérifier si c'est aujourd'hui
  isToday(dayOfWeek: number): boolean {
    const today = new Date().getDay();
    // Convertir dimanche (0) vers 7 pour correspondre à notre système
    const adjustedToday = today === 0 ? 7 : today;
    return adjustedToday === dayOfWeek;
  }

  // Formatage des heures pour l'affichage
  formatTimeDisplay(time: string | undefined): string {
    if (!time) return '--:--';
    return time.substring(0, 5); // Format HH:mm
  }

  // Calculer la durée d'ouverture
  calculateDuration(openTime: string | undefined, closeTime: string | undefined): string {
    if (!openTime || !closeTime) return '--';
    
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    let duration = (closeHour * 60 + closeMin) - (openHour * 60 + openMin);
    
    // Gérer le cas où la fermeture est le lendemain (ex: 23h → 2h)
    if (duration < 0) {
      duration += 24 * 60;
    }
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${minutes < 10 ? '0' : ''}${minutes}`;
    }
  }


  // Templates rapides
  async applyTemplate(template: string) {
    let templateTimes: {open: string, close: string};
    
    switch (template) {
      case 'classic':
        templateTimes = {open: '11:00', close: '22:00'};
        break;
      case 'fastfood':
        templateTimes = {open: '10:00', close: '23:00'};
        break;
      case 'evening':
        templateTimes = {open: '18:00', close: '02:00'};
        break;
      default:
        return;
    }

    // Appliquer à tous les jours ouverts
    this.schedule.forEach(day => {
      if (!day.is_closed) {
        day.open_time = templateTimes.open;
        day.close_time = templateTimes.close;
      }
    });

    console.log(`Applied ${template} template`, templateTimes);
    
    // Sauvegarder automatiquement
    await this.saveScheduleAutomatically();
  }

  // =====================================
  // NAVIGATION
  // =====================================

  async switchTab(tab: 'restaurant' | 'drivers' | 'menus' | 'delivery' | 'categories') {
    this.currentTab = tab;
    
    // Si on passe à l'onglet livreurs, charger les données
    if (tab === 'drivers' && this.drivers.length === 0) {
      this.loadDrivers();
    }
    
    // Si on passe à l'onglet menus, charger les données
    if (tab === 'menus') {
      if (this.availableCategories.length === 0) {
        await this.loadCategoriesForMenus();
      }
      if (this.menuItems.length === 0) {
        this.loadMenuItems();
      }
    }
    
    // Si on passe à l'onglet modes de livraison, charger les données
    if (tab === 'delivery') {
      const user = this.authService.getCurrentUser();
      if (user?.restaurantId) {
        this.loadDeliveryModes(user.restaurantId);
      }
    }
    
    // Si on passe à l'onglet catégories, charger les données
    if (tab === 'categories' && this.restaurantCategories.length === 0) {
      this.loadCategories();
    }
    
    // Animation subtile
    const content = document.querySelector('ion-content');
    if (content) {
      content.scrollToTop(300);
    }
  }

  // =====================================
  // NOUVELLES MÉTHODES GESTION LIVREURS
  // =====================================

  async loadDrivers() {
    if (!this.restaurantStatus) return;
    
    console.log(`🔄 Loading drivers for restaurant ${this.restaurantStatus.id}`);
    this.isLoadingDrivers = true;
    try {
      this.drivers = await this.deliveryService.getDeliveryUsersByRestaurant(this.restaurantStatus.id);
      console.log(`✅ Loaded ${this.drivers.length} drivers for restaurant:`, this.drivers.map(d => ({
        id: d.id,
        nom: d.nom,
        is_blocked: d.is_blocked,
        is_online: d.is_online
      })));
    } catch (error) {
      console.error('Error loading drivers:', error);
      this.showToast('Erreur lors du chargement des livreurs', 'danger');
    } finally {
      this.isLoadingDrivers = false;
    }
  }

  async createDriver() {
    if (!this.restaurantStatus || !this.newDriver.name || !this.newDriver.phone) {
      return;
    }

    // Validation format téléphone
    if (!this.isValidPhoneNumber(this.newDriver.phone)) {
      this.showToast('Format de téléphone invalide (ex: +224623456789, 623456789, +33123456789)', 'danger');
      return;
    }

    try {
      const normalizedPhone = this.normalizePhoneNumber(this.newDriver.phone.trim());
      
      const request: CreateDeliveryUserRequest = {
        nom: this.newDriver.name.trim(),
        telephone: normalizedPhone,
        restaurant_id: this.restaurantStatus.id
      };

      const newDriver = await this.deliveryService.createDeliveryUser(request);
      
      // Envoyer le message de bienvenue
      const whatsAppResult = await this.deliveryService.sendWhatsAppWelcomeMessage(
        newDriver, 
        this.restaurantStatus.name
      );

      if (whatsAppResult.success) {
        this.showToast(
          `✅ Livreur créé et message WhatsApp envoyé à ${newDriver.nom}`, 
          'success'
        );
      } else {
        this.showToast(
          `⚠️ Livreur créé mais échec envoi WhatsApp: ${whatsAppResult.message}`, 
          'warning'
        );
      }

      // Reset form et reload
      this.newDriver = { name: '', phone: '' };
      await this.loadDrivers();

    } catch (error: any) {
      console.error('Error creating driver:', error);
      this.showToast(error.message || 'Erreur lors de la création du livreur', 'danger');
    }
  }

  async toggleDriverBlock(driver: DeliveryUser) {
    console.log(`🔄 Toggling block status for driver ${driver.nom}:`, {
      currentStatus: driver.is_blocked,
      driverId: driver.id
    });
    
    const newBlockStatus = !driver.is_blocked;
    const actionText = newBlockStatus ? 'bloquer' : 'débloquer';
    
    console.log(`➡️ New status will be: ${newBlockStatus ? 'BLOCKED' : 'UNBLOCKED'}`);
    
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${actionText} ${driver.nom} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: async () => {
            try {
              console.log(`🔧 Calling updateDeliveryUserBlockStatus(${driver.id}, ${newBlockStatus})`);
              await this.deliveryService.updateDeliveryUserBlockStatus(driver.id, newBlockStatus);
              console.log(`✅ Successfully updated driver ${driver.id} block status to ${newBlockStatus}`);
              
              if (newBlockStatus) {
                this.showToast(
                  `🚫 ${driver.nom} a été bloqué (déconnexion dans 5 min)`, 
                  'warning'
                );
              } else {
                this.showToast(
                  `✅ ${driver.nom} a été débloqué`, 
                  'success'
                );
              }
              
              console.log(`🔄 Reloading drivers list...`);
              await this.loadDrivers();
              console.log(`✅ Drivers list reloaded`);
            } catch (error) {
              console.error('Error toggling driver block:', error);
              this.showToast('Erreur lors du changement de statut', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteDriver(driver: DeliveryUser) {
    const alert = await this.alertController.create({
      header: 'Supprimer le livreur',
      message: `⚠️ Êtes-vous sûr de vouloir supprimer définitivement ${driver.nom} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.deliveryService.deleteDeliveryUser(driver.id);
              this.showToast(`🗑️ ${driver.nom} a été supprimé`, 'success');
              await this.loadDrivers();
            } catch (error) {
              console.error('Error deleting driver:', error);
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async refreshDrivers() {
    await this.loadDrivers();
    this.showToast('✅ Liste des livreurs actualisée', 'success', 1000);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const cleanPhone = phone.trim();
    
    // Vérifier les formats acceptés:
    // France: +33XXXXXXXXX (9 chiffres après indicatif) ou 33XXXXXXXXX
    // Guinée: +224XXXXXXXXX (9 chiffres après indicatif), 224XXXXXXXXX, ou 6XXXXXXXX (local)
    
    const franceRegex = /^(\+33|33)[1-9][0-9]{8}$/;
    const guineeFullRegex = /^(\+224|224)[6-7][0-9]{8}$/;
    const guineeLocalRegex = /^[6-7][0-9]{8}$/;
    
    return franceRegex.test(cleanPhone) || 
           guineeFullRegex.test(cleanPhone) || 
           guineeLocalRegex.test(cleanPhone);
  }

  private normalizePhoneNumber(phone: string): string {
    const cleanPhone = phone.trim();
    
    // Normaliser vers le format international standard
    
    // Si c'est un numéro français
    if (/^(\+33|33)[1-9][0-9]{8}$/.test(cleanPhone)) {
      if (cleanPhone.startsWith('+33')) {
        return cleanPhone; // Déjà au bon format
      } else {
        return '+' + cleanPhone; // Ajouter le +
      }
    }
    
    // Si c'est un numéro guinéen complet
    if (/^(\+224|224)[6-7][0-9]{8}$/.test(cleanPhone)) {
      if (cleanPhone.startsWith('+224')) {
        return cleanPhone; // Déjà au bon format
      } else {
        return '+' + cleanPhone; // Ajouter le +
      }
    }
    
    // Si c'est un numéro guinéen local (6XXXXXXXX)
    if (/^[6-7][0-9]{8}$/.test(cleanPhone)) {
      return '+224' + cleanPhone; // Ajouter l'indicatif international
    }
    
    // Par défaut, retourner tel quel
    return cleanPhone;
  }

  // =====================================
  // MENU MANAGEMENT
  // =====================================

  async loadMenuItems() {
    if (!this.restaurantStatus) return;
    
    console.log(`🍽️ Loading menu items for restaurant ${this.restaurantStatus.id}`);
    this.isLoadingMenuItems = true;
    try {
      this.menuItems = await this.menuService.getMenuItemsByRestaurant(this.restaurantStatus.id);
      this.menuStats = await this.menuService.getMenuStats(this.restaurantStatus.id);
      this.applyCurrentFilter();
      console.log(`✅ Loaded ${this.menuItems.length} menu items`);
    } catch (error) {
      console.error('Error loading menu items:', error);
      this.showToast('Erreur lors du chargement des menus', 'danger');
    } finally {
      this.isLoadingMenuItems = false;
    }
  }

  async createMenuItem() {
    if (!this.restaurantStatus || !this.newMenuItem.nom_plat || !this.newMenuItem.categorie || !this.newMenuItem.prix_display) {
      return;
    }

    try {
      const request: CreateMenuItemRequest = {
        restaurant_id: this.restaurantStatus.id,
        nom_plat: this.newMenuItem.nom_plat,
        description: this.newMenuItem.description || undefined,
        prix: this.menuService.convertToBaseAmount(this.newMenuItem.prix_display),
        categorie: this.newMenuItem.categorie as any,
        photo_url: this.newMenuItem.photo_url || undefined
      };

      const newItem = await this.menuService.createMenuItem(request);
      
      this.showToast(`✅ "${newItem.nom_plat}" ajouté au menu`, 'success');
      
      // Reset form
      this.newMenuItem = {
        nom_plat: '',
        description: '',
        prix_display: null,
        categorie: '',
        photo_url: '',
        ordre_affichage: 0
      };
      
      // Fermer le formulaire après ajout
      this.showNewMenuItemForm = false;
      
      await this.loadMenuItems();

    } catch (error: any) {
      console.error('Error creating menu item:', error);
      this.showToast(error.message || 'Erreur lors de la création du plat', 'danger');
    }
  }

  async toggleMenuItemAvailability(item: MenuItem) {
    try {
      const updatedItem = await this.menuService.toggleMenuItemAvailability(item.id);
      
      const status = updatedItem.disponible ? 'disponible' : 'indisponible';
      this.showToast(`🍽️ "${item.nom_plat}" marqué comme ${status}`, 'success');
      
      await this.loadMenuItems();
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      this.showToast('Erreur lors de la mise à jour', 'danger');
    }
  }

  async editMenuItem(item: MenuItem) {
    const { EditMenuItemModalComponent } = await import('./components/edit-menu-item-modal/edit-menu-item-modal.component');
    
    const modal = await this.modalController.create({
      component: EditMenuItemModalComponent,
      componentProps: {
        menuItem: item,
        availableCategories: this.availableCategories.filter(cat => cat.value !== 'all')
      },
      cssClass: 'edit-menu-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      console.log('✅ Menu item updated:', data.menuItem);
      // Recharger la liste des menus pour refléter les changements
      await this.loadMenuItems();
    }
  }

  async deleteMenuItem(item: MenuItem) {
    const alert = await this.alertController.create({
      header: 'Supprimer le plat',
      message: `Êtes-vous sûr de vouloir supprimer "${item.nom_plat}" du menu ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.menuService.deleteMenuItem(item.id);
              this.showToast(`🗑️ "${item.nom_plat}" supprimé du menu`, 'success');
              await this.loadMenuItems();
            } catch (error) {
              console.error('Error deleting menu item:', error);
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async refreshMenuItems() {
    await this.loadMenuItems();
    this.showToast('✅ Menu actualisé', 'success', 1000);
  }

  // Filtrage et tri
  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyCurrentFilter();
  }

  private applyCurrentFilter() {
    if (this.selectedCategory === 'all') {
      this.filteredMenuItems = [...this.menuItems];
    } else {
      this.filteredMenuItems = this.menuItems.filter(item => item.categorie === this.selectedCategory);
    }
  }

  getCategoryCount(category: string): number {
    const count = this.menuItems.filter(item => item.categorie === category).length;
    console.log(`🔍 getCategoryCount("${category}"): ${count} items found`);
    console.log(`📋 Total menuItems: ${this.menuItems.length}`);
    
    // Debug: afficher tous les items de cette catégorie
    const itemsInCategory = this.menuItems.filter(item => item.categorie === category);
    console.log(`🍽️ Items in category "${category}":`, itemsInCategory.map(item => ({
      id: item.id,
      nom_plat: item.nom_plat,
      categorie: item.categorie
    })));
    
    return count;
  }

  getFilterTitle(): string {
    if (this.selectedCategory === 'all') {
      return 'Tous les plats';
    }
    
    const category = this.availableCategories.find(cat => cat.value === this.selectedCategory);
    return category ? category.label : 'Plats filtrés';
  }

  getCategoryColor(categorie: string): string {
    const colors: { [key: string]: string } = {
      'entree': 'success',
      'plat': 'primary', 
      'accompagnement': 'secondary',
      'dessert': 'tertiary',
      'boisson': 'warning'
    };
    return colors[categorie] || 'medium';
  }

  getCategoryIcon(categorie: string): string {
    const icons: { [key: string]: string } = {
      'entree': 'restaurant',
      'plat': 'pizza',
      'accompagnement': 'leaf',
      'dessert': 'ice-cream',
      'boisson': 'wine'
    };
    return icons[categorie] || 'restaurant';
  }

  getCategoryLabel(categorie: string): string {
    const category = this.availableCategories.find(cat => cat.value === categorie);
    return category ? category.label : categorie;
  }

  formatPrice(amount: number): string {
    return this.menuService.formatPrice(amount);
  }

  getCurrencySymbol(): string {
    return this.menuService.getCurrency();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async updateCurrency() {
    if (!this.restaurantStatus) return;

    try {
      // Mettre à jour dans la base de données
      const { error } = await this.supabase
        .from('restaurants')
        .update({ currency: this.currentCurrency })
        .eq('id', this.restaurantStatus.id);

      if (error) {
        console.error('Error updating currency:', error);
        await this.showToast('Erreur lors de la mise à jour de la devise', 'danger');
        return;
      }

      // Mettre à jour dans le service
      this.menuService.setCurrency(this.currentCurrency);

      await this.showToast('Devise mise à jour avec succès', 'success');
    } catch (error) {
      console.error('Error updating currency:', error);
      await this.showToast('Erreur lors de la mise à jour de la devise', 'danger');
    }
  }

  getCurrentCurrencyName(): string {
    const currency = this.availableCurrencies.find(c => c.code === this.currentCurrency);
    return currency ? `${currency.name} (${currency.code})` : this.currentCurrency;
  }

  private get supabase() {
    return (this.scheduleService as any).supabase.client;
  }

  getCategoriesCount(): number {
    if (!this.menuStats) return 0;
    return Object.keys(this.menuStats.categories).length;
  }

  toggleNewMenuItemForm(): void {
    this.showNewMenuItemForm = !this.showNewMenuItemForm;
  }

  private async showToast(message: string, color: string, duration = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color
    });
    await toast.present();
  }

  // =====================================
  // DELIVERY MODES MANAGEMENT
  // =====================================

  async loadDeliveryModes(restaurantId: string) {
    try {
      const { data, error } = await this.supabase
        .from('restaurants')
        .select('allow_dine_in, allow_takeaway, allow_delivery')
        .eq('id', restaurantId)
        .single();

      if (!error && data) {
        this.deliveryModes = {
          allow_dine_in: data.allow_dine_in ?? true,
          allow_takeaway: data.allow_takeaway ?? true,
          allow_delivery: data.allow_delivery ?? true
        };
        console.log('✅ Modes de livraison chargés:', this.deliveryModes);
      } else {
        console.error('❌ Erreur chargement modes de livraison:', error);
      }
    } catch (error) {
      console.error('❌ Erreur chargement modes de livraison:', error);
    }
  }

  async loadRestaurantCurrency(restaurantId: string) {
    try {
      const { data, error } = await this.supabase
        .from('restaurants')
        .select('currency')
        .eq('id', restaurantId)
        .single();

      if (data && !error) {
        if (data.currency) {
          this.currentCurrency = data.currency;
          this.menuService.setCurrency(data.currency);
          console.log('✅ Devise restaurant chargée:', data.currency);
        }
      } else {
        console.error('❌ Erreur chargement devise restaurant:', error);
      }
    } catch (error) {
      console.error('❌ Erreur chargement devise restaurant:', error);
    }
  }

  async updateDeliveryModes() {
    if (!this.restaurantStatus) return;

    // Vérifier qu'au moins un mode est activé
    if (!this.isAtLeastOneModeActive()) {
      await this.showToast('⚠️ Au moins un mode doit être activé', 'warning');
      // Réactiver le dernier mode décoché
      return;
    }

    try {
      const { error } = await this.supabase
        .from('restaurants')
        .update({
          allow_dine_in: this.deliveryModes.allow_dine_in,
          allow_takeaway: this.deliveryModes.allow_takeaway,
          allow_delivery: this.deliveryModes.allow_delivery
        })
        .eq('id', this.restaurantStatus.id);

      if (error) {
        console.error('❌ Erreur mise à jour modes de livraison:', error);
        await this.showToast('Erreur lors de la mise à jour des modes', 'danger');
        return;
      }

      console.log('✅ Modes de livraison mis à jour avec succès');
      
      // Afficher le message de succès visuel
      this.deliveryModesUpdateSuccess = true;
      setTimeout(() => {
        this.deliveryModesUpdateSuccess = false;
      }, 3000);
    } catch (error) {
      console.error('❌ Erreur mise à jour modes de livraison:', error);
      await this.showToast('Erreur lors de la mise à jour', 'danger');
    }
  }

  isAtLeastOneModeActive(): boolean {
    return this.deliveryModes.allow_dine_in || 
           this.deliveryModes.allow_takeaway || 
           this.deliveryModes.allow_delivery;
  }

  // =====================================
  // PAYMENT MODES MANAGEMENT
  // =====================================

  async loadPaymentModes(restaurantId: string) {
    try {
      const { data, error } = await this.supabase
        .from('restaurants')
        .select('allow_pay_now, allow_pay_later')
        .eq('id', restaurantId)
        .single();

      if (data && !error) {
        this.paymentModes = {
          allow_pay_now: data.allow_pay_now ?? true,
          allow_pay_later: data.allow_pay_later ?? true
        };
        console.log('✅ Modes de paiement chargés:', this.paymentModes);
      } else {
        console.error('❌ Erreur chargement modes de paiement:', error);
      }
    } catch (error) {
      console.error('❌ Erreur chargement modes de paiement:', error);
    }
  }

  async updatePaymentModes() {
    if (!this.restaurantStatus) return;

    // Vérifier qu'au moins un mode est activé
    if (!this.isAtLeastOnePaymentModeActive()) {
      await this.showToast('⚠️ Au moins un mode de paiement doit être activé', 'warning');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('restaurants')
        .update({
          allow_pay_now: this.paymentModes.allow_pay_now,
          allow_pay_later: this.paymentModes.allow_pay_later
        })
        .eq('id', this.restaurantStatus.id);

      if (error) {
        console.error('❌ Erreur mise à jour modes de paiement:', error);
        await this.showToast('Erreur lors de la mise à jour des modes de paiement', 'danger');
        return;
      }

      console.log('✅ Modes de paiement mis à jour avec succès');
      
      // Afficher le message de succès visuel
      this.paymentModesUpdateSuccess = true;
      setTimeout(() => {
        this.paymentModesUpdateSuccess = false;
      }, 3000);
    } catch (error) {
      console.error('❌ Erreur mise à jour modes de paiement:', error);
      await this.showToast('Erreur lors de la mise à jour', 'danger');
    }
  }

  isAtLeastOnePaymentModeActive(): boolean {
    return this.paymentModes.allow_pay_now || this.paymentModes.allow_pay_later;
  }

  async showPaymentModeDisabledMessage() {
    const alert = await this.alertController.create({
      header: 'Paiement immédiat',
      message: 'Le paiement immédiat n\'est plus automatique. Vous pouvez maintenant envoyer directement le lien de paiement au client depuis la gestion des commandes pour plus de flexibilité.',
      buttons: [
        {
          text: 'Compris',
          role: 'confirm'
        }
      ]
    });
    await alert.present();
  }

  // =====================================
  // CATEGORIES MANAGEMENT
  // =====================================

  async loadCategories() {
    if (!this.restaurantStatus) return;
    
    console.log(`🏷️ Loading categories for restaurant ${this.restaurantStatus.id}`);
    this.isLoadingCategories = true;
    try {
      const { data, error } = await this.supabase
        .from('restaurant_categories')
        .select('*')
        .eq('restaurant_id', this.restaurantStatus.id)
        .order('ordre');

      if (error) {
        console.error('Error loading categories:', error);
        this.showToast('Erreur lors du chargement des catégories', 'danger');
        this.loadFallbackCategories();
        return;
      }

      this.restaurantCategories = data || [];
      this.updateCategoriesStats();
      this.updateAvailableCategories();
      console.log(`✅ Loaded ${this.restaurantCategories.length} categories`);
    } catch (error) {
      console.error('Error loading categories:', error);
      this.showToast('Erreur lors du chargement des catégories', 'danger');
      this.loadFallbackCategories();
    } finally {
      this.isLoadingCategories = false;
    }
  }

  private updateCategoriesStats() {
    this.categoriesStats = {
      total: this.restaurantCategories.length,
      active: this.restaurantCategories.filter(c => c.active).length,
      inactive: this.restaurantCategories.filter(c => !c.active).length
    };
  }

  async createCategory() {
    if (!this.restaurantStatus || !this.newCategory.category_key || !this.newCategory.category_name || !this.newCategory.emoji) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    // Vérifier si la clé existe déjà
    if (this.restaurantCategories.some(c => c.category_key === this.newCategory.category_key)) {
      this.showToast('Cette clé de catégorie existe déjà', 'danger');
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('restaurant_categories')
        .insert({
          restaurant_id: this.restaurantStatus.id,
          category_key: this.newCategory.category_key,
          category_name: this.newCategory.category_name,
          emoji: this.newCategory.emoji,
          ordre: this.newCategory.ordre,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        this.showToast('Erreur lors de la création de la catégorie', 'danger');
        return;
      }

      this.showToast(`✅ Catégorie "${data.category_name}" créée avec succès`, 'success');
      
      // Reset form
      this.newCategory = {
        category_key: '',
        category_name: '',
        emoji: '',
        ordre: this.restaurantCategories.length + 1
      };
      
      this.showNewCategoryForm = false;
      await this.loadCategories();
      
      // Reload menu items to update category filtering
      if (this.menuItems.length > 0) {
        await this.loadMenuItems();
      }

    } catch (error) {
      console.error('Error creating category:', error);
      this.showToast('Erreur lors de la création de la catégorie', 'danger');
    }
  }

  async updateCategory(category: RestaurantCategory) {
    try {
      const { error } = await this.supabase
        .from('restaurant_categories')
        .update({
          category_name: category.category_name,
          emoji: category.emoji,
          ordre: category.ordre,
          active: category.active
        })
        .eq('id', category.id);

      if (error) {
        console.error('Error updating category:', error);
        this.showToast('Erreur lors de la mise à jour', 'danger');
        return;
      }

      this.showToast(`✅ Catégorie "${category.category_name}" mise à jour`, 'success');
      this.editingCategory = null;
      await this.loadCategories();

    } catch (error) {
      console.error('Error updating category:', error);
      this.showToast('Erreur lors de la mise à jour', 'danger');
    }
  }

  async toggleCategoryStatus(category: RestaurantCategory) {
    try {
      const newStatus = !category.active;
      const { error } = await this.supabase
        .from('restaurant_categories')
        .update({ active: newStatus })
        .eq('id', category.id);

      if (error) {
        console.error('Error toggling category status:', error);
        this.showToast('Erreur lors de la mise à jour du statut', 'danger');
        return;
      }

      const statusText = newStatus ? 'activée' : 'désactivée';
      this.showToast(`✅ Catégorie "${category.category_name}" ${statusText}`, 'success');
      await this.loadCategories();

    } catch (error) {
      console.error('Error toggling category status:', error);
      this.showToast('Erreur lors de la mise à jour', 'danger');
    }
  }

  async deleteCategory(category: RestaurantCategory) {
    const alert = await this.alertController.create({
      header: 'Supprimer la catégorie',
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${category.category_name}" ? Cette action est irréversible.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              const { error } = await this.supabase
                .from('restaurant_categories')
                .delete()
                .eq('id', category.id);

              if (error) {
                console.error('Error deleting category:', error);
                this.showToast('Erreur lors de la suppression', 'danger');
                return;
              }

              this.showToast(`🗑️ Catégorie "${category.category_name}" supprimée`, 'success');
              await this.loadCategories();

            } catch (error) {
              console.error('Error deleting category:', error);
              this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  editCategory(category: RestaurantCategory) {
    this.editingCategory = { ...category };
  }

  cancelEdit() {
    this.editingCategory = null;
  }

  toggleNewCategoryForm() {
    this.showNewCategoryForm = !this.showNewCategoryForm;
    if (this.showNewCategoryForm) {
      this.newCategory.ordre = this.restaurantCategories.length + 1;
    }
  }

  async refreshCategories() {
    await this.loadCategories();
    this.showToast('✅ Catégories actualisées', 'success', 1000);
  }

  getCategoryStatusColor(active: boolean): string {
    return active ? 'success' : 'medium';
  }

  getCategoryStatusText(active: boolean): string {
    return active ? 'Active' : 'Inactive';
  }

  openEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  selectEmoji(emoji: string) {
    this.newCategory.emoji = emoji;
    this.showEmojiPicker = false;
  }

  onCategoryKeyInput(event: any) {
    let value = event.target.value;
    // Convert to lowercase and replace spaces with underscores
    value = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    this.newCategory.category_key = value;
  }

  getNextCategoryOrder(): number {
    return this.restaurantCategories.length + 1;
  }

  // Computed property for stats compatibility with template
  get categoryStats() {
    return {
      total_categories: this.categoriesStats.total,
      total_products: this.menuStats?.total_items || 0,
      avg_products_per_category: this.categoriesStats.total > 0 ? Math.round((this.menuStats?.total_items || 0) / this.categoriesStats.total) : 0,
      last_updated: this.formatDate(new Date().toISOString())
    };
  }

  getShortDateFormat(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private updateAvailableCategories() {
    // Convert restaurant categories to the format expected by the menu forms
    this.availableCategories = this.restaurantCategories
      .map(cat => ({
        value: cat.category_key,
        label: cat.category_name,
        icon: 'pricetag', // Default icon, could be enhanced later
        active: cat.active
      }));
    
    // Add 'all' option for filtering
    this.availableCategories.unshift({
      value: 'all',
      label: 'Toutes les catégories',
      icon: 'list',
      active: true
    });
  }

  private loadFallbackCategories() {
    // Fallback to hardcoded categories if database fails
    const fallbackCategories = this.menuService.getAvailableCategories();
    this.availableCategories = fallbackCategories.map(cat => ({
      ...cat,
      active: true // Fallback categories are considered active by default
    }));
  }

  async loadCategoriesForMenus() {
    if (!this.restaurantStatus) return;
    
    console.log(`🏷️ Loading categories for menus for restaurant ${this.restaurantStatus.id}`);
    try {
      const { data, error } = await this.supabase
        .from('restaurant_categories')
        .select('*')
        .eq('restaurant_id', this.restaurantStatus.id)
        .order('ordre');

      if (error) {
        console.error('Error loading categories for menus:', error);
        this.loadFallbackCategories();
        return;
      }

      console.log(`📊 Raw restaurant_categories data:`, data);
      
      // Mettre à jour availableCategories pour les menus
      this.restaurantCategories = data || [];
      this.updateAvailableCategories();
      
      console.log(`✅ Loaded ${this.restaurantCategories.length} categories for menus`);
      console.log(`🏷️ Final availableCategories:`, this.availableCategories);
    } catch (error) {
      console.error('Error loading categories for menus:', error);
      this.loadFallbackCategories();
    }
  }
}
