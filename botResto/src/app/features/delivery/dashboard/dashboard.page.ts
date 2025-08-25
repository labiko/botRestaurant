import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { DeliveryService, DeliveryStats, DeliveryOrder } from '../../../core/services/delivery.service';
import { OtpValidationModalComponent } from '../components/otp-validation-modal/otp-validation-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  @ViewChild(OtpValidationModalComponent) otpModal?: OtpValidationModalComponent;
  
  stats: DeliveryStats | null = null;
  allOrders: DeliveryOrder[] = [];
  currentOrders: DeliveryOrder[] = [];
  selectedTab: string = 'active';
  isOnline = true;
  
  // OTP Modal properties
  showOtpModal = false;
  currentOrderIdForOtp: number | null = null;
  currentOrderNumberForOtp = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private deliveryService: DeliveryService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.type !== 'delivery') {
      this.router.navigate(['/login'], { queryParams: { userType: 'delivery' } });
      return;
    }

    await this.loadDashboardData();
    this.subscribeToUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadDashboardData() {
    try {
      const user = this.authService.getCurrentUser();
      console.log('👤 Current user for dashboard:', user);
      
      if (user && user.deliveryPhone) {
        console.log(`📞 Loading data for delivery phone: ${user.deliveryPhone}`);
        await this.deliveryService.loadDeliveryStats(user.deliveryPhone);
        await this.deliveryService.loadDeliveryOrders(user.deliveryPhone);
      } else {
        console.error('❌ No delivery user info found:', { user });
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  }

  private subscribeToUpdates() {
    this.subscriptions.push(
      this.deliveryService.stats$.subscribe(stats => {
        this.stats = stats;
      })
    );

    this.subscriptions.push(
      this.deliveryService.orders$.subscribe(orders => {
        console.log('📦 Dashboard received orders:', orders);
        
        this.allOrders = orders;
        this.filterOrdersByTab();
        
        console.log(`📋 Dashboard filtered orders (${this.currentOrders.length}):`, this.currentOrders);
      })
    );
  }

  onTabChange() {
    this.filterOrdersByTab();
  }

  private filterOrdersByTab() {
    if (this.selectedTab === 'active') {
      // Commandes en cours : assigned, picked_up, in_transit
      this.currentOrders = this.allOrders.filter(order => 
        order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit'
      );
    } else if (this.selectedTab === 'history') {
      // Historique : commandes livrées
      this.currentOrders = this.allOrders.filter(order => order.status === 'delivered');
    }
  }

  toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
  }

  goToOrders() {
    this.router.navigate(['/delivery/orders']);
  }

  async acceptOrder(orderId: number) {
    try {
      console.log(`✅ Accepting order ${orderId}`);
      await this.deliveryService.acceptOrder(orderId);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  }

  async updateOrderStatus(orderId: number, status: DeliveryOrder['status']) {
    try {
      // For delivered status, open OTP modal instead
      if (status === 'delivered') {
        this.openOtpModal(orderId);
        return;
      }
      
      // For other statuses, update directly
      await this.deliveryService.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  openOtpModal(orderId: number) {
    const order = this.allOrders.find(o => o.id === orderId);
    if (!order) {
      console.error('Order not found for OTP validation');
      return;
    }
    
    this.currentOrderIdForOtp = orderId;
    this.currentOrderNumberForOtp = order.orderNumber;
    this.showOtpModal = true;
  }

  async onOtpValidate(otp: string) {
    if (!this.currentOrderIdForOtp) {
      console.error('No order ID for OTP validation');
      return;
    }

    const success = await this.deliveryService.validateDeliveryOTP(this.currentOrderIdForOtp, otp);
    
    if (success) {
      // Success feedback
      this.showOtpModal = false;
      this.currentOrderIdForOtp = null;
      this.currentOrderNumberForOtp = '';
      
      const toast = await this.toastController.create({
        message: '✅ Livraison confirmée avec succès !',
        duration: 3000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
      
      // Reload orders to reflect changes
      await this.loadDashboardData();
    } else {
      // Error feedback - handled by modal component
      if (this.otpModal) {
        this.otpModal.handleValidationResult(false);
      }
      
      const toast = await this.toastController.create({
        message: '❌ Code incorrect. Veuillez réessayer.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }

  onOtpCancel() {
    this.showOtpModal = false;
    this.currentOrderIdForOtp = null;
    this.currentOrderNumberForOtp = '';
  }

  async startNavigation(latitude: number | null, longitude: number | null) {
    await this.deliveryService.startNavigation(latitude, longitude);
  }

  viewClientInfo(clientId: string) {
    console.log(`Voir informations client: ${clientId}`);
    // TODO: Implémenter la vue détaillée du client
  }

  async callCustomer(phone: string) {
    await this.deliveryService.callCustomer(phone);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0
    }).format(amount) + ' GNF';
  }

  getPaymentStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en_attente': 'En attente',
      'paye': 'Payé',
      'echoue': 'Échec',
      'rembourse': 'Remboursé'
    };
    return statusMap[status] || status;
  }

  getPaymentMethodLabel(method: string): string {
    const methodMap: { [key: string]: string } = {
      'orange_money': 'Orange Money',
      'wave': 'Wave',
      'cash': 'Espèces',
      'carte': 'Carte bancaire'
    };
    return methodMap[method] || method;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
