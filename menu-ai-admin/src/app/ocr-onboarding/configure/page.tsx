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
  const [currentStep, setCurrentStep] = useState<'loading' | 'category_config' | 'restaurant_info' | 'ready'>('loading');

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
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const initializeData = async () => {
      await loadPizzaYoloTemplate();
      await loadOCRResults();
      loadCategoryConfigurations();
    };
    initializeData();
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
        // Pré-remplir avec des données par défaut mais permettre la modification
        setNewRestaurantData({
          ...result.data,
          name: 'Mon Nouveau Restaurant', // Nom par défaut générique
          whatsapp_number: result.data.whatsapp_number,
          address: 'Adresse du restaurant',
          city: 'Ville',
          phone: result.data.phone
        });
      }
    } catch (error) {
      console.error('Erreur chargement template Pizza Yolo:', error);
      // Fallback avec données par défaut
      setNewRestaurantData({
        name: 'Mon Nouveau Restaurant',
        whatsapp_number: '0123456789',
        address: 'Adresse du restaurant',
        city: 'Ville',
        phone: '0123456789'
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

      // Vérifier s'il y a déjà une analyse IA existante pour CES PRODUITS SPÉCIFIQUES
      const existingAnalysis = localStorage.getItem('analysisResults');
      const existingConfig = localStorage.getItem('smartConfig');

      if (existingAnalysis && existingConfig && results.products && results.products.length > 0) {
        const analysis = JSON.parse(existingAnalysis);
        const config = JSON.parse(existingConfig);

        // Vérifier que l'analyse correspond aux produits actuels
        const currentProductNames = results.products.map((p: any) => p.name).sort();
        const analysisProductNames = analysis.map((a: any) => a.product.name).sort();

        if (JSON.stringify(currentProductNames) === JSON.stringify(analysisProductNames)) {
          // Les produits correspondent, utiliser l'analyse existante
          setAnalysisResults(analysis);
          setSmartConfig(config);
          setNewRestaurantData(config.newRestaurantData);
          setCurrentStep('ready');
          return;
        }
      }

      // Pas d'analyse correspondante, lancer l'analyse puis passer à la configuration
      await processSmartAnalysisWithResults(results);
      setCurrentStep('category_config');
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
    setCurrentStep('ready');
    finalizeConfiguration();
  };

  const finalizeConfiguration = async () => {
    if (!analysisResults.length) return;

    try {
      // 2. Clonage du template Pizza Yolo 77
      const restaurantTemplate = await RestaurantTemplateClonerService.cloneRestaurantTemplate('pizza-yolo-77');

      // 3. Génération slug unique
      const slug = RestaurantTemplateClonerService.generateUniqueSlug(newRestaurantData.name);

      // 4. Création de la configuration Smart
      const smartConfiguration: OCRSmartConfigure = {
        extractedProducts: ocrResults.products,
        workflowSuggestions: analysisResults.map(r => r.workflowSuggestion),
        categoryMappings: analysisResults.map(r => r.categoryMapping),
        restaurantTemplate,
        newRestaurantData: {
          ...newRestaurantData,
          slug
        }
      };

      setSmartConfig(smartConfiguration);
    } catch (error) {
      console.error('Erreur finalisation configuration:', error);
      alert('Erreur lors de la finalisation de la configuration');
    }
  };

  const processSmartAnalysisWithResults = async (results: any) => {
    if (!results?.products || results.products.length === 0) {
      console.error('Pas de produits OCR disponibles:', results);
      alert('Aucun produit extrait trouvé');
      return;
    }

    console.log('🚀 Début analyse des produits:', results.products.map((p: any) => p.name));
    setProcessing(true);

    try {
      // 1. Analyse IA de tous les produits SCANNÉS (SANS CLASSIFICATION AUTOMATIQUE)
      const products: ExtractedProduct[] = results.products;

      console.log('🔍 Produits à analyser:', products.map(p => p.name));

      // Analyse simplifiée : tous les produits restent dans une seule catégorie
      const analysisResults = products.map(product => {
        console.log('📊 Analyse du produit:', product.name);
        const analysis = ProductAnalysisAIService.analyzeProduct(product);
        // Forcer tous les produits à rester sans catégorie prédéfinie
        analysis.categoryMapping = {
          suggestedCategoryName: '', // Pas de catégorie auto
          icon: '🍽️',
          confidence: 1.0
        };
        return analysis;
      });

      setAnalysisResults(analysisResults);

      console.log('✅ Analyse terminée:', analysisResults.map(r => ({
        nom: r.product.name,
        description: r.product.description,
        type: r.detectedType,
        prixSurPlace: r.pricingSuggestion.onSitePrice,
        prixLivraison: r.pricingSuggestion.deliveryPrice
      })));

    } catch (error) {
      console.error('Erreur analyse smart:', error);
      alert('Erreur lors de l\'analyse intelligente des produits');
    } finally {
      setProcessing(false);
    }
  };

  const processSmartAnalysis = async () => {
    await processSmartAnalysisWithResults(ocrResults);
  };

  const handleConfigureWorkflow = () => {
    if (!categoryName.trim()) {
      alert('Veuillez saisir un nom de catégorie');
      return;
    }

    // Sauvegarder le contexte de configuration de catégorie avec TOUS les produits
    localStorage.setItem('categoryConfigContext', JSON.stringify({
      categoryName: categoryName.trim(),
      categoryProducts: analysisResults, // TOUS les produits scannés
      returnTo: '/ocr-onboarding/configure'
    }));

    // Rediriger vers la page de configuration de catégorie
    router.push('/ocr-onboarding/category-config');
  };

  const handleContinueToRestaurantInfo = () => {
    if (Object.keys(categoryConfigurations).length === 0) {
      alert('Veuillez configurer au moins une catégorie');
      return;
    }

    // Passer à l'étape des informations restaurant
    setCurrentStep('restaurant_info');
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
            • Calcul automatique des prix (+1€ livraison)
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🍽️ Configuration de Catégorie</h2>
            <p className="text-gray-600 mb-6">
              Tous les produits scannés appartiennent à une seule catégorie. Saisissez le nom de la catégorie et configurez le workflow qui s'appliquera à tous ces produits.
            </p>

            {/* Champ de saisie nom de catégorie */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                placeholder="Ex: Burgers, Pizzas, Salades..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Liste des produits scannés */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">📋 Produits scannés ({analysisResults.length})</h3>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                {analysisResults.map((result, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900" title={`Produit scanné: ${result.product.name}`}>
                          {result.product.name}
                        </h4>
                        {result.product.description && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{result.product.description}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end text-xs ml-3">
                        <span className="text-green-600 font-medium">Sur place: {result.pricingSuggestion.onSitePrice}€</span>
                        <span className="text-blue-600 font-medium">Livraison: {result.pricingSuggestion.deliveryPrice}€</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        Type: {result.detectedType.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        Confiance: {Math.round(result.product.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton de configuration */}
            <button
              onClick={handleConfigureWorkflow}
              disabled={!categoryName.trim()}
              className={`w-full py-3 px-6 rounded-lg font-medium ${
                !categoryName.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              🔧 Configurer le Workflow pour "{categoryName || 'cette catégorie'}"
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Résumé</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisResults.length}</div>
                <div className="text-sm text-green-800">Produits scannés</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(categoryConfigurations).length}</div>
                <div className="text-sm text-purple-800">Workflows configurés</div>
              </div>
            </div>

            {Object.keys(categoryConfigurations).length === 0 ? (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Configuration requise</strong> : Configurez le workflow pour continuer
                </p>
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Workflow configuré</strong> : Vous pouvez continuer vers l'intégration
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleContinueToRestaurantInfo}
            disabled={Object.keys(categoryConfigurations).length === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium ${
              Object.keys(categoryConfigurations).length === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Continuer vers Informations Restaurant
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

      {currentStep === 'category_config' && renderAnalysisStep()}
      {currentStep === 'restaurant_info' && renderRestaurantInfoStep()}
      {currentStep === 'ready' && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-semibold text-green-900 mb-2">Configuration Terminée !</h2>
          <p className="text-green-700 mb-6">
            Toutes les catégories sont configurées et les informations restaurant sont complètes.
          </p>
          <button
            onClick={handleContinueToDatabase}
            className="bg-green-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-green-700"
          >
            Continuer vers l'Intégration Base de Données
          </button>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-8">
        {currentStep === 'restaurant_info' && (
          <button
            onClick={() => setCurrentStep('category_config')}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
          >
            ← Retour Configuration Catégories
          </button>
        )}
        {currentStep === 'category_config' && (
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