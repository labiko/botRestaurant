import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryTrackingService, DeliveryTrackingData, OrderTrackingStats } from '../../../../core/services/delivery-tracking.service';

@Component({
  selector: 'app-delivery-tracking',
  templateUrl: './delivery-tracking.page.html',
  styleUrls: ['./delivery-tracking.page.scss'],
  standalone: false
})
export class DeliveryTrackingPage implements OnInit, OnDestroy {
  currentUser: FranceUser | null = null;
  trackingData: DeliveryTrackingData = {
    activeOrders: [],
    totalActiveOrders: 0,
    totalPendingNotifications: 0,
    averageResponseTime: 0
  };
  
  isLoading = false;
  isRefreshing = false;
  
  // Auto-refresh supprimé - refresh manuel uniquement
  private userSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryTrackingService: DeliveryTrackingService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // S'abonner aux changements d'utilisateur pour gérer l'authentification asynchrone
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentUser = user;
        if (user && user.type === 'restaurant') {
          console.log('✅ [DeliveryTracking] Utilisateur restaurant authentifié');
          this.loadTrackingData();
        } else if (!user) {
          console.log('❌ [DeliveryTracking] Utilisateur non connecté');
        } else {
          console.log('⚠️ [DeliveryTracking] Utilisateur non-restaurant détecté');
        }
      }
    });

    // Green API déjà configuré automatiquement
    // Auto-refresh supprimé - refresh manuel uniquement via l'icône
  }

  ngOnDestroy() {
    // Nettoyer la subscription utilisateur
    this.userSubscription?.unsubscribe();
  }

  /**
   * Charger les données de suivi
   */
  async loadTrackingData() {
    if (!this.currentUser) return;

    this.isLoading = true;

    try {
      this.trackingData = await this.deliveryTrackingService.getDeliveryTrackingData(
        this.currentUser.restaurantId
      );
      
      console.log(`📊 [DeliveryTracking] Données chargées: ${this.trackingData.activeOrders.length} commandes`);
      
    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur chargement données:', error);
      await this.showToast('Erreur lors du chargement des données', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Refresh manuel (pull-to-refresh)
   */
  async handleRefresh(event: RefresherCustomEvent) {
    this.isRefreshing = true;
    
    try {
      await this.loadTrackingData();
    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur refresh:', error);
    } finally {
      this.isRefreshing = false;
      event.target.complete();
    }
  }

  // Méthodes d'auto-refresh supprimées - refresh manuel uniquement via l'icône

  /**
   * Forcer la libération d'une commande
   */
  async forceReleaseOrder(order: OrderTrackingStats) {
    const alert = await this.alertController.create({
      header: '🚨 Force Release',
      message: `Êtes-vous sûr de vouloir libérer la commande #${order.orderNumber} ?<br><br>⚠️ Cette action va :<br>• Remettre la commande en recherche<br>• Notifier tous les livreurs disponibles`,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Raison de la libération (optionnel)',
          value: 'Livreur indisponible - Recherche nouveau livreur'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Libérer',
          handler: async (data) => {
            await this.performForceRelease(order.orderId, data.reason);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Exécuter la libération forcée
   */
  private async performForceRelease(orderId: number, reason: string) {
    if (!this.currentUser) return;

    try {
      const result = await this.deliveryTrackingService.forceReleaseOrder(
        orderId,
        this.currentUser.restaurantId,
        reason || 'Libération forcée par le restaurant'
      );

      if (result.success) {
        await this.showToast(result.message, 'success');
        await this.loadTrackingData(); // Recharger les données
      } else {
        await this.showToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur force release:', error);
      await this.showToast('Erreur lors de la libération', 'danger');
    }
  }

  /**
   * Envoyer des rappels pour une commande
   */
  async sendReminders(order: OrderTrackingStats) {
    console.log('🔔 [DeliveryTracking] Click sendReminders pour commande:', order);
    
    const alert = await this.alertController.create({
      header: '🔔 Envoi de rappels',
      message: `Envoyer des rappels WhatsApp pour la commande #${order.orderNumber} ?\n\n📱 Les livreurs déjà notifiés recevront un nouveau message de rappel.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('❌ [DeliveryTracking] Rappels annulés');
          }
        },
        {
          text: 'Envoyer',
          handler: () => {
            console.log('✅ [DeliveryTracking] Confirmation envoi rappels');
            // Fermer immédiatement l'alert et traiter en arrière-plan
            this.performSendRemindersAsync(order.orderId);
            return true; // Ferme l'alert immédiatement
          }
        }
      ]
    });

    await alert.present();
    console.log('📱 [DeliveryTracking] Alert de rappels affiché');
  }

  /**
   * Exécuter l'envoi des rappels de manière asynchrone (non-bloquant)
   */
  private async performSendRemindersAsync(orderId: number) {
    try {
      // Afficher immédiatement un toast de traitement en cours
      await this.showToast('📤 Envoi des rappels en cours...', 'warning');
      
      console.log('🚀 [DeliveryTracking] Début envoi rappels pour commande:', orderId);
      
      const result = await this.deliveryTrackingService.sendReminderNotifications(orderId);
      
      console.log('📋 [DeliveryTracking] Résultat envoi rappels:', result);

      if (result.success) {
        console.log('✅ [DeliveryTracking] Rappels envoyés avec succès');
        await this.showToast(result.message, 'success');
        await this.loadTrackingData(); // Recharger les données
      } else {
        console.log('❌ [DeliveryTracking] Échec envoi rappels:', result.message);
        await this.showToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur envoi rappels:', error);
      await this.showToast('Erreur lors de l\'envoi des rappels', 'danger');
    }
  }

  /**
   * Exécuter l'envoi des rappels (version synchrone - conservée pour compatibilité)
   */
  private async performSendReminders(orderId: number) {
    try {
      console.log('🚀 [DeliveryTracking] Début envoi rappels pour commande:', orderId);
      
      const result = await this.deliveryTrackingService.sendReminderNotifications(orderId);
      
      console.log('📋 [DeliveryTracking] Résultat envoi rappels:', result);

      if (result.success) {
        console.log('✅ [DeliveryTracking] Rappels envoyés avec succès');
        await this.showToast(result.message, 'success');
        await this.loadTrackingData(); // Recharger les données
      } else {
        console.log('❌ [DeliveryTracking] Échec envoi rappels:', result.message);
        await this.showToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur envoi rappels:', error);
      await this.showToast('Erreur lors de l\'envoi des rappels', 'danger');
    }
  }

  /**
   * Marquer une commande comme prête
   */
  async markOrderReady(order: OrderTrackingStats) {
    if (!this.currentUser) return;

    const alert = await this.alertController.create({
      header: '✅ Marquer comme prête',
      message: `Marquer la commande #${order.orderNumber} comme prête ?<br><br>📱 Tous les livreurs disponibles seront automatiquement notifiés par WhatsApp.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Marquer prête',
          handler: async () => {
            await this.performMarkReady(order.orderId);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Exécuter le marquage comme prête
   */
  private async performMarkReady(orderId: number) {
    if (!this.currentUser) return;

    try {
      const result = await this.deliveryTrackingService.markOrderReady(
        orderId,
        this.currentUser.restaurantId
      );

      if (result.success) {
        await this.showToast(result.message, 'success');
        await this.loadTrackingData(); // Recharger les données
      } else {
        await this.showToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ [DeliveryTracking] Erreur marquage prête:', error);
      await this.showToast('Erreur lors du marquage comme prête', 'danger');
    }
  }

  // Configuration Green API supprimée - déjà gérée automatiquement

  /**
   * Obtenir l'icône de statut pour une commande
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'prete': return 'checkmark-circle';
      case 'assignee': return 'person-circle';
      default: return 'help-circle';
    }
  }

  /**
   * Obtenir la couleur de statut pour une commande
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'prete': return 'warning';
      case 'assignee': return 'primary';
      default: return 'medium';
    }
  }

  /**
   * Calculer le temps relatif depuis une date (délégué au service)
   */
  getTimeAgo(timestamp: string | Date): string {
    return this.deliveryTrackingService.getTimeAgo(timestamp);
  }

  /**
   * Formater une date en heure 24H (délégué au service)
   */
  formatTime24H(timestamp: string | Date): string {
    return this.deliveryTrackingService.formatTime24H(timestamp);
  }

  /**
   * Obtenir le texte de statut pour une commande
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'prete': return 'Prête';
      case 'assignee': return 'Assignée';
      default: return 'Inconnue';
    }
  }

  /**
   * Afficher un toast
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}