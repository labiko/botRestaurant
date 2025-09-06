/**
 * Service de gestion des adresses clients
 * SOLID - Single Responsibility : Gestion uniquement des adresses
 * Import adapté depuis l'ancien bot pour l'architecture universelle
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { WhatsAppContactService } from './WhatsAppContactService.ts';

export interface CustomerAddress {
  id?: number;
  phone_number: string;
  address_label: string;
  full_address: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  is_active?: boolean;
  whatsapp_name?: string;
  created_at?: string;
  updated_at?: string;
}

export class AddressManagementService {
  private supabase: SupabaseClient;
  private maxAddressesPerCustomer: number;

  constructor(
    private supabaseUrl: string,
    private supabaseKey: string,
    private whatsappContactService?: WhatsAppContactService,
    maxAddressesPerCustomer = 3
  ) {
    this.maxAddressesPerCustomer = maxAddressesPerCustomer;
    this.initSupabase();
  }

  /**
   * Initialiser le client Supabase
   */
  private async initSupabase() {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Récupérer toutes les adresses d'un client
   */
  async getCustomerAddresses(phoneNumber: string): Promise<CustomerAddress[]> {
    try {
      console.log(`📋 [AddressService] Récupération adresses pour: ${phoneNumber}`);
      
      // Standardiser le format avec @c.us pour correspondre à la base
      const standardPhone = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
      
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .select('*')
        .eq('phone_number', standardPhone)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [AddressService] Erreur récupération:', error);
        return [];
      }

      console.log(`✅ [AddressService] ${data?.length || 0} adresses trouvées`);
      return data || [];
      
    } catch (error) {
      console.error('❌ [AddressService] Exception:', error);
      return [];
    }
  }

  /**
   * Sauvegarder une nouvelle adresse
   */
  async saveAddress(address: CustomerAddress): Promise<CustomerAddress | null> {
    try {
      console.log(`💾 [AddressService] Sauvegarde adresse...`);
      
      // Standardiser le format avec @c.us pour correspondre à la base
      address.phone_number = address.phone_number.includes('@c.us') ? address.phone_number : `${address.phone_number}@c.us`;
      
      // Vérifier le nombre d'adresses existantes
      const existingAddresses = await this.getCustomerAddresses(address.phone_number);
      
      if (existingAddresses.length >= this.maxAddressesPerCustomer) {
        // Désactiver silencieusement la plus ancienne adresse
        const oldestAddress = existingAddresses
          .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())[0];
        
        if (oldestAddress) {
          await this.deactivateAddress(oldestAddress.id!);
          
          // Si l'adresse désactivée était la default, promouvoir la suivante
          if (oldestAddress.is_default && existingAddresses.length > 1) {
            const nextAddress = existingAddresses
              .filter(a => a.id !== oldestAddress.id)
              .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())[0];
            
            if (nextAddress) {
              await this.setDefaultAddress(address.phone_number, nextAddress.id!);
            }
          }
        }
      }
      
      // Récupérer le nom WhatsApp si le service est disponible
      if (this.whatsappContactService) {
        const whatsappName = await this.whatsappContactService.getContactName(address.phone_number);
        if (whatsappName) {
          address.whatsapp_name = whatsappName;
        }
      }
      
      // La nouvelle adresse devient toujours par défaut
      address.is_default = true;
      address.is_active = true;
      
      // Révoquer le statut par défaut des autres adresses si il y en a
      if (existingAddresses.length > 0) {
        console.log(`🔄 [AddressService] Révocation statut par défaut des autres adresses`);
        await this.supabase
          .from('france_customer_addresses')
          .update({ is_default: false })
          .eq('phone_number', address.phone_number)
          .eq('is_active', true);
      }
      
      // Insérer la nouvelle adresse
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .insert(address)
        .select()
        .single();
      
      if (error) {
        console.error('❌ [AddressService] Erreur sauvegarde:', error);
        return null;
      }
      
      console.log(`✅ [AddressService] Adresse sauvegardée: ${data.address_label}`);
      return data;
      
    } catch (error) {
      console.error('❌ [AddressService] Exception sauvegarde:', error);
      return null;
    }
  }

  /**
   * Supprimer une adresse (conservé pour compatibilité)
   */
  async deleteAddress(addressId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('france_customer_addresses')
        .delete()
        .eq('id', addressId);
      
      if (error) {
        console.error('❌ [AddressService] Erreur suppression:', error);
        return false;
      }
      
      console.log(`✅ [AddressService] Adresse ${addressId} supprimée`);
      return true;
      
    } catch (error) {
      console.error('❌ [AddressService] Exception suppression:', error);
      return false;
    }
  }

  /**
   * Désactiver une adresse (soft delete)
   */
  async deactivateAddress(addressId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('france_customer_addresses')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId);
      
      if (error) {
        console.error('❌ [AddressService] Erreur désactivation:', error);
        return false;
      }
      
      console.log(`✅ [AddressService] Adresse ${addressId} désactivée`);
      return true;
      
    } catch (error) {
      console.error('❌ [AddressService] Exception désactivation:', error);
      return false;
    }
  }

  /**
   * Mettre à jour l'adresse par défaut
   */
  async setDefaultAddress(phoneNumber: string, addressId: number): Promise<boolean> {
    try {
      const cleanPhone = phoneNumber.replace('@c.us', '');
      
      // Retirer le défaut de toutes les adresses
      await this.supabase
        .from('france_customer_addresses')
        .update({ is_default: false })
        .eq('phone_number', cleanPhone);
      
      // Mettre la nouvelle par défaut
      const { error } = await this.supabase
        .from('france_customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId);
      
      if (error) {
        console.error('❌ [AddressService] Erreur mise à jour défaut:', error);
        return false;
      }
      
      console.log(`✅ [AddressService] Adresse ${addressId} définie par défaut`);
      return true;
      
    } catch (error) {
      console.error('❌ [AddressService] Exception:', error);
      return false;
    }
  }

  /**
   * Récupérer une adresse par son ID
   */
  async getAddressById(addressId: number): Promise<CustomerAddress | null> {
    try {
      const { data, error } = await this.supabase
        .from('france_customer_addresses')
        .select('*')
        .eq('id', addressId)
        .single();
      
      if (error) {
        console.error('❌ [AddressService] Erreur récupération:', error);
        return null;
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ [AddressService] Exception:', error);
      return null;
    }
  }

  /**
   * Formater le message de sélection d'adresses
   * FORMAT UNIVERSEL - Même structure pour tous les restaurants
   */
  formatAddressSelectionMessage(addresses: CustomerAddress[]): string {
    let message = `🚚 Votre adresse:\n\n`;
    
    addresses.forEach((addr, index) => {
      const emoji = addr.is_default ? '⭐' : '📍';
      message += `${index + 1} ${emoji} ${addr.address_label}\n`;
      message += `${addr.full_address}\n\n`;
    });
    
    const nextNumber = addresses.length + 1;
    message += `${nextNumber} ➕ NOUVELLE\n\n`;
    message += `Tapez ${addresses.map((_, i) => i + 1).join(', ')} ou ${nextNumber}`;
    
    return message;
  }

  /**
   * Générer un label automatique pour une adresse
   */
  generateAddressLabel(existingAddresses: CustomerAddress[]): string {
    const labels = existingAddresses.map(a => a.address_label);
    
    if (!labels.includes('Maison')) return 'Maison';
    if (!labels.includes('Bureau')) return 'Bureau';
    if (!labels.includes('Autre')) return 'Autre';
    
    // Si tous les labels standards sont pris, générer un label numéroté
    let counter = 1;
    while (labels.includes(`Adresse ${counter}`)) {
      counter++;
    }
    
    return `Adresse ${counter}`;
  }
}