'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  stats: {
    categories: number;
    products: number;
    workflows: number;
    options: number;
  };
}

interface TargetRestaurant {
  name: string;
  slug: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  city: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  stats: {
    products: number;
    workflows: number;
    simple: number;
    composite: number;
  };
}

export default function SelectCategoriesPage() {
  const router = useRouter();
  const [sourceRestaurant, setSourceRestaurant] = useState<Restaurant | null>(null);
  const [targetRestaurant, setTargetRestaurant] = useState<TargetRestaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      // Récupérer les données de session
      const sourceData = sessionStorage.getItem('duplication-source');
      const targetData = sessionStorage.getItem('duplication-target');

      if (!sourceData || !targetData) {
        router.push('/duplicate');
        return;
      }

      const source = JSON.parse(sourceData) as Restaurant;
      const target = JSON.parse(targetData) as TargetRestaurant;

      setSourceRestaurant(source);
      setTargetRestaurant(target);

      // Charger les catégories du restaurant source
      await loadCategories(source.id);

    } catch (err) {
      console.error('Erreur chargement session:', err);
      router.push('/duplicate');
    }
  };

  const loadCategories = async (restaurantId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/restaurant-categories/${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
        // Sélectionner toutes les catégories par défaut
        const allCategoryIds = new Set(data.categories.map((cat: Category) => cat.id));
        setSelectedCategories(allCategoryIds);
      } else {
        setError(data.error || 'Erreur lors du chargement des catégories');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(categoryId)) {
        newSelection.delete(categoryId);
      } else {
        newSelection.add(categoryId);
      }
      return newSelection;
    });
  };

  const selectAll = () => {
    const allCategoryIds = new Set(categories.map(cat => cat.id));
    setSelectedCategories(allCategoryIds);
  };

  const deselectAll = () => {
    setSelectedCategories(new Set());
  };

  const getSelectionStats = () => {
    const selectedCats = categories.filter(cat => selectedCategories.has(cat.id));
    return {
      categories: selectedCats.length,
      products: selectedCats.reduce((sum, cat) => sum + cat.stats.products, 0),
      workflows: selectedCats.reduce((sum, cat) => sum + cat.stats.workflows, 0)
    };
  };

  const handleDuplicate = async () => {
    if (!sourceRestaurant || !targetRestaurant || selectedCategories.size === 0) {
      return;
    }

    try {
      setDuplicating(true);

      const response = await fetch('/api/duplicate-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceRestaurantId: sourceRestaurant.id,
          targetRestaurant,
          selectedCategories: Array.from(selectedCategories),
          duplicateWorkflows: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Stocker les résultats pour la page suivante
        sessionStorage.setItem('duplication-result', JSON.stringify(data));

        // Nettoyer les données temporaires
        sessionStorage.removeItem('duplication-source');
        sessionStorage.removeItem('duplication-target');

        // Rediriger vers la page de résultats
        router.push('/duplicate/success');
      } else {
        setError(data.error || 'Erreur lors de la duplication');
      }
    } catch (err) {
      setError('Erreur de connexion lors de la duplication');
      console.error('Erreur:', err);
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => router.push('/duplicate')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const stats = getSelectionStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔄 Sélectionner Catégories à Dupliquer
          </h1>
          <p className="text-gray-600">
            Choisissez les catégories à dupliquer depuis <span className="font-semibold">{sourceRestaurant?.name}</span> vers <span className="font-semibold">{targetRestaurant?.name}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Actions de sélection */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={selectAll}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                ✅ Tout Sélectionner
              </button>
              <button
                onClick={deselectAll}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                ❌ Tout Désélectionner
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {selectedCategories.size} / {categories.length} catégories sélectionnées
            </div>
          </div>

          {/* Liste des catégories */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Catégories Disponibles</h3>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune catégorie trouvée pour ce restaurant
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCategories.has(category.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          {category.name}
                          {selectedCategories.has(category.id) && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {category.stats.products} produits • {category.stats.workflows} workflows
                        </p>
                        <p className="text-xs text-gray-500">
                          {category.stats.simple} simples • {category.stats.composite} composites
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        #{category.display_order}
                      </div>
                      <div className="text-xs text-gray-500">
                        ordre
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Statistiques de sélection */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Sélection Actuelle</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-700">{stats.categories}</div>
                <div className="text-sm text-blue-600">Catégories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{stats.products}</div>
                <div className="text-sm text-blue-600">Produits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{stats.workflows}</div>
                <div className="text-sm text-blue-600">Workflows</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/duplicate')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={duplicating}
            >
              ⬅️ Retour
            </button>

            <button
              onClick={handleDuplicate}
              disabled={selectedCategories.size === 0 || duplicating}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedCategories.size > 0 && !duplicating
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {duplicating ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Duplication en cours...
                </span>
              ) : (
                'Dupliquer ➡️'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}