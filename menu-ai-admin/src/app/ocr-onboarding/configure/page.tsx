// ÉTAPE 2 : Smart Configure avec intégration Workflow V2
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductAnalysisAIService } from '@/lib/ocr/services/product-analysis-ai.service';
import { RestaurantTemplateClonerService } from '@/lib/ocr/services/restaurant-template-cloner.service';
import { OCRSmartConfigure, ProductAnalysisResult } from '@/lib/ocr/interfaces/ocr-smart-configure.interface';
import { ExtractedProduct } from '@/lib/ocr/interfaces/ocr-provider.interface';

export default function OCRConfigurePage() {
  const router = useRouter();

  // États principaux
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<ProductAnalysisResult[]>([]);
  const [smartConfig, setSmartConfig] = useState<OCRSmartConfigure | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'loading' | 'restaurant_info' | 'review_analysis' | 'ready'>('loading');

  // États pour les informations du restaurant (pré-remplis dynamiquement)
  const [newRestaurantData, setNewRestaurantData] = useState({
    name: '',
    whatsapp_number: '',
    address: '',
    city: '',
    phone: ''
  });

  // États pour la validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [categoryConfigurations, setCategoryConfigurations] = useState<Record<string, any>>({});

  useEffect(() => {
    loadOCRResults();
    loadPizzaYoloTemplate();
    loadCategoryConfigurations();
  }, []);

  // Effet pour recharger les configurations quand on revient de la config catégorie
  useEffect(() => {
    const handleFocus = () => {
      loadCategoryConfigurations();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadCategoryConfigurations = () => {
    try {
      const stored = localStorage.getItem('categoryConfigurations');
      if (stored) {
        setCategoryConfigurations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement configurations catégories:', error);
    }
  };

  const loadPizzaYoloTemplate = async () => {
    try {
      const response = await fetch('/api/ocr/get-pizza-yolo-template');
      const result = await response.json();

      if (result.success && result.data) {
        setNewRestaurantData(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement template Pizza Yolo:', error);
      // Fallback avec données par défaut
      setNewRestaurantData({
        name: 'Pizza Yolo 77',
        whatsapp_number: '0164880605',
        address: '251 Av. Philippe Bur, 77550 Moissy-Cramayel',
        city: 'Paris',
        phone: '0164880605'
      });
    }
  };

  const loadOCRResults = async () => {
    try {
      const stored = localStorage.getItem('ocrResults');
      if (!stored) {
        alert('Aucun résultat OCR trouvé. Retour à l\'étape d\'upload.');
        router.push('/ocr-onboarding/upload');
        return;
      }

      const results = JSON.parse(stored);
      setOcrResults(results);

      // Vérifier s'il y a déjà une analyse IA existante
      const existingAnalysis = localStorage.getItem('analysisResults');
      const existingConfig = localStorage.getItem('smartConfig');

      if (existingAnalysis && existingConfig) {
        // Il y a déjà une analyse, aller directement à l'étape ready
        const analysis = JSON.parse(existingAnalysis);
        const config = JSON.parse(existingConfig);

        setAnalysisResults(analysis);
        setSmartConfig(config);
        setNewRestaurantData(config.newRestaurantData);
        setCurrentStep('ready');
      } else {
        // Pas d'analyse existante, commencer par les infos restaurant
        setCurrentStep('restaurant_info');
      }
    } catch (error) {
      console.error('Erreur chargement résultats OCR:', error);
      alert('Erreur lors du chargement des résultats OCR');
      router.push('/ocr-onboarding/upload');
    }
  };

  const handleRestaurantInfoNext = () => {
    const validation = RestaurantTemplateClonerService.validateNewRestaurantData(newRestaurantData);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setCurrentStep('review_analysis');
    processSmartAnalysis();
  };

  const processSmartAnalysis = async () => {
    if (!ocrResults?.products) {
      alert('Aucun produit extrait trouvé');
      return;
    }

    setProcessing(true);

    try {
      // 1. Analyse IA de tous les produits
      const products: ExtractedProduct[] = ocrResults.products;
      const analysisResults = products.map(product =>
        ProductAnalysisAIService.analyzeProduct(product)
      );

      setAnalysisResults(analysisResults);

      // 2. Clonage du template Pizza Yolo 77
      const restaurantTemplate = await RestaurantTemplateClonerService.cloneRestaurantTemplate('pizza-yolo-77');

      // 3. Génération slug unique
      const slug = RestaurantTemplateClonerService.generateUniqueSlug(newRestaurantData.name);

      // 4. Création de la configuration Smart
      const smartConfiguration: OCRSmartConfigure = {
        extractedProducts: products,
        workflowSuggestions: analysisResults.map(r => r.workflowSuggestion),
        categoryMappings: analysisResults.map(r => r.categoryMapping),
        restaurantTemplate,
        newRestaurantData: {
          ...newRestaurantData,
          slug
        }
      };

      setSmartConfig(smartConfiguration);
      setCurrentStep('ready');

    } catch (error) {
      console.error('Erreur analyse smart:', error);
      alert('Erreur lors de l\'analyse intelligente des produits');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfigureCategory = (categoryName: string, categoryProducts: ProductAnalysisResult[]) => {
    // Sauvegarder le contexte de configuration de catégorie
    localStorage.setItem('categoryConfigContext', JSON.stringify({
      categoryName,
      categoryProducts,
      returnTo: '/ocr-onboarding/configure'
    }));

    // Rediriger vers la page de configuration de catégorie
    router.push('/ocr-onboarding/category-config');
  };

  const handleContinueToDatabase = () => {
    if (!smartConfig) {
      alert('Configuration non prête');
      return;
    }

    // Sauvegarde pour l'étape suivante
    localStorage.setItem('smartConfig', JSON.stringify(smartConfig));
    localStorage.setItem('analysisResults', JSON.stringify(analysisResults));

    router.push('/ocr-onboarding/database');
  };

  const renderRestaurantInfoStep = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">🏪 Informations du Nouveau Restaurant</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du restaurant *
          </label>
          <input
            type="text"
            placeholder="Ex: Restaurant Chez Marie"
            value={newRestaurantData.name}
            onChange={(e) => setNewRestaurantData({...newRestaurantData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro WhatsApp *
          </label>
          <input
            type="text"
            placeholder="Ex: 0123456789"
            value={newRestaurantData.whatsapp_number}
            onChange={(e) => setNewRestaurantData({...newRestaurantData, whatsapp_number: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <input
            type="text"
            placeholder="Ex: 123 Rue de la Paix"
            value={newRestaurantData.address}
            onChange={(e) => setNewRestaurantData({...newRestaurantData, address: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              placeholder="Ex: Paris"
              value={newRestaurantData.city}
              onChange={(e) => setNewRestaurantData({...newRestaurantData, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="text"
              placeholder="Ex: 0123456789"
              value={newRestaurantData.phone}
              onChange={(e) => setNewRestaurantData({...newRestaurantData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="font-medium text-red-800 mb-2">Erreurs de validation :</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-red-600 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Template Pizza Yolo 77</strong> : Votre restaurant sera créé avec la même structure que Pizza Yolo 77 (22 catégories, configuration éprouvée)
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleRestaurantInfoNext}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
        >
          Analyser les Produits avec IA
        </button>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      {processing ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">🤖 Analyse IA en cours...</h2>
          <p className="text-gray-600">
            • Détection automatique des types de produits<br/>
            • Génération de workflows intelligents<br/>
            • Mapping des catégories avec Pizza Yolo 77<br/>
            • Calcul automatique des prix (+1€ livraison)
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🍽️ Configuration par Catégorie/Menu</h2>
            <p className="text-gray-600 mb-6">
              Configurez le workflow pour chaque catégorie. Tous les produits de la même catégorie utiliseront le même workflow.
            </p>

            <div className="space-y-4">
              {Object.entries(
                analysisResults.reduce((acc, result) => {
                  const categoryName = result.categoryMapping.suggestedCategoryName;
                  if (!acc[categoryName]) {
                    acc[categoryName] = {
                      icon: result.categoryMapping.icon,
                      products: [],
                      detectedTypes: new Set()
                    };
                  }
                  acc[categoryName].products.push(result);
                  acc[categoryName].detectedTypes.add(result.detectedType);
                  return acc;
                }, {} as Record<string, { icon: string; products: ProductAnalysisResult[]; detectedTypes: Set<string> }>)
              ).map(([categoryName, categoryData]) => {
                const dominantType = [...categoryData.detectedTypes].reduce((a, b) =>
                  categoryData.products.filter(p => p.detectedType === a).length >=
                  categoryData.products.filter(p => p.detectedType === b).length ? a : b
                );

                return (
                  <div key={categoryName} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryData.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{categoryName}</h3>
                          <p className="text-sm text-gray-600">
                            {categoryData.products.length} produits • Type dominant: {dominantType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {categoryConfigurations[categoryName] ? (
                        <div className="flex gap-2">
                          <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                            ✅ Configuré
                          </span>
                          <button
                            onClick={() => handleConfigureCategory(categoryName, categoryData.products)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          >
                            ✏️ Modifier
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfigureCategory(categoryName, categoryData.products)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          🔧 Configurer le workflow
                        </button>
                      )}
                    </div>

                    {/* Liste des produits dans cette catégorie */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      {categoryData.products.map((result, index) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{result.product.name}</span>
                            <div className="flex gap-2 text-xs">
                              <span className="text-green-600">{result.pricingSuggestion.onSitePrice}€</span>
                              <span className="text-blue-600">{result.pricingSuggestion.deliveryPrice}€</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Résumé de Configuration</h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(
                    analysisResults.reduce((acc, result) => {
                      acc[result.categoryMapping.suggestedCategoryName] = true;
                      return acc;
                    }, {} as Record<string, boolean>)
                  ).length}
                </div>
                <div className="text-sm text-blue-800">Catégories détectées</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisResults.length}</div>
                <div className="text-sm text-green-800">Produits total</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(categoryConfigurations).length}</div>
                <div className="text-sm text-purple-800">Workflows configurés</div>
              </div>
            </div>

            {Object.keys(categoryConfigurations).length === 0 ? (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Configuration requise</strong> : Configurez le workflow pour chaque catégorie avant de continuer
                </p>
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>{Object.keys(categoryConfigurations).length} catégories configurées</strong> : Vous pouvez continuer vers l'intégration
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleContinueToDatabase}
            disabled={Object.keys(categoryConfigurations).length === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium ${
              Object.keys(categoryConfigurations).length === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Continuer vers l'Intégration Base de Données
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🤖 OCR Smart Configure - Analyse IA</h1>
          <div className="text-sm text-gray-600">Étape 2/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
        </div>
      </div>

      {currentStep === 'loading' && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des résultats OCR...</p>
        </div>
      )}

      {currentStep === 'restaurant_info' && renderRestaurantInfoStep()}
      {(currentStep === 'review_analysis' || currentStep === 'ready') && renderAnalysisStep()}

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        {currentStep !== 'restaurant_info' && (
          <button
            onClick={() => {
              if (currentStep === 'review_analysis' || currentStep === 'ready') {
                setCurrentStep('restaurant_info');
              }
            }}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
          >
            ← Précédent
          </button>
        )}
        {currentStep === 'restaurant_info' && (
          <button
            onClick={() => router.push('/ocr-onboarding/upload')}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
          >
            ← Retour Upload
          </button>
        )}
        <div></div> {/* Spacer */}
      </div>
    </div>
  );
}