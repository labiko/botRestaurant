'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

interface Restaurant {
  id: number;
  name: string;
  subscription_status: 'active' | 'expiring' | 'expired' | 'suspended';
  subscription_end_date: string;
  subscription_plan: 'monthly' | 'quarterly' | 'annual';
  phone: string;
  email: string;
}

interface ProlongModalData {
  restaurantId: number;
  restaurantName: string;
}

export default function SubscriptionsPage() {
  const { supabase, environment } = useSupabase();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ProlongModalData | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [isProlonging, setIsProlonging] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchTerm, statusFilter]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('france_restaurants')
        .select('id, name, subscription_status, subscription_end_date, subscription_plan, phone, email')
        .order('subscription_end_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      setRestaurants(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement restaurants:', error);
      setMessage('❌ Erreur lors du chargement des restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.subscription_status === statusFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term)
      );
    }

    setFilteredRestaurants(filtered);
  };

  const openProlongModal = (restaurant: Restaurant) => {
    setModalData({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name
    });
    setDurationMonths(1);
    setNotes('');
    setShowModal(true);
    setMessage('');
  };

  const closeProlongModal = () => {
    setShowModal(false);
    setModalData(null);
    setNotes('');
  };

  const handleProlong = async () => {
    if (!modalData) return;

    setIsProlonging(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('subscription-admin', {
        body: {
          action: 'prolong',
          restaurant_id: modalData.restaurantId,
          duration_months: durationMonths,
          notes: notes,
          admin_user: 'super-admin' // TODO: Get from auth session
        }
      });

      if (error) throw error;

      setMessage(`✅ Abonnement prolongé de ${durationMonths} mois pour ${modalData.restaurantName}`);
      closeProlongModal();
      await loadRestaurants(); // Reload data
    } catch (error) {
      console.error('❌ Erreur prolongation:', error);
      setMessage('❌ Erreur lors de la prolongation');
    } finally {
      setIsProlonging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expiring: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: '✅ Actif',
      expiring: '⚠️ Expire bientôt',
      expired: '❌ Expiré',
      suspended: '⏸️ Suspendu'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPlanLabel = (plan: string) => {
    const labels = {
      monthly: '📅 Mensuel',
      quarterly: '📅 Trimestriel',
      annual: '📅 Annuel'
    };
    return labels[plan as keyof typeof labels] || plan;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🏪 Gestion des Abonnements</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          environment === 'DEV' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {environment === 'DEV' ? '🔧 DEV' : '🚀 PROD'}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, téléphone, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les restaurants</option>
              <option value="active">✅ Actifs</option>
              <option value="expiring">⚠️ Expirent bientôt</option>
              <option value="expired">❌ Expirés</option>
              <option value="suspended">⏸️ Suspendus</option>
            </select>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-800">{restaurants.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-800">
              {restaurants.filter(r => r.subscription_status === 'active').length}
            </div>
            <div className="text-sm text-green-600">Actifs</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-800">
              {restaurants.filter(r => r.subscription_status === 'expiring').length}
            </div>
            <div className="text-sm text-yellow-600">Expirent</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-800">
              {restaurants.filter(r => r.subscription_status === 'expired').length}
            </div>
            <div className="text-sm text-red-600">Expirés</div>
          </div>
        </div>
      </div>

      {/* Liste des restaurants */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin abonnement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jours restants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun restaurant trouvé
                  </td>
                </tr>
              ) : (
                filteredRestaurants.map((restaurant) => {
                  const daysRemaining = getDaysRemaining(restaurant.subscription_end_date);
                  return (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(restaurant.subscription_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPlanLabel(restaurant.subscription_plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(restaurant.subscription_end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {daysRemaining !== null ? (
                          <span className={`font-medium ${
                            daysRemaining < 0 ? 'text-red-600' :
                            daysRemaining < 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {daysRemaining < 0 ? `Expiré depuis ${Math.abs(daysRemaining)} j` : `${daysRemaining} jours`}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openProlongModal(restaurant)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          ➕ Prolonger
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de prolongation */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">➕ Prolonger l'abonnement</h2>

            <div className="mb-4">
              <p className="text-gray-700">
                <strong>Restaurant :</strong> {modalData.restaurantName}
              </p>
            </div>

            {/* Durée */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de prolongation
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 mois</option>
                <option value={3}>3 mois</option>
                <option value={6}>6 mois</option>
                <option value={12}>12 mois</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Mobile Money, référence paiement...)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ex: Paiement Orange Money - 50€ - Ref: TXN123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeProlongModal}
                disabled={isProlonging}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleProlong}
                disabled={isProlonging}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isProlonging ? 'Prolongation...' : '✅ Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
