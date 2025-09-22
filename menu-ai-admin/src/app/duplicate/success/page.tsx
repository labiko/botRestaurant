'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DuplicationResult {
  success: boolean;
  restaurantId: number;
  stats: {
    categories: number;
    products: number;
    workflows: number;
    options: number;
  };
  message: string;
}

export default function DuplicationSuccessPage() {
  const router = useRouter();
  const [result, setResult] = useState<DuplicationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResultData();
  }, []);

  const loadResultData = () => {
    try {
      const resultData = sessionStorage.getItem('duplication-result');

      if (!resultData) {
        router.push('/duplicate');
        return;
      }

      const parsedResult = JSON.parse(resultData) as DuplicationResult;
      setResult(parsedResult);

      // Nettoyer les données de session
      sessionStorage.removeItem('duplication-result');
    } catch (err) {
      console.error('Erreur chargement résultat:', err);
      router.push('/duplicate');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToEdit = () => {
    if (result?.restaurantId) {
      router.push(`/restaurant/${result.restaurantId}/edit`);
    }
  };

  const handleTestBot = () => {
    if (result?.restaurantId) {
      router.push(`/restaurant/${result.restaurantId}/test`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalisation de la duplication...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Résultats non trouvés</div>
          <button
            onClick={() => router.push('/duplicate')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nouvelle Duplication
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête de succès */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <span className="text-4xl">🎉</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            Duplication Réussie !
          </h1>
          <p className="text-xl text-gray-600">
            {result.message}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* Statistiques de duplication */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              📊 Résultats de la Duplication
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {result.stats.categories}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  Catégories
                </div>
                <div className="text-xs text-blue-500">
                  dupliquées
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {result.stats.products}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Produits
                </div>
                <div className="text-xs text-green-500">
                  créés
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {result.stats.workflows}
                </div>
                <div className="text-sm text-purple-700 font-medium">
                  Workflows
                </div>
                <div className="text-xs text-purple-500">
                  configurés
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {result.stats.options}
                </div>
                <div className="text-sm text-orange-700 font-medium">
                  Options
                </div>
                <div className="text-xs text-orange-500">
                  générées
                </div>
              </div>
            </div>
          </div>

          {/* Actions disponibles */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔧 Actions Disponibles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleGoToEdit}
                className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="font-medium text-blue-900">Éditer Produits</div>
                    <div className="text-sm text-blue-600">
                      Modifier noms, prix et descriptions
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push(`/restaurant/${result.restaurantId}/prices`)}
                className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="font-medium text-green-900">Modifier Prix</div>
                    <div className="text-sm text-green-600">
                      Ajuster les tarifs en masse
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push(`/restaurant/${result.restaurantId}/categories`)}
                className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="font-medium text-purple-900">Gérer Catégories</div>
                    <div className="text-sm text-purple-600">
                      Réorganiser et renommer
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push(`/restaurant/${result.restaurantId}/workflows`)}
                className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <div className="font-medium text-orange-900">Configurer Workflows</div>
                    <div className="text-sm text-orange-600">
                      Personnaliser les choix
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleTestBot}
                className="p-4 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-medium text-indigo-900">Tester Bot</div>
                    <div className="text-sm text-indigo-600">
                      Simuler commandes WhatsApp
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push(`/restaurant/${result.restaurantId}/preview`)}
                className="p-4 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-medium text-pink-900">Voir Aperçu</div>
                    <div className="text-sm text-pink-600">
                      Interface client final
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-xl">💡</span>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Prochaines Étapes Recommandées</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Vérifiez et adaptez les noms de produits selon votre menu</li>
                  <li>• Ajustez les prix selon vos tarifs locaux</li>
                  <li>• Testez les workflows avec le simulateur de bot</li>
                  <li>• Personnalisez les options de choix selon vos préférences</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions finales */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              🏠 Retour Accueil
            </button>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/duplicate')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                🔄 Nouvelle Duplication
              </button>

              <button
                onClick={handleTestBot}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                🤖 Tester Maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}