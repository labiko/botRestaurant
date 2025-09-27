// 🎯 PAGE PRINCIPALE - MENU AI ADMIN
// ====================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryEditModal from '@/components/CategoryEditModal';
import ProdConfirmModal from '@/components/ProdConfirmModal';
import RestaurantDeletion from '@/components/RestaurantDeletion';
import { Restaurant } from '@/lib/types';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { TimezoneService } from '@/lib/timezone-service';

interface AIResponse {
  success: boolean;
  sql?: string;
  explanation?: string;
  preview?: {
    action: string;
    sourceProduct?: any;
    newProduct?: any;
    category?: any;
  };
  error?: string;
  confidence: number;
  executed?: boolean;
  environment?: string;
}

function MenuAIAdminContent() {
  const searchParams = useSearchParams();
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [environment, setEnvironment] = useState<'DEV' | 'PROD'>('DEV');
  const [copied, setCopied] = useState(false);

  // Mode interface avec Édition Moderne réactivée
  const [mode, setMode] = useState<'command' | 'list' | 'modal'>('modal');
  const [activeSection, setActiveSection] = useState<string>('');
  const [categoryName, setCategoryName] = useState('');
  const [originalList, setOriginalList] = useState('');
  const [modifiedList, setModifiedList] = useState('');
  const [categoryData, setCategoryData] = useState<any>(null);

  // États pour la modale d'édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<any>(null);
  const [modalProducts, setModalProducts] = useState<any[]>([]);

  // NOUVEAUX ÉTATS pour les onglets d'édition (ajout non-intrusif)
  const [activeEditTab, setActiveEditTab] = useState<'edit' | 'duplicate' | 'delete'>('edit');
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [duplicateSourceRestaurant, setDuplicateSourceRestaurant] = useState<any>(null);
  const [duplicateSourceCategory, setDuplicateSourceCategory] = useState<any>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // États pour feedback et notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    details?: string;
  } | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // États pour modal de confirmation suppression catégorie
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Auto-masquage des notifications
  useEffect(() => {
    if (notification && notification.type !== 'info') {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // 5 secondes

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // États pour l'historique des scripts
  const [scripts, setScripts] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // États pour la modale PROD
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [selectedProdScript, setSelectedProdScript] = useState<any>(null);
  const [prodExecuting, setProdExecuting] = useState(false);

  // NOUVEAUX ÉTATS POUR LES RESTAURANTS
  const { selectedRestaurant, restaurants, setRestaurants, setSelectedRestaurant } = useRestaurant();
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // NOUVEAUX ÉTATS POUR LE CLONAGE DE RESTAURANTS
  const [sourceRestaurant, setSourceRestaurant] = useState<Restaurant | null>(null);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantData, setNewRestaurantData] = useState({
    address: '',
    phone: '',
    city: '',
    deliveryZone: 5,
    deliveryFee: 2.50
  });
  const [menuData, setMenuData] = useState('');
  const [cloneResult, setCloneResult] = useState<any>(null);
  const [cloningLoading, setCloningLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!command.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, restaurantId: selectedRestaurant?.id || 1 })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur de connexion au serveur',
        confidence: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!result?.sql) return;

    setLoading(true);
    try {
      // 1. Sauvegarder dans l'historique AVANT exécution
      console.log('🔄 [DEBUG] Début sauvegarde historique...');
      console.log('🔄 [DEBUG] Script SQL:', result.sql);
      console.log('🔄 [DEBUG] Command source:', command || 'Modification manuelle');

      try {
        const savePayload = {
          script_sql: result.sql,
          command_source: command || 'Modification manuelle',
          ai_explanation: result.explanation || 'Script généré',
          category_name: result.preview?.category || 'Modification'
        };

        console.log('🔄 [DEBUG] Payload sauvegarde:', savePayload);

        const saveResponse = await fetch('/api/scripts-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload)
        });

        console.log('🔄 [DEBUG] Response status sauvegarde:', saveResponse.status);

        const saveData = await saveResponse.json();
        console.log('🔄 [DEBUG] Response data sauvegarde:', saveData);

        if (saveData.success) {
          console.log('✅ [DEBUG] Sauvegarde historique réussie');
        } else {
          console.error('❌ [DEBUG] Échec sauvegarde historique:', saveData.error);
        }
      } catch (saveError) {
        console.error('⚠️ [DEBUG] Erreur sauvegarde historique:', saveError);
      }

      // 2. Exécution automatique en DEV (plan mis à jour)
      console.log('🔄 [DEBUG] Début exécution SQL...');

      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: result.sql,
          environment: 'DEV' // Toujours DEV selon le nouveau plan
        })
      });

      console.log('🔄 [DEBUG] Response status exécution:', response.status);

      const data = await response.json();
      console.log('🔄 [DEBUG] Response data exécution:', data);

      if (data.success) {
        console.log('✅ [DEBUG] Exécution SQL réussie');
        setResult({ ...result, executed: true, environment: 'DEV' });
        setCommand('');
        // 3. Recharger l'historique pour afficher le nouveau script
        console.log('🔄 [DEBUG] showHistory:', showHistory);
        if (showHistory) {
          console.log('🔄 [DEBUG] Rechargement historique...');
          await loadScriptsHistory();
        }
      } else {
        console.error('❌ [DEBUG] Échec exécution SQL:', data.error);
        setResult({ ...result, error: data.error });
      }
    } catch (error) {
      console.error('Erreur exécution:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = async () => {
    if (!result?.sql) return;

    try {
      await navigator.clipboard.writeText(result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  // Nouvelle fonction : Charger une catégorie
  const handleLoadCategory = async () => {
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/load-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: categoryName.trim(),
          restaurantId: selectedRestaurant?.id || 1  // 🔧 CORRECTION: Utiliser le restaurant sélectionné
        })
      });

      const data = await response.json();
      if (data.success) {
        setCategoryData(data);
        setOriginalList(data.productList);
        setModifiedList(data.productList);
      } else {
        setResult({ ...result, error: data.error } as any);
      }
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' } as any);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction : Analyser les différences
  const handleAnalyzeList = async () => {
    if (!originalList || !modifiedList || !categoryData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalList,
          modifiedList,
          categoryId: categoryData.category.id,
          restaurantId: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        // Convertir la réponse au format attendu
        const sqlStatements = data.changes?.map((change: any) => change.sql).join(';\n') || '';
        setResult({
          success: true,
          sql: sqlStatements,
          explanation: data.summary,
          preview: {
            action: `${data.changes?.length || 0} changement(s) détecté(s)`,
            changes: data.changes
          },
          confidence: data.confidence
        } as any);
      } else {
        setResult({ ...result, error: data.error } as any);
      }
    } catch (error) {
      console.error('Erreur analyse liste:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' } as any);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction : Ouvrir modale d'édition
  const handleOpenModal = async () => {
    if (!categoryName.trim()) return;

    // 🔍 DEBUG: Logs avant ouverture modale
    console.log('🔍 [MODAL OPEN DEBUG] Ouverture modale d\'\u00e9dition:');
    console.log('📝 categoryName:', categoryName.trim());
    console.log('🏪 selectedRestaurant:', selectedRestaurant);
    console.log('🆔 restaurantId envoy\u00e9:', selectedRestaurant?.id || 1);

    setLoading(true);
    try {
      const response = await fetch('/api/load-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: categoryName.trim(),
          restaurantId: selectedRestaurant?.id || 1  // 🔧 CORRECTION: Utiliser le restaurant sélectionné
        })
      });

      const data = await response.json();
      if (data.success) {
        setModalCategory(data.category);
        setModalProducts(data.products);
        setIsModalOpen(true);
      } else {
        setResult({ ...result, error: data.error } as any);
      }
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      setResult({ ...result, error: 'Erreur de connexion au serveur' } as any);
    } finally {
      setLoading(false);
    }
  };

  // Fonction : Traiter les changements de la modale
  const handleModalSave = (changes: any[]) => {
    // Générer SQL à partir des changements
    const sqlStatements = changes.map(change => {
      switch (change.type) {
        case 'ADD':
          return `INSERT INTO france_products (name, category_id, restaurant_id, price_on_site_base, price_delivery_base, product_type, display_order, composition, requires_steps, steps_config, is_active, created_at, updated_at) VALUES ('${change.newProduct.name}', ${change.newProduct.category_id}, ${change.newProduct.restaurant_id}, ${change.newProduct.price_on_site_base}, ${change.newProduct.price_delivery_base}, '${change.newProduct.product_type}', ${change.newProduct.display_order}, '${change.newProduct.composition || ''}', ${change.newProduct.requires_steps}, '${JSON.stringify(change.newProduct.steps_config || {})}', ${change.newProduct.is_active}, NOW(), NOW())`;

        case 'UPDATE':
          return `UPDATE france_products SET name = '${change.newProduct.name}', price_on_site_base = ${change.newProduct.price_on_site_base}, price_delivery_base = ${change.newProduct.price_delivery_base}, product_type = '${change.newProduct.product_type}', composition = '${change.newProduct.composition || ''}', is_active = ${change.newProduct.is_active}, updated_at = NOW() WHERE id = ${change.productId}`;

        case 'DELETE':
          return `DELETE FROM france_products WHERE id = ${change.productId}`;

        default:
          return '';
      }
    }).filter(sql => sql.length > 0);

    setResult({
      success: true,
      sql: `BEGIN;\n${sqlStatements.join(';\n')};\nCOMMIT;`,
      explanation: `${changes.length} modification(s) appliquée(s) à la catégorie ${modalCategory?.name}`,
      preview: {
        action: `Modifications catégorie ${modalCategory?.name}`,
        changes: changes
      },
      confidence: 95
    } as any);
  };

  // Fonction : Charger l'historique des scripts
  const loadScriptsHistory = async () => {
    try {
      const response = await fetch('/api/scripts-history');
      const data = await response.json();
      if (data.success) {
        setScripts(data.scripts);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  // Fonction : Exécuter un script
  const executeScript = async (scriptId: number, environment: string) => {
    try {
      const response = await fetch('/api/execute-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId, environment })
      });

      const data = await response.json();
      if (data.success) {
        // Recharger l'historique
        await loadScriptsHistory();
      }
      return data;
    } catch (error) {
      console.error('Erreur exécution script:', error);
      throw error;
    }
  };

  // Fonction : Ouvrir modale confirmation PROD
  const openProdModal = (script: any) => {
    setSelectedProdScript(script);
    setProdModalOpen(true);
  };

  // Fonction : Exécuter en PROD avec modale moderne
  const executeScriptInProd = async () => {
    if (!selectedProdScript) return;

    setProdExecuting(true);
    try {
      await executeScript(selectedProdScript.id, 'PROD');
      setProdModalOpen(false);
      setSelectedProdScript(null);
    } catch (error) {
      console.error('Erreur exécution PROD:', error);
    } finally {
      setProdExecuting(false);
    }
  };

  // Fonction : Générer rollback
  const generateRollback = async (scriptId: number) => {
    try {
      const response = await fetch('/api/generate-rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur génération rollback:', error);
      throw error;
    }
  };

  // NOUVELLES FONCTIONS pour l'édition avancée (ajout non-intrusif)
  const loadRestaurantCategories = async (restaurantId: number) => {
    if (!restaurantId) return;

    try {
      setLoadingCategories(true);
      const response = await fetch(`/api/restaurant-categories/${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setAvailableCategories(data.categories);
        console.log(`✅ ${data.categories.length} catégories chargées pour restaurant ${restaurantId}`);
      } else {
        console.error('❌ Erreur chargement catégories:', data.error);
        setAvailableCategories([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
      setAvailableCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDuplicateCategory = async () => {
    if (!duplicateSourceRestaurant || !duplicateSourceCategory || !selectedRestaurant) {
      setNotification({
        type: 'error',
        message: 'Paramètres de duplication manquants',
        details: 'Veuillez sélectionner un restaurant source, une catégorie et un restaurant cible.'
      });
      return;
    }

    setIsDuplicating(true);
    setNotification({
      type: 'info',
      message: 'Duplication en cours...',
      details: `Duplication de "${duplicateSourceCategory.name}" vers "${selectedRestaurant.name}"`
    });

    try {
      const response = await fetch('/api/duplicate-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceRestaurantId: duplicateSourceRestaurant.id,
          sourceCategoryId: duplicateSourceCategory.id,
          targetRestaurantId: selectedRestaurant.id,
          action: 'create_new',
          duplicateWorkflows: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: '🎉 Catégorie dupliquée avec succès !',
          details: `${data.result.duplicatedProducts} produits et ${data.result.duplicatedOptions} options dupliqués dans "${data.result.newCategoryName}"`
        });

        // Recharger les catégories du restaurant cible
        await loadRestaurantCategories(selectedRestaurant.id);

        // Reset sélections
        setDuplicateSourceCategory(null);
        setDuplicateSourceRestaurant(null);
      } else {
        setNotification({
          type: 'error',
          message: 'Erreur lors de la duplication',
          details: data.error || 'Une erreur inconnue s\'est produite'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur de connexion',
        details: 'Impossible de contacter le serveur. Veuillez réessayer.'
      });
      console.error('❌ Erreur duplication catégorie:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  // Fonction d'exécution réelle de la suppression (appelée depuis le modal)
  const executeDeleteCategory = async () => {
    if (!categoryToDelete) return;

    // Fermer le modal et réinitialiser
    setShowDeleteConfirmModal(false);
    setDeleteConfirmationText('');

    // Temporairement assigner la catégorie à supprimer à selectedCategory
    // pour que la logique existante fonctionne
    const originalCategory = selectedCategory;
    setSelectedCategory(categoryToDelete);

    // Exécuter la logique de suppression originale (sans les confirmations)
    await executeOriginalDeletion();

    // Restaurer la sélection originale et nettoyer
    setSelectedCategory(originalCategory);
    setCategoryToDelete(null);
  };

  // Logique de suppression originale (extraite de handleDeleteCategory)
  const executeOriginalDeletion = async () => {
    setLoadingCategories(true);
    setNotification({
      type: 'info',
      message: 'Suppression en cours...',
      details: `Suppression de "${selectedCategory.name}" et de tous ses éléments`
    });

    try {
      const response = await fetch('/api/delete-category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          restaurantId: selectedRestaurant.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: '🗑️ Catégorie supprimée avec succès !',
          details: `${data.deleted.products_count} produits et ${data.deleted.options_count} options ont été supprimés définitivement`
        });

        // Recharger les catégories
        await loadRestaurantCategories(selectedRestaurant.id);

        // Reset sélection
        setSelectedCategory(null);
      } else {
        setNotification({
          type: 'error',
          message: 'Erreur lors de la suppression',
          details: data.error || 'Une erreur inconnue s\'est produite'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur de connexion',
        details: 'Impossible de contacter le serveur. Veuillez réessayer.'
      });
      console.error('❌ Erreur suppression catégorie:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fonction : Supprimer une catégorie complète
  const handleDeleteCategory = async () => {
    if (!selectedCategory || !selectedRestaurant) {
      setNotification({
        type: 'error',
        message: 'Paramètres de suppression manquants',
        details: 'Veuillez sélectionner une catégorie à supprimer.'
      });
      return;
    }

    // Afficher le modal de confirmation sécurisé
    setCategoryToDelete(selectedCategory);
    setShowDeleteConfirmModal(true);
  };

  // Fonction : Supprimer un script
  const deleteScript = async (scriptId: number) => {
    try {
      const response = await fetch(`/api/delete-script?id=${scriptId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await loadScriptsHistory();
      }
      return data;
    } catch (error) {
      console.error('Erreur suppression script:', error);
      throw error;
    }
  };

  // NOUVELLE FONCTION : Charger les restaurants
  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.restaurants);
        // Sélectionner automatiquement le premier restaurant (Pizza Yolo)
        if (data.restaurants.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(data.restaurants[0]);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement restaurants:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Charger l'historique au montage du composant
  useEffect(() => {
    if (showHistory) {
      loadScriptsHistory();
    }
  }, [showHistory]);

  // NOUVEAU USEEFFECT : Charger les restaurants au démarrage
  useEffect(() => {
    loadRestaurants();

    // Détecter le mode depuis l'URL (pour la sidebar)
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    const urlSection = params.get('section');

    if (urlMode === 'modal') {
      setMode('modal');
    }

    // Détecter la section pour navigation - sauvegarder section active
    if (urlSection) {
      console.log('🔍 DEBUG: Section détectée dans URL:', urlSection);
      setActiveSection(urlSection);
    } else {
      console.log('🔍 DEBUG: Aucune section dans URL, params:', params.toString());
    }
  }, []);

  // USEEFFECT : Écouter les changements d'URL via sidebar
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlSection = searchParams.get('section');

    console.log('🔄 DEBUG: Mise à jour navigation - mode:', urlMode, 'section:', urlSection);

    if (urlMode === 'modal') {
      setMode('modal');
      setActiveSection('');
    } else if (urlSection) {
      setActiveSection(urlSection);
    }
  }, [searchParams]);

  // USEEFFECT : Recharger catégories quand restaurant change
  useEffect(() => {
    if (selectedRestaurant) {
      loadRestaurantCategories(selectedRestaurant.id);
    }
  }, [selectedRestaurant]);

  // NOUVELLE FONCTION : Analyser le clonage de restaurant
  const handleCloneAnalyze = async () => {
    if (!sourceRestaurant || !newRestaurantName.trim() || !menuData.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setCloningLoading(true);
    setCloneResult(null);

    try {
      const response = await fetch('/api/clone-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceRestaurantId: sourceRestaurant.id,
          targetRestaurantName: newRestaurantName,
          targetRestaurantData: newRestaurantData,
          menuData: menuData
        })
      });

      const data = await response.json();
      setCloneResult(data);

      if (data.success) {
        console.log('✅ Analyse clonage réussie:', data);
      } else {
        console.error('❌ Erreur analyse clonage:', data.error);
      }
    } catch (error) {
      console.error('❌ Erreur requête clonage:', error);
      setCloneResult({
        success: false,
        error: 'Erreur de connexion au serveur',
        confidence: 0
      });
    } finally {
      setCloningLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">

          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🤖 Menu AI Admin
              </h1>
              <p className="text-gray-600">
                Interface d'administration pour la gestion des menus
              </p>
            </div>

            {/* Sélecteur de restaurant */}
            <div className="flex flex-col items-end">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Restaurant
              </label>
              <select
                value={selectedRestaurant?.id || ''}
                onChange={(e) => {
                  const restaurantId = parseInt(e.target.value);
                  const restaurant = restaurants.find(r => r.id === restaurantId);
                  setSelectedRestaurant(restaurant || null);
                }}
                disabled={loadingRestaurants || restaurants.length === 0}
                className="px-3 py-2 border rounded-lg text-sm font-medium bg-blue-50 border-blue-300 text-blue-800"
              >
                {loadingRestaurants ? (
                  <option value="">⏳ Chargement...</option>
                ) : restaurants.length === 0 ? (
                  <option value="">❌ Aucun restaurant</option>
                ) : (
                  <>
                    <option value="">Sélectionner un restaurant</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        🏪 {restaurant.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedRestaurant
                  ? `✅ Restaurant: ${selectedRestaurant.name}`
                  : '⚠️ Sélectionnez un restaurant'}
              </p>
            </div>
          </div>
        </div>

        {/* Composant de notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' :
            notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-800' :
            'bg-blue-100 border border-blue-400 text-blue-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {notification.type === 'success' && '✅ '}
                  {notification.type === 'error' && '❌ '}
                  {notification.type === 'warning' && '⚠️ '}
                  {notification.type === 'info' && 'ℹ️ '}
                  {notification.message}
                </div>
                {notification.details && (
                  <div className="text-sm opacity-90">
                    {notification.details}
                  </div>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Section Édition Moderne RÉACTIVÉE */}
        {mode === 'modal' && (
          <div className="bg-white rounded-lg shadow-lg">
            {/* En-tête avec titre */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    ✨ Édition Moderne Avancée
                  </h2>
                  <p className="text-purple-100">
                    Interface complète : Éditez vos catégories ou dupliquez depuis d'autres restaurants
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMode('modal');
                    window.history.pushState({}, '', '/?mode=modal');
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  ← Menu Principal
                </button>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveEditTab('edit')}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeEditTab === 'edit'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📝 Éditer Catégorie
                </button>
                <button
                  onClick={() => {
                    setActiveEditTab('duplicate');
                    if (selectedRestaurant) {
                      loadRestaurantCategories(selectedRestaurant.id);
                    }
                  }}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeEditTab === 'duplicate'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🔄 Dupliquer Catégorie
                </button>

                <button
                  onClick={() => {
                    setActiveEditTab('delete');
                    if (selectedRestaurant) {
                      loadRestaurantCategories(selectedRestaurant.id);
                    }
                  }}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeEditTab === 'delete'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🗑️ Supprimer Catégorie
                </button>
              </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="p-6">
              {/* ONGLET ÉDITION (amélioré avec dropdown) */}
              {activeEditTab === 'edit' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📝 Éditer une catégorie existante
                  </h3>

                  <div className="space-y-4">
                    {/* Sélecteur de catégorie (nouveau) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📋 Catégorie à éditer (Moderne)
                        </label>
                        <select
                          value={selectedCategory?.id || ''}
                          onChange={(e) => {
                            const categoryId = parseInt(e.target.value);
                            const category = availableCategories.find(c => c.id === categoryId);
                            setSelectedCategory(category || null);
                            setCategoryName(category?.name || '');
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                          disabled={!selectedRestaurant || loadingCategories}
                        >
                          <option value="">
                            {loadingCategories ? 'Chargement...' : 'Sélectionner une catégorie'}
                          </option>
                          {availableCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.name} ({category.stats.products} produits)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Saisie libre (Classique)
                        </label>
                        <input
                          type="text"
                          value={categoryName}
                          onChange={(e) => {
                            setCategoryName(e.target.value);
                            setSelectedCategory(null);
                          }}
                          placeholder="Ex: SALADES, PIZZAS, BURGERS, TACOS..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Aperçu de la catégorie sélectionnée */}
                    {selectedCategory && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-2">📋 Catégorie sélectionnée</h4>
                        <div className="text-sm text-purple-800 space-y-1">
                          <div><strong>Nom :</strong> {selectedCategory.name}</div>
                          <div><strong>Produits :</strong> {selectedCategory.stats.products}</div>
                          <div><strong>Workflows :</strong> {selectedCategory.stats.workflows}</div>
                          <div><strong>Types :</strong> {selectedCategory.stats.simple} simples, {selectedCategory.stats.composite} composites</div>
                        </div>
                      </div>
                    )}

                    {/* Bouton d'édition */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleOpenModal}
                        disabled={loading || !categoryName.trim()}
                        className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          '🎛️'
                        )}
                        Ouvrir l'Éditeur {selectedCategory ? `(${selectedCategory.stats.products} produits)` : ''}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                    💡 <strong>Double mode :</strong> Sélectionnez depuis la liste OU tapez directement le nom • Édition temps réel • Auto-calculs • Workflows préservés
                  </div>
                </div>
              )}

              {/* ONGLET DUPLICATION (nouveau) */}
              {activeEditTab === 'duplicate' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🔄 Dupliquer une catégorie depuis un autre restaurant
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Restaurant source */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏪 Restaurant Source
                        </label>
                        <select
                          value={duplicateSourceRestaurant?.id || ''}
                          onChange={(e) => {
                            const sourceId = parseInt(e.target.value);
                            const sourceRestaurant = restaurants.find(r => r.id === sourceId);
                            setDuplicateSourceRestaurant(sourceRestaurant || null);
                            setDuplicateSourceCategory(null);
                            if (sourceRestaurant) {
                              loadRestaurantCategories(sourceRestaurant.id);
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Sélectionner un restaurant</option>
                          {restaurants.filter(r => r.id !== selectedRestaurant?.id).map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                              {restaurant.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Catégorie source */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📋 Catégorie à dupliquer
                        </label>
                        <select
                          value={duplicateSourceCategory?.id || ''}
                          onChange={(e) => {
                            const categoryId = parseInt(e.target.value);
                            const category = availableCategories.find(c => c.id === categoryId);
                            setDuplicateSourceCategory(category || null);
                          }}
                          disabled={!duplicateSourceRestaurant || loadingCategories}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                        >
                          <option value="">
                            {loadingCategories ? 'Chargement...' : 'Sélectionner une catégorie'}
                          </option>
                          {availableCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.name} ({category.stats.products} produits)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Aperçu de la duplication */}
                    {duplicateSourceCategory && selectedRestaurant && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">📋 Aperçu de la duplication</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <div>✅ <strong>Nouvelle catégorie :</strong> "{duplicateSourceCategory.name}" sera créée dans {selectedRestaurant.name}</div>
                          <div>✅ <strong>Produits :</strong> {duplicateSourceCategory.stats.products} produits seront ajoutés</div>
                          <div>✅ <strong>Workflows :</strong> {duplicateSourceCategory.stats.workflows} workflows seront préservés</div>
                          <div>⚠️ <strong>Sécurité :</strong> Aucune catégorie existante ne sera modifiée</div>
                        </div>
                      </div>
                    )}

                    {/* Bouton de duplication */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleDuplicateCategory}
                        disabled={!duplicateSourceCategory || !selectedRestaurant || isDuplicating}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                          isDuplicating
                            ? 'bg-blue-400 cursor-not-allowed'
                            : !duplicateSourceCategory || !selectedRestaurant
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                        } text-white`}
                      >
                        {isDuplicating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Duplication en cours...
                          </>
                        ) : (
                          <>
                            🔄 Dupliquer {duplicateSourceCategory?.stats.products || 0} produits
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET SUPPRESSION */}
              {activeEditTab === 'delete' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🗑️ Supprimer une catégorie existante
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-2">
                        <span className="text-red-600 text-lg mr-2">⚠️</span>
                        <span className="font-semibold text-red-800">Attention : Action irréversible</span>
                      </div>
                      <p className="text-red-700 text-sm">
                        La suppression d'une catégorie supprimera définitivement tous les produits et options associés.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📋 Catégorie à supprimer
                        </label>
                        <select
                          value={selectedCategory?.id || ''}
                          onChange={(e) => {
                            const categoryId = parseInt(e.target.value);
                            const category = availableCategories.find(c => c.id === categoryId);
                            setSelectedCategory(category || null);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Sélectionner une catégorie à supprimer</option>
                          {availableCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.name} ({category.stats?.products || 0} produits)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {selectedCategory && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Aperçu de la suppression :</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>📂 Catégorie : <span className="font-medium">{selectedCategory.name}</span></li>
                              <li>📦 Produits : <span className="font-medium text-red-600">{selectedCategory.stats?.products || 0} supprimés</span></li>
                              <li>⚙️ Options : <span className="font-medium text-red-600">{selectedCategory.stats?.options || 0} supprimées</span></li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => handleDeleteCategory()}
                        disabled={!selectedCategory || loadingCategories}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loadingCategories ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Chargement...
                          </>
                        ) : (
                          <>
                            🗑️ Supprimer définitivement
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Clonage supprimée - disponible via sidebar */}
        {false && (
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg shadow-lg p-6 text-gray-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🔄 Clonage de Restaurant IA (Révolutionnaire)
            </h2>
            <p className="mb-4 text-gray-600">
              Dupliquez automatiquement un restaurant complet avec l'IA : workflows, catégories, produits - en 5 minutes !
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne 1: Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏪 Restaurant Modèle
                  </label>
                  <select
                    value={sourceRestaurant?.id || ''}
                    onChange={(e) => {
                      const restaurantId = parseInt(e.target.value);
                      const restaurant = restaurants.find(r => r.id === restaurantId);
                      setSourceRestaurant(restaurant || null);
                    }}
                    className="w-full p-3 border border-blue-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un modèle</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        🏪 {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🆕 Nom Nouveau Restaurant
                  </label>
                  <input
                    type="text"
                    value={newRestaurantName}
                    onChange={(e) => setNewRestaurantName(e.target.value)}
                    placeholder="Ex: McDonald's Conakry"
                    className="w-full p-3 border border-blue-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📍 Adresse
                    </label>
                    <input
                      type="text"
                      value={newRestaurantData.address}
                      onChange={(e) => setNewRestaurantData({...newRestaurantData, address: e.target.value})}
                      placeholder="Centre-ville Conakry"
                      className="w-full p-2 border border-blue-300 rounded-lg text-gray-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📞 Téléphone
                    </label>
                    <input
                      type="text"
                      value={newRestaurantData.phone}
                      onChange={(e) => setNewRestaurantData({...newRestaurantData, phone: e.target.value})}
                      placeholder="+224 123 456 789"
                      className="w-full p-2 border border-blue-300 rounded-lg text-gray-800 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Colonne 2: Menu Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Menu Source (Texte brut ou JSON ChatGPT)
                </label>
                <textarea
                  value={menuData}
                  onChange={(e) => setMenuData(e.target.value)}
                  placeholder="🍔 BURGERS
- Big Mac - 2 steaks, sauce spéciale - 8€
- Royal Deluxe - poulet grillé - 7€

🍟 ACCOMPAGNEMENTS
- Frites Small/Medium/Large - 2€/3€/4€

OU coller directement le JSON ChatGPT..."
                  className="w-full h-40 p-3 border border-blue-300 rounded-lg text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloneAnalyze}
                disabled={cloningLoading || !sourceRestaurant || !newRestaurantName.trim() || !menuData.trim()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2 transition-all transform hover:scale-105"
              >
                {cloningLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  '🧠'
                )}
                Analyser avec IA
              </button>

            </div>

            <div className="mt-4 text-sm text-gray-600">
              🚀 <strong>Résultat :</strong> Restaurant complet • Workflows automatiques • Bot fonctionnel en 5 minutes
            </div>
          </div>
        )}


        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={result.success ? "text-green-600" : "text-red-600"}>
                {result.success ? "✅" : "❌"}
              </span>
              <h2 className="text-xl font-semibold">Résultat de l'analyse</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                result.confidence > 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                Confiance: {result.confidence}%
              </span>
            </div>

            {result.success ? (
              <div className="space-y-4">
                {/* Explanation */}
                {result.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {result.explanation}
                  </div>
                )}

                {/* Preview */}
                {result.preview && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Aperçu de la modification:</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Action:</strong> {result.preview.action}</p>

                      {result.preview.sourceProduct && (
                        <div>
                          <strong>Produit source:</strong>
                          <div className="ml-4 bg-white p-2 rounded border">
                            {result.preview.sourceProduct.name} - {result.preview.sourceProduct.price_on_site_base}€
                          </div>
                        </div>
                      )}

                      {result.preview.newProduct && (
                        <div>
                          <strong>Nouveau produit:</strong>
                          <div className="ml-4 bg-green-50 p-2 rounded border border-green-200">
                            {result.preview.newProduct.name} - {result.preview.newProduct.price_on_site_base}€
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SQL Preview */}
                {result.sql && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">💾 SQL généré:</h4>
                      <button
                        onClick={handleCopySQL}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          copied
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {copied ? (
                          <>
                            ✅ Copié !
                          </>
                        ) : (
                          <>
                            📋 Copier
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      {result.sql}
                    </pre>
                  </div>
                )}

                {/* Message de succès d'exécution */}
                {result.executed && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🎉</span>
                      <h4 className="font-semibold text-green-800">
                        Commande exécutée avec succès !
                      </h4>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Environnement: <strong>{result.environment || environment}</strong>
                    </p>
                    <p className="text-green-600 text-sm">
                      Les modifications ont été appliquées à la base de données.
                    </p>
                  </div>
                )}

                {/* Execute Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleExecute}
                    disabled={loading || !result.sql || result.executed}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 text-white font-medium ${
                      result.executed
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : result.executed ? (
                      "✅"
                    ) : (
                      "🚀"
                    )}
                    {result.executed ? 'Exécuté' : 'Exécuter'}
                  </button>

                  <button
                    onClick={() => setResult(null)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Nouvelle commande
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {result.error || 'Erreur inconnue'}
              </div>
            )}
          </div>
        )}

        {/* Cloning Results Section */}
        {cloneResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={cloneResult.success ? "text-green-600" : "text-red-600"}>
                {cloneResult.success ? "✅" : "❌"}
              </span>
              <h2 className="text-xl font-semibold">🔄 Résultat du Clonage IA</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                cloneResult.confidence > 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                Confiance: {cloneResult.confidence}%
              </span>
            </div>

            {cloneResult.success ? (
              <div className="space-y-6">
                {/* AI Analysis Overview */}
                {cloneResult.analysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-blue-800">🧠 Analyse IA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Stratégie de mapping:</strong></p>
                        <p className="text-gray-700 mt-1">{cloneResult.analysis.mapping_strategy}</p>
                      </div>
                      <div>
                        <p><strong>Complexité estimée:</strong></p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cloneResult.analysis.estimated_complexity === 'Facile' ? 'bg-green-100 text-green-800' :
                          cloneResult.analysis.estimated_complexity === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cloneResult.analysis.estimated_complexity}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Restaurant Preview */}
                {cloneResult.preview && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">🏪 Aperçu du Restaurant</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p><strong>Nom:</strong> {cloneResult.preview.restaurant.name}</p>
                        <p><strong>Catégories:</strong> {cloneResult.preview.restaurant.categories}</p>
                        <p><strong>Produits:</strong> {cloneResult.preview.restaurant.products}</p>
                      </div>
                      <div>
                        <p><strong>Mapping:</strong></p>
                        <p className="text-gray-700">{cloneResult.preview.mapping}</p>
                      </div>
                      <div>
                        <p><strong>Complexité:</strong></p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cloneResult.preview.complexity === 'Facile' ? 'bg-green-100 text-green-800' :
                          cloneResult.preview.complexity === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cloneResult.preview.complexity}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Mapping */}
                {cloneResult.analysis?.categories && cloneResult.analysis.categories.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-purple-800">📂 Mapping des Catégories</h4>
                    <div className="space-y-2">
                      {cloneResult.analysis.categories.map((cat: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                          <span className="text-sm">
                            <strong>{cat.originalName}</strong> → <span className="text-purple-600">{cat.newName}</span>
                          </span>
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-xs text-gray-500 ml-auto">{cat.mapping}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Preview */}
                {cloneResult.analysis?.products && cloneResult.analysis.products.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-green-800">🍽️ Aperçu des Produits ({cloneResult.analysis.products.length} articles)</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {cloneResult.analysis.products.slice(0, 10).map((product: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                          <div>
                            <span className="font-medium">{product.newName}</span>
                            <span className="text-gray-500 ml-2">({product.category})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-green-600 font-medium">{product.price_on_site}€ / {product.price_delivery}€</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.workflow_type === 'simple' ? 'bg-gray-100 text-gray-700' :
                              product.workflow_type === 'composite' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {product.workflow_type}
                            </span>
                          </div>
                        </div>
                      ))}
                      {cloneResult.analysis.products.length > 10 && (
                        <div className="text-center text-gray-500 text-sm py-2">
                          ... et {cloneResult.analysis.products.length - 10} autres produits
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Generated SQL */}
                {cloneResult.sql && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">💾 SQL de Clonage Généré:</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cloneResult.sql);
                          // Simple feedback without state management for now
                          const btn = event?.target as HTMLButtonElement;
                          if (btn) {
                            const originalText = btn.textContent;
                            btn.textContent = '✅ Copié !';
                            btn.className = btn.className.replace('bg-gray-100 text-gray-700 hover:bg-gray-200', 'bg-green-100 text-green-800');
                            setTimeout(() => {
                              btn.textContent = originalText;
                              btn.className = btn.className.replace('bg-green-100 text-green-800', 'bg-gray-100 text-gray-700 hover:bg-gray-200');
                            }, 2000);
                          }
                        }}
                        className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all"
                      >
                        📋 Copier SQL
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                      {cloneResult.sql}
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      // Execute the cloning SQL
                      if (cloneResult.sql) {
                        // For now, just copy to clipboard - could be enhanced to execute directly
                        navigator.clipboard.writeText(cloneResult.sql);
                        alert('SQL copié dans le presse-papiers ! Vous pouvez maintenant l\'exécuter dans votre console SQL.');
                      }
                    }}
                    disabled={!cloneResult.sql}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    🚀 Copier & Exécuter SQL
                  </button>

                  <button
                    onClick={() => {
                      // Start a new analysis with the same settings
                      setCloneResult(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    🔄 Nouveau Clonage
                  </button>

                  <button
                    onClick={() => setCloneResult(null)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    ❌ Fermer
                  </button>
                </div>

                {/* Warning about execution */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Important:</p>
                      <p>Ce SQL doit être exécuté manuellement dans votre console de base de données. Vérifiez toujours le contenu avant l'exécution.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <h4 className="font-semibold mb-2">❌ Erreur de Clonage</h4>
                <p>{cloneResult.error || 'Erreur inconnue lors du clonage'}</p>
                <button
                  onClick={() => setCloneResult(null)}
                  className="mt-3 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section Historique des Scripts SQL */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
              📊 Historique des Scripts SQL
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showHistory
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {showHistory ? '🙈 Masquer' : '👀 Afficher'}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {scripts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-xl text-gray-600">💻 Aucun script généré</p>
                  <p className="text-sm mt-2 text-gray-500">Les scripts générés apparaîtront ici automatiquement</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-24" />
                      <col className="w-40" />
                      <col className="w-48" />
                      <col className="w-24" />
                      <col className="w-28" />
                      <col className="w-32" />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">📅 Date</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">💬 Commande</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">⚡ Script SQL</th>
                        <th className="text-center p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">🧪 DEV</th>
                        <th className="text-center p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">🚀 PROD</th>
                        <th className="text-center p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">⚙️ Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scripts.map((script, index) => (
                        <tr key={script.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-3">
                            <div className="text-xs text-gray-700 leading-tight font-medium">
                              {TimezoneService.formatDateWithOptions(script.created_at, {
                                day: '2-digit',
                                month: '2-digit'
                              })}
                              <br />
                              <span className="text-gray-500">
                                {TimezoneService.formatDateWithOptions(script.created_at, {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="truncate text-xs text-gray-800 font-medium">
                              {script.command_source || 'Script généré'}
                            </div>
                            {script.category_name && (
                              <div className="text-xs text-blue-600 truncate mt-1 flex items-center gap-1">
                                🗂️ {script.category_name}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="relative group">
                              <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-green-700 font-mono text-xs truncate cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all"
                                   onClick={() => navigator.clipboard.writeText(script.script_sql)}
                                   title="Cliquer pour copier le script complet">
                                {script.script_sql.includes('UPDATE')
                                  ? script.script_sql.match(/UPDATE[^;]+/)?.[0] || 'UPDATE...'
                                  : script.script_sql.includes('INSERT')
                                  ? 'INSERT...'
                                  : script.script_sql.includes('DELETE')
                                  ? 'DELETE...'
                                  : script.script_sql.substring(0, 30) + '...'
                                }
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-blue-500 text-xs">📄</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 ${
                              script.dev_status === 'executed' ? 'bg-green-100 text-green-700 border border-green-200' :
                              script.dev_status === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                              script.dev_status === 'rolled_back' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {script.dev_status === 'pending' && '🔄'}
                              {script.dev_status === 'executed' && '✅'}
                              {script.dev_status === 'error' && '🚫'}
                              {script.dev_status === 'rolled_back' && '⏪'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1 ${
                              script.prod_status === 'executed' ? 'bg-green-100 text-green-700 border border-green-200' :
                              script.prod_status === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                              script.prod_status === 'rolled_back' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              script.prod_status === 'not_applied' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                              'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {script.prod_status === 'not_applied' && '⏸️'}
                              {script.prod_status === 'pending' && '🔄'}
                              {script.prod_status === 'executed' && '✅'}
                              {script.prod_status === 'error' && '🚫'}
                              {script.prod_status === 'rolled_back' && '⏪'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2 justify-center">
                              {/* Bouton déploiement PROD moderne */}
                              {script.prod_status === 'not_applied' && (
                                <button
                                  onClick={() => openProdModal(script)}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm hover:shadow transition-all flex items-center gap-1"
                                  title="Déployer en PRODUCTION"
                                >
                                  🚀 PROD
                                </button>
                              )}

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section Suppression - activée via sidebar */}
        {activeSection === 'suppression' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {console.log('🗑️ DEBUG: Affichage section Suppression')}
            <RestaurantDeletion onDeletionComplete={() => {
              // Optionnel: Recharger la liste des restaurants après suppression
              loadRestaurants();
            }} />
          </div>
        )}
        {/* DEBUG: État activeSection */}
        {console.log('🔍 DEBUG: activeSection actuel:', activeSection)}


        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          Menu AI Modifier v1.0.0 - Powered by OpenAI & Supabase
        </div>
      </div>

      {/* Modale d'Édition Moderne */}
      <CategoryEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={modalCategory}
        products={modalProducts}
        onSave={handleModalSave}
        selectedRestaurant={selectedRestaurant}
      />

      {/* Modale Confirmation PROD */}
      <ProdConfirmModal
        isOpen={prodModalOpen}
        onClose={() => setProdModalOpen(false)}
        onConfirm={executeScriptInProd}
        scriptPreview={selectedProdScript?.script_sql || ''}
        loading={prodExecuting}
      />

      {/* Modal de confirmation suppression catégorie */}
      {showDeleteConfirmModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Header avec icône d'attention */}
            <div className="bg-red-50 border-b border-red-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">
                    ATTENTION : Suppression définitive
                  </h3>
                </div>
              </div>
            </div>

            {/* Corps du modal */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-900 mb-2">
                  Vous êtes sur le point de supprimer définitivement la catégorie <strong>"{categoryToDelete.name}"</strong> et tous ses produits.
                </p>
                <p className="text-red-600 font-medium">
                  Cette action est IRRÉVERSIBLE.
                </p>
              </div>

              {/* Aperçu des conséquences */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Aperçu de la suppression :</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>📁 Catégorie :</span>
                    <span className="font-medium">{categoryToDelete.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🍕 Produits :</span>
                    <span className="text-red-600 font-medium">{categoryToDelete.stats?.products || 0} supprimés</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚙️ Options :</span>
                    <span className="text-red-600 font-medium">{categoryToDelete.stats?.options || 0} supprimées</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-2">
                  Êtes-vous absolument certain de vouloir continuer ?
                </p>
                <p className="text-sm text-gray-600">
                  Pour confirmer, tapez le nom exact de la catégorie :
                </p>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={categoryToDelete.name}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <div className="mt-2 text-xs text-gray-500">
                  {deleteConfirmationText === categoryToDelete.name ? (
                    <span className="text-green-600">✅ Nom confirmé</span>
                  ) : (
                    <span className="text-gray-500">❌ Veuillez taper le nom exact</span>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setDeleteConfirmationText('');
                    setCategoryToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={executeDeleteCategory}
                  disabled={deleteConfirmationText !== categoryToDelete.name || loadingCategories}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingCategories ? 'Suppression...' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MenuAIAdmin() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    }>
      <MenuAIAdminContent />
    </Suspense>
  );
}
