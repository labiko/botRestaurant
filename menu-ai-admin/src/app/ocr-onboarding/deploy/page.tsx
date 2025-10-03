// ÉTAPE 5 : Deploy (/ocr-onboarding/deploy)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';

export default function OCRDeployPage() {
  const { fetch: fetchWithEnv } = useFetch();
  const router = useRouter();

  // États principaux
  const [integrationResult, setIntegrationResult] = useState<any>(null);
  const [finalWorkflows, setFinalWorkflows] = useState<any[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'ready' | 'deploying' | 'success' | 'error'>('ready');
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'DEV' | 'PROD'>('DEV');

  useEffect(() => {
    loadFinalData();
  }, []);

  const loadFinalData = async () => {
    try {
      const integrationStored = localStorage.getItem('integrationResult');
      const workflowsStored = localStorage.getItem('finalWorkflows');

      if (!integrationStored || !workflowsStored) {
        alert('Données de déploiement non trouvées. Retour à l\'étape précédente.');
        router.push('/ocr-onboarding/workflow');
        return;
      }

      const integration = JSON.parse(integrationStored);
      const workflows = JSON.parse(workflowsStored);

      setIntegrationResult(integration);
      setFinalWorkflows(workflows);
    } catch (error) {
      console.error('Erreur chargement données finales:', error);
      alert('Erreur lors du chargement des données');
      router.push('/ocr-onboarding/workflow');
    }
  };

  const handleDeploy = async () => {
    if (!integrationResult?.sql) {
      alert('SQL de déploiement non disponible');
      return;
    }

    setDeploymentStatus('deploying');

    try {
      // Exécution du SQL d'intégration complète
      const response = await fetchWithEnv('/api/ocr/execute-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: integrationResult.sql,
          environment: selectedEnvironment,
          source: 'ocr-smart-onboarding'
        })
      });

      const result = await response.json();

      if (result.success) {
        setDeploymentResult(result);
        setDeploymentStatus('success');

        // Nettoyer le localStorage après succès
        localStorage.removeItem('ocrResults');
        localStorage.removeItem('smartConfig');
        localStorage.removeItem('analysisResults');
        localStorage.removeItem('integrationResult');
        localStorage.removeItem('finalWorkflows');
      } else {
        setDeploymentResult(result);
        setDeploymentStatus('error');
      }
    } catch (error) {
      console.error('Erreur déploiement:', error);
      setDeploymentResult({
        success: false,
        error: `Erreur de déploiement: ${error}`
      });
      setDeploymentStatus('error');
    }
  };

  const handleRestart = () => {
    // Nettoyer complètement le localStorage OCR
    ['ocrResults', 'smartConfig', 'analysisResults', 'integrationResult', 'finalWorkflows'].forEach(key => {
      localStorage.removeItem(key);
    });
    router.push('/ocr-onboarding/upload');
  };

  const handleTestBot = async () => {
    if (!deploymentResult?.restaurantId) {
      alert('Restaurant non déployé');
      return;
    }

    try {
      const response = await fetchWithEnv('/api/test-bot-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: deploymentResult.restaurantId,
          environment: selectedEnvironment,
          testScenarios: [
            'basic_menu_navigation',
            'product_workflow_simple',
            'product_workflow_complex'
          ]
        })
      });

      const testResults = await response.json();

      if (testResults.success) {
        alert(`Tests bot réussis !\n\n${testResults.summary}`);
      } else {
        alert(`Tests bot échoués :\n${testResults.error}`);
      }
    } catch (error) {
      console.error('Erreur test bot:', error);
      alert('Erreur lors des tests automatiques du bot');
    }
  };

  const renderReadyStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🚀 Prêt pour le Déploiement</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-blue-800">Restaurant</div>
            <div className="text-xs text-gray-600">Avec template Pizza Yolo 77</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{integrationResult?.categoriesCreated}</div>
            <div className="text-sm text-green-800">Catégories</div>
            <div className="text-xs text-gray-600">Clonées de Pizza Yolo 77</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{finalWorkflows.length}</div>
            <div className="text-sm text-purple-800">Produits</div>
            <div className="text-xs text-gray-600">Avec workflows IA</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-900 mb-2">✅ Configuration Finalisée</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Restaurant configuré avec template Pizza Yolo 77 (22 catégories)</li>
            <li>• {finalWorkflows.length} produits analysés par IA avec workflows optimisés</li>
            <li>• SQL transactionnel généré (BEGIN/COMMIT)</li>
            <li>• Simulation bot WhatsApp validée</li>
            <li>• Intégration WorkflowGeneratorV2 complète</li>
          </ul>
        </div>

        {/* Sélection environnement */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environnement de déploiement :
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedEnvironment('DEV')}
              className={`p-3 border rounded-lg text-center ${
                selectedEnvironment === 'DEV'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">🧪 DÉVELOPPEMENT</div>
              <div className="text-xs">Tests et validation</div>
            </button>
            <button
              onClick={() => setSelectedEnvironment('PROD')}
              className={`p-3 border rounded-lg text-center ${
                selectedEnvironment === 'PROD'
                  ? 'border-red-500 bg-red-50 text-red-900'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">🚀 PRODUCTION</div>
              <div className="text-xs">Déploiement final</div>
            </button>
          </div>
        </div>

        <button
          onClick={handleDeploy}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700"
        >
          🚀 Déployer en {selectedEnvironment}
        </button>
      </div>

      {/* Aperçu SQL */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">📄 Aperçu SQL de Déploiement</h3>
          <button
            onClick={() => navigator.clipboard.writeText(integrationResult?.sql || '')}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            📋 Copier
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
            {integrationResult?.sql?.substring(0, 2000)}...
          </pre>
        </div>
      </div>
    </div>
  );

  const renderDeployingStep = () => (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold mb-4">🚀 Déploiement en cours...</h2>
      <div className="space-y-2 text-gray-600">
        <p>• Exécution SQL transactionnelle</p>
        <p>• Création restaurant et catégories</p>
        <p>• Insertion des produits avec workflows</p>
        <p>• Validation de l'intégrité des données</p>
        <p>• Tests automatiques du bot</p>
      </div>
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          ⏱️ Déploiement en environnement <strong>{selectedEnvironment}</strong>...
        </p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-green-900">Déploiement Réussi !</h2>
            <p className="text-green-700">Restaurant créé avec succès en {selectedEnvironment}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{deploymentResult?.restaurantId}</div>
            <div className="text-sm text-green-800">Restaurant ID</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{deploymentResult?.categoriesCreated}</div>
            <div className="text-sm text-blue-800">Catégories</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{deploymentResult?.productsCreated}</div>
            <div className="text-sm text-purple-800">Produits</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{deploymentResult?.workflowsCreated}</div>
            <div className="text-sm text-yellow-800">Workflows</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-900 mb-2">🔗 Informations de Connexion</h3>
          <div className="text-sm text-green-800 space-y-1">
            <div><strong>WhatsApp :</strong> {deploymentResult?.whatsappNumber}</div>
            <div><strong>Slug :</strong> {deploymentResult?.restaurantSlug}</div>
            <div><strong>URL Vitrine :</strong> <a href={deploymentResult?.vitrineUrl} target="_blank" className="text-blue-600 underline">{deploymentResult?.vitrineUrl}</a></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleTestBot}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
          >
            🤖 Tester Bot WhatsApp
          </button>
          <button
            onClick={() => router.push('/back-office-restaurant')}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700"
          >
            🏪 Gérer Restaurant
          </button>
        </div>
      </div>

      {deploymentResult?.botSimulation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">🤖 Test Bot - Workflow Fonctionnel</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {deploymentResult.botSimulation}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <h3 className="font-semibold text-blue-900 mb-2">✅ OCR Smart Onboarding Terminé</h3>
        <p className="text-blue-800">
          Votre restaurant a été créé automatiquement depuis une image de menu grâce à
          l'OCR OpenAI et l'analyse IA. Tous les workflows sont fonctionnels !
        </p>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">❌</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-red-900">Erreur de Déploiement</h2>
          <p className="text-red-700">{deploymentResult?.error}</p>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-red-900 mb-2">🔍 Détails de l'Erreur</h3>
        <pre className="text-sm text-red-800 whitespace-pre-wrap">
          {JSON.stringify(deploymentResult, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setDeploymentStatus('ready')}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          🔄 Réessayer
        </button>
        <button
          onClick={() => router.push('/ocr-onboarding/workflow')}
          className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600"
        >
          ← Retour Configuration
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🚀 OCR Deploy & Test</h1>
          <div className="text-sm text-gray-600">Étape 5/5</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {deploymentStatus === 'ready' && renderReadyStep()}
      {deploymentStatus === 'deploying' && renderDeployingStep()}
      {deploymentStatus === 'success' && renderSuccessStep()}
      {deploymentStatus === 'error' && renderErrorStep()}
    </div>
  );
}