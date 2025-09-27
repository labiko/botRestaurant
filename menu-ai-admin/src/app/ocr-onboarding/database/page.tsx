// ÉTAPE 3 : Database Integration avec clonage restaurant
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseIntegrationService, DatabaseIntegrationResult } from '@/lib/ocr/services/database-integration.service';
import { OCRSmartConfigure, ProductAnalysisResult } from '@/lib/ocr/interfaces/ocr-smart-configure.interface';

export default function OCRDatabasePage() {
  const router = useRouter();

  // États principaux
  const [smartConfig, setSmartConfig] = useState<OCRSmartConfigure | null>(null);
  const [analysisResults, setAnalysisResults] = useState<ProductAnalysisResult[]>([]);
  const [integrationResult, setIntegrationResult] = useState<DatabaseIntegrationResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'loading' | 'preview' | 'integration' | 'completed'>('loading');

  useEffect(() => {
    loadConfigurationData();
  }, []);

  const loadConfigurationData = async () => {
    try {
      const smartConfigStored = localStorage.getItem('smartConfig');
      const analysisResultsStored = localStorage.getItem('analysisResults');

      if (!smartConfigStored || !analysisResultsStored) {
        alert('Configuration Smart non trouvée. Retour à l\'étape de configuration.');
        router.push('/ocr-onboarding/configure');
        return;
      }

      const config = JSON.parse(smartConfigStored);
      const results = JSON.parse(analysisResultsStored);

      setSmartConfig(config);
      setAnalysisResults(results);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Erreur chargement configuration:', error);
      alert('Erreur lors du chargement de la configuration');
      router.push('/ocr-onboarding/configure');
    }
  };

  const handleIntegrateDatabase = async () => {
    if (!smartConfig || !analysisResults.length) {
      alert('Configuration incomplète');
      return;
    }

    // Validation préalable
    const validation = DatabaseIntegrationService.validateConfiguration(smartConfig, analysisResults);
    if (!validation.valid) {
      alert(`Erreurs de validation :\n${validation.errors.join('\n')}`);
      return;
    }

    setProcessing(true);
    setCurrentStep('integration');

    try {
      // Intégration complète avec WorkflowGeneratorV2
      const result = await DatabaseIntegrationService.integrateSmartConfiguration(
        smartConfig,
        analysisResults
      );

      setIntegrationResult(result);
      setCurrentStep('completed');

      if (result.success) {
        // Sauvegarde pour l'étape suivante
        localStorage.setItem('integrationResult', JSON.stringify(result));
      }

    } catch (error) {
      console.error('Erreur intégration database:', error);
      alert('Erreur lors de l\'intégration en base de données');
      setCurrentStep('preview');
    } finally {
      setProcessing(false);
    }
  };

  const handleContinueToWorkflow = () => {
    if (!integrationResult?.success) {
      alert('Intégration non réussie');
      return;
    }

    router.push('/ocr-onboarding/workflow');
  };

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🏪 Aperçu du Restaurant à Créer</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Informations Restaurant</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Nom :</strong> {smartConfig?.newRestaurantData.name}</div>
              <div><strong>Slug :</strong> {smartConfig?.newRestaurantData.slug}</div>
              <div><strong>WhatsApp :</strong> {smartConfig?.newRestaurantData.whatsapp_number}</div>
              {smartConfig?.newRestaurantData.address && (
                <div><strong>Adresse :</strong> {smartConfig.newRestaurantData.address}</div>
              )}
              {smartConfig?.newRestaurantData.city && (
                <div><strong>Ville :</strong> {smartConfig.newRestaurantData.city}</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Template Pizza Yolo 77</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Catégories :</strong> {smartConfig?.restaurantTemplate.categories.length}</div>
              <div><strong>Zone livraison :</strong> {smartConfig?.restaurantTemplate.baseConfig.delivery_zone_km} km</div>
              <div><strong>Frais livraison :</strong> {smartConfig?.restaurantTemplate.baseConfig.delivery_fee}€</div>
              <div><strong>Commande min :</strong> {smartConfig?.restaurantTemplate.baseConfig.min_order_amount}€</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Récapitulatif des Produits</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysisResults.length}</div>
            <div className="text-sm text-blue-800">Produits total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analysisResults.filter(r => r.detectedType === 'simple').length}
            </div>
            <div className="text-sm text-green-800">Simple</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analysisResults.filter(r => r.detectedType === 'modular').length}
            </div>
            <div className="text-sm text-blue-800">Modulaire</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analysisResults.filter(r => r.detectedType === 'composite').length}
            </div>
            <div className="text-sm text-purple-800">Composite</div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="grid gap-3">
            {analysisResults.map((result, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{result.categoryMapping.icon}</span>
                    <div>
                      <div className="font-medium">{result.product.name}</div>
                      <div className="text-xs text-gray-500">
                        {result.categoryMapping.suggestedCategoryName} •
                        {result.detectedType} •
                        {result.workflowSuggestion.steps.length} étapes
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <div>Sur site: {result.pricingSuggestion.onSitePrice}€</div>
                    <div>Livraison: {result.pricingSuggestion.deliveryPrice}€</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🔧 Intégration avec WorkflowGeneratorV2</h3>
        <p className="text-blue-800 text-sm">
          Tous les produits seront créés en utilisant le système WorkflowGeneratorV2 existant,
          garantissant une compatibilité totale avec le bot WhatsApp et une génération SQL optimisée.
        </p>
      </div>

      <button
        onClick={handleIntegrateDatabase}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700"
      >
        🚀 Intégrer en Base de Données
      </button>
    </div>
  );

  const renderIntegrationStep = () => (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold mb-4">🔄 Intégration en cours...</h2>
      <div className="space-y-2 text-gray-600">
        <p>• Génération SQL transactionnelle</p>
        <p>• Clonage template Pizza Yolo 77</p>
        <p>• Création restaurant et 22 catégories</p>
        <p>• Génération workflows avec WorkflowGeneratorV2</p>
        <p>• Simulation bot WhatsApp</p>
      </div>
      <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⏱️ Cette opération peut prendre quelques secondes...
        </p>
      </div>
    </div>
  );

  const renderCompletedStep = () => (
    <div className="space-y-6">
      {integrationResult?.success ? (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-900">Intégration Réussie !</h2>
                <p className="text-green-700">Configuration générée avec succès</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">1</div>
                <div className="text-sm text-green-800">Restaurant</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{integrationResult.categoriesCreated}</div>
                <div className="text-sm text-blue-800">Catégories</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{integrationResult.productsCreated}</div>
                <div className="text-sm text-purple-800">Produits</div>
              </div>
            </div>

            {integrationResult.warnings && integrationResult.warnings.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Avertissements :</h4>
                <ul className="list-disc list-inside space-y-1">
                  {integrationResult.warnings.map((warning, i) => (
                    <li key={i} className="text-yellow-800 text-sm">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">📄 SQL Généré (Transactionnel)</h3>
              <button
                onClick={() => navigator.clipboard.writeText(integrationResult.sql || '')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                📋 Copier SQL
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                {integrationResult.sql?.substring(0, 1000)}...
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🤖 Simulation Bot WhatsApp</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {integrationResult.simulation}
              </pre>
            </div>
          </div>

          <button
            onClick={handleContinueToWorkflow}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700"
          >
            Continuer vers Configuration Workflows
          </button>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900">Erreur d'Intégration</h2>
              <p className="text-red-700">{integrationResult?.error}</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('preview')}
            className="w-full bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
          >
            Retour à l'Aperçu
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🗄️ OCR Database Integration</h1>
          <div className="text-sm text-gray-600">Étape 3/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>

      {currentStep === 'loading' && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de la configuration Smart...</p>
        </div>
      )}

      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'integration' && renderIntegrationStep()}
      {currentStep === 'completed' && renderCompletedStep()}

      {/* Boutons de navigation */}
      {currentStep === 'preview' && (
        <div className="flex justify-between mt-8">
          <button
            onClick={() => {
              // Naviguer vers configure en préservant les données
              const currentConfig = localStorage.getItem('smartConfig');
              const currentAnalysis = localStorage.getItem('analysisResults');
              if (currentConfig && currentAnalysis) {
                // Les données existent déjà, navigation sécurisée
                router.push('/ocr-onboarding/configure');
              } else {
                // Fallback si données manquantes
                alert('Données de configuration manquantes. Retour à l\'étape d\'upload.');
                router.push('/ocr-onboarding/upload');
              }
            }}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
          >
            ← Précédent
          </button>
          <div></div> {/* Spacer */}
        </div>
      )}
    </div>
  );
}