'use client';

import { useState, useEffect } from 'react';
import { TimezoneService } from '@/lib/timezone-service';

interface Product {
  id: number;
  name: string;
  description?: string;
  price_on_site_base: number;
  price_delivery_base: number;
  display_order: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  display_order: number;
  france_products: Product[];
}

interface Option {
  id: number;
  product_id: number;
  option_name: string;
  option_group: string;
  price_modifier: number;
  display_order: number;
  product: { id: number; name: string };
}

interface DuplicationDetail {
  id: number;
  source_restaurant: { name: string };
  target_restaurant: { name: string };
  status: string;
  started_at: string;
  completed_at: string;
  summary: {
    categoriesDuplicated: number;
    productsDuplicated: number;
    optionsDuplicated: number;
  };
}

interface DuplicationDetailModalProps {
  duplicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DuplicationDetailModal({
  duplicationId,
  isOpen,
  onClose
}: DuplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'options'>('categories');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [duplication, setDuplication] = useState<DuplicationDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && duplicationId) {
      loadDuplicationDetails();
    }
  }, [isOpen, duplicationId]);

  const loadDuplicationDetails = async () => {
    if (!duplicationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/duplication-details/${duplicationId}`);
      const data = await response.json();

      if (data.success) {
        setDuplication(data.duplication);
        setCategories(data.categories);
        setOptions(data.options);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('❌ Erreur chargement détails:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  const formatDate = (dateString: string) => {
    return TimezoneService.formatDate(dateString);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                📋 Duplication #{duplicationId}
              </h2>
              {duplication && (
                <div className="space-y-1 text-blue-100">
                  <p>
                    <span className="font-medium">Source:</span> {duplication.source_restaurant.name}
                  </p>
                  <p>
                    <span className="font-medium">Cible:</span> {duplication.target_restaurant.name}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {formatDate(duplication.started_at)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement des détails...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">❌ {error}</div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-0">
                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'categories'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🗂️ Catégories ({categories.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('options')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'options'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ⚙️ Options ({options.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'categories' ? (
                  <div className="space-y-4">
                    {categories.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Aucune catégorie trouvée
                      </div>
                    ) : (
                      categories.map((category) => (
                        <div
                          key={category.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                          >
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{category.icon}</span>
                                <span className="font-medium">{category.name}</span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {category.france_products.length} produits
                                </span>
                              </div>
                              {category.created_at && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500 ml-8">
                                  <span>🕒</span>
                                  <span>Dupliquée le {TimezoneService.formatDateWithOptions(category.created_at, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              )}
                            </div>
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                expandedCategories.has(category.id) ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Category Content */}
                          {expandedCategories.has(category.id) && (
                            <div className="p-4 bg-white">
                              {category.france_products.length === 0 ? (
                                <div className="text-gray-500 text-sm">Aucun produit</div>
                              ) : (
                                <div className="grid gap-3">
                                  {category.france_products.map((product) => (
                                    <div
                                      key={product.id}
                                      className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                                        {product.description && (
                                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                        )}
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className="font-medium text-gray-900">
                                          {formatPrice(product.price_on_site_base)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Livraison: {formatPrice(product.price_delivery_base)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {options.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Aucune option trouvée
                      </div>
                    ) : (
                      // Afficher directement la liste dédupliquée d'options
                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <span className="text-blue-600 mr-2">⚙️</span>
                            Options disponibles
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {options.length} option{options.length > 1 ? 's' : ''} unique{options.length > 1 ? 's' : ''}
                            </span>
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            {options.map((option) => (
                              <div
                                key={option.id}
                                className="flex justify-between items-start py-3 px-4 bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {option.option_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Groupe: {option.option_group}
                                  </p>
                                </div>
                                <div className={`text-sm font-medium ${
                                  option.price_modifier >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {option.price_modifier >= 0 ? '+' : ''}{formatPrice(option.price_modifier)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}