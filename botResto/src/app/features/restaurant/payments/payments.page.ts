import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantPaymentsService, Order } from '../../../core/services/restaurant-payments.service';
import { VersementOtpService } from '../../../core/services/versement-otp.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: false,
})
export class PaymentsPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  selectedFilter: string = 'all';
  isLoading = true;
  
  // OTP versement states
  showOtpInput: { [orderId: string]: boolean } = {};
  otpLoadingStates: { [orderId: string]: boolean } = {};
  otpAttempts: { [orderId: string]: number } = {};
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private paymentsService: RestaurantPaymentsService,
    private versementOtpService: VersementOtpService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user || user.type !== 'restaurant') {
      this.router.navigate(['/auth/login'], { queryParams: { userType: 'restaurant' } });
      return;
    }

    if (!user.restaurantId) {
      console.error('Restaurant ID not found');
      return;
    }

    // Subscribe to payments updates
    const paymentsSubscription = this.paymentsService.getPaymentOrders().subscribe(
      orders => {
        this.orders = orders;
        this.isLoading = false;
      }
    );
    this.subscriptions.push(paymentsSubscription);

    // Load initial data
    await this.paymentsService.loadRestaurantPayments(user.restaurantId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Filter orders by payment status
  getFilteredOrders(): Order[] {
    if (this.selectedFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.paiement_statut === this.selectedFilter);
  }

  // Get payment status color
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paye': return 'success';
      case 'en_attente': return 'warning';
      case 'echoue': return 'danger';
      case 'rembourse': return 'medium';
      default: return 'medium';
    }
  }

  // Get payment status text
  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'paye': return 'Payé';
      case 'en_attente': return 'En attente';
      case 'echoue': return 'Échec';
      case 'rembourse': return 'Remboursé';
      default: return status;
    }
  }

  // Get payment mode text
  getPaymentModeText(mode: string): string {
    switch (mode) {
      case 'fin_repas': return 'Fin de repas';
      case 'recuperation': return 'À la récupération';
      case 'livraison': return 'À la livraison';
      case 'maintenant': return 'Immédiat';
      default: return mode;
    }
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'en_attente': return 'warning';
      case 'confirmee': return 'primary';
      case 'preparation': return 'secondary';
      case 'prete': return 'success';
      case 'en_livraison': return 'tertiary';
      case 'livree': return 'success';
      case 'terminee': return 'success';
      case 'annulee': return 'danger';
      default: return 'medium';
    }
  }

  // Get status text
  getStatusText(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'preparation': return 'En préparation';
      case 'prete': return 'Prête';
      case 'en_livraison': return 'En livraison';
      case 'livree': return 'Livrée';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  }

  // Mark order as paid
  async markAsPaid(orderId: string) {
    const success = await this.paymentsService.markOrderAsPaid(orderId);
    if (!success) {
      console.error('Failed to mark order as paid');
      // TODO: Show error toast
    }
  }

  // Format price
  formatPrice(amount: number | string | null | undefined): string {
    // Convert to number and handle edge cases
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount == null) {
      console.warn('Invalid amount for formatting:', amount);
      return '0 GNF';
    }
    
    // Use simple formatting without currency symbol issues
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount) + ' GNF';
  }

  // Format time
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Format date and time
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get order count by status
  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.paiement_statut === status).length;
  }

  // Refresh payments
  async refreshPayments() {
    const user = this.authService.getCurrentUser();
    if (user?.restaurantId) {
      this.isLoading = true;
      await this.paymentsService.loadRestaurantPayments(user.restaurantId);
    }
  }

  // === OTP VERSEMENT METHODS ===
  
  // Show OTP input for versement confirmation
  async confirmVersement(orderId: string) {
    console.log('🔐 Demande confirmation versement:', orderId);
    
    this.otpLoadingStates[orderId] = true;
    
    const success = await this.versementOtpService.generateAndSendOTP(orderId);
    
    if (success) {
      this.showOtpInput[orderId] = true;
      this.otpAttempts[orderId] = 0;
      console.log('✅ OTP généré et envoyé au livreur');
    } else {
      console.error('❌ Erreur génération/envoi OTP');
      // TODO: Show error toast
    }
    
    this.otpLoadingStates[orderId] = false;
  }

  // Handle OTP validation
  async onOtpValidated(orderId: string, otpCode: string, otpComponent: any) {
    console.log('🔍 Validation OTP:', { orderId, otpCode });
    
    this.otpLoadingStates[orderId] = true;
    
    const isValid = await this.versementOtpService.validateOTP(orderId, otpCode);
    
    if (isValid) {
      console.log('✅ OTP validé, versement confirmé');
      this.showOtpInput[orderId] = false;
      this.otpAttempts[orderId] = 0;
      
      // Refresh data to show updated status
      await this.refreshPayments();
    } else {
      console.log('❌ OTP invalide');
      this.otpAttempts[orderId] = (this.otpAttempts[orderId] || 0) + 1;
      
      // Notify the OTP component of the validation failure
      otpComponent.handleValidationResult(false);
      
      // If max attempts reached, hide OTP input
      if (this.otpAttempts[orderId] >= 3) {
        this.showOtpInput[orderId] = false;
      }
    }
    
    this.otpLoadingStates[orderId] = false;
  }

  // Handle OTP regeneration
  async onRegenerateOtp(orderId: string) {
    console.log('🔄 Régénération OTP:', orderId);
    
    this.otpLoadingStates[orderId] = true;
    
    const success = await this.versementOtpService.regenerateOTP(orderId);
    
    if (success) {
      console.log('✅ Nouveau OTP généré et envoyé');
      this.otpAttempts[orderId] = 0;
    } else {
      console.error('❌ Erreur régénération OTP');
    }
    
    this.otpLoadingStates[orderId] = false;
  }

  // Cancel OTP input
  cancelOtpInput(orderId: string) {
    this.showOtpInput[orderId] = false;
    this.otpAttempts[orderId] = 0;
  }

  // Get driver phone for OTP display
  getDriverPhone(order: Order): string {
    return order.livreur_phone || 'N/A';
  }
}