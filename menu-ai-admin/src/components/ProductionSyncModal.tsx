'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';

interface Category {
  id: number;
  name: string;
  products_count: number;
}

interface ProductionSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplication: {
    id: number;
    target_restaurant?: { name: string };
    target_restaurant_id: number;
  } | null;
  onSync: (syncType: string, selectedCategories?: number[]) => void;
}

export default function ProductionSyncModal({
  isOpen,
  onClose,
  duplication,
  onSync
}: ProductionSyncModalProps) {
  const { fetch: fetchWithEnv } = useFetch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [syncType, setSyncType] = useState<'complete' | 'category'>('complete');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && duplication) {
      loadCategories();
    }
  }, [isOpen, duplication]);

  const loadCategories = async () => {
    if (!duplication) return;

    try {
      setLoading(true);
      // Récupérer les catégories du restaurant
      const response = await fetchWithEnv(`/api/restaurants/${duplication.target_restaurant_id}/categories`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSync = () => {
    if (syncType === 'complete') {
      onSync('complete');
    } else {
      onSync('category', selectedCategories);
    }
    onClose();
  };

  if (!isOpen || !duplication) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            🔄 Synchronisation Production - {duplication.target_restaurant?.name}
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>IMPORTANT:</strong> Cette synchronisation ne supprime aucune donnée.
              Les éléments existants en production sont préservés.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Type de synchronisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez les éléments à synchroniser :
            </label>

            <div className="space-y-3">
              {/* Option restaurant complet */}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="syncType"
                  value="complete"
                  checked={syncType === 'complete'}
                  onChange={(e) => setSyncType(e.target.value as 'complete')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-900">
                  ☑️ Restaurant complet (métadonnées + toutes catégories)
                </span>
              </label>

              {/* Option par catégorie */}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="syncType"
                  value="category"
                  checked={syncType === 'category'}
                  onChange={(e) => setSyncType(e.target.value as 'category')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-900">
                  OU synchroniser par catégorie :
                </span>
              </label>
            </div>
          </div>

          {/* Sélection des catégories */}
          {syncType === 'category' && (
            <div className="ml-6 space-y-2">
              {loading ? (
                <div className="text-sm text-gray-500">Chargement des catégories...</div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-gray-500">Aucune catégorie trouvée</div>
              ) : (
                categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      📁 {category.name} ({category.products_count} produits) - Ajout/Mise à jour
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSync}
            disabled={syncType === 'category' && selectedCategories.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🔄 Synchroniser en Production
          </button>
        </div>
      </div>
    </div>
  );
}