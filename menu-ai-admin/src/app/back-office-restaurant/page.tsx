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

interface Category {
  id: number;
  name: string;
  icon: string;
  restaurant_id: number;
  display_order: number;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  icon: string | null;
  category_id: number;
  restaurant_id: number;
  display_order: number;
  is_active: boolean;
  price_onsite: number;
  price_delivery: number;
}

interface ProductOption {
  id: number;
  product_id: number;
  option_group: string;
  option_name: string;
  price_modifier: number;
  icon: string | null;
  display_order: number;
  is_active: boolean;
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

  // États pour les notifications modernes
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    details?: string;
  } | null>(null);

  // États pour la gestion avancée des icônes
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // États pour la modal avancée
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'category' | 'options'>('category');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // États pour le drag & drop
  const [draggedProduct, setDraggedProduct] = useState<number | null>(null);

  // États pour les options des produits composites
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // Fonctions pour la gestion avancée des icônes
  const loadCategoriesForRestaurant = async (restaurantId: number) => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`/api/categories?restaurant_id=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
        console.log(`✅ [loadCategoriesForRestaurant] ${data.categories?.length || 0} catégories trouvées pour restaurant ${restaurantId}`);
      } else {
        console.error('❌ [loadCategoriesForRestaurant] Erreur API:', data.error);
        showNotification('error', 'Erreur de chargement', data.error || 'Impossible de charger les catégories');
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ [loadCategoriesForRestaurant] Exception:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const openAdvancedCategoryModal = async (category: Category) => {
    console.log('🎯 [openAdvancedCategoryModal] Ouverture modal pour catégorie:', category);
    setEditingCategory(category);
    setShowAdvancedModal(true);
    setActiveModalTab('category');

    console.log('📦 [openAdvancedCategoryModal] Chargement produits pour:', {
      restaurant_id: category.restaurant_id,
      category_id: category.id,
      category_name: category.name
    });

    // Charger les produits de la catégorie
    const products = await loadCategoryProducts(category.restaurant_id, category.id);

    // Si il y a des produits composites, charger leurs options
    if (products && products.length > 0) {
      const compositeProduct = products.find(p => p.product_type === 'composite');
      if (compositeProduct) {
        console.log('⚙️ [openAdvancedCategoryModal] Produit composite trouvé, chargement options:', compositeProduct);
        setEditingProduct(compositeProduct);
        await loadProductOptions(compositeProduct.id);
      }
    }
  };

  const loadCategoryProducts = async (restaurantId: number | string, categoryId: number | string) => {
    setLoadingProducts(true);
    try {
      console.log('🔍 [loadCategoryProducts] Chargement:', { restaurantId, categoryId });

      const url = `/api/products?restaurant_id=${restaurantId}&category_id=${categoryId}`;
      console.log('🌐 [loadCategoryProducts] URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📊 [loadCategoryProducts] Response:', data);

      if (data.success) {
        setCategoryProducts(data.products || []);
        console.log(`✅ [loadCategoryProducts] Produits chargés: ${data.products?.length || 0}`);
        return data.products || [];
      } else {
        console.error('❌ [loadCategoryProducts] Erreur API:', data.error);
        showNotification('error', 'Erreur de chargement', data.error || 'Impossible de charger les produits');
        setCategoryProducts([]);
        return [];
      }
    } catch (error) {
      console.error('❌ [loadCategoryProducts] Exception:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
      setCategoryProducts([]);
      return [];
    } finally {
      setLoadingProducts(false);
    }
  };

  const saveCategoryIcon = async (categoryId: number, icon: string) => {
    console.log('🎯 [saveCategoryIcon] Début sauvegarde:', { categoryId, icon });
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, icon })
      });

      console.log('🌐 [saveCategoryIcon] Status HTTP:', response.status);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 [saveCategoryIcon] Réponse API:', data);

      if (data.success) {
        console.log('✅ [saveCategoryIcon] Succès - Mise à jour des états');

        // Mise à jour de la liste des catégories
        setCategories(prev => prev.map(cat =>
          cat.id === categoryId ? { ...cat, icon } : cat
        ));

        // Mise à jour de la catégorie en cours d'édition
        setEditingCategory(prev => prev ? { ...prev, icon } : prev);

        console.log('🔄 [saveCategoryIcon] États mis à jour avec icône:', icon);
        showNotification('success', 'Icône mise à jour', 'L\'icône de la catégorie a été sauvegardée');
      } else {
        console.error('❌ [saveCategoryIcon] Erreur API:', data.error);
        showNotification('error', 'Erreur de sauvegarde', data.error || 'Impossible de sauvegarder l\'icône');
      }
    } catch (error) {
      console.error('❌ [saveCategoryIcon] Exception:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === categoryProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(categoryProducts.map(p => p.id));
    }
  };

  const applyBulkIcon = async (icon: string) => {
    if (selectedProducts.length === 0) return;

    try {
      const response = await fetch('/api/products/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: selectedProducts,
          icon
        })
      });

      const data = await response.json();

      if (data.success) {
        setCategoryProducts(prev => prev.map(product =>
          selectedProducts.includes(product.id) ? { ...product, icon } : product
        ));
        setSelectedProducts([]);
        setShowBulkModal(false);
        showNotification('success', 'Icônes appliquées', `${selectedProducts.length} produits mis à jour`);
      } else {
        showNotification('error', 'Erreur de sauvegarde', data.error || 'Impossible d\'appliquer les icônes');
      }
    } catch (error) {
      console.error('Erreur application bulk icônes:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
    }
  };

  const saveProductIcon = async (productId: number, icon: string) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, icon })
      });

      const data = await response.json();

      if (data.success) {
        setCategoryProducts(prev => prev.map(product =>
          product.id === productId ? { ...product, icon } : product
        ));
        showNotification('success', 'Icône mise à jour', 'L\'icône du produit a été sauvegardée');
      } else {
        showNotification('error', 'Erreur de sauvegarde', data.error || 'Impossible de sauvegarder l\'icône');
      }
    } catch (error) {
      console.error('Erreur sauvegarde icône produit:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
    }
  };

  const handleDragStart = (productId: number) => {
    setDraggedProduct(productId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetProductId: number) => {
    e.preventDefault();

    if (!draggedProduct || draggedProduct === targetProductId) {
      setDraggedProduct(null);
      return;
    }

    const draggedIndex = categoryProducts.findIndex(p => p.id === draggedProduct);
    const targetIndex = categoryProducts.findIndex(p => p.id === targetProductId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedProducts = [...categoryProducts];
    const [draggedItem] = reorderedProducts.splice(draggedIndex, 1);
    reorderedProducts.splice(targetIndex, 0, draggedItem);

    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));

    setCategoryProducts(updatedProducts);
    setDraggedProduct(null);

    try {
      const response = await fetch('/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts.map(p => ({ id: p.id, display_order: p.display_order }))
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Ordre mis à jour', 'L\'ordre des produits a été sauvegardé');
      } else {
        showNotification('error', 'Erreur de sauvegarde', data.error || 'Impossible de sauvegarder l\'ordre');
        await loadCategoryProducts(editingCategory!.restaurant_id, editingCategory!.id);
      }
    } catch (error) {
      console.error('Erreur sauvegarde ordre produits:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
      await loadCategoryProducts(editingCategory!.restaurant_id, editingCategory!.id);
    }
  };

  // Fonctions pour la gestion des options de produits composites
  const loadProductOptions = async (productId: number) => {
    setLoadingOptions(true);
    try {
      const response = await fetch(`/api/product-options?product_id=${productId}`);
      const data = await response.json();

      if (data.success) {
        setProductOptions(data.options || []);
        console.log(`✅ [loadProductOptions] ${data.options?.length || 0} options trouvées pour produit ${productId}`);
      } else {
        console.error('❌ [loadProductOptions] Erreur API:', data.error);
        showNotification('error', 'Erreur de chargement', data.error || 'Impossible de charger les options');
        setProductOptions([]);
      }
    } catch (error) {
      console.error('❌ [loadProductOptions] Exception:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
      setProductOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const openProductOptionsModal = async (product: Product) => {
    console.log('🎯 [openProductOptionsModal] Ouverture modal options pour produit:', product);
    setEditingProduct(product);
    setShowOptionsModal(true);
    await loadProductOptions(product.id);
  };

  const saveOptionIcon = async (optionId: number, icon: string) => {
    try {
      const response = await fetch('/api/product-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: optionId, icon })
      });

      const data = await response.json();

      if (data.success) {
        setProductOptions(prev => prev.map(opt =>
          opt.id === optionId ? { ...opt, icon } : opt
        ));
        showNotification('success', 'Icône mise à jour', 'L\'icône de l\'option a été sauvegardée');
      } else {
        showNotification('error', 'Erreur de sauvegarde', data.error || 'Impossible de sauvegarder l\'icône');
      }
    } catch (error) {
      console.error('Erreur sauvegarde icône option:', error);
      showNotification('error', 'Erreur de connexion', 'Impossible de communiquer avec le serveur');
    }
  };

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

      {/* Tab Gestion des Icônes */}
      {activeTab === 'icons' && (
        <div className="space-y-6">
          {/* Sélection du restaurant */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">🎨 Gestion des Icônes</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Personnalisation avancée des icônes par restaurant
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏪 Sélectionner le restaurant
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={selectedRestaurantId || ''}
                  onChange={(e) => {
                    const restaurantId = e.target.value ? parseInt(e.target.value) : null;
                    setSelectedRestaurantId(restaurantId);
                    if (restaurantId) {
                      loadCategoriesForRestaurant(restaurantId);
                    } else {
                      setCategories([]);
                    }
                  }}
                >
                  <option value="">-- Sélectionnez un restaurant --</option>
                  {restaurants.filter(r => r.is_active).map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} ({restaurant.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grille des catégories */}
          {selectedRestaurantId && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">🏷️ Catégories</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {categories.length} catégories trouvées
                    </p>
                  </div>
                  <button
                    onClick={() => selectedRestaurantId && loadCategoriesForRestaurant(selectedRestaurantId)}
                    disabled={loadingCategories}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loadingCategories ? '⏳ Chargement...' : '🔄 Actualiser'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loadingCategories ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-purple-600 bg-purple-100">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Chargement des catégories...
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🏷️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie trouvée</h3>
                    <p className="text-gray-600">
                      Ce restaurant n'a pas encore de catégories actives
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="group relative bg-gray-50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 border border-gray-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-105"
                      >
                        {/* Icône de la catégorie */}
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{category.icon || '❓'}</div>
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {category.name}
                          </h4>
                        </div>

                        {/* Bouton modifier */}
                        <button
                          onClick={() => openAdvancedCategoryModal(category)}
                          className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          🎨 Modifier
                        </button>

                        {/* Badge ordre d'affichage */}
                        <div className="absolute top-2 right-2 bg-white text-xs text-gray-500 px-2 py-1 rounded-full shadow-sm">
                          #{category.display_order}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Avancée de Gestion des Icônes */}
      {showAdvancedModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header Modal */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    {editingCategory.icon} {editingCategory.name}
                  </h2>
                  <p className="text-purple-100 mt-1">
                    Gestion avancée • Restaurant ID: {editingCategory.restaurant_id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAdvancedModal(false);
                    setEditingCategory(null);
                    setCategoryProducts([]);
                    setSelectedProducts([]);
                  }}
                  className="text-white hover:text-red-200 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 flex space-x-1">
                {[
                  { key: 'category', label: '🏷️ Icône Catégorie', desc: 'Modifier l\'icône' },
                  { key: 'options', label: '⚙️ Options', desc: `${productOptions.length} options`, badge: loadingOptions ? 'Chargement...' : undefined }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveModalTab(tab.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeModalTab === tab.key
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <div>{tab.label}</div>
                    <div className="text-xs opacity-80">{tab.desc}</div>
                    {tab.badge && (
                      <div className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full mt-1">
                        {tab.badge}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu Modal */}
            <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>

              {/* Tab: Icône Catégorie */}
              {activeModalTab === 'category' && (
                <div className="p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Modifier l'icône de la catégorie
                      </h3>
                      <div className="inline-flex items-center bg-gray-100 rounded-lg p-4">
                        <div className="text-6xl mr-4">{editingCategory.icon || '❓'}</div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{editingCategory.name}</div>
                          <div className="text-sm text-gray-500">Icône actuelle</div>
                        </div>
                      </div>
                    </div>

                    {/* Grille d'icônes pour catégories */}
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                      {[
                        '🍽️', '🍕', '🍔', '🌯', '🥙', '🍗', '🥩', '🐟', '🦐', '🍝', '🍜', '🍛',
                        '🥗', '🥬', '🥒', '🍅', '🧅', '🥔', '🍟', '🥤', '☕', '🧃', '🍰', '🍨',
                        '🎂', '🍪', '🍩', '🧁', '🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🥥', '🍑',
                        '🌶️', '🌽', '🥕', '🥦', '🥒', '🍆', '🥑', '🍠', '🥜', '🌰', '🍞', '🥐',
                        '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🍳', '🥓', '🌭', '🥪', '🌮'
                      ].map((icon, index) => (
                        <button
                          key={`category-icon-${index}`}
                          onClick={() => saveCategoryIcon(editingCategory.id, icon)}
                          className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                            editingCategory.icon === icon
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                          title={`Sélectionner ${icon}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Options */}
              {activeModalTab === 'options' && (
                <div className="p-6">
                  {loadingOptions ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-green-600 bg-green-100">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Chargement des options...
                      </div>
                    </div>
                  ) : productOptions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">⚙️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune option trouvée</h3>
                      <p className="text-gray-600 mb-4">
                        Cette catégorie ne contient pas de produit composite avec options
                      </p>

                      {/* Panel debug */}
                      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                        <h4 className="font-medium text-green-900 mb-2">🔍 Informations de debug</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Catégorie :</strong> {editingCategory.name}</div>
                          <div><strong>ID Catégorie :</strong> {editingCategory.id}</div>
                          <div><strong>Restaurant ID :</strong> {editingCategory.restaurant_id}</div>
                          <div><strong>Produit composite :</strong> {editingProduct?.name || 'Non trouvé'}</div>
                          <div><strong>Loading options :</strong> {loadingOptions ? 'Oui' : 'Non'}</div>
                          <div><strong>Options trouvées :</strong> {productOptions.length}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => editingProduct && loadProductOptions(editingProduct.id)}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        🔄 Recharger les options
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Header avec informations */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          ⚙️ Options du {editingProduct?.name || 'produit composite'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {productOptions.length} options disponibles • Cliquez sur une icône pour la modifier
                        </p>
                      </div>

                      {/* Liste des options par groupe */}
                      <div className="space-y-6">
                        {productOptions.reduce((groups: any[], option) => {
                          const existingGroup = groups.find(g => g.name === option.option_group);
                          if (existingGroup) {
                            existingGroup.options.push(option);
                          } else {
                            groups.push({
                              name: option.option_group,
                              options: [option]
                            });
                          }
                          return groups;
                        }, []).map((group) => (
                          <div key={group.name} className="bg-gray-50 rounded-xl p-6">
                            {/* Header du groupe */}
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">
                                📋 {group.name}
                              </h4>
                              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                                {group.options.length} option{group.options.length > 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Options du groupe */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {group.options.map((option: ProductOption) => (
                                <div
                                  key={option.id}
                                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
                                >
                                  {/* Icône actuelle */}
                                  <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2">
                                      {option.icon || '❓'}
                                    </div>
                                    <h5 className="font-medium text-gray-900">{option.option_name}</h5>
                                    {option.price_modifier !== 0 && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {option.price_modifier > 0 ? '+' : ''}{option.price_modifier}€
                                      </p>
                                    )}
                                  </div>

                                  {/* Sélecteur d'icône */}
                                  <div className="grid grid-cols-6 gap-2">
                                    {[
                                      '🍗', '🥩', '🐟', '🦐', '🍖', '🥓',
                                      '🍛', '🍝', '🍜', '🥗', '🍞', '🥞',
                                      '🥤', '☕', '🧃', '🍺', '🥛', '💧',
                                      '🍕', '🍔', '🌯', '🥙', '🌮', '🥪'
                                    ].map((iconOption, index) => (
                                      <button
                                        key={index}
                                        onClick={() => saveOptionIcon(option.id, iconOption)}
                                        className={`p-2 text-lg rounded-md border transition-all hover:scale-110 ${
                                          option.icon === iconOption
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                        }`}
                                        title={`Appliquer ${iconOption} à ${option.option_name}`}
                                      >
                                        {iconOption}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Bulk Edit Icons */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">🎨 Édition en lot</h2>
                  <p className="text-orange-100 mt-1">
                    Appliquer une icône à {selectedProducts.length} produits
                  </p>
                </div>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-white hover:text-red-200 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {[
                  '🍽️', '🍕', '🍔', '🌯', '🥙', '🍗', '🥩', '🐟', '🦐', '🍝', '🍜', '🍛',
                  '🥗', '🥬', '🥒', '🍅', '🧅', '🥔', '🍟', '🥤', '☕', '🧃', '🍰', '🍨',
                  '🎂', '🍪', '🍩', '🧁', '🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🥥', '🍑',
                  '🌶️', '🌽', '🥕', '🥦', '🥒', '🍆', '🥑', '🍠', '🥜', '🌰', '🍞', '🥐',
                  '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🍳', '🥓', '🌭', '🥪', '🌮'
                ].map((icon, index) => (
                  <button
                    key={`bulk-icon-${index}`}
                    onClick={() => applyBulkIcon(icon)}
                    className="p-3 text-2xl rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all hover:scale-110"
                    title={`Appliquer ${icon} à ${selectedProducts.length} produits`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}