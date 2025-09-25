// ÉTAPE 4 : Workflow Configuration pré-remplie (Réutilisation Workflow Universal V2)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkflowGeneratorV2, UniversalWorkflow } from '@/lib/workflow-generator-v2';
import { DatabaseIntegrationResult } from '@/lib/ocr/services/database-integration.service';
import { ProductAnalysisResult } from '@/lib/ocr/interfaces/ocr-smart-configure.interface';

export default function OCRWorkflowPage() {
  const router = useRouter();

  // États principaux
  const [integrationResult, setIntegrationResult] = useState<DatabaseIntegrationResult | null>(null);
  const [analysisResults, setAnalysisResults] = useState<ProductAnalysisResult[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [currentWorkflow, setCurrentWorkflow] = useState<UniversalWorkflow | null>(null);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [botSimulation, setBotSimulation] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  // États pour modification workflows
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [editedWorkflow, setEditedWorkflow] = useState<UniversalWorkflow | null>(null);

  useEffect(() => {
    loadIntegrationData();
  }, []);

  useEffect(() => {
    if (analysisResults.length > 0) {
      loadProductWorkflow(selectedProductIndex);
    }
  }, [selectedProductIndex, analysisResults]);

  const loadIntegrationData = async () => {
    try {
      const integrationStored = localStorage.getItem('integrationResult');
      const analysisStored = localStorage.getItem('analysisResults');

      if (!integrationStored || !analysisStored) {
        alert('Données d\'intégration non trouvées. Retour à l\'étape précédente.');
        router.push('/ocr-onboarding/database');
        return;
      }

      const integration = JSON.parse(integrationStored);
      const analysis = JSON.parse(analysisStored);

      setIntegrationResult(integration);
      setAnalysisResults(analysis);
    } catch (error) {
      console.error('Erreur chargement données intégration:', error);
      alert('Erreur lors du chargement des données');
      router.push('/ocr-onboarding/database');
    }
  };

  const loadProductWorkflow = (productIndex: number) => {
    if (!analysisResults[productIndex]) return;

    const result = analysisResults[productIndex];
    const product = result.product;

    // Création du workflow universel pré-rempli par l'IA
    const prefilledWorkflow: UniversalWorkflow = {
      productName: product.name,
      restaurantId: integrationResult?.restaurantId || 999,
      categoryName: result.categoryMapping.suggestedCategoryName,
      onSitePrice: result.pricingSuggestion.onSitePrice,
      deliveryPrice: result.pricingSuggestion.deliveryPrice,
      steps: result.workflowSuggestion.steps,
      optionGroups: result.workflowSuggestion.optionGroups
    };

    setCurrentWorkflow(prefilledWorkflow);
    setEditedWorkflow(prefilledWorkflow);
    generateWorkflowPreview(prefilledWorkflow);
  };

  const generateWorkflowPreview = (workflow: UniversalWorkflow) => {
    // Utilisation du WorkflowGeneratorV2 existant
    const validation = WorkflowGeneratorV2.validateForBot(workflow);
    setValidationResult(validation);

    if (validation.valid) {
      // Génération SQL
      const sql = WorkflowGeneratorV2.generateCompleteSQL(workflow);
      setGeneratedSQL(sql);

      // Génération simulation bot
      const simulation = WorkflowGeneratorV2.simulateBotFlow(workflow);
      setBotSimulation(simulation);
    } else {
      setGeneratedSQL('');
      setBotSimulation('');
    }
  };

  const handleEditWorkflow = () => {
    setIsEditingWorkflow(true);
  };

  const handleSaveWorkflowChanges = () => {
    if (!editedWorkflow) return;

    // Mise à jour dans les résultats d'analyse
    const updatedResults = [...analysisResults];
    updatedResults[selectedProductIndex].workflowSuggestion = {
      ...updatedResults[selectedProductIndex].workflowSuggestion,
      steps: editedWorkflow.steps,
      optionGroups: editedWorkflow.optionGroups
    };

    setAnalysisResults(updatedResults);
    setCurrentWorkflow(editedWorkflow);
    generateWorkflowPreview(editedWorkflow);
    setIsEditingWorkflow(false);

    // Sauvegarder les modifications
    localStorage.setItem('analysisResults', JSON.stringify(updatedResults));
  };

  const handleCancelWorkflowEdit = () => {
    setEditedWorkflow(currentWorkflow);
    setIsEditingWorkflow(false);
  };

  const handleContinueToDeploy = () => {
    // Sauvegarder les workflows finalisés
    localStorage.setItem('finalWorkflows', JSON.stringify(analysisResults));
    router.push('/ocr-onboarding/deploy');
  };

  const renderProductSelector = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">🍽️ Sélectionnez un Produit à Configurer</h2>

      <div className="grid gap-3">
        {analysisResults.map((result, index) => (
          <button
            key={index}
            onClick={() => setSelectedProductIndex(index)}
            className={`p-3 border rounded-lg text-left transition-colors ${
              selectedProductIndex === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
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
          </button>
        ))}
      </div>
    </div>
  );

  const renderWorkflowEditor = () => {
    if (!currentWorkflow) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            🔧 Configuration Workflow - {currentWorkflow.productName}
          </h2>
          {!isEditingWorkflow ? (
            <button
              onClick={handleEditWorkflow}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ✏️ Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveWorkflowChanges}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={handleCancelWorkflowEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                ❌ Annuler
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Informations Produit</h3>
            <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
              <div><strong>Nom :</strong> {currentWorkflow.productName}</div>
              <div><strong>Catégorie :</strong> {currentWorkflow.categoryName}</div>
              <div><strong>Prix sur site :</strong> {currentWorkflow.onSitePrice}€</div>
              <div><strong>Prix livraison :</strong> {currentWorkflow.deliveryPrice}€</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Type Détecté par IA</h3>
            <div className="bg-blue-50 p-3 rounded">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                analysisResults[selectedProductIndex]?.detectedType === 'simple' ? 'bg-green-100 text-green-800' :
                analysisResults[selectedProductIndex]?.detectedType === 'modular' ? 'bg-blue-100 text-blue-800' :
                analysisResults[selectedProductIndex]?.detectedType === 'composite' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {analysisResults[selectedProductIndex]?.detectedType?.toUpperCase() || 'INCONNU'}
              </span>
              <p className="text-sm mt-2 text-blue-800">
                {analysisResults[selectedProductIndex]?.workflowSuggestion.reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Étapes du Workflow</h3>
          {currentWorkflow.steps.length > 0 ? (
            <div className="space-y-3">
              {currentWorkflow.steps.map((step, index) => (
                <div key={index} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">Étape {step.step}: {step.prompt}</div>
                    <div className="text-xs text-gray-500">
                      {step.required ? 'Obligatoire' : 'Optionnel'} • Max {step.max_selections}
                    </div>
                  </div>

                  {step.option_groups.map(groupName => {
                    const options = currentWorkflow.optionGroups[groupName] || [];
                    return (
                      <div key={groupName} className="mt-2">
                        <div className="text-sm font-medium text-gray-700">{groupName}:</div>
                        <div className="ml-2 text-sm space-y-1">
                          {options.map((option, optIndex) => (
                            <div key={optIndex} className="flex justify-between">
                              <span>{option.emoji} {option.name}</span>
                              <span className={option.price_modifier >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {option.price_modifier > 0 ? '+' : ''}{option.price_modifier}€
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded">
              <div className="text-gray-500 mb-2">Produit Simple</div>
              <div className="text-sm text-gray-600">Aucun workflow complexe requis</div>
            </div>
          )}
        </div>

        {isEditingWorkflow && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">✏️ Mode Édition</h4>
            <p className="text-sm text-yellow-800">
              Pour modifier ce workflow, utilisez l'interface complète du
              <strong> Workflow Universel V2</strong>. Les modifications seront appliquées à ce produit.
            </p>
            <button
              onClick={() => {
                // Sauvegarder le contexte et rediriger vers Workflow Universal V2
                localStorage.setItem('ocrWorkflowContext', JSON.stringify({
                  productIndex: selectedProductIndex,
                  returnTo: '/ocr-onboarding/workflow'
                }));
                router.push('/workflow-universal');
              }}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🔧 Ouvrir dans Workflow Universal V2
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderValidationAndPreview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Validation */}
      {validationResult && (
        <div className={`bg-white rounded-lg shadow p-6 ${validationResult.valid ? 'border-green-500' : 'border-red-500'} border-2`}>
          <h3 className="font-semibold mb-4">
            {validationResult.valid ? '✅ Validation Réussie' : '❌ Erreurs de Validation'}
          </h3>
          {validationResult.errors?.length > 0 && (
            <div className="space-y-1 mb-4">
              {validationResult.errors.map((error: string, i: number) => (
                <p key={i} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}
          {validationResult.warnings?.length > 0 && (
            <div className="space-y-1">
              {validationResult.warnings.map((warning: string, i: number) => (
                <p key={i} className="text-yellow-600 text-sm">{warning}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simulation Bot */}
      {botSimulation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">🤖 Simulation Bot</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono">{botSimulation}</pre>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔧 OCR Workflow Configuration</h1>
          <div className="text-sm text-gray-600">Étape 4/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
        </div>
      </div>

      {/* Info intégration */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🔄 Réutilisation Workflow Universal V2</h3>
        <p className="text-blue-800 text-sm">
          Cette étape utilise l'interface existante du <strong>Workflow Universal V2</strong> avec des configurations
          pré-remplies par l'analyse IA. Tous les workflows sont générés automatiquement et peuvent être modifiés.
        </p>
      </div>

      {renderProductSelector()}
      {renderWorkflowEditor()}
      {renderValidationAndPreview()}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => {
            // Naviguer vers database en préservant les données
            const currentIntegration = localStorage.getItem('integrationResult');
            const currentAnalysis = localStorage.getItem('analysisResults');
            if (currentIntegration && currentAnalysis) {
              // Les données existent déjà, navigation sécurisée
              router.push('/ocr-onboarding/database');
            } else {
              // Fallback si données manquantes
              alert('Données d\'intégration manquantes. Retour à l\'étape de configuration.');
              router.push('/ocr-onboarding/configure');
            }
          }}
          className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
        >
          ← Précédent
        </button>
        <button
          onClick={handleContinueToDeploy}
          className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
        >
          Finaliser et Déployer →
        </button>
      </div>
    </div>
  );
}