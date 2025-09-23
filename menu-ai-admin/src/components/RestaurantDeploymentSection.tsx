'use client';

import { useState, useEffect } from 'react';

interface Restaurant {
  id: number;
  name: string;
  deployment_status: 'development' | 'testing' | 'production';
  is_active: boolean;
  is_exceptionally_closed: boolean;
  phone?: string;
  address?: string;
}

export default function RestaurantDeploymentSection() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // États pour les notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // Auto-masquage des notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appel API vers PROD pour récupérer les restaurants avec deployment_status
      const response = await fetch('/api/deployment/restaurants');
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.restaurants);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion à la production');
      console.error('Erreur chargement restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadRestaurants();
    }
  }, [isExpanded]);

  const updateDeploymentStatus = async (restaurantId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/deployment/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          deployment_status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          type: 'success',
          message: `✅ Statut mis à jour: ${data.restaurant_name} → ${getStatusLabel(newStatus)}`
        });

        // Mettre à jour l'état local
        setRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, deployment_status: newStatus as any }
            : r
        ));
      } else {
        setNotification({
          type: 'error',
          message: `❌ Erreur: ${data.error}`
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: '❌ Erreur de connexion'
      });
      console.error('Erreur:', error);
    }
  };

  const deployToProduction = (restaurant: Restaurant) => {
    updateDeploymentStatus(restaurant.id, 'production');
  };

  const moveToTesting = (restaurant: Restaurant) => {
    updateDeploymentStatus(restaurant.id, 'testing');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'text-green-600 bg-green-50';
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      case 'development': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'production': return '🟢';
      case 'testing': return '🟡';
      case 'development': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'production': return 'Production';
      case 'testing': return 'Testing';
      case 'development': return 'Development';
      default: return 'Inconnu';
    }
  };

  const stats = restaurants.reduce((acc, r) => {
    acc[r.deployment_status] = (acc[r.deployment_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-3 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
          'bg-blue-100 border border-blue-400 text-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* En-tête pliable */}
      <div
        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Gestion Déploiement Restaurants (PROD)
              </h2>
              <p className="text-sm text-gray-600">
                Contrôler la visibilité des restaurants dans la liste "resto" - Environnement PRODUCTION
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Statistiques rapides */}
            {restaurants.length > 0 && (
              <div className="flex space-x-2 text-sm">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  🟢 {stats.production || 0}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  🟡 {stats.testing || 0}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                  🔴 {stats.development || 0}
                </span>
              </div>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu déployable */}
      {isExpanded && (
        <div className="p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Connexion à la production...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-2">❌ {error}</div>
              <button
                onClick={loadRestaurants}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && restaurants.length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">🏪</span>
              <p className="text-gray-600">Aucun restaurant trouvé</p>
            </div>
          )}

          {!loading && !error && restaurants.length > 0 && (
            <div className="space-y-4">
              {/* Aide rapide */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span>ℹ️</span>
                  <div>
                    <strong>Fonctionnement :</strong>
                    <ul className="mt-1 space-y-1 text-blue-700">
                      <li>• <strong>Development/Testing</strong> : Invisible dans "resto", accessible par téléphone</li>
                      <li>• <strong>Production</strong> : Visible dans "resto" et accessible par téléphone</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Liste des restaurants */}
              <div className="grid gap-4">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">

                      {/* Info restaurant */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(restaurant.deployment_status)}`}>
                            {getStatusIcon(restaurant.deployment_status)} {getStatusLabel(restaurant.deployment_status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {restaurant.phone && `📞 ${restaurant.phone}`}
                          {restaurant.phone && restaurant.address && ' • '}
                          {restaurant.address && `📍 ${restaurant.address}`}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">

                        {/* Segments déploiement */}
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                          {['development', 'testing', 'production'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateDeploymentStatus(restaurant.id, status)}
                              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                restaurant.deployment_status === status
                                  ? status === 'production' ? 'bg-green-100 text-green-800' :
                                    status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  : 'bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {getStatusIcon(status)} {getStatusLabel(status)}
                            </button>
                          ))}
                        </div>

                        {/* Action rapide déployer */}
                        {restaurant.deployment_status !== 'production' && (
                          <button
                            onClick={() => deployToProduction(restaurant)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            🚀 Déployer
                          </button>
                        )}

                        {/* Action rapide retirer */}
                        {restaurant.deployment_status === 'production' && (
                          <button
                            onClick={() => moveToTesting(restaurant)}
                            className="bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
                          >
                            🔄 Retirer
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton refresh */}
              <div className="text-center pt-4">
                <button
                  onClick={loadRestaurants}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}