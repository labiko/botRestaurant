'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';

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
  country_code?: string;
  timezone?: string;
  currency?: string;
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

interface Icon {
  id: number;
  emoji: string;
  name: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Country {
  id: number;
  code: string;
  name: string;
  flag: string;
  phone_prefix: string;
  remove_leading_zero: boolean;
  phone_format: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Patterns de regex prédéfinis pour les pays (formats officiels vérifiés 2025)
const COMMON_PHONE_PATTERNS = {
  'FR': { pattern: '^0[1-9]\\d{8}$', example: '0612345678', description: 'France - 10 chiffres (01-05 fixe, 06-07 mobile)' },
  'GN': { pattern: '^[36]\\d{8}$', example: '613001718', description: 'Guinée - 9 chiffres (3 fixe, 6 mobile)' },
  'CI': { pattern: '^(01|05|07)\\d{8}$', example: '0712345678', description: 'Côte d\'Ivoire - 10 chiffres (01 Moov, 05 MTN, 07 Orange)' },
  'SN': { pattern: '^(33|7[067])\\d{7}$', example: '77123456', description: 'Sénégal - 9 chiffres (33 fixe, 70 Expresso, 76 Tigo, 77 Orange)' },
  'ML': { pattern: '^[679]\\d{7}$', example: '67123456', description: 'Mali - 8 chiffres (67 Orange, 9X Malitel)' },
  'BF': { pattern: '^7\\d{7}$', example: '75123456', description: 'Burkina Faso - 8 chiffres (75 Orange, 70-74 Moov, 78-79 Telecel)' }
};

export default function BackOfficeRestaurantPage() {
  const { fetch: fetchWithEnv } = useFetch();
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
  const [iconEditMode, setIconEditMode] = useState<'category' | 'product'>('category');
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

  // États pour la gestion vitrine
  const [selectedVitrineRestaurant, setSelectedVitrineRestaurant] = useState<number | null>(null);
  const [vitrineSettings, setVitrineSettings] = useState<any>(null);
  const [vitrineLoading, setVitrineLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // États pour la gestion des icônes (catalogue)
  const [icons, setIcons] = useState<Icon[]>([]);
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconForm, setIconForm] = useState({
    emoji: '',
    name: '',
    category: '',
    tags: ''
  });
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [vitrineExists, setVitrineExists] = useState<boolean>(false);
  const [showCreateVitrineSection, setShowCreateVitrineSection] = useState(false);

  // États pour la gestion des pays
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countryForm, setCountryForm] = useState<Partial<Country>>({});
  const [useCustomPattern, setUseCustomPattern] = useState(false);

  // États pour la gestion des boissons workflows
  const [boissonsStep, setBoissonsStep] = useState<1 | 2 | 3>(1);
  const [selectedBoissonsRestaurant, setSelectedBoissonsRestaurant] = useState<number | null>(null);
  const [boissonsProducts, setBoissonsProducts] = useState<any[]>([]);
  const [selectedBoissonsProducts, setSelectedBoissonsProducts] = useState<number[]>([]);
  const [loadingBoissonsProducts, setLoadingBoissonsProducts] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState<{ verification: string; execution: string } | null>(null);

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

  // Charger les icônes au démarrage
  useEffect(() => {
    console.log('🚀 [ICONS-DEBUG] useEffect - Chargement initial des icônes...');
    loadIcons();
  }, []);

  // Fonction helper pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string, details?: string) => {
    setNotification({ type, message, details });
  };

  // Charger les restaurants
  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetchWithEnv('/api/restaurants/management');
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
      longitude: restaurant.longitude,
      country_code: restaurant.country_code,
      timezone: restaurant.timezone,
      currency: restaurant.currency
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
      const response = await fetchWithEnv(`/api/restaurants/${restaurantId}/reset-password`, {
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
      const response = await fetchWithEnv(`/api/restaurants/${editingRestaurant.id}/update`, {
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
      const response = await fetchWithEnv(`/api/restaurants/${restaurantId}/status`, {
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
      const response = await fetchWithEnv(`/api/categories?restaurant_id=${restaurantId}`);
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
    setIconEditMode('category');

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

      const response = await fetchWithEnv(url);
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
      const response = await fetchWithEnv('/api/categories', {
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
      const response = await fetchWithEnv('/api/products/bulk', {
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
      const response = await fetchWithEnv('/api/products', {
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

  // Fonction unifiée pour sauvegarder les icônes
  const saveIcon = async (icon: string) => {
    if (iconEditMode === 'category') {
      await saveCategoryIcon(editingCategory?.id || 0, icon);
    } else if (iconEditMode === 'product' && editingProduct) {
      await saveProductIcon(editingProduct.id, icon);
      // Mettre à jour l'état local du produit en cours d'édition
      setEditingProduct(prev => prev ? { ...prev, icon } : prev);
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
      const response = await fetchWithEnv('/api/products/reorder', {
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
      const response = await fetchWithEnv(`/api/product-options?product_id=${productId}`);
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
      const response = await fetchWithEnv('/api/product-options', {
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

  // ===== FONCTIONS VITRINE =====

  // Vérifier si une vitrine existe et charger les paramètres
  const checkAndLoadVitrineSettings = async (restaurantId: number) => {
    setVitrineLoading(true);
    setVitrineExists(false);
    setShowCreateVitrineSection(false);
    setVitrineSettings(null);

    try {
      const response = await fetchWithEnv(`/api/restaurants/${restaurantId}/vitrine`);
      const data = await response.json();

      if (data.success && data.vitrine) {
        // Cas 2: Vitrine existe - Charger pour édition
        setVitrineExists(true);
        setVitrineSettings(data.vitrine);
        showNotification('info', 'Vitrine trouvée', 'Vous pouvez maintenant éditer cette vitrine existante');
      } else {
        // Cas 1: Pas de vitrine - Afficher section création
        setVitrineExists(false);
        setShowCreateVitrineSection(true);

        // Préparer les données depuis Pizza Yolo (restaurant source)
        const pizzaYolo = restaurants.find(r => r.name.toLowerCase().includes('pizza') && r.name.toLowerCase().includes('yolo'));
        if (pizzaYolo) {
          await loadPizzaYoloTemplate(restaurantId, pizzaYolo.id);
        } else {
          showNotification('warning', 'Restaurant source non trouvé', 'Impossible de trouver Pizza Yolo comme modèle');
        }
      }
    } catch (error) {
      console.error('Erreur vérification vitrine:', error);
      showNotification('error', 'Erreur', 'Impossible de vérifier l\'existence de la vitrine');
    } finally {
      setVitrineLoading(false);
    }
  };

  // Charger le template Pizza Yolo pour duplication
  const loadPizzaYoloTemplate = async (targetRestaurantId: number, pizzaYoloId: number) => {
    try {
      // Récupérer les paramètres vitrine de Pizza Yolo
      const response = await fetchWithEnv(`/api/restaurants/${pizzaYoloId}/vitrine`);
      const data = await response.json();

      const targetRestaurant = restaurants.find(r => r.id === targetRestaurantId);
      if (!targetRestaurant) return;

      let templateSettings;

      if (data.success && data.vitrine) {
        // Utiliser la vitrine existante de Pizza Yolo comme template
        templateSettings = { ...data.vitrine };
        delete templateSettings.id; // Supprimer l'ID pour créer une nouvelle entrée
      } else {
        // Valeurs par défaut si Pizza Yolo n'a pas de vitrine
        templateSettings = {
          primary_color: '#ff0000',
          secondary_color: '#cc0000',
          accent_color: '#ffc107',
          logo_emoji: '🍕',
          subtitle: 'Commandez en 30 secondes sur WhatsApp!',
          promo_text: '📱 100% DIGITAL SUR WHATSAPP',
          feature_1: JSON.stringify({ emoji: '🚀', text: 'Livraison rapide' }),
          feature_2: JSON.stringify({ emoji: '💯', text: 'Produits frais' }),
          feature_3: JSON.stringify({ emoji: '⭐', text: '4.8 étoiles' }),
          show_live_stats: true,
          average_rating: 4.8,
          delivery_time_min: 25,
          is_active: true
        };
      }

      // Adapter au restaurant cible
      const slug = targetRestaurant.name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      templateSettings.restaurant_id = targetRestaurantId;
      templateSettings.slug = `${slug}-${targetRestaurantId}`;

      // Définir comme template prêt à créer
      setVitrineSettings(templateSettings);
      setHasUnsavedChanges(true);

      showNotification('info', 'Template prêt', 'Les paramètres de Pizza Yolo ont été dupliqués. Modifiez si nécessaire puis cliquez sur "Créer Vitrine"');

    } catch (error) {
      console.error('Erreur chargement template Pizza Yolo:', error);
      showNotification('error', 'Erreur', 'Impossible de charger le template Pizza Yolo');
    }
  };


  // Sauvegarder les modifications ou créer une nouvelle vitrine
  const saveVitrineSettings = async () => {
    if (!vitrineSettings) return;

    try {
      let response;

      if (vitrineExists && vitrineSettings.id) {
        // Cas 2: Mise à jour d'une vitrine existante
        response = await fetchWithEnv(`/api/vitrine/${vitrineSettings.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vitrineSettings)
        });
      } else {
        // Cas 1: Création d'une nouvelle vitrine
        response = await fetchWithEnv('/api/vitrine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vitrineSettings)
        });
      }

      const data = await response.json();

      if (data.success) {
        if (!vitrineExists) {
          // Première création - mise à jour des états
          setVitrineSettings(data.vitrine);
          setVitrineExists(true);
          setShowCreateVitrineSection(false);
          showNotification('success', 'Vitrine créée', 'La nouvelle vitrine a été créée avec succès!');
        } else {
          // Mise à jour existante
          showNotification('success', 'Vitrine sauvegardée', 'Les modifications ont été enregistrées');
        }
        setHasUnsavedChanges(false);
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de sauvegarder');
      }
    } catch (error) {
      console.error('Erreur sauvegarde vitrine:', error);
      showNotification('error', 'Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  // Mettre à jour un champ vitrine
  const updateVitrineField = (field: string, value: any) => {
    setVitrineSettings((prev: any) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Mettre à jour une feature
  const updateFeature = (index: number, type: 'emoji' | 'text', value: string) => {
    const featureKey = `feature_${index}`;
    const currentFeature = vitrineSettings[featureKey] ? JSON.parse(vitrineSettings[featureKey]) : {};
    const updatedFeature = { ...currentFeature, [type]: value };

    setVitrineSettings((prev: any) => ({
      ...prev,
      [featureKey]: JSON.stringify(updatedFeature)
    }));
    setHasUnsavedChanges(true);
  };

  // Appliquer un preset de couleurs
  const applyColorPreset = (preset: string) => {
    const presets: any = {
      pizza: { primary: '#ff0000', secondary: '#cc0000', emoji: '🍕' },
      burger: { primary: '#ff6b35', secondary: '#f4501e', emoji: '🍔' },
      sushi: { primary: '#1a1a1a', secondary: '#333333', emoji: '🍣' },
      tacos: { primary: '#4caf50', secondary: '#388e3c', emoji: '🌮' }
    };

    const selected = presets[preset];
    if (selected) {
      setVitrineSettings((prev: any) => ({
        ...prev,
        primary_color: selected.primary,
        secondary_color: selected.secondary,
        logo_emoji: selected.emoji
      }));
      setHasUnsavedChanges(true);
    }
  };

  // Gérer la sélection d'un restaurant
  const handleVitrineRestaurantSelect = async (restaurantId: number) => {
    setSelectedVitrineRestaurant(restaurantId);
    setVitrineSettings(null);
    setHasUnsavedChanges(false);

    if (restaurantId) {
      await checkAndLoadVitrineSettings(restaurantId);
    }
  };

  // Copier le lien dans le presse-papiers
  const copyVitrineLink = async () => {
    if (!vitrineSettings?.slug) return;

    const url = `${window.location.origin}/vitrine/${vitrineSettings.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showNotification('success', 'Lien copié', 'Le lien de la vitrine a été copié dans le presse-papiers');
    } catch (error) {
      showNotification('error', 'Erreur', 'Impossible de copier le lien');
    }
  };

  // Fonctions pour la gestion du catalogue d'icônes
  const loadIcons = async () => {
    console.log('🔄 [ICONS-DEBUG] Début chargement des icônes...');
    setLoading(true);
    try {
      console.log('🔄 [ICONS-DEBUG] Appel API /api/icons...');
      const response = await fetchWithEnv('/api/icons');
      console.log('📡 [ICONS-DEBUG] Réponse API reçue:', response.status, response.ok);
      const data = await response.json();
      console.log('📋 [ICONS-DEBUG] Données reçues:', data);

      if (data.success) {
        console.log('✅ [ICONS-DEBUG] Succès ! Nombre d\'icônes:', data.icons?.length || 0);
        console.log('📊 [ICONS-DEBUG] Première icône:', data.icons?.[0]);
        console.log('🔍 [ICONS-DEBUG] Recherche icône ID 52 (Menu Famille)...');
        const menuFamille = data.icons?.find(icon => icon.id === 52);
        console.log('👨‍👩‍👧‍👦 [ICONS-DEBUG] Icône Menu Famille trouvée:', menuFamille);
        setIcons(data.icons || []);
      } else {
        console.error('❌ [ICONS-DEBUG] Échec API:', data.error);
        showNotification('error', 'Erreur', data.error || 'Impossible de charger les icônes');
      }
    } catch (error) {
      console.error('💥 [ICONS-DEBUG] Erreur chargement:', error);
      showNotification('error', 'Erreur', 'Impossible de charger les icônes');
    } finally {
      console.log('🏁 [ICONS-DEBUG] Fin chargement des icônes');
      setLoading(false);
    }
  };

  const createIcon = async () => {
    if (!iconForm.emoji || !iconForm.name || !iconForm.category) {
      showNotification('error', 'Champs requis', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetchWithEnv('/api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji: iconForm.emoji,
          name: iconForm.name,
          category: iconForm.category,
          tags: iconForm.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Icône créée', 'L\'icône a été ajoutée au catalogue');
        setShowIconModal(false);
        setIconForm({ emoji: '', name: '', category: '', tags: '' });
        loadIcons();
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de créer l\'icône');
      }
    } catch (error) {
      showNotification('error', 'Erreur', 'Impossible de créer l\'icône');
    }
  };

  // Fonctions pour la gestion des boissons workflows
  const loadBoissonsProducts = async (restaurantId: number) => {
    setLoadingBoissonsProducts(true);
    try {
      const response = await fetchWithEnv(`/api/boissons-workflows/list-products?restaurant_id=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setBoissonsProducts(data.products || []);
        if (data.products.length === 0) {
          showNotification('info', 'Aucun produit', 'Aucun produit avec step "Boissons" trouvé pour ce restaurant');
        }
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de charger les produits');
        setBoissonsProducts([]);
      }
    } catch (error) {
      console.error('Erreur chargement produits boissons:', error);
      showNotification('error', 'Erreur', 'Impossible de charger les produits');
      setBoissonsProducts([]);
    } finally {
      setLoadingBoissonsProducts(false);
    }
  };

  const generateBoissonsSQL = async () => {
    if (!selectedBoissonsRestaurant || selectedBoissonsProducts.length === 0) {
      showNotification('error', 'Données manquantes', 'Restaurant et produits requis');
      return;
    }

    setLoadingPreview(true);
    try {
      const response = await fetchWithEnv('/api/boissons-workflows/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: selectedBoissonsRestaurant,
          product_ids: selectedBoissonsProducts
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedSQL({
          verification: data.verification,
          execution: data.execution
        });
        showNotification('success', 'Scripts générés', `${data.boissons_count} boissons pour ${data.products_count} produit(s)`);
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de générer les scripts SQL');
      }
    } catch (error) {
      console.error('Erreur génération SQL:', error);
      showNotification('error', 'Erreur', 'Impossible de générer les scripts SQL');
    } finally {
      setLoadingPreview(false);
    }
  };

  const deleteIcon = async (id: number) => {
    if (!confirm('Supprimer cette icône du catalogue ?')) return;

    try {
      const response = await fetchWithEnv(`/api/icons/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Icône supprimée', 'L\'icône a été retirée du catalogue');
        loadIcons();
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de supprimer l\'icône');
      }
    } catch (error) {
      showNotification('error', 'Erreur', 'Impossible de supprimer l\'icône');
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (activeTab === 'catalogue') {
      loadIcons();
    }
    if (activeTab === 'countries') {
      loadCountries();
    }
  }, [activeTab]);

  // ===== FONCTIONS GESTION PAYS =====

  // Charger la liste des pays
  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetchWithEnv('/api/countries');
      const data = await response.json();

      if (data.success) {
        setCountries(data.countries);
      } else {
        showNotification('error', 'Erreur', 'Impossible de charger les pays');
      }
    } catch (error) {
      showNotification('error', 'Erreur', 'Erreur de connexion');
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fonction helper pour détecter si un pattern est prédéfini
  const detectPredefinedPattern = (pattern: string) => {
    const found = Object.entries(COMMON_PHONE_PATTERNS).find(
      ([code, info]) => info.pattern === pattern
    );
    return found ? found[0] : null;
  };

  // Ouvrir modal d'ajout de pays
  const openAddCountryModal = () => {
    setEditingCountry(null);
    setCountryForm({
      code: '',
      name: '',
      flag: '',
      phone_prefix: '',
      remove_leading_zero: false,
      phone_format: '',
      is_active: true,
      display_order: 0
    });
    setUseCustomPattern(false);
    setShowCountryModal(true);
  };

  // Ouvrir modal d'édition de pays
  const openEditCountryModal = (country: Country) => {
    setEditingCountry(country);
    setCountryForm({ ...country });

    // Détecter si le pattern actuel est prédéfini ou custom
    const predefinedCode = detectPredefinedPattern(country.phone_format);
    setUseCustomPattern(!predefinedCode);

    setShowCountryModal(true);
  };

  // Sauvegarder un pays
  const saveCountry = async () => {
    try {
      const url = editingCountry
        ? `/api/countries/${editingCountry.id}`
        : '/api/countries';

      const method = editingCountry ? 'PUT' : 'POST';

      const response = await fetchWithEnv(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(countryForm)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success',
          editingCountry ? 'Pays modifié' : 'Pays ajouté',
          'Le pays a été sauvegardé avec succès'
        );
        setShowCountryModal(false);
        loadCountries();
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de sauvegarder');
      }
    } catch (error) {
      showNotification('error', 'Erreur', 'Erreur de connexion');
    }
  };

  // Basculer le statut actif d'un pays
  const toggleCountryStatus = async (country: Country) => {
    try {
      const response = await fetchWithEnv(`/api/countries/${country.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...country, is_active: !country.is_active })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success',
          'Statut modifié',
          `Le pays ${country.name} est maintenant ${!country.is_active ? 'actif' : 'inactif'}`
        );
        loadCountries();
      } else {
        showNotification('error', 'Erreur', 'Impossible de modifier le statut');
      }
    } catch (error) {
      showNotification('error', 'Erreur', 'Erreur de connexion');
    }
  };

  // Supprimer un pays
  const deleteCountry = async (country: Country) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le pays ${country.name} ?`)) {
      return;
    }

    try {
      const response = await fetchWithEnv(`/api/countries/${country.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Pays supprimé', 'Le pays a été supprimé avec succès');
        loadCountries();
      } else {
        showNotification('error', 'Erreur', data.error || 'Impossible de supprimer');
      }
    } catch (error) {
      showNotification('error', 'Erreur', 'Erreur de connexion');
    }
  };

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
            <button
              onClick={() => setActiveTab('catalogue')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catalogue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🗂️ Catalogue Icônes
            </button>
            <button
              onClick={() => setActiveTab('vitrine')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vitrine'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🌐 Gestion Vitrine
            </button>
            <button
              onClick={() => setActiveTab('countries')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'countries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🌍 Gestion Pays
            </button>
            <button
              onClick={() => setActiveTab('boissons-workflows')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'boissons-workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🥤 Gestion Boissons Workflows
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

                {/* Country Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌍 Code pays
                  </label>
                  <select
                    value={editForm.country_code || 'FR'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, country_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="FR">🇫🇷 France (FR)</option>
                    <option value="GN">🇬🇳 Guinée (GN)</option>
                    <option value="SN">🇸🇳 Sénégal (SN)</option>
                    <option value="ML">🇲🇱 Mali (ML)</option>
                    <option value="TG">🇹🇬 Togo (TG)</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Devise
                  </label>
                  <select
                    value={editForm.currency || 'EUR'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="GNF">🇬🇳 Franc Guinéen (GNF)</option>
                    <option value="XOF">🇸🇳 Franc CFA (XOF)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Devise utilisée pour l'affichage des prix dans le bot WhatsApp
                  </p>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🕒 Fuseau horaire
                  </label>
                  <select
                    value={editForm.timezone || 'Europe/Paris'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Europe/Paris">🇫🇷 Europe/Paris (UTC+1)</option>
                    <option value="Africa/Conakry">🇬🇳 Africa/Conakry (UTC+0)</option>
                    <option value="Africa/Dakar">🇸🇳 Africa/Dakar (UTC+0)</option>
                    <option value="Africa/Bamako">🇲🇱 Africa/Bamako (UTC+0)</option>
                    <option value="Africa/Lome">🇹🇬 Africa/Lome (UTC+0)</option>
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
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    setEditingProduct(null);
                    setIconEditMode('category'); // Reset au mode catégorie par défaut
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
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Modifier les icônes
                      </h3>

                      {/* Toggle simple entre catégorie et produit - Toujours visible */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-1 rounded-lg">
                          <button
                            onClick={() => setIconEditMode('category')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              iconEditMode === 'category'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            🏷️ Catégorie
                          </button>
                          <button
                            onClick={() => {
                              setIconEditMode('product');
                              setEditingProduct(null); // Réinitialiser pour afficher la liste
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              iconEditMode === 'product'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            📦 Produits
                          </button>
                        </div>
                      </div>

                      {/* Affichage conditionnel selon le mode */}
                      {iconEditMode === 'category' ? (
                        /* Mode Catégorie - Affichage de l'icône de la catégorie */
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-8 max-w-md mx-auto">
                          <div className="text-center">
                            <div className="text-8xl mb-4">
                              {editingCategory.icon || '❓'}
                            </div>
                            <div className="font-medium text-gray-900 mb-1">
                              {editingCategory.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Icône de la catégorie
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Mode Produit - Affichage de la liste des produits ou du produit sélectionné */
                        <>
                          {!editingProduct ? (
                            /* Liste des produits pour sélection */
                            <div className="mb-8">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                📦 Sélectionnez un produit
                              </h4>
                              {loadingProducts ? (
                                <div className="text-center py-8">
                                  <div className="inline-flex items-center px-4 py-2 font-semibold text-sm text-purple-600">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Chargement des produits...
                                  </div>
                                </div>
                              ) : categoryProducts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  Aucun produit dans cette catégorie
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                                  {categoryProducts.map((product) => (
                                    <button
                                      key={product.id}
                                      onClick={() => setEditingProduct(product)}
                                      className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all"
                                    >
                                      <div className="text-4xl mb-2">
                                        {product.icon || '❓'}
                                      </div>
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {product.price_on_site_base}€
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Produit sélectionné - Affichage de l'icône du produit */
                            <div>
                              <div className="bg-white border-2 border-green-200 rounded-xl p-8 mb-4 max-w-md mx-auto">
                                <div className="text-center">
                                  <div className="text-8xl mb-4">
                                    {editingProduct.icon || '❓'}
                                  </div>
                                  <div className="font-medium text-gray-900 mb-1">
                                    {editingProduct.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Icône du produit
                                  </div>
                                </div>
                              </div>
                              <div className="text-center mb-8">
                                <button
                                  onClick={() => setEditingProduct(null)}
                                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                                >
                                  ← Retour à la liste des produits
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Sélection d'icônes unifiée - Affichée seulement quand on a sélectionné ce qu'on veut modifier */}
                    {(iconEditMode === 'category' || (iconEditMode === 'product' && editingProduct)) && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          {iconEditMode === 'product' ? '📦 Choisir l\'icône du produit' : '🏷️ Choisir l\'icône de la catégorie'}
                        </h4>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-xl">
                        {icons.map((iconData, index) => (
                          <button
                            key={`unified-icon-${iconData.id}`}
                            onClick={() => saveIcon(iconData.emoji)}
                            className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                              (iconEditMode === 'product' && editingProduct ? editingProduct.icon : editingCategory.icon) === iconData.emoji
                                ? 'border-blue-500 bg-blue-100'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                            title={`Appliquer ${iconData.emoji} ${iconData.name} à la catégorie`}
                          >
                            {iconData.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    )}

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
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                                    {icons.map((iconData, index) => (
                                      <button
                                        key={`option-icon-${iconData.id}-${index}`}
                                        onClick={() => saveOptionIcon(option.id, iconData.emoji)}
                                        className={`p-2 text-lg rounded-md border transition-all hover:scale-110 ${
                                          option.icon === iconData.emoji
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                        }`}
                                        title={`Appliquer ${iconData.emoji} ${iconData.name} à ${option.option_name}`}
                                      >
                                        {iconData.emoji}
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

      {/* Tab Catalogue Icônes */}
      {activeTab === 'catalogue' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">🗂️ Catalogue d'Icônes</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {icons.length} icônes disponibles
                </p>
              </div>
              <button
                onClick={() => setShowIconModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ➕ Créer une icône
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement...</p>
            </div>
          ) : icons.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>Aucune icône dans le catalogue</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icône</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {icons.map((icon) => (
                    <tr key={icon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-2xl">
                        {icon.emoji}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{icon.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {icon.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {icon.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteIcon(icon.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Gestion Vitrine */}
      {activeTab === 'vitrine' && (
        <div className="space-y-6">
          {/* Header avec sélection restaurant */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🌐 Gestion Page Vitrine</h2>

            {/* Dropdown sélection restaurant */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un restaurant
              </label>
              <select
                value={selectedVitrineRestaurant || ''}
                onChange={(e) => handleVitrineRestaurantSelect(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choisir un restaurant --</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - {restaurant.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Lien public si vitrine existe */}
            {vitrineExists && vitrineSettings && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Lien public :</p>
                    <a
                      href={`/vitrine/${vitrineSettings.slug}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {typeof window !== 'undefined' ? window.location.origin : ''}/vitrine/{vitrineSettings.slug}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyVitrineLink}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📋 Copier
                    </button>
                    <button
                      onClick={() => window.open(`/vitrine/${vitrineSettings.slug}`, '_blank')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      👁️ Voir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section création de vitrine - Cas 1: Pas de vitrine */}
          {selectedVitrineRestaurant && showCreateVitrineSection && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune vitrine trouvée pour ce restaurant
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Cette restaurant n'a pas encore de page vitrine. Vous pouvez en créer une en utilisant le modèle de Pizza Yolo.
                  </p>
                </div>

                {vitrineLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Préparation du template...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vitrineSettings && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">Aperçu des paramètres (basés sur Pizza Yolo) :</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p><strong>Couleur principale :</strong> {vitrineSettings.primary_color}</p>
                          <p><strong>Logo :</strong> {vitrineSettings.logo_emoji}</p>
                          <p><strong>Sous-titre :</strong> {vitrineSettings.subtitle}</p>
                          <p><strong>URL :</strong> /vitrine/{vitrineSettings.slug}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={saveVitrineSettings}
                      disabled={!vitrineSettings}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✨ Créer la vitrine pour ce restaurant
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenu principal - Cas 2: Vitrine existe */}
          {selectedVitrineRestaurant && vitrineExists && vitrineSettings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panneau gauche - Éditeur */}
              <div className="space-y-4">
                {/* Section Couleurs */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    🎨 Personnalisation Couleurs
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur Principale
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={vitrineSettings?.primary_color || '#ff0000'}
                          onChange={(e) => updateVitrineField('primary_color', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={vitrineSettings?.primary_color || '#ff0000'}
                          onChange={(e) => updateVitrineField('primary_color', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded"
                          placeholder="#ff0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur Secondaire
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={vitrineSettings?.secondary_color || '#cc0000'}
                          onChange={(e) => updateVitrineField('secondary_color', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={vitrineSettings?.secondary_color || '#cc0000'}
                          onChange={(e) => updateVitrineField('secondary_color', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded"
                          placeholder="#cc0000"
                        />
                      </div>
                    </div>

                    {/* Presets de couleurs */}
                    <div className="pt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Thèmes rapides :</p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => applyColorPreset('pizza')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          🍕 Pizza
                        </button>
                        <button
                          onClick={() => applyColorPreset('burger')}
                          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
                        >
                          🍔 Burger
                        </button>
                        <button
                          onClick={() => applyColorPreset('sushi')}
                          className="px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 transition-colors"
                        >
                          🍣 Sushi
                        </button>
                        <button
                          onClick={() => applyColorPreset('tacos')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          🌮 Tacos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Contenu */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">📝 Contenu</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Emoji
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {['🍕', '🍔', '🌮', '🍣', '🥙', '🍗', '🍝', '🥗', '🍟', '🥤', '☕', '🧃'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => updateVitrineField('logo_emoji', emoji)}
                            className={`text-3xl p-2 rounded border-2 transition-all ${
                              vitrineSettings?.logo_emoji === emoji
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={vitrineSettings?.subtitle || ''}
                        onChange={(e) => updateVitrineField('subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Commandez en 30 secondes sur WhatsApp!"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte Promo
                      </label>
                      <input
                        type="text"
                        value={vitrineSettings?.promo_text || ''}
                        onChange={(e) => updateVitrineField('promo_text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="📱 100% DIGITAL SUR WHATSAPP"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Features */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">✨ Points Forts</h3>

                  {[1, 2, 3].map(index => {
                    const feature = vitrineSettings?.[`feature_${index}`]
                      ? JSON.parse(vitrineSettings[`feature_${index}`])
                      : { emoji: '', text: '' };

                    return (
                      <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-2">Feature {index}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={feature.emoji || ''}
                            onChange={(e) => updateFeature(index, 'emoji', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                            placeholder="🚀"
                          />
                          <input
                            type="text"
                            value={feature.text || ''}
                            onChange={(e) => updateFeature(index, 'text', e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Livraison rapide"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <button
                    onClick={saveVitrineSettings}
                    disabled={!hasUnsavedChanges}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasUnsavedChanges
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    💾 {vitrineExists ? 'Sauvegarder' : 'Créer Vitrine'}
                  </button>
                  <button
                    onClick={() => {
                      setVitrineSettings(null);
                      setHasUnsavedChanges(false);
                      loadVitrineSettings(selectedVitrineRestaurant);
                    }}
                    disabled={!hasUnsavedChanges}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      hasUnsavedChanges
                        ? 'border-gray-300 hover:bg-gray-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ↩️ Annuler
                  </button>
                </div>
              </div>

              {/* Panneau droite - Preview */}
              <div className="sticky top-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">👁️ Aperçu</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`px-3 py-1 rounded transition-colors ${
                          previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        📱
                      </button>
                      <button
                        onClick={() => setPreviewMode('tablet')}
                        className={`px-3 py-1 rounded transition-colors ${
                          previewMode === 'tablet' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        📱
                      </button>
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`px-3 py-1 rounded transition-colors ${
                          previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        💻
                      </button>
                    </div>
                  </div>

                  {/* Preview iframe placeholder */}
                  <div className={`
                    border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50
                    ${previewMode === 'mobile' ? 'w-[375px] h-[667px] mx-auto' : ''}
                    ${previewMode === 'tablet' ? 'w-full h-[600px]' : ''}
                    ${previewMode === 'desktop' ? 'w-full h-[700px]' : ''}
                  `}>
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔄</div>
                        <p>Preview en cours de développement</p>
                        <p className="text-sm mt-2">
                          Utilisez le bouton "👁️ Voir" pour ouvrir la vitrine
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Indicateur modifications */}
                  {hasUnsavedChanges && (
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Modifications non sauvegardées
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* État de chargement */}
          {vitrineLoading && selectedVitrineRestaurant && (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement des paramètres vitrine...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Gestion Boissons Workflows */}
      {activeTab === 'boissons-workflows' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🥤 Gestion Boissons Workflows</h2>
            <p className="text-gray-600">
              Remplacer automatiquement les boissons des workflows par les boissons standardisées (33cl)
            </p>
          </div>

          {/* Indicateur d'étapes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    boissonsStep === step
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : boissonsStep > step
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {boissonsStep > step ? '✓' : step}
                  </div>
                  <div className={`ml-3 ${boissonsStep === step ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    {step === 1 && 'Restaurant'}
                    {step === 2 && 'Produits'}
                    {step === 3 && 'SQL & Vérification'}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${boissonsStep > step ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Étape 1 : Sélection du restaurant */}
          {boissonsStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Étape 1 : Sélectionner un restaurant</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant
                  </label>
                  <select
                    value={selectedBoissonsRestaurant || ''}
                    onChange={(e) => setSelectedBoissonsRestaurant(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Sélectionner un restaurant --</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name} ({restaurant.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!selectedBoissonsRestaurant) {
                        showNotification('warning', 'Restaurant requis', 'Veuillez sélectionner un restaurant');
                        return;
                      }
                      setBoissonsStep(2);
                      loadBoissonsProducts(selectedBoissonsRestaurant);
                    }}
                    disabled={!selectedBoissonsRestaurant}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      selectedBoissonsRestaurant
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Sélection des produits */}
          {boissonsStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Étape 2 : Sélectionner les produits</h3>

              {loadingBoissonsProducts ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement des produits...
                  </div>
                </div>
              ) : boissonsProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <p>Aucun produit avec step "Boissons" trouvé pour ce restaurant.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Sélectionnez les produits dont vous souhaitez remplacer les boissons par les boissons standardisées (33cl)
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            <input
                              type="checkbox"
                              checked={selectedBoissonsProducts.length === boissonsProducts.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBoissonsProducts(boissonsProducts.map(p => p.id));
                                } else {
                                  setSelectedBoissonsProducts([]);
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Produit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Options Boissons
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {boissonsProducts.map((product) => (
                          <tr key={product.id} className={selectedBoissonsProducts.includes(product.id) ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedBoissonsProducts.includes(product.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBoissonsProducts([...selectedBoissonsProducts, product.id]);
                                  } else {
                                    setSelectedBoissonsProducts(selectedBoissonsProducts.filter(id => id !== product.id));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{product.category_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{product.boissons_count} option(s)</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setBoissonsStep(1)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={async () => {
                        if (selectedBoissonsProducts.length === 0) {
                          showNotification('warning', 'Produits requis', 'Veuillez sélectionner au moins un produit');
                          return;
                        }
                        setBoissonsStep(3);
                        await generateBoissonsSQL();
                      }}
                      disabled={selectedBoissonsProducts.length === 0}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        selectedBoissonsProducts.length > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Suivant →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Étape 3 : Prévisualisation et génération SQL */}
          {boissonsStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Étape 3 : Scripts SQL</h3>

              <div className="space-y-6">
                {/* Script de vérification */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-medium text-gray-900">1️⃣ Script de vérification</h4>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(generatedSQL?.verification || '');
                          showNotification('success', 'Copié', 'Script de vérification copié dans le presse-papiers');
                        } catch (error) {
                          showNotification('error', 'Erreur', 'Impossible de copier dans le presse-papiers');
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      📋 Copier
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Exécutez ce script en premier pour visualiser les boissons actuelles qui seront remplacées
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-xs">
                      {generatedSQL?.verification || '-- Génération en cours...'}
                    </pre>
                  </div>
                </div>

                {/* Script d'exécution */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-medium text-gray-900">2️⃣ Script d'exécution</h4>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(generatedSQL?.execution || '');
                          showNotification('success', 'Copié', 'Script d\'exécution copié dans le presse-papiers');
                        } catch (error) {
                          showNotification('error', 'Erreur', 'Impossible de copier dans le presse-papiers');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      📋 Copier
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    ⚠️ Exécutez ce script uniquement après avoir vérifié les résultats du script de vérification
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-xs">
                      {generatedSQL?.execution || '-- Génération en cours...'}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setBoissonsStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => {
                      // Reset tout
                      setBoissonsStep(1);
                      setSelectedBoissonsRestaurant(null);
                      setBoissonsProducts([]);
                      setSelectedBoissonsProducts([]);
                      setGeneratedSQL(null);
                      showNotification('success', 'Réinitialisé', 'Vous pouvez recommencer le processus');
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✓ Terminer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Gestion Pays */}
      {activeTab === 'countries' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🌍 Gestion des Pays</h2>
              <button
                onClick={openAddCountryModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                ➕ Ajouter un pays
              </button>
            </div>
            <p className="text-gray-600">Gérer les pays supportés par l'application</p>
          </div>

          {/* Liste des pays */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loadingCountries ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement des pays...
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pays
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Préfixe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {countries.map((country) => (
                      <tr key={country.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{country.flag}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {country.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Ordre: {country.display_order}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {country.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          +{country.phone_prefix}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>Format: {country.phone_format}</div>
                            <div className="text-xs">
                              {country.remove_leading_zero ? '🔄 Supprimer 0 initial' : '➡️ Garder tel quel'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleCountryStatus(country)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              country.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {country.is_active ? '✅ Actif' : '❌ Inactif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditCountryModal(country)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => deleteCountry(country)}
                              className="text-red-600 hover:text-red-900"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {countries.length === 0 && !loadingCountries && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">🌍 Aucun pays configuré</p>
                      <p className="text-sm">Ajoutez votre premier pays pour commencer</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ajout/Édition Pays */}
      {showCountryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingCountry ? '✏️ Modifier le pays' : '➕ Ajouter un pays'}
                </h2>
                <button
                  onClick={() => setShowCountryModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Code pays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code pays * (ex: FR, GN, CI)
                  </label>
                  <input
                    type="text"
                    value={countryForm.code || ''}
                    onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                    maxLength={2}
                    placeholder="FR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du pays *
                  </label>
                  <input
                    type="text"
                    value={countryForm.name || ''}
                    onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                    placeholder="France"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Flag */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drapeau * (emoji)
                  </label>
                  <input
                    type="text"
                    value={countryForm.flag || ''}
                    onChange={(e) => setCountryForm({ ...countryForm, flag: e.target.value })}
                    placeholder="🇫🇷"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Préfixe téléphonique */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Préfixe téléphonique * (ex: 33, 224)
                  </label>
                  <input
                    type="text"
                    value={countryForm.phone_prefix || ''}
                    onChange={(e) => setCountryForm({ ...countryForm, phone_prefix: e.target.value })}
                    placeholder="33"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Format téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format de validation du téléphone *
                </label>

                {/* Toggle Pattern prédéfini / Custom */}
                <div className="mb-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!useCustomPattern}
                        onChange={() => setUseCustomPattern(false)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Pattern prédéfini</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={useCustomPattern}
                        onChange={() => setUseCustomPattern(true)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Saisie manuelle</span>
                    </label>
                  </div>
                </div>

                {!useCustomPattern ? (
                  // Select avec patterns prédéfinis
                  <div>
                    <select
                      value={detectPredefinedPattern(countryForm.phone_format || '') || ''}
                      onChange={(e) => {
                        const selectedCode = e.target.value;
                        if (selectedCode && COMMON_PHONE_PATTERNS[selectedCode]) {
                          setCountryForm({
                            ...countryForm,
                            phone_format: COMMON_PHONE_PATTERNS[selectedCode].pattern
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner un pattern...</option>
                      {Object.entries(COMMON_PHONE_PATTERNS).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.description} - Ex: {info.example}
                        </option>
                      ))}
                    </select>

                    {/* Affichage du regex sélectionné */}
                    {countryForm.phone_format && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border">
                        <span className="text-xs text-gray-600">Regex généré:</span>
                        <code className="block text-sm font-mono text-gray-800 mt-1">
                          {countryForm.phone_format}
                        </code>
                      </div>
                    )}
                  </div>
                ) : (
                  // Saisie manuelle
                  <div>
                    <input
                      type="text"
                      value={countryForm.phone_format || ''}
                      onChange={(e) => setCountryForm({ ...countryForm, phone_format: e.target.value })}
                      placeholder="^0[1-9]\d{8}$"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Utilisez une expression régulière valide (ex: ^0[1-9]\d{8}$ pour la France)
                    </p>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={countryForm.display_order || 0}
                    onChange={(e) => setCountryForm({ ...countryForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={countryForm.remove_leading_zero || false}
                      onChange={(e) => setCountryForm({ ...countryForm, remove_leading_zero: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Supprimer le 0 initial
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCountryModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={saveCountry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCountry ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Icône */}
      {showIconModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">➕ Créer une icône</h2>
                <button
                  onClick={() => {
                    setShowIconModal(false);
                    setIconForm({ emoji: '', name: '', category: '', tags: '' });
                  }}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emoji *
                </label>
                <input
                  type="text"
                  value={iconForm.emoji}
                  onChange={(e) => setIconForm({ ...iconForm, emoji: e.target.value })}
                  placeholder="🍕"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-2xl"
                  maxLength={2}
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={iconForm.name}
                  onChange={(e) => setIconForm({ ...iconForm, name: e.target.value })}
                  placeholder="Pizza"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={iconForm.category}
                  onChange={(e) => setIconForm({ ...iconForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="🍕 Nourriture">🍕 Nourriture</option>
                  <option value="🥤 Boissons">🥤 Boissons</option>
                  <option value="🍰 Desserts">🍰 Desserts</option>
                  <option value="🎉 Événement">🎉 Événement</option>
                  <option value="⚙️ Divers">⚙️ Divers</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (séparés par virgules)
                </label>
                <input
                  type="text"
                  value={iconForm.tags}
                  onChange={(e) => setIconForm({ ...iconForm, tags: e.target.value })}
                  placeholder="italien, restaurant, menu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Ex: italien, restaurant, menu</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowIconModal(false);
                  setIconForm({ emoji: '', name: '', category: '', tags: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={createIcon}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}