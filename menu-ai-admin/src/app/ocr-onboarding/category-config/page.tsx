// Configuration workflow par catégorie - OCR Onboarding
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductAnalysisResult } from '@/lib/ocr/interfaces/ocr-smart-configure.interface';

interface EditableProduct {
  name: string;
  description: string;
  priceSurPlace: number;
  priceLivraison: number;
  type: string;
}

interface WorkflowStep {
  step: number;
  prompt: string;
  required: boolean;
  max_selections: number;
  option_groups: string[];
}

interface OptionItem {
  name: string;
  price_modifier: number;
  emoji: string;
}

export default function CategoryConfigPage() {
  const router = useRouter();
  const [categoryContext, setCategoryContext] = useState<{
    categoryName: string;
    categoryProducts: ProductAnalysisResult[];
    returnTo: string;
  } | null>(null);

  const [editableProducts, setEditableProducts] = useState<EditableProduct[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [optionGroups, setOptionGroups] = useState<Record<string, OptionItem[]>>({});

  useEffect(() => {
    loadCategoryContext();
  }, []);

  const loadCategoryContext = () => {
    try {
      const stored = localStorage.getItem('categoryConfigContext');
      if (!stored) {
        alert('Contexte de configuration de catégorie non trouvé');
        router.push('/ocr-onboarding/configure');
        return;
      }

      const context = JSON.parse(stored);
      setCategoryContext(context);

      // Convertir les produits en format éditable
      const products = context.categoryProducts.map((result: ProductAnalysisResult) => ({
        name: result.product.name,
        description: result.product.description || '',
        priceSurPlace: result.pricingSuggestion.onSitePrice,
        priceLivraison: result.pricingSuggestion.deliveryPrice,
        type: result.detectedType
      }));
      setEditableProducts(products);

      // Analyser le type dominant pour pré-configurer le workflow
      const dominantType = getDominantType(context.categoryProducts);
      initializeWorkflowByType(dominantType, context.categoryName);

    } catch (error) {
      console.error('Erreur chargement contexte catégorie:', error);
      router.push('/ocr-onboarding/configure');
    }
  };

  const getDominantType = (products: ProductAnalysisResult[]): string => {
    const typeCount = products.reduce((acc, product) => {
      acc[product.detectedType] = (acc[product.detectedType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).reduce((a, b) =>
      typeCount[a[0]] >= typeCount[b[0]] ? a : b
    )[0];
  };

  const initializeWorkflowByType = (dominantType: string, categoryName: string) => {
    let defaultSteps: WorkflowStep[] = [];
    let defaultOptions: Record<string, OptionItem[]> = {};

    switch (dominantType) {
      case 'modular':
        if (categoryName.toLowerCase().includes('burger')) {
          defaultSteps = [
            {
              step: 1,
              prompt: "Choisir la taille",
              required: true,
              max_selections: 1,
              option_groups: ["tailles"]
            },
            {
              step: 2,
              prompt: "Choisir la boisson",
              required: true,
              max_selections: 1,
              option_groups: ["boissons"]
            }
          ];
          defaultOptions = {
            "tailles": [
              { name: "Petit", emoji: "🍟", price_modifier: 0 },
              { name: "Moyen", emoji: "🍟", price_modifier: 2 },
              { name: "Grand", emoji: "🍟", price_modifier: 4 }
            ],
            "boissons": [
              { name: "Coca-Cola", emoji: "🥤", price_modifier: 0 },
              { name: "Sprite", emoji: "🥤", price_modifier: 0 },
              { name: "Fanta", emoji: "🥤", price_modifier: 0 }
            ]
          };
        }
        break;

      case 'simple':
      default:
        // Pas d'étapes pour les produits simples
        break;
    }

    setWorkflowSteps(defaultSteps);
    setOptionGroups(defaultOptions);
  };

  const handleSaveConfiguration = () => {
    if (!categoryContext) return;

    // Sauvegarder la configuration de cette catégorie
    const categoryConfigs = JSON.parse(localStorage.getItem('categoryConfigurations') || '{}');
    categoryConfigs[categoryContext.categoryName] = {
      steps: workflowSteps,
      optionGroups: optionGroups,
      products: editableProducts,
      configuredAt: new Date().toISOString()
    };
    localStorage.setItem('categoryConfigurations', JSON.stringify(categoryConfigs));

    // Nettoyer le contexte temporaire
    localStorage.removeItem('categoryConfigContext');

    // Retour à la page configure
    router.push(categoryContext.returnTo);
  };


  if (!categoryContext) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Chargement de la configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🔧 Configuration - {categoryContext.categoryName}</h1>
        <p className="text-gray-600">{editableProducts.length} produits scannés</p>
      </div>

      <div className="space-y-6">
        {/* Produits Scannés - Éditable */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📋</span>
            <h2 className="text-lg font-semibold">Produits Scannés</h2>
            <button
              className="ml-auto bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              onClick={() => {
                const newProduct: EditableProduct = {
                  name: 'Nouveau produit',
                  description: '',
                  priceSurPlace: 0,
                  priceLivraison: 1,
                  type: 'simple'
                };
                setEditableProducts([...editableProducts, newProduct]);
              }}
            >
              + Ajouter produit
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left">Nom</th>
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-center">Prix Sur Place</th>
                  <th className="border p-2 text-center">Prix Livraison</th>
                  <th className="border p-2 text-center">Type</th>
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editableProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => {
                          const newProducts = [...editableProducts];
                          newProducts[index].name = e.target.value;
                          setEditableProducts(newProducts);
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={product.description}
                        onChange={(e) => {
                          const newProducts = [...editableProducts];
                          newProducts[index].description = e.target.value;
                          setEditableProducts(newProducts);
                        }}
                        className="w-full p-1 border rounded"
                        placeholder="Description du produit..."
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        value={product.priceSurPlace}
                        onChange={(e) => {
                          const newProducts = [...editableProducts];
                          newProducts[index].priceSurPlace = parseFloat(e.target.value) || 0;
                          setEditableProducts(newProducts);
                        }}
                        className="w-20 p-1 border rounded text-center"
                        step="0.1"
                      />€
                    </td>
                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        value={product.priceLivraison}
                        onChange={(e) => {
                          const newProducts = [...editableProducts];
                          newProducts[index].priceLivraison = parseFloat(e.target.value) || 0;
                          setEditableProducts(newProducts);
                        }}
                        className="w-20 p-1 border rounded text-center"
                        step="0.1"
                      />€
                    </td>
                    <td className="border p-2 text-center">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => {
                          const newProducts = editableProducts.filter((_, i) => i !== index);
                          setEditableProducts(newProducts);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions de sauvegarde */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push(categoryContext.returnTo)}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveConfiguration}
            className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Sauvegarder Configuration
          </button>
        </div>
      </div>
    </div>
  );
}