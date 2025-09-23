'use client';

import { useState, useEffect } from 'react';

interface Restaurant {
  id: number;
  name: string;
  is_active: boolean;
  updated_at: string;
  city: string;
  phone: string;
  whatsapp_number?: string;
}

export default function BackOfficeRestaurantPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  // États pour les notifications modernes
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    details?: string;
  } | null>(null);

  // Fonction de formatage de date avec correction du fuseau horaire
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);

    // Correction du décalage horaire pour la France (UTC+1/UTC+2)
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (timezoneOffset * 60000));

    return localDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-masquage des notifications
  useEffect(() => {
    if (notification && notification.type !== 'error') {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // 5 secondes pour success/warning/info

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fonction helper pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string, details?: string) => {
    setNotification({ type, message, details });
  };

  // Charger les restaurants
  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/restaurants/management');
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.restaurants);
      } else {
        showNotification('error', 'Erreur lors du chargement des restaurants', data.error);
      }
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de charger les restaurants');
    } finally {
      setLoading(false);
    }
  };

  // Toggle statut restaurant
  const toggleRestaurantStatus = async (restaurantId: number, newStatus: boolean) => {
    setUpdating(restaurantId);

    // Trouver le nom du restaurant pour un message personnalisé
    const restaurant = restaurants.find(r => r.id === restaurantId);
    const restaurantName = restaurant?.name || `Restaurant #${restaurantId}`;

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        // Recharger la liste
        await loadRestaurants();

        // Notification de succès moderne
        const statusText = newStatus ? 'activé' : 'désactivé';
        showNotification(
          'success',
          `Restaurant ${statusText}`,
          `${restaurantName} a été ${statusText} avec succès`
        );
      } else {
        showNotification(
          'error',
          'Échec de la mise à jour',
          result.error || 'Impossible de mettre à jour le statut du restaurant'
        );
      }
    } catch (error) {
      console.error('Erreur toggle status:', error);
      showNotification(
        'error',
        'Erreur de connexion',
        'Impossible de communiquer avec le serveur'
      );
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🏪 Back Office Restaurant</h1>
        <p className="text-gray-600">Gérer l'activation et la désactivation des restaurants</p>
      </div>

      {/* Système de notifications moderne */}
      {notification && (
        <div className={`mb-6 rounded-lg shadow-lg p-4 border-l-4 ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-800'
            : notification.type === 'error'
            ? 'bg-red-50 border-red-500 text-red-800'
            : notification.type === 'warning'
            ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
            : 'bg-blue-50 border-blue-500 text-blue-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              {notification.details && (
                <p className="text-sm mt-1 opacity-90">{notification.details}</p>
              )}
            </div>
            {notification.type === 'error' && (
              <button
                onClick={() => setNotification(null)}
                className="ml-3 flex-shrink-0"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gestion des Restaurants</h2>
              <p className="text-sm text-gray-600 mt-1">
                {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <button
              onClick={loadRestaurants}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Actualisation...' : '🔄 Actualiser'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement des restaurants...
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">🏪</div>
            <p>Aucun restaurant trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière MAJ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">ID: {restaurant.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{restaurant.city || 'Non spécifié'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {restaurant.phone && (
                          <div className="text-sm text-gray-900">📞 {restaurant.phone}</div>
                        )}
                        {restaurant.whatsapp_number && restaurant.whatsapp_number !== restaurant.phone && (
                          <div className="text-sm text-gray-600">💬 {restaurant.whatsapp_number}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        restaurant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.is_active ? '✅ Actif' : '❌ Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(restaurant.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRestaurantStatus(restaurant.id, !restaurant.is_active)}
                        disabled={updating === restaurant.id}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          restaurant.is_active
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {updating === restaurant.id ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            MAJ...
                          </div>
                        ) : restaurant.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {restaurants.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Informations importantes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Les restaurants désactivés sont automatiquement déconnectés dans les 30 secondes</li>
            <li>• La date de mise à jour est automatiquement mise à jour lors des changements</li>
            <li>• Les modifications sont immédiatement effectives</li>
          </ul>
        </div>
      )}
    </div>
  );
}