import { Injectable } from '@angular/core';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { WhatsAppNotificationFranceService } from './whatsapp-notification-france.service';
import { FranceDriver } from './drivers-france.service';
import { FranceOrder } from './france-orders.service';

export interface DeliveryAssignment {
  id: number;
  order_id: number;
  driver_id: number;
  assignment_status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  responded_at?: string;
  expires_at: string;
  response_time_seconds?: number;
}

export interface AssignmentDetails extends DeliveryAssignment {
  order_number: string;
  restaurant_name: string;
  delivery_address: string;
  total_amount: number;
  driver_name: string;
  driver_phone: string;
  phone_number: string; // Client phone
  notes?: string; // Order notes
  created_at: string; // Order creation time
}

export interface AvailableDriver extends FranceDriver {
  current_latitude?: number;
  current_longitude?: number;
  is_online: boolean;
  last_location_update?: string;
  distance_km?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryAssignmentService {

  private assignmentsSubject = new BehaviorSubject<AssignmentDetails[]>([]);
  public assignments$ = this.assignmentsSubject.asObservable();

  private cleanupSubscription?: Subscription;

  // Configuration de l'assignation
  private readonly ASSIGNMENT_TIMEOUT_MINUTES = 3;
  private readonly MAX_SEARCH_DISTANCE_KM = 10;
  private readonly CLEANUP_INTERVAL_MINUTES = 2;

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private whatsAppFranceService: WhatsAppNotificationFranceService,
    private fuseauHoraireService: FuseauHoraireService
  ) {
    this.startPeriodicCleanup();
  }

  /**
   * Démarrer l'assignation automatique d'une commande
   */
  async startOrderAssignment(orderId: number): Promise<boolean> {
    try {
      console.log(`🚀 [DeliveryAssignment] Début assignation commande ${orderId}`);

      // 1. Vérifier que la commande est éligible
      const order = await this.getOrderForAssignment(orderId);
      if (!order) {
        console.error(`❌ [DeliveryAssignment] Commande ${orderId} non éligible ou introuvable`);
        return false;
      }

      // 2. Vérifier si la commande est déjà assignée
      const existingAssignment = await this.getAcceptedAssignment(orderId);
      if (existingAssignment) {
        console.log(`⚠️ [DeliveryAssignment] Commande ${orderId} déjà assignée au livreur ${existingAssignment.driver_id}`);
        return false;
      }

      // 3. Marquer la commande comme recherche en cours
      const updated = await this.updateOrderAssignmentStatus(orderId, 'searching');
      if (!updated) {
        console.error(`❌ [DeliveryAssignment] Impossible de marquer commande ${orderId} comme recherche`);
        return false;
      }

      // 3. Trouver les livreurs disponibles
      const availableDrivers = await this.findAvailableDrivers(order.restaurant_id);
      if (availableDrivers.length === 0) {
        console.warn(`⚠️ [DeliveryAssignment] Aucun livreur disponible pour commande ${orderId}`);
        await this.handleNoDriversAvailable(orderId);
        return false;
      }

      // 4. Créer les assignations pour tous les livreurs disponibles
      const assignmentResults = await Promise.all(
        availableDrivers.map(driver => this.createAssignmentForDriver(orderId, driver.id))
      );

      const successfulAssignments = assignmentResults.filter(result => result);
      if (successfulAssignments.length === 0) {
        console.error(`❌ [DeliveryAssignment] Aucune assignation créée pour commande ${orderId}`);
        await this.handleNoDriversAvailable(orderId);
        return false;
      }

      // 5. Envoyer les notifications à tous les livreurs
      await this.sendAssignmentNotifications(orderId, availableDrivers);

      console.log(`✅ [DeliveryAssignment] Assignation démarrée pour commande ${orderId} - ${successfulAssignments.length} livreurs notifiés`);
      return true;

    } catch (error) {
      console.error(`❌ [DeliveryAssignment] Erreur assignation commande ${orderId}:`, error);
      return false;
    }
  }

  /**
   * Accepter une assignation par un livreur
   */
  async acceptAssignment(assignmentId: number, driverId: number): Promise<boolean | {success: false, message: string, alreadyTaken: boolean}> {
    try {
      console.log(`✅ [DeliveryAssignment] Livreur ${driverId} accepte assignation ${assignmentId}`);

      // 1. Vérifier que l'assignation est encore valide
      const assignment = await this.getAssignmentById(assignmentId);
      if (!assignment || assignment.assignment_status !== 'pending') {
        console.warn(`⚠️ [DeliveryAssignment] Assignation ${assignmentId} non valide`);
        return false;
      }

      // 2. Vérifier si la commande n'a pas déjà été acceptée par un autre livreur
      const existingAssignment = await this.getAcceptedAssignment(assignment.order_id);
      if (existingAssignment) {
        const driverName = existingAssignment.driver_name || 'un autre livreur';
        console.log(`⚠️ [DeliveryAssignment] Commande ${assignment.order_id} déjà prise par ${driverName}`);
        // Marquer cette assignation comme rejetée puisque déjà prise
        await this.markAssignmentAsRejected(assignmentId);
        
        // Retourner un objet avec info pour affichage dans l'app
        return { 
          success: false, 
          message: `Désolé, cette livraison a déjà été prise par ${driverName}`,
          alreadyTaken: true 
        } as any;
      }

      // 2. Calculer le temps de réponse
      const responseTimeSeconds = Math.floor((Date.now() - new Date(assignment.created_at).getTime()) / 1000);

      // 3. Marquer cette assignation comme acceptée
      const { error: updateError } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .update({
          assignment_status: 'accepted',
          responded_at: new Date().toISOString(),
          response_time_seconds: responseTimeSeconds
        })
        .eq('id', assignmentId)
        .eq('assignment_status', 'pending'); // Double vérification

      if (updateError) {
        console.error('❌ [DeliveryAssignment] Erreur acceptation assignation:', updateError);
        return false;
      }

      // 4. Rejeter toutes les autres assignations pour cette commande
      await this.rejectOtherAssignments(assignment.order_id, assignmentId);

      // 5. Assigner le livreur à la commande
      const orderUpdated = await this.assignDriverToOrder(assignment.order_id, driverId);
      if (!orderUpdated) {
        console.error(`❌ [DeliveryAssignment] Impossible d'assigner livreur à la commande ${assignment.order_id}`);
        return false;
      }

      // 6. Envoyer notifications de confirmation
      await this.sendAcceptanceNotifications(assignment.order_id, driverId);

      console.log(`✅ [DeliveryAssignment] Assignation acceptée avec succès - Commande ${assignment.order_id} → Livreur ${driverId}`);
      return true;

    } catch (error) {
      console.error(`❌ [DeliveryAssignment] Erreur acceptation assignation:`, error);
      return false;
    }
  }

  /**
   * Rejeter une assignation par un livreur
   */
  async rejectAssignment(assignmentId: number, driverId: number): Promise<boolean> {
    try {
      console.log(`❌ [DeliveryAssignment] Livreur ${driverId} rejette assignation ${assignmentId}`);

      // 1. Calculer le temps de réponse
      const assignment = await this.getAssignmentById(assignmentId);
      if (!assignment) return false;

      const responseTimeSeconds = Math.floor((Date.now() - new Date(assignment.created_at).getTime()) / 1000);

      // 2. Marquer l'assignation comme rejetée
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .update({
          assignment_status: 'rejected',
          responded_at: new Date().toISOString(),
          response_time_seconds: responseTimeSeconds
        })
        .eq('id', assignmentId)
        .eq('driver_id', driverId)
        .eq('assignment_status', 'pending');

      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur rejet assignation:', error);
        return false;
      }

      console.log(`✅ [DeliveryAssignment] Assignation rejetée par livreur ${driverId}`);
      return true;

    } catch (error) {
      console.error(`❌ [DeliveryAssignment] Erreur rejet assignation:`, error);
      return false;
    }
  }

  /**
   * Obtenir les assignations actives pour un livreur
   */
  async getDriverActiveAssignments(driverId: number): Promise<AssignmentDetails[]> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_active_assignments')
        .select('*')
        .eq('driver_id', driverId)
        .eq('assignment_status', 'pending');

      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur récupération assignations actives:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur service assignations actives:', error);
      return [];
    }
  }

  /**
   * Obtenir le statut d'assignation d'une commande
   */
  async getOrderAssignmentStatus(orderId: number): Promise<string> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('driver_assignment_status, assigned_driver_id')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        return 'none';
      }

      return data.driver_assignment_status || 'none';
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur récupération statut assignation:', error);
      return 'none';
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  /**
   * Marquer une assignation comme rejetée (quand déjà prise par un autre)
   */
  private async markAssignmentAsRejected(assignmentId: number): Promise<void> {
    try {
      await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .update({
          assignment_status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', assignmentId);
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur marquage rejet:', error);
    }
  }

  /**
   * Vérifier si une commande a déjà une assignation acceptée
   */
  private async getAcceptedAssignment(orderId: number): Promise<any | null> {
    try {
      // SIMPLIFIÉ : Pas de jointure pour éviter erreur 406
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .select('*')
        .eq('order_id', orderId)
        .eq('assignment_status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found (OK)
        console.error('❌ [DeliveryAssignment] Erreur vérification assignation acceptée:', error);
        return null;
      }

      // Si assignation trouvée, récupérer le nom du livreur séparément
      if (data) {
        const { data: driver } = await this.supabaseFranceService.client
          .from('france_delivery_drivers')
          .select('first_name, last_name')
          .eq('id', data.driver_id)
          .single();
        
        if (driver) {
          data.driver_name = `${driver.first_name} ${driver.last_name}`;
        }
      }

      return data;
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur service vérification assignation:', error);
      return null;
    }
  }

  /**
   * Récupérer une commande éligible pour l'assignation
   */
  private async getOrderForAssignment(orderId: number): Promise<FranceOrder | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('*')
        .eq('id', orderId)
        .in('status', ['preparation', 'prete']) // MODIFIÉ : Accepter aussi 'preparation' pour vérification AVANT
        .eq('delivery_mode', 'livraison')
        .is('driver_id', null) // CORRIGÉ : driver_id au lieu de assigned_driver_id
        .single();

      if (error || !data) {
        return null;
      }

      return data as FranceOrder;
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur récupération commande:', error);
      return null;
    }
  }

  /**
   * Trouver les livreurs disponibles pour une commande
   */
  private async findAvailableDrivers(restaurantId: number): Promise<AvailableDriver[]> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_available_drivers')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur recherche livreurs disponibles:', error);
        return [];
      }

      console.log(`🔍 [DeliveryAssignment] ${(data || []).length} livreurs disponibles trouvés`);
      return (data || []) as AvailableDriver[];
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur service livreurs disponibles:', error);
      return [];
    }
  }

  /**
   * Créer une assignation pour un livreur
   */
  private async createAssignmentForDriver(orderId: number, driverId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .insert({
          order_id: orderId,
          driver_id: driverId,
          assignment_status: 'pending'
          // Plus d'expires_at - simplicité !
        });

      if (error) {
        console.error(`❌ [DeliveryAssignment] Erreur création assignation pour livreur ${driverId}:`);
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur service création assignation:', error);
      return false;
    }
  }

  /**
   * Envoyer les notifications d'assignation aux livreurs
   */
  private async sendAssignmentNotifications(orderId: number, drivers: AvailableDriver[]): Promise<void> {
    try {
      // Récupérer les détails de la commande
      const { data: orderData, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner (name, phone)
        `)
        .eq('id', orderId)
        .single();

      if (error || !orderData) {
        console.error(`❌ [DeliveryAssignment] Impossible de récupérer données commande ${orderId}`);
        return;
      }

      // Envoyer notification à chaque livreur
      const notificationPromises = drivers.map(async (driver) => {
        try {
          const message = this.formatAssignmentMessage(orderData, driver);
          // Ici on utiliserait le service de notification WhatsApp
          console.log(`📱 [DeliveryAssignment] Notification envoyée au livreur ${driver.id}: ${message}`);
          return true;
        } catch (error) {
          console.error(`❌ [DeliveryAssignment] Erreur notification livreur ${driver.id}:`, error);
          return false;
        }
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur envoi notifications:', error);
    }
  }

  /**
   * Formater le message d'assignation pour les livreurs
   */
  private formatAssignmentMessage(orderData: any, driver: AvailableDriver): string {
    return `
🚚 **NOUVELLE LIVRAISON DISPONIBLE**

📋 **Commande:** ${orderData.order_number}
🏪 **Restaurant:** ${orderData.france_restaurants?.name}
💰 **Montant:** ${orderData.total_amount}€
📍 **Adresse:** ${orderData.delivery_address}

⏰ **Vous avez ${this.ASSIGNMENT_TIMEOUT_MINUTES} minutes pour répondre**

Répondez:
✅ **OUI** pour accepter
❌ **NON** pour refuser
    `.trim();
  }

  /**
   * Mettre à jour le statut d'assignation d'une commande
   */
  private async updateOrderAssignmentStatus(orderId: number, status: string): Promise<boolean> {
    try {
      const updateData: any = {
        driver_assignment_status: status,
        updated_at: await this.fuseauHoraireService.getCurrentDatabaseTimeForRestaurant()
      };

      if (status === 'searching') {
        const timeoutAt = new Date();
        timeoutAt.setMinutes(timeoutAt.getMinutes() + this.ASSIGNMENT_TIMEOUT_MINUTES + 1);
        updateData.assignment_timeout_at = timeoutAt.toISOString();
      }

      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update(updateData)
        .eq('id', orderId);

      return !error;
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur mise à jour statut commande:', error);
      return false;
    }
  }

  /**
   * Récupérer une assignation par ID
   */
  private async getAssignmentById(assignmentId: number): Promise<DeliveryAssignment | null> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (error || !data) return null;
      return data as DeliveryAssignment;
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur récupération assignation:', error);
      return null;
    }
  }

  /**
   * Rejeter toutes les autres assignations pour une commande
   */
  private async rejectOtherAssignments(orderId: number, acceptedAssignmentId: number): Promise<void> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .update({
          assignment_status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('assignment_status', 'pending')
        .neq('id', acceptedAssignmentId);

      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur rejet autres assignations:', error);
      }
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur service rejet assignations:', error);
    }
  }

  /**
   * Assigner un livreur à une commande
   */
  private async assignDriverToOrder(orderId: number, driverId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update({
          assigned_driver_id: driverId,
          driver_assignment_status: 'assigned',
          delivery_started_at: this.fuseauHoraireService.getCurrentTimeForDatabase(),
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
        })
        .eq('id', orderId);

      return !error;
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur assignation livreur commande:', error);
      return false;
    }
  }

  /**
   * Envoyer notifications d'acceptation
   */
  private async sendAcceptanceNotifications(orderId: number, driverId: number): Promise<void> {
    try {
      // Récupérer les données complètes
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner (name, phone),
          france_delivery_drivers!inner (first_name, last_name, phone_number)
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        console.error('❌ [DeliveryAssignment] Erreur récupération données acceptation');
        return;
      }

      // Notification au client
      const customerMessage = `
✅ **LIVREUR ASSIGNÉ**

Votre commande ${data.order_number} a été prise en charge par ${data.france_delivery_drivers.first_name}.

📱 **Contact livreur:** ${data.france_delivery_drivers.phone_number}
⏱️ **Livraison estimée:** 30-45 min

Merci pour votre patience !
      `.trim();

      console.log(`📱 [DeliveryAssignment] Notification client: ${customerMessage}`);

      // Notification au restaurant
      const restaurantMessage = `
✅ **LIVREUR ASSIGNÉ**

Commande ${data.order_number} prise en charge par ${data.france_delivery_drivers.first_name} ${data.france_delivery_drivers.last_name}

La commande peut être marquée "En livraison" quand le livreur arrive.
      `.trim();

      console.log(`📱 [DeliveryAssignment] Notification restaurant: ${restaurantMessage}`);

    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur notifications acceptation:', error);
    }
  }

  /**
   * Gérer le cas où aucun livreur n'est disponible
   */
  private async handleNoDriversAvailable(orderId: number): Promise<void> {
    try {
      // Remettre le statut à "none"
      await this.updateOrderAssignmentStatus(orderId, 'none');

      // Notification au restaurant
      console.log(`⚠️ [DeliveryAssignment] Aucun livreur disponible pour commande ${orderId}`);
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur gestion pas de livreurs:', error);
    }
  }

  /**
   * Nettoyage périodique des assignations expirées
   */
  private startPeriodicCleanup(): void {
    this.cleanupSubscription = timer(0, this.CLEANUP_INTERVAL_MINUTES * 60 * 1000).subscribe(() => {
      this.cleanupExpiredAssignments();
    });
  }

  /**
   * Nettoyer les assignations expirées
   */
  private async cleanupExpiredAssignments(): Promise<void> {
    try {
      // Utiliser la fonction SQL de nettoyage
      const { data, error } = await this.supabaseFranceService.client
        .rpc('cleanup_expired_assignments');

      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur nettoyage assignations expirées:', error);
        return;
      }

      if (data && data > 0) {
        console.log(`🧹 [DeliveryAssignment] ${data} assignations expirées nettoyées`);
      }
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur service nettoyage:', error);
    }
  }

  /**
   * Vérifier s'il existe une assignation pending pour une commande
   */
  async checkPendingAssignment(orderId: number): Promise<{
    hasPending: boolean;
    pendingDrivers: any[];
    isExpired: boolean;
  }> {
    try {
      console.log(`🔍 [DeliveryAssignment] Vérification assignations pending pour commande ${orderId}`);
      
      // Vérifier les assignations pending non expirées (30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .select(`
          *,
          france_delivery_drivers (
            id,
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq('order_id', orderId)
        .eq('assignment_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur vérification assignations pending:', error);
        return {
          hasPending: false,
          pendingDrivers: [],
          isExpired: false
        };
      }
      
      if (!data || data.length === 0) {
        console.log(`ℹ️ [DeliveryAssignment] Aucune assignation pending pour commande ${orderId}`);
        return {
          hasPending: false,
          pendingDrivers: [],
          isExpired: false
        };
      }
      
      // Vérifier si les assignations sont expirées
      const nonExpiredAssignments = data.filter(assignment => 
        new Date(assignment.created_at) > new Date(thirtyMinutesAgo)
      );
      
      const isExpired = nonExpiredAssignments.length === 0;
      
      console.log(`✅ [DeliveryAssignment] ${data.length} assignation(s) pending trouvée(s), ${nonExpiredAssignments.length} non expirée(s)`);
      
      return {
        hasPending: nonExpiredAssignments.length > 0,
        pendingDrivers: nonExpiredAssignments,
        isExpired: isExpired
      };
      
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur checkPendingAssignment:', error);
      return {
        hasPending: false,
        pendingDrivers: [],
        isExpired: false
      };
    }
  }

  /**
   * Nettoyer les assignations pending expirées
   */
  async cleanExpiredAssignments(): Promise<number> {
    try {
      console.log('🧹 [DeliveryAssignment] Nettoyage des assignations expirées...');
      
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      // Mettre à jour les assignations pending expirées
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .update({ 
          assignment_status: 'expired'
        })
        .eq('assignment_status', 'pending')
        .lt('created_at', thirtyMinutesAgo)
        .select();
      
      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur nettoyage assignations:', error);
        return 0;
      }
      
      const cleanedCount = data?.length || 0;
      console.log(`✅ [DeliveryAssignment] ${cleanedCount} assignation(s) expirée(s) nettoyée(s)`);
      
      return cleanedCount;
      
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur cleanExpiredAssignments:', error);
      return 0;
    }
  }

  /**
   * Vérifier s'il existe n'importe quelle assignation pending pour une commande (même expirée)
   * Utilisé pour déterminer si on doit afficher "Rappel" au lieu de "Renvoyer notification"
   */
  async checkAnyPendingAssignment(orderId: number): Promise<{ hasAny: boolean }> {
    try {
      console.log(`🔍 [DeliveryAssignment] Vérification ANY assignation pending pour commande ${orderId}`);
      
      const { data, error } = await this.supabaseFranceService.client
        .from('france_delivery_assignments')
        .select('id')
        .eq('order_id', orderId)
        .in('assignment_status', ['pending', 'expired'])
        .limit(1);
      
      if (error) {
        console.error('❌ [DeliveryAssignment] Erreur vérification ANY assignation pending:', error);
        return { hasAny: false };
      }
      
      const hasAny = (data && data.length > 0);
      console.log(`📊 [DeliveryAssignment] Commande ${orderId} - ANY assignation pending: ${hasAny}`);
      
      return { hasAny };
      
    } catch (error) {
      console.error('❌ [DeliveryAssignment] Erreur checkAnyPendingAssignment:', error);
      return { hasAny: false };
    }
  }

  /**
   * Arrêter le service et nettoyer les ressources
   */
  ngOnDestroy(): void {
    if (this.cleanupSubscription) {
      this.cleanupSubscription.unsubscribe();
    }
  }
}