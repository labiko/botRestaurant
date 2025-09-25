// Configuration workflow par catégorie - OCR Onboarding
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductAnalysisResult } from '@/lib/ocr/interfaces/ocr-smart-configure.interface';

export default function CategoryConfigPage() {
  const router = useRouter();
  const [categoryContext, setCategoryContext] = useState<{
    categoryName: string;
    categoryProducts: ProductAnalysisResult[];
    returnTo: string;
  } | null>(null);

  const [workflowConfig, setWorkflowConfig] = useState({
    steps: [] as any[],
    optionGroups: {} as Record<string, any[]>
  });

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
    let defaultSteps: any[] = [];
    let defaultOptions: Record<string, any[]> = {};

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

    setWorkflowConfig({
      steps: defaultSteps,
      optionGroups: defaultOptions
    });
  };

  const handleSaveConfiguration = () => {
    if (!categoryContext) return;

    // Sauvegarder la configuration de cette catégorie
    const categoryConfigs = JSON.parse(localStorage.getItem('categoryConfigurations') || '{}');
    categoryConfigs[categoryContext.categoryName] = {
      ...workflowConfig,
      products: categoryContext.categoryProducts,
      configuredAt: new Date().toISOString()
    };
    localStorage.setItem('categoryConfigurations', JSON.stringify(categoryConfigs));

    // Nettoyer le contexte temporaire
    localStorage.removeItem('categoryConfigContext');

    // Retour à la page configure
    router.push(categoryContext.returnTo);
  };

  const handleAddStep = () => {
    const newStep = {
      step: workflowConfig.steps.length + 1,
      prompt: "Nouvelle étape",
      required: true,
      max_selections: 1,
      option_groups: []
    };

    setWorkflowConfig(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleAddOptionGroup = () => {
    const groupName = prompt('Nom du groupe d\'options :');
    if (!groupName) return;

    setWorkflowConfig(prev => ({
      ...prev,
      optionGroups: {
        ...prev.optionGroups,
        [groupName]: []
      }
    }));
  };

  const handleAddOption = (groupName: string) => {
    const optionName = prompt('Nom de l\'option :');
    const priceModifier = parseFloat(prompt('Modificateur de prix (€) :') || '0');

    if (!optionName) return;

    const newOption = {
      name: optionName,
      emoji: "⭐",
      price_modifier: priceModifier
    };

    setWorkflowConfig(prev => ({
      ...prev,
      optionGroups: {
        ...prev.optionGroups,
        [groupName]: [...(prev.optionGroups[groupName] || []), newOption]
      }
    }));
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔧 Configuration Workflow - {categoryContext.categoryName}</h1>
          <div className="text-sm text-gray-600">{categoryContext.categoryProducts.length} produits</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Produits dans cette catégorie */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Produits concernés :</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categoryContext.categoryProducts.map((result, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded border text-sm">
                <div className="font-medium">{result.product.name}</div>
                <div className="text-xs text-gray-500">
                  {result.pricingSuggestion.onSitePrice}€ - {result.pricingSuggestion.deliveryPrice}€
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration du workflow */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Workflow Steps</h2>
            <button
              onClick={handleAddStep}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              + Ajouter étape
            </button>
          </div>

          {workflowConfig.steps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune étape configurée (Produits simples)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflowConfig.steps.map((step, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Étape {step.step}</h3>
                  </div>
                  <input
                    type="text"
                    value={step.prompt}
                    onChange={(e) => {
                      const newSteps = [...workflowConfig.steps];
                      newSteps[index].prompt = e.target.value;
                      setWorkflowConfig(prev => ({ ...prev, steps: newSteps }));
                    }}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <div className="text-sm text-gray-600">
                    Groupes d'options : {step.option_groups.join(', ') || 'Aucun'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Groupes d'options */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Groupes d'Options</h2>
            <button
              onClick={handleAddOptionGroup}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              + Ajouter groupe
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(workflowConfig.optionGroups).map(([groupName, options]) => (
              <div key={groupName} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{groupName}</h3>
                  <button
                    onClick={() => handleAddOption(groupName)}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                  >
                    + Option
                  </button>
                </div>
                <div className="space-y-1">
                  {options.map((option, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{option.emoji} {option.name}</span>
                      <span className={option.price_modifier >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {option.price_modifier > 0 ? '+' : ''}{option.price_modifier}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
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