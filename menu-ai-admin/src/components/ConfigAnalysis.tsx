'use client';

import { useState, useEffect } from 'react';

interface ConfigAnalysisProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export default function ConfigAnalysis({ onAnalysisComplete }: ConfigAnalysisProps) {
  const { fetch: fetchWithEnv } = useFetch();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'templates' | 'patterns'>('overview');

  const runAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithEnv('/api/analyze-configs');
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis);
      } else {
        setError(data.error || 'Erreur lors de l\'analyse');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur analyse:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Lancer l'analyse automatiquement au montage
    runAnalysis();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Analyse des configurations en cours...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800">❌ Erreur d'analyse</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={runAnalysis}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🔍 Analyse des Configurations</h2>
          <button
            onClick={runAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🔄 Actualiser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysis.summary?.total_restaurants || 0}</div>
            <div className="text-sm text-gray-600">Restaurants</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analysis.summary?.total_workflows || 0}</div>
            <div className="text-sm text-gray-600">Workflows</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{analysis.summary?.total_problems || 0}</div>
            <div className="text-sm text-gray-600">Problèmes</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analysis.summary?.success_rate?.toFixed(1) || 0}%</div>
            <div className="text-sm text-gray-600">Taux réussite</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-4">
            {[
              { id: 'overview', label: '📊 Vue d\'ensemble', count: analysis.diagnostic?.panini_problem?.length },
              { id: 'problems', label: '🚨 Problèmes', count: analysis.problems?.length },
              { id: 'templates', label: '✅ Templates', count: analysis.successful_templates?.length },
              { id: 'patterns', label: '📈 Patterns', count: analysis.patterns?.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">🥪 Diagnostic Panini</h3>
                {analysis.diagnostic?.panini_problem?.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.diagnostic.panini_problem.map((panini: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <p><strong>Restaurant:</strong> {panini.france_restaurants?.name}</p>
                        <p><strong>Produit:</strong> {panini.name}</p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-yellow-700 hover:text-yellow-900">
                            🔍 Voir configuration
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(panini.steps_config, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-yellow-700">Aucun produit panini trouvé avec workflow.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">🏪 Par Restaurant</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.existing_workflows?.by_restaurant || {}).map(([restaurant, count]) => (
                      <div key={restaurant} className="flex justify-between">
                        <span className="text-gray-700">{restaurant}</span>
                        <span className="font-medium">{count as number} workflows</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">📈 Structures</h4>
                  <div className="space-y-2">
                    {analysis.restaurant_structures?.slice(0, 5).map((restaurant: any) => (
                      <div key={restaurant.name} className="text-sm">
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-gray-600">
                          {restaurant.categories_count} catégories, {restaurant.products_count} produits
                          ({restaurant.composite_count} composites)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Problèmes */}
          {activeTab === 'problems' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-3">🚨 Problèmes détectés ({analysis.problems?.length || 0})</h3>
                {analysis.problems?.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.problems.slice(0, 10).map((problem: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border border-red-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{problem.restaurant} - {problem.produit}</p>
                            <p className="text-red-600 text-sm">{problem.probleme}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            problem.probleme.includes('nom manquant') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {problem.probleme.includes('nom manquant') ? 'CRITIQUE' : 'MINEUR'}
                          </span>
                        </div>
                        {problem.config_actuelle && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800 text-sm">
                              🔍 Configuration actuelle
                            </summary>
                            <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {problem.config_actuelle}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                    {analysis.problems.length > 10 && (
                      <p className="text-gray-600 text-sm">... et {analysis.problems.length - 10} autres problèmes</p>
                    )}
                  </div>
                ) : (
                  <p className="text-green-700">✅ Aucun problème détecté !</p>
                )}
              </div>
            </div>
          )}

          {/* Templates réussis */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-800 mb-3">✅ Templates réussis ({analysis.successful_templates?.length || 0})</h3>
                {analysis.successful_templates?.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.successful_templates.map((template: any, index: number) => (
                      <div key={index} className="bg-white p-4 rounded border border-green-200">
                        <div className="mb-2">
                          <p className="font-medium">{template.restaurant} - {template.category}</p>
                          <p className="text-green-700">{template.product}</p>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-green-600 hover:text-green-800">
                            🔍 Voir configuration template
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            {JSON.stringify(template.config, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucun template trouvé.</p>
                )}
              </div>
            </div>
          )}

          {/* Patterns */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-800 mb-3">📈 Patterns d'utilisation</h3>
                <p className="text-purple-700">Analyse des patterns de configuration les plus utilisés.</p>
                {analysis.patterns?.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {analysis.patterns.map((pattern: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <p className="font-medium">Pattern #{index + 1}</p>
                        <p className="text-sm text-gray-600">{JSON.stringify(pattern)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 mt-2">Analyse des patterns en cours...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommandations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-3">💡 Recommandations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-blue-700 text-sm flex items-start">
                <span className="mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}