'use client';

import { useState, useEffect } from 'react';

interface Restaurant {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city: string;
  phone: string;
  whatsapp_number?: string;
  address?: string;
  password_hash?: string;
  latitude?: number;
  longitude?: number;
}

interface FranceIcon {
  id: number;
  emoji: string;
  name: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function BackOfficeRestaurantPage() {
  // État pour les tabs
  const [activeTab, setActiveTab] = useState('restaurants');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({});

  // États pour la gestion des icônes produits
  const [selectedRestaurantForIcons, setSelectedRestaurantForIcons] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryForIcons, setSelectedCategoryForIcons] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<FranceIcon[]>([]);
  const [showIconModal, setShowIconModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // États pour la gestion des icônes (variables manquantes ajoutées)
  const [icons, setIcons] = useState<FranceIcon[]>([]);
  const [loadingIcons, setLoadingIcons] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

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

  // Charger les catégories d'un restaurant
  const loadCategories = async (restaurantId: string) => {
    if (!restaurantId) return;

    try {
      const response = await fetch(`/api/categories?restaurant_id=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
        setSelectedCategoryForIcons('');
        setProducts([]);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      showNotification('error', 'Erreur', 'Impossible de charger les catégories');
    }
  };

  // Charger les produits d'une catégorie
  const loadProducts = async (restaurantId: string, categoryId: string) => {
    if (!restaurantId || !categoryId) return;

    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/products?restaurant_id=${restaurantId}&category_id=${categoryId}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        showNotification('success', 'Produits chargés', `${data.products.length} produits trouvés`);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      showNotification('error', 'Erreur', 'Impossible de charger les produits');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Charger les icônes disponibles
  const loadAvailableIcons = async () => {
    try {
      const response = await fetch('/api/icons');
      const data = await response.json();
      if (data.success) {
        setAvailableIcons(data.icons);
      }
    } catch (error) {
      console.error('Erreur chargement icônes:', error);
    }
  };

  // Charger toutes les icônes pour la gestion (fonction manquante ajoutée)
  const loadIcons = async () => {
    setLoadingIcons(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRestaurant) params.append('restaurant', selectedRestaurant);

      const response = await fetch(`/api/icons?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setIcons(data.icons);
        showNotification('success', 'Icônes chargées', `${data.icons.length} icônes trouvées`);
      } else {
        showNotification('error', 'Erreur', data.error);
      }
    } catch (error) {
      console.error('Erreur chargement icônes:', error);
      showNotification('error', 'Erreur', 'Impossible de charger les icônes');
    } finally {
      setLoadingIcons(false);
    }
  };

  // Sauvegarder l'icône d'un produit
  const saveProductIcon = async (productId: number, iconEmoji: string) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, icon: iconEmoji })
      });

      const data = await response.json();
      if (data.success) {
        // Recharger les produits
        await loadProducts(selectedRestaurantForIcons, selectedCategoryForIcons);
        setShowIconModal(false);
        setEditingProduct(null);
        showNotification('success', 'Icône mise à jour', 'L\'icône du produit a été sauvegardée');
      }
    } catch (error) {
      console.error('Erreur sauvegarde icône:', error);
      showNotification('error', 'Erreur', 'Impossible de sauvegarder l\'icône');
    }
  };

  // Toggle statut restaurant
  const openEditModal = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setEditForm({
      name: restaurant.name,
      phone: restaurant.phone,
      whatsapp_number: restaurant.whatsapp_number,
      city: restaurant.city,
      address: restaurant.address,
      is_active: restaurant.is_active,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRestaurant(null);
    setEditForm({});
  };

  const resetPassword = async (restaurantId: number) => {
    console.log('🔍 [Reset Password] Fonction appelée, restaurant ID:', restaurantId);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.success) {
        showNotification(
          'success',
          'Mot de passe reset',
          'Le restaurant pourra créer un nouveau mot de passe à la prochaine connexion'
        );

        // Mettre à jour l'état local pour masquer le bouton immédiatement
        if (editingRestaurant) {
          setEditingRestaurant({
            ...editingRestaurant,
            password_hash: ''
          });
        }

        await loadRestaurants(); // Recharger les données
      } else {
        showNotification('error', 'Erreur', result.error);
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion', 'Impossible de reset le mot de passe');
    }
  };

  const saveRestaurantChanges = async () => {
    if (!editingRestaurant) return;

    try {
      const response = await fetch(`/api/restaurants/${editingRestaurant.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          latitude: editForm.latitude,
          longitude: editForm.longitude
        })
      });

      const result = await response.json();
      if (result.success) {
        showNotification(
          'success',
          'Modifications enregistrées',
          `Les informations de ${editingRestaurant.name} ont été mises à jour`
        );
        await loadRestaurants();
        closeEditModal();
      } else {
        showNotification(
          'error',
          'Échec de la mise à jour',
          result.error || 'Impossible de sauvegarder les modifications'
        );
      }
    } catch (error) {
      showNotification(
        'error',
        'Erreur de connexion',
        'Impossible de communiquer avec le serveur'
      );
    }
  };

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

  // Filtrer les icônes selon les critères
  const filteredIcons = icons.filter(icon => {
    const matchesSearch = searchTerm === '' ||
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.emoji.includes(searchTerm) ||
      icon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === '' || icon.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🏪 Back Office Restaurant</h1>
        <p className="text-gray-600">Gérer l'activation, désactivation des restaurants et gestion des icônes</p>

        {/* Navigation par tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'restaurants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏪 Gestion Restaurants
            </button>
            <button
              onClick={() => setActiveTab('icons')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'icons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎨 Gestion Icônes
            </button>
          </nav>
        </div>
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

      {/* Contenu conditionnel selon l'onglet actif */}
      {activeTab === 'restaurants' && (
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                      <div className="flex items-center space-x-2">
                        {/* Bouton voir/éditer */}
                        <button
                          onClick={() => openEditModal(restaurant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Voir/Éditer les informations"
                        >
                          👁️
                        </button>

                        {/* Bouton toggle actif/inactif avec icône */}
                        <button
                          onClick={() => toggleRestaurantStatus(restaurant.id, !restaurant.is_active)}
                          disabled={updating === restaurant.id}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                            restaurant.is_active
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={restaurant.is_active ? 'Désactiver le restaurant' : 'Activer le restaurant'}
                        >
                          {updating === restaurant.id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : restaurant.is_active ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
    )}

      {/* Modal d'édition des informations restaurant */}
      {showEditModal && editingRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal moderne */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Édition Restaurant
                      </h3>
                      <p className="text-blue-100 text-sm">
                        <strong>{editingRestaurant.name}</strong> • ID: {editingRestaurant.id}
                      </p>
                    </div>
                  </div>

                  {/* Dates de création et modification */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs font-medium text-blue-100 uppercase tracking-wide">Création</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {formatDateTime(editingRestaurant.created_at)}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-xs font-medium text-blue-100 uppercase tracking-wide">Modification</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {formatDateTime(editingRestaurant.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeEditModal}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors ml-4"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom du restaurant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏪 Nom du restaurant
                  </label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom du restaurant"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Ville
                  </label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ville du restaurant"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📞 Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Numéro de téléphone"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editForm.whatsapp_number || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Numéro WhatsApp"
                  />
                </div>

                {/* Statut actif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⚡ Statut
                  </label>
                  <select
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">✅ Actif</option>
                    <option value="false">❌ Inactif</option>
                  </select>
                </div>

                {/* Latitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌍 Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.latitude || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 9.5092"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌐 Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.longitude || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: -13.7122"
                  />
                </div>
              </div>

              {/* Adresse complète */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🗺️ Adresse complète
                </label>
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Adresse complète du restaurant"
                />
              </div>

              {/* Gestion mot de passe simplifiée */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🔐 Gestion mot de passe
                </label>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-blue-900">
                          État actuel :
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          editingRestaurant?.password_hash
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {editingRestaurant?.password_hash ? '✅ Configuré' : '❌ Vide'}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700">
                        {editingRestaurant?.password_hash
                          ? 'Le restaurant peut se connecter avec son mot de passe actuel'
                          : '✅ Reset effectué - Le restaurant pourra créer son mot de passe à la première connexion'
                        }
                      </p>
                    </div>

                    {editingRestaurant?.password_hash && (
                      <button
                        onClick={() => {
                          console.log('🔍 [Button Click] Reset button clicked, restaurant:', editingRestaurant);
                          resetPassword(editingRestaurant.id);
                        }}
                        className="ml-4 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action modernes */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
              <div className="text-xs text-gray-500">
                💡 Les modifications seront appliquées immédiatement
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Annuler</span>
                </button>
                <button
                  onClick={saveRestaurantChanges}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Gestion des Icônes - Nouveau workflow */}
      {activeTab === 'icons' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">🎨 Assignation Icônes aux Produits</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sélectionnez un restaurant et une catégorie pour gérer les icônes des produits
                </p>
              </div>
              <div className="text-sm text-gray-500">
                🎯 {products.length} produits • {availableIcons.length} icônes disponibles
              </div>
            </div>
          </div>

          {/* Filtres Restaurant et Catégorie */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection Restaurant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏪 Sélectionner un restaurant
                </label>
                <select
                  value={selectedRestaurantForIcons}
                  onChange={(e) => {
                    setSelectedRestaurantForIcons(e.target.value);
                    setSelectedCategoryForIcons('');
                    setProducts([]);
                    if (e.target.value) {
                      loadCategories(e.target.value);
                    } else {
                      setCategories([]);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Choisir un restaurant --</option>
                  {restaurants
                    .filter(r => r.is_active)
                    .map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name} • {restaurant.city}
                      </option>
                    ))}
                </select>
                {selectedRestaurantForIcons && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Restaurant sélectionné - {categories.length} catégories disponibles
                  </p>
                )}
              </div>

              {/* Sélection Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏷️ Sélectionner une catégorie
                </label>
                <select
                  value={selectedCategoryForIcons}
                  onChange={(e) => {
                    setSelectedCategoryForIcons(e.target.value);
                    if (e.target.value && selectedRestaurantForIcons) {
                      loadProducts(selectedRestaurantForIcons, e.target.value);
                    } else {
                      setProducts([]);
                    }
                  }}
                  disabled={!selectedRestaurantForIcons}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choisir une catégorie --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategoryForIcons && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Catégorie sélectionnée - {products.length} produits trouvés
                  </p>
                )}
              </div>
            </div>

            {/* Instructions */}
            {!selectedRestaurantForIcons && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">
                  💡 <strong>Instructions :</strong> Sélectionnez d'abord un restaurant pour voir ses catégories, puis choisissez une catégorie pour afficher les produits et gérer leurs icônes.
                </p>
              </div>
            )}
          </div>

          {/* Liste des Produits */}
          {selectedRestaurantForIcons && selectedCategoryForIcons && (
            <div className="p-6">
              {loadingProducts ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement des produits...
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600">
                    Cette catégorie ne contient aucun produit actif.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      📦 Produits de la catégorie ({products.length})
                    </h3>
                    <button
                      onClick={loadAvailableIcons}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      🔄 Recharger icônes ({availableIcons.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-2xl">
                                {product.icon || '❓'}
                              </span>
                              <h4 className="font-medium text-gray-900 text-sm">
                                {product.name}
                              </h4>
                            </div>
                            {product.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                              ID: {product.id} • {product.product_type}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            loadAvailableIcons();
                            setShowIconModal(true);
                          }}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>🎨</span>
                          <span>{product.icon ? 'Modifier l\'icône' : 'Assigner une icône'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de sélection d'icône pour produit */}
      {showIconModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    🎨 Sélectionner une icône
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Produit : <strong>{editingProduct.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowIconModal(false);
                    setEditingProduct(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              {/* Icône actuelle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">
                    {editingProduct.icon || '❓'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Icône actuelle</p>
                    <p className="text-sm text-gray-600">
                      {editingProduct.icon ? 'Cliquez sur une nouvelle icône pour la remplacer' : 'Aucune icône assignée'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Filtres rapides */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchTerm('')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    searchTerm === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                {['plats', 'boissons', 'desserts', 'spécialités'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSearchTerm(cat)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      searchTerm === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grille d'icônes disponibles */}
              <div className="max-h-96 overflow-y-auto">
                {availableIcons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🎨</div>
                    <p>Chargement des icônes...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
                    {availableIcons
                      .filter(icon =>
                        searchTerm === '' ||
                        icon.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        icon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((icon) => (
                        <div
                          key={icon.id}
                          onClick={() => saveProductIcon(editingProduct.id, icon.emoji)}
                          className="group relative bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:shadow-md"
                          title={`${icon.emoji} ${icon.name}`}
                        >
                          <div className="text-2xl text-center">
                            {icon.emoji}
                          </div>
                          <div className="text-xs text-center text-gray-600 group-hover:text-blue-600 mt-1 truncate">
                            {icon.name}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pied du modal */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {availableIcons.filter(icon =>
                  searchTerm === '' ||
                  icon.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  icon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length} icônes disponibles
              </div>
              <button
                onClick={() => {
                  setShowIconModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}