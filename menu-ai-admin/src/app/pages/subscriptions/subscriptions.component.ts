import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

interface Restaurant {
  id: number;
  name: string;
  subscription_status: string;
  subscription_end_date: string;
  subscription_plan: string;
}

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];

  isLoading = false;
  filter = 'all';
  searchTerm = '';

  showProlongModal = false;
  selectedRestaurant: Restaurant | null = null;
  prolongDuration = 1;
  prolongNotes = '';
  isProlonging = false;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadRestaurants();
  }

  async loadRestaurants() {
    this.isLoading = true;
    try {
      const { data, error } = await this.supabase.client
        .from('france_restaurants')
        .select('id, name, subscription_status, subscription_end_date, subscription_plan')
        .order('subscription_end_date', { ascending: true });

      if (error) throw error;

      this.restaurants = data || [];
      this.applyFilters();

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let filtered = [...this.restaurants];

    if (this.filter === 'expiring') {
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      filtered = filtered.filter(r => {
        const endDate = new Date(r.subscription_end_date);
        return endDate <= in30Days && endDate > new Date();
      });
    } else if (this.filter === 'expired') {
      filtered = filtered.filter(r => {
        const endDate = new Date(r.subscription_end_date);
        return endDate < new Date();
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term)
      );
    }

    this.filteredRestaurants = filtered;
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'active') return 'badge-success';
    if (status === 'expiring') return 'badge-warning';
    if (status === 'expired') return 'badge-danger';
    return 'badge-secondary';
  }

  openProlongModal(restaurant: Restaurant) {
    this.selectedRestaurant = restaurant;
    this.prolongDuration = 1;
    this.prolongNotes = '';
    this.showProlongModal = true;
  }

  closeProlongModal() {
    this.showProlongModal = false;
    this.selectedRestaurant = null;
  }

  async prolongSubscription() {
    if (!this.selectedRestaurant) return;

    this.isProlonging = true;
    try {
      const { error } = await this.supabase.client.functions.invoke('subscription-admin', {
        body: {
          action: 'prolong',
          restaurant_id: this.selectedRestaurant.id,
          duration_months: this.prolongDuration,
          notes: this.prolongNotes,
          admin_user: 'admin'
        }
      });

      if (error) throw error;

      alert(`✅ Abonnement prolongé de ${this.prolongDuration} mois !`);
      this.closeProlongModal();
      await this.loadRestaurants();

    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur prolongation');
    } finally {
      this.isProlonging = false;
    }
  }
}
