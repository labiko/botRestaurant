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

        {/* Configuration des Étapes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🔧 Configuration des Étapes</h2>
            <button
              onClick={() => {
                const newStep = {
                  step: workflowSteps.length + 1,
                  type: 'options_selection',
                  prompt: 'Nouvelle question',
                  option_groups: ['Nouveau groupe'],
                  required: true,
                  max_selections: 1
                };
                setWorkflowSteps([...workflowSteps, newStep]);
              }}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              + Ajouter étape
            </button>
          </div>

          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">Étape {step.step}</h3>
                  <button
                    onClick={() => {
                      const updatedSteps = workflowSteps.filter((_, i) => i !== index);
                      updatedSteps.forEach((step, i) => {
                        step.step = i + 1;
                      });
                      setWorkflowSteps(updatedSteps);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Question à poser"
                    value={step.prompt}
                    onChange={(e) => {
                      const updatedSteps = [...workflowSteps];
                      updatedSteps[index].prompt = e.target.value;
                      setWorkflowSteps(updatedSteps);
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />

                  <select
                    value={step.option_groups[0] || ''}
                    onChange={(e) => {
                      const updatedSteps = [...workflowSteps];
                      updatedSteps[index].option_groups = [e.target.value];
                      setWorkflowSteps(updatedSteps);
                      // Créer le groupe s'il n'existe pas
                      if (e.target.value && !optionGroups[e.target.value]) {
                        setOptionGroups({
                          ...optionGroups,
                          [e.target.value]: [
                            { name: 'Option 1', price_modifier: 0, display_order: 1, emoji: '⭐' }
                          ]
                        });
                      }
                    }}
                    className="w-full px-2 py-1 border rounded text-sm bg-white"
                  >
                    <option value="">Sélectionnez un groupe</option>
                    {Object.keys(optionGroups).map((groupName) => (
                      <option key={groupName} value={groupName}>
                        {groupName}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={step.required}
                        onChange={(e) => {
                          const updatedSteps = [...workflowSteps];
                          updatedSteps[index].required = e.target.checked;
                          setWorkflowSteps(updatedSteps);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Obligatoire</span>
                    </label>

                    <div className="flex items-center">
                      <span className="text-sm mr-2">Max choix:</span>
                      <input
                        type="number"
                        min="1"
                        value={step.max_selections}
                        onChange={(e) => {
                          const updatedSteps = [...workflowSteps];
                          updatedSteps[index].max_selections = parseInt(e.target.value);
                          setWorkflowSteps(updatedSteps);
                        }}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>

                  {!step.required && (
                    <div className="p-2 bg-yellow-100 rounded text-xs">
                      ⚠️ Le bot affichera : "0️⃣ Passer cette étape"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Options par Groupe */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📋 Options par Groupe</h2>
            <button
              onClick={() => {
                const groupName = prompt('Nom du groupe d\'options :');
                if (groupName && !optionGroups[groupName]) {
                  setOptionGroups({
                    ...optionGroups,
                    [groupName]: [
                      { name: 'Option 1', price_modifier: 0, display_order: 1, emoji: '⭐' }
                    ]
                  });
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Ajouter groupe
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(optionGroups).map(([groupName, options]) => (
              <div key={groupName} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => {
                      const newGroupName = e.target.value;
                      if (newGroupName !== groupName) {
                        const updatedGroups: Record<string, OptionItem[]> = {};
                        Object.entries(optionGroups).forEach(([key, value]) => {
                          if (key === groupName) {
                            updatedGroups[newGroupName] = value;
                          } else {
                            updatedGroups[key] = value;
                          }
                        });
                        setOptionGroups(updatedGroups);

                        const updatedSteps = workflowSteps.map(step => ({
                          ...step,
                          option_groups: step.option_groups.map(group =>
                            group === groupName ? newGroupName : group
                          )
                        }));
                        setWorkflowSteps(updatedSteps);
                      }
                    }}
                    className="font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const group = optionGroups[groupName] || [];
                        const newOption = {
                          name: `Option ${group.length + 1}`,
                          price_modifier: 0,
                          display_order: group.length + 1,
                          emoji: '⭐'
                        };
                        setOptionGroups({
                          ...optionGroups,
                          [groupName]: [...group, newOption]
                        });
                      }}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                    >
                      + Option
                    </button>
                    <button
                      onClick={() => {
                        const updatedGroups = { ...optionGroups };
                        delete updatedGroups[groupName];
                        setOptionGroups(updatedGroups);
                      }}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      title="Supprimer le groupe"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {options.map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nom"
                      value={option.name}
                      onChange={(e) => {
                        const updatedGroups = { ...optionGroups };
                        if (updatedGroups[groupName]) {
                          updatedGroups[groupName][optIndex] = {
                            ...updatedGroups[groupName][optIndex],
                            name: e.target.value
                          };
                          setOptionGroups(updatedGroups);
                        }
                      }}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Prix"
                      value={option.price_modifier || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value === '' ? 0 : parseFloat(value);
                        const updatedGroups = { ...optionGroups };
                        if (updatedGroups[groupName]) {
                          updatedGroups[groupName][optIndex] = {
                            ...updatedGroups[groupName][optIndex],
                            price_modifier: isNaN(numericValue) ? 0 : numericValue
                          };
                          setOptionGroups(updatedGroups);
                        }
                      }}
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Emoji"
                      value={option.emoji || ''}
                      onChange={(e) => {
                        const updatedGroups = { ...optionGroups };
                        if (updatedGroups[groupName]) {
                          updatedGroups[groupName][optIndex] = {
                            ...updatedGroups[groupName][optIndex],
                            emoji: e.target.value
                          };
                          setOptionGroups(updatedGroups);
                        }
                      }}
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={() => {
                        const updatedGroups = { ...optionGroups };
                        if (updatedGroups[groupName]) {
                          updatedGroups[groupName].splice(optIndex, 1);
                          updatedGroups[groupName].forEach((option, index) => {
                            option.display_order = index + 1;
                          });
                          setOptionGroups(updatedGroups);
                        }
                      }}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      title="Supprimer cette option"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Actions de sauvegarde */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Retour
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