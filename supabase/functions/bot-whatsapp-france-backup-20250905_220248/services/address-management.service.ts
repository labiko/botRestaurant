/**
 * Service de gestion des adresses clients pour le système de livraison
 * Gère l'historique, la sélection et la sauvegarde des adresses de livraison
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { 
  CustomerAddress, 
  CreateCustomerAddressRequest,
  AddressSelectionMessage,
  GooglePlaceResult
} from '../types/address.types.ts';

export class AddressManagementService {
  private supabase: SupabaseClient;
  private maxAddressesPerCustomer: number;

  constructor(supabase: SupabaseClient, maxAddressesPerCustomer = 5) {
    this.supabase = supabase;
    this.maxAddressesPerCustomer = maxAddressesPerCustomer;
  }

  /**
   * Récupérer toutes les adresses d'un client
   * @param phoneNumber Numéro WhatsApp du client
   * @returns Liste des adresses, triées par défaut puis par date
   */
  async getCustomerAddresses(phoneNumber: string): Promise<CustomerAddress[]> {
    try {
      console.log(`📋 [AddressService] Récupération adresses pour: ${phoneNumber}`);
      
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [AddressService] Erreur récupération adresses:', error);
        return [];
      }

      console.log(`✅ [AddressService] ${data?.length || 0} adresses trouvées`);
      return data || [];
    } catch (error) {
      console.error('❌ [AddressService] Erreur récupération adresses:', error);
      return [];
    }
  }

  /**
   * Sauvegarder une nouvelle adresse client
   * @param phoneNumber Numéro WhatsApp du client
   * @param address Adresse Google Places validée
   * @param label Nom donné à l'adresse par le client
   * @param setAsDefault Définir comme adresse par défaut
   * @returns Adresse créée
   */
  async saveCustomerAddress(
    phoneNumber: string, 
    address: GooglePlaceResult, 
    label: string,
    setAsDefault = false
  ): Promise<CustomerAddress | null> {
    try {
      console.log(`💾 [AddressService] Sauvegarde adresse "${label}" pour: ${phoneNumber}`);
      
      // Vérifier la limite d'adresses
      const isWithinLimit = await this.validateAddressLimit(phoneNumber);
      if (!isWithinLimit) {
        console.error('❌ [AddressService] Limite d\'adresses atteinte');
        return null;
      }

      // Si c'est la première adresse ou setAsDefault = true, la définir par défaut
      const currentAddresses = await this.getCustomerAddresses(phoneNumber);
      const shouldSetDefault = setAsDefault || currentAddresses.length === 0;

      // Si on définit par défaut, désactiver l'ancienne adresse par défaut
      if (shouldSetDefault) {
        await this.supabase
          .from('france_customer_addresses')
          .update({ is_default: false })
          .eq('phone_number', phoneNumber)
          .eq('is_default', true);
      }

      const addressData: CreateCustomerAddressRequest = {
        phone_number: phoneNumber,
        address_label: label.trim(),
        full_address: address.formatted_address,
        google_place_id: address.place_id,
        latitude: address.geometry.location.lat,
        longitude: address.geometry.location.lng,
        is_default: shouldSetDefault
      };

      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .insert([addressData])
        .select()
        .single();

      if (error) {
        console.error('❌ [AddressService] Erreur sauvegarde:', error);
        return null;
      }

      console.log(`✅ [AddressService] Adresse sauvegardée avec ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ [AddressService] Erreur sauvegarde adresse:', error);
      return null;
    }
  }

  /**
   * Mettre à jour une adresse existante
   * @param id ID de l'adresse
   * @param updates Données à mettre à jour
   * @returns Adresse mise à jour
   */
  async updateCustomerAddress(id: number, updates: Partial<CustomerAddress>): Promise<CustomerAddress | null> {
    try {
      console.log(`🔄 [AddressService] Mise à jour adresse ID: ${id}`);
      
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [AddressService] Erreur mise à jour:', error);
        return null;
      }

      console.log('✅ [AddressService] Adresse mise à jour avec succès');
      return data;
    } catch (error) {
      console.error('❌ [AddressService] Erreur mise à jour adresse:', error);
      return null;
    }
  }

  /**
   * Supprimer une adresse
   * @param id ID de l'adresse
   * @returns Succès de la suppression
   */
  async deleteCustomerAddress(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ [AddressService] Suppression adresse ID: ${id}`);
      
      const { error } = await this.supabase
        .from('france_customer_addresses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ [AddressService] Erreur suppression:', error);
        return false;
      }

      console.log('✅ [AddressService] Adresse supprimée avec succès');
      return true;
    } catch (error) {
      console.error('❌ [AddressService] Erreur suppression adresse:', error);
      return false;
    }
  }

  /**
   * Définir une adresse comme adresse par défaut
   * @param phoneNumber Numéro WhatsApp du client
   * @param addressId ID de l'adresse à définir par défaut
   * @returns Succès de l'opération
   */
  async setDefaultAddress(phoneNumber: string, addressId: number): Promise<boolean> {
    try {
      console.log(`⭐ [AddressService] Définition adresse par défaut ID: ${addressId}`);
      
      // Désactiver l'ancienne adresse par défaut
      await this.supabase
        .from('france_customer_addresses')
        .update({ is_default: false })
        .eq('phone_number', phoneNumber)
        .eq('is_default', true);

      // Activer la nouvelle adresse par défaut
      const { error } = await this.supabase
        .from('france_customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('phone_number', phoneNumber);

      if (error) {
        console.error('❌ [AddressService] Erreur définition défaut:', error);
        return false;
      }

      console.log('✅ [AddressService] Adresse par défaut définie avec succès');
      return true;
    } catch (error) {
      console.error('❌ [AddressService] Erreur définition adresse par défaut:', error);
      return false;
    }
  }

  /**
   * Récupérer l'adresse par défaut d'un client
   * @param phoneNumber Numéro WhatsApp du client
   * @returns Adresse par défaut ou null
   */
  async getDefaultAddress(phoneNumber: string): Promise<CustomerAddress | null> {
    try {
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [AddressService] Erreur récupération défaut:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('❌ [AddressService] Erreur récupération adresse par défaut:', error);
      return null;
    }
  }

  /**
   * Construire le message de sélection d'adresses pour WhatsApp
   * @param phoneNumber Numéro WhatsApp du client
   * @returns Message formaté pour la sélection d'adresses
   */
  async buildAddressSelectionMessage(phoneNumber: string): Promise<AddressSelectionMessage> {
    try {
      const addresses = await this.getCustomerAddresses(phoneNumber);
      
      if (addresses.length === 0) {
        return {
          hasAddresses: false,
          message: '🚚 **Première livraison !**\n\n  📍 **Saisissez votre adresse complète**\n  \n  💡 *Exemple : 15 rue de la Paix, 75001 Paris*',
          addresses: []
        };
      }

      let message = '🚚 Votre adresse:\n\n';
      
      addresses.forEach((address, index) => {
        const number = index + 1;
        const emoji = address.is_default ? '⭐' : this.getAddressEmoji(address.address_label);
        const label = address.address_label.toUpperCase();
        // Adresse complète sans raccourcissement
        const fullAddress = address.full_address.replace(/, France$/, '');
        
        message += `${number}️⃣ ${emoji} ${label}\n${fullAddress}\n\n`;
      });
      
      const nextNumber = addresses.length + 1;
      message += `${nextNumber}️⃣ ➕ NOUVELLE\n\n`;
      message += `Tapez 1, 2, 3 ou 4`;

      return {
        hasAddresses: true,
        message,
        addresses
      };
    } catch (error) {
      console.error('❌ [AddressService] Erreur construction message:', error);
      return {
        hasAddresses: false,
        message: 'Erreur lors de la récupération de vos adresses. Veuillez saisir votre adresse manuellement.',
        addresses: []
      };
    }
  }

  /**
   * Valider la limite d'adresses par client
   * @param phoneNumber Numéro WhatsApp du client
   * @returns true si dans la limite, false sinon
   */
  async validateAddressLimit(phoneNumber: string): Promise<boolean> {
    try {
      const addresses = await this.getCustomerAddresses(phoneNumber);
      return addresses.length < this.maxAddressesPerCustomer;
    } catch (error) {
      console.error('❌ [AddressService] Erreur validation limite:', error);
      return false;
    }
  }

  /**
   * Récupérer une adresse par son ID pour un client spécifique
   * @param phoneNumber Numéro WhatsApp du client
   * @param addressId ID de l'adresse
   * @returns Adresse trouvée ou null
   */
  async getAddressById(phoneNumber: string, addressId: number): Promise<CustomerAddress | null> {
    try {
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [AddressService] Erreur récupération par ID:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('❌ [AddressService] Erreur récupération adresse par ID:', error);
      return null;
    }
  }

  /**
   * Obtenir un emoji approprié selon le type d'adresse
   * @param label Label de l'adresse
   * @returns Emoji correspondant
   */
  private getAddressEmoji(label: string): string {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('maison') || labelLower.includes('domicile')) {
      return '🏠';
    } else if (labelLower.includes('bureau') || labelLower.includes('travail') || labelLower.includes('office')) {
      return '🏢';
    } else if (labelLower.includes('ami') || labelLower.includes('chez')) {
      return '👥';
    } else if (labelLower.includes('hotel') || labelLower.includes('hôtel')) {
      return '🏨';
    } else {
      return '📍';
    }
  }

  /**
   * Nettoyer les anciennes adresses non utilisées
   * @param olderThanDays Adresses plus anciennes que X jours
   * @returns Nombre d'adresses supprimées
   */
  async cleanupUnusedAddresses(olderThanDays = 365): Promise<number> {
    try {
      console.log(`🧹 [AddressService] Nettoyage adresses anciennes (>${olderThanDays} jours)`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .delete()
        .lt('updated_at', cutoffDate.toISOString())
        .eq('is_default', false)
        .select('id');

      if (error) {
        console.error('❌ [AddressService] Erreur nettoyage:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ [AddressService] ${deletedCount} anciennes adresses supprimées`);
      return deletedCount;
    } catch (error) {
      console.error('❌ [AddressService] Erreur nettoyage adresses:', error);
      return 0;
    }
  }
}