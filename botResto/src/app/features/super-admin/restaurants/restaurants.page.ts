import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';
import { SuperAdminRestaurantService, RestaurantAdmin } from '../services/super-admin-restaurant.service';
import { WhatsAppAdminService } from '../services/whatsapp-admin.service';
import { PaymentConfigService } from '../services/payment-config.service';
import { RestaurantOrdersModalComponent } from '../components/restaurant-orders-modal.component';
import { AddRestaurantModalComponent } from '../components/add-restaurant-modal.component';

@Component({
  selector: 'app-super-admin-restaurants',
  templateUrl: './restaurants.page.html',
  styleUrls: ['./restaurants.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class SuperAdminRestaurantsPage implements OnInit {
  restaurants: RestaurantAdmin[] = [];
  filteredRestaurants: RestaurantAdmin[] = [];
  loading = true;
  
  // Filtres
  searchQuery = '';
  statusFilter = 'all';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  viewMode: 'grid' | 'list' = 'grid';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  constructor(
    private restaurantService: SuperAdminRestaurantService,
    private whatsappService: WhatsAppAdminService,
    private paymentConfigService: PaymentConfigService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadRestaurants();
  }

  async loadRestaurants() {
    try {
      this.loading = true;
      this.restaurants = await this.restaurantService.getAllRestaurants();
      this.applyFilters();
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
      await this.showToast('Erreur lors du chargement', 'danger');
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    let filtered = [...this.restaurants];

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.nom.toLowerCase().includes(query) ||
        r.owner.toLowerCase().includes(query) ||
        r.email?.toLowerCase().includes(query) ||
        r.phone.includes(query)
      );
    }

    // Filtre par statut
    if (this.statusFilter !== 'all') {
      if (this.statusFilter === 'blocked') {
        filtered = filtered.filter(r => r.isBlocked === true);
      } else {
        filtered = filtered.filter(r => r.status === this.statusFilter);
      }
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = a.nom;
          bValue = b.nom;
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'orders':
          aValue = a.orderCount;
          bValue = b.orderCount;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        default:
          aValue = a.nom;
          bValue = b.nom;
      }

      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredRestaurants = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredRestaurants.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getPaginatedRestaurants(): RestaurantAdmin[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredRestaurants.slice(start, end);
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  changeSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  async activateRestaurant(restaurant: RestaurantAdmin) {
    const alert = await this.alertController.create({
      header: 'Activer le restaurant',
      message: `Êtes-vous sûr de vouloir activer "${restaurant.nom}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Activer',
          role: 'confirm',
          handler: async () => {
            try {
              await this.restaurantService.updateRestaurantStatus(restaurant.id, 'active');
              restaurant.status = 'active';
              
              // Envoyer notification WhatsApp
              await this.whatsappService.sendAccountActivatedMessage({
                restaurantName: restaurant.nom,
                ownerName: restaurant.owner,
                phone: restaurant.phone,
                planType: restaurant.subscription
              });
              
              await this.showToast('Restaurant activé avec succès', 'success');
            } catch (error) {
              await this.showToast('Erreur lors de l\'activation', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async suspendRestaurant(restaurant: RestaurantAdmin) {
    const alert = await this.alertController.create({
      header: 'Suspendre le restaurant',
      message: `Êtes-vous sûr de vouloir suspendre "${restaurant.nom}" ?`,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Motif de la suspension...',
          attributes: { required: true }
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Suspendre',
          role: 'confirm',
          handler: async (data) => {
            if (!data.reason?.trim()) {
              await this.showToast('Motif obligatoire', 'warning');
              return false;
            }

            try {
              await this.restaurantService.updateRestaurantStatus(restaurant.id, 'suspended', data.reason);
              restaurant.status = 'suspended';
              
              // Envoyer notification WhatsApp
              await this.whatsappService.sendSuspensionNotice(
                restaurant.phone,
                restaurant.nom,
                data.reason
              );
              
              await this.showToast('Restaurant suspendu', 'success');
              return true;
            } catch (error) {
              await this.showToast('Erreur lors de la suspension', 'danger');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteRestaurant(restaurant: RestaurantAdmin) {
    const alert = await this.alertController.create({
      header: 'Supprimer le restaurant',
      message: `⚠️ ATTENTION: Cette action est irréversible!\n\nÊtes-vous sûr de vouloir supprimer définitivement "${restaurant.nom}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Suppression en cours...'
            });
            await loading.present();
            
            try {
              const success = await this.restaurantService.deleteRestaurant(restaurant.id);
              await loading.dismiss();
              
              if (success) {
                // Recharger la liste complète depuis la base
                await this.loadRestaurants();
                await this.showToast('Restaurant supprimé définitivement avec archivage complet', 'success');
              } else {
                await this.showToast('Erreur lors de la suppression définitive', 'danger');
              }
            } catch (error) {
              await loading.dismiss();
              await this.showToast('Erreur lors de la suppression', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async resetPassword(restaurant: RestaurantAdmin) {
    const alert = await this.alertController.create({
      header: 'Réinitialiser le mot de passe',
      message: `Réinitialiser le mot de passe de "${restaurant.nom}" ? Le restaurant sera déconnecté et devra créer un nouveau mot de passe lors de sa prochaine connexion.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Réinitialiser',
          role: 'confirm',
          handler: async () => {
            try {
              await this.restaurantService.resetRestaurantPasswordForced(restaurant.id);
              
              // Envoyer notification WhatsApp
              await this.whatsappService.sendPasswordResetMessage({
                restaurantName: restaurant.nom,
                ownerName: restaurant.owner,
                phone: restaurant.phone
              });

              await this.showToast('Mot de passe réinitialisé avec succès. Le restaurant a été notifié.', 'success');
              await this.loadRestaurants();
              
            } catch (error) {
              await this.showToast('Erreur lors de la réinitialisation', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async sendBulkNotification() {
    const alert = await this.alertController.create({
      header: 'Notification en masse',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Titre de la notification',
          attributes: { required: true }
        },
        {
          name: 'message',
          type: 'textarea',
          placeholder: 'Message à envoyer...',
          attributes: { required: true }
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Envoyer',
          role: 'confirm',
          handler: async (data) => {
            if (!data.title?.trim() || !data.message?.trim()) {
              await this.showToast('Titre et message obligatoires', 'warning');
              return false;
            }

            try {
              const activeRestaurants = this.restaurants
                .filter(r => r.status === 'active')
                .map(r => ({ phone: r.phone, name: r.nom }));

              const result = await this.whatsappService.sendBulkMessage(
                activeRestaurants,
                data.message,
                { featureTitle: data.title }
              );

              await this.showToast(
                `Envoyé: ${result.successful}, Échecs: ${result.failed}`, 
                'success'
              );
              return true;
            } catch (error) {
              await this.showToast('Erreur lors de l\'envoi', 'danger');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'danger';
      case 'pending': return 'warning';
      case 'banned': return 'dark';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'suspended': return 'Suspendu';
      case 'pending': return 'En attente';
      case 'banned': return 'Banni';
      default: return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-GN').format(amount) + ' GNF';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getActiveRestaurantsCount(): number {
    return this.restaurants.filter(r => r.status === 'active').length;
  }

  /**
   * Affiche la modale avec les commandes du restaurant
   */
  async viewRestaurantOrders(restaurant: RestaurantAdmin) {
    const modal = await this.modalController.create({
      component: RestaurantOrdersModalComponent,
      componentProps: {
        restaurant: restaurant
      },
      cssClass: 'restaurant-orders-modal-class'
    });
    
    await modal.present();
  }

  /**
   * Bloque un restaurant
   */
  async blockRestaurant(restaurant: RestaurantAdmin) {
    const alert = await this.alertController.create({
      header: 'Bloquer le restaurant',
      message: `Bloquer "${restaurant.nom}" ? Le restaurant sera immédiatement déconnecté et ne pourra plus se connecter.`,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Raison du blocage (optionnel)',
          attributes: {
            maxlength: 500
          }
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Bloquer',
          role: 'confirm',
          cssClass: 'danger-button',
          handler: async (data) => {
            try {
              await this.restaurantService.blockRestaurant(restaurant.id, data.reason);
              await this.whatsappService.sendAccountBlockedMessage({
                restaurantName: restaurant.nom,
                ownerName: restaurant.owner,
                phone: restaurant.phone,
                reason: data.reason || 'Non spécifiée'
              });
              await this.showToast('Restaurant bloqué avec succès', 'success');
              await this.loadRestaurants();
            } catch (error) {
              await this.showToast('Erreur lors du blocage', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Débloque un restaurant
   */
  async unblockRestaurant(restaurant: RestaurantAdmin) {
    const alert = await this.alertController.create({
      header: 'Débloquer le restaurant',
      message: `Débloquer "${restaurant.nom}" ? Le restaurant pourra à nouveau se connecter.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Débloquer',
          role: 'confirm',
          handler: async () => {
            try {
              await this.restaurantService.unblockRestaurant(restaurant.id);
              await this.whatsappService.sendAccountUnblockedMessage({
                restaurantName: restaurant.nom,
                ownerName: restaurant.owner,
                phone: restaurant.phone
              });
              await this.showToast('Restaurant débloqué avec succès', 'success');
              await this.loadRestaurants();
            } catch (error) {
              await this.showToast('Erreur lors du déblocage', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  // Nouvelles méthodes pour la modernisation
  getPendingRestaurantsCount(): number {
    return this.restaurants.filter(r => r.status === 'pending').length;
  }

  getBlockedRestaurantsCount(): number {
    return this.restaurants.filter(r => r.isBlocked === true).length;
  }

  hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' || 
           this.statusFilter !== 'all';
  }

  clearSearch() {
    this.searchQuery = '';
    this.onSearchChange();
  }

  clearStatusFilter() {
    this.statusFilter = 'all';
    this.onStatusFilterChange();
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.currentPage = 1;
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      'var(--ion-color-primary)',
      'var(--ion-color-secondary)',
      'var(--ion-color-tertiary)',
      'var(--ion-color-success)',
      'var(--ion-color-warning)',
      'var(--ion-color-danger)',
      'var(--ion-color-dark)',
      'var(--ion-color-medium)'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 4.0) return '#8bc34a';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 3.0) return '#ff9800';
    return '#f44336';
  }

  formatShortCurrency(amount: number): string {
    if (!amount || isNaN(amount)) return '0';
    
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
  }

  getLastActivityText(lastActivity: string | Date): string {
    if (!lastActivity) return 'Jamais';
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  async showMoreActions(restaurant: RestaurantAdmin) {
    const actionSheet = await this.actionSheetController.create({
      header: restaurant.nom,
      cssClass: 'modern-action-sheet',
      buttons: [
        {
          text: 'Voir les commandes',
          icon: 'receipt',
          handler: () => {
            this.viewRestaurantOrders(restaurant);
          }
        },
        {
          text: 'Modifier',
          icon: 'create',
          handler: () => {
            this.editRestaurant(restaurant);
          }
        },
        {
          text: 'Réinitialiser mot de passe',
          icon: 'key',
          handler: () => {
            this.resetPassword(restaurant);
          }
        },
        {
          text: restaurant.status === 'active' ? 'Suspendre' : 'Activer',
          icon: restaurant.status === 'active' ? 'pause' : 'play',
          handler: () => {
            if (restaurant.status === 'active') {
              this.suspendRestaurant(restaurant);
            } else {
              this.activateRestaurant(restaurant);
            }
          }
        },
        {
          text: restaurant.isBlocked ? 'Débloquer' : 'Bloquer',
          icon: restaurant.isBlocked ? 'lock-open' : 'lock-closed',
          role: restaurant.isBlocked ? undefined : 'destructive',
          handler: () => {
            if (restaurant.isBlocked) {
              this.unblockRestaurant(restaurant);
            } else {
              this.blockRestaurant(restaurant);
            }
          }
        },
        {
          text: 'Supprimer',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.deleteRestaurant(restaurant);
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  async editRestaurant(restaurant: RestaurantAdmin) {
    // TODO: Implémenter la modal d'édition
    await this.showToast('Fonction d\'édition à venir', 'warning');
  }

  async openRestaurantSettings(restaurant: RestaurantAdmin) {
    // Naviguer vers la page de paramètres avec le restaurant sélectionné
    this.router.navigate(['/super-admin/restaurant-settings'], {
      state: { restaurant: restaurant }
    });
  }

  async addNewRestaurant() {
    const modal = await this.modalController.create({
      component: AddRestaurantModalComponent,
      cssClass: 'add-restaurant-modal-class',
      backdropDismiss: false
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    
    if (data?.success) {
      const restaurantName = data.restaurantName || 'Restaurant';
      await this.showToast(`${restaurantName} créé avec succès!`, 'success');
      await this.loadRestaurants();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(this.currentPage - 1);
        pages.push(this.currentPage);
        pages.push(this.currentPage + 1);
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Ouvre la configuration de paiement pour un restaurant
   */
  async openPaymentConfig(restaurant: RestaurantAdmin) {
    // Pour l'instant, on navigue vers une page dédiée
    // Plus tard on pourra faire une modale
    this.router.navigate(['/super-admin/payment-config'], {
      state: { restaurant: restaurant }
    });
  }
}