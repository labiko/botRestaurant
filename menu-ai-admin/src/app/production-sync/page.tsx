'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductionSyncModal from '@/components/ProductionSyncModal';

interface ProductionDuplication {
  id: number;
  duplication_type: 'restaurant' | 'category';
  source_restaurant: { name: string } | null;
  target_restaurant: { name: string } | null;
  production_status: 'dev_only' | 'synced' | 'outdated' | 'error';
  last_production_sync: string | null;
  sync_count: number;
  target_restaurant_id: number;
}

export default function ProductionSyncPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [duplications, setDuplications] = useState<ProductionDuplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'dev_only' | 'synced' | 'outdated'>('all');

  // État pour le modal de synchronisation
  const [selectedDuplication, setSelectedDuplication] = useState<ProductionDuplication | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [showScriptModal, setShowScriptModal] = useState(false);

  useEffect(() => {
    loadProductionData();

    // Si ID passé en paramètre, ouvrir directement le modal
    const id = searchParams.get('id');
    if (id) {
      // Après chargement des données, ouvrir le modal pour cet ID
    }
  }, []);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/production-sync/list');
      const data = await response.json();

      if (data.success) {
        setDuplications(data.duplications);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur chargement production sync:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🟢 Synchronisé
          </span>
        );
      case 'outdated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🟡 Modifié
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Erreur
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🔵 DEV uniquement
          </span>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openSyncModal = (duplication: ProductionDuplication) => {
    setSelectedDuplication(duplication);
    setShowSyncModal(true);
  };

  const closeSyncModal = () => {
    setShowSyncModal(false);
    setSelectedDuplication(null);
  };

  const generateScript = async (duplicationId: number, syncType: string, selectedCategories?: string[]) => {
    try {
      const response = await fetch('/api/production-sync/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duplicationId,
          syncType,
          selectedCategories
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedScript(data.script);
        setShowScriptModal(true);
        closeSyncModal();
      } else {
        alert('Erreur génération script: ' + data.error);
      }
    } catch (error) {
      alert('Erreur génération script');
      console.error('Erreur:', error);
    }
  };

  const markAsExecuted = async (duplicationId: number) => {
    try {
      const response = await fetch(`/api/production-sync/mark-executed/${duplicationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Synchronisation marquée comme exécutée pour ${data.data.restaurant}`);
        // Recharger les données pour mettre à jour l'affichage
        loadProductionData();
      } else {
        alert('Erreur marquage synchronisation: ' + data.error);
      }
    } catch (error) {
      alert('Erreur marquage synchronisation');
      console.error('Erreur:', error);
    }
  };

  const filteredDuplications = duplications.filter(dup => {
    if (filter === 'all') return true;
    return dup.production_status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de production...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <button
            onClick={loadProductionData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔄 Gestion Synchronisation Production
              </h1>
              <p className="text-gray-600">
                Synchronisez vos restaurants dupliqués vers l'environnement de production
              </p>
            </div>
            <button
              onClick={() => router.push('/duplicate/history')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              📚 Historique Duplications
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filtrer par statut :</span>

            {(['all', 'dev_only', 'synced', 'outdated'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' && '🔍 Tous'}
                {filterOption === 'dev_only' && '🔵 DEV uniquement'}
                {filterOption === 'synced' && '🟢 Synchronisés'}
                {filterOption === 'outdated' && '🟡 Modifiés'}
                {filterOption === 'all' && ` (${duplications.length})`}
                {filterOption === 'dev_only' && ` (${duplications.filter(d => d.production_status === 'dev_only').length})`}
                {filterOption === 'synced' && ` (${duplications.filter(d => d.production_status === 'synced').length})`}
                {filterOption === 'outdated' && ` (${duplications.filter(d => d.production_status === 'outdated').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau des restaurants */}
        {filteredDuplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <span className="text-6xl mb-4 block">🔄</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun restaurant trouvé</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Aucun restaurant dupliqué trouvé.'
                : `Aucun restaurant avec le statut "${filter}" trouvé.`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut Production
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière Sync
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nb Sync
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDuplications.map((dup) => (
                    <tr key={dup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {dup.duplication_type === 'category'
                              ? `📁 CAT-${String(dup.id).padStart(3, '0')}`
                              : `🏪 REST-${String(dup.id).padStart(3, '0')}`
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            {dup.source_restaurant?.name} → {dup.target_restaurant?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(dup.production_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(dup.last_production_sync)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dup.sync_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {dup.production_status === 'dev_only' && (
                            <>
                              <button
                                onClick={() => generateScript(dup.id, 'complete', [])}
                                className="text-blue-600 hover:text-blue-900"
                                title="Générer script SQL"
                              >
                                📜 Générer
                              </button>
                              <button
                                onClick={() => openSyncModal(dup)}
                                className="text-green-600 hover:text-green-900"
                                title="Synchroniser"
                              >
                                🔄 Sync
                              </button>
                              <button
                                onClick={() => markAsExecuted(dup.id)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Marquer comme synchronisé en production"
                              >
                                ✅ Exécuté
                              </button>
                            </>
                          )}

                          {dup.production_status === 'synced' && (
                            <button
                              onClick={() => alert('Fonctionnalité historique à implémenter')}
                              className="text-purple-600 hover:text-purple-900"
                              title="Voir historique"
                            >
                              📊 Historique
                            </button>
                          )}

                          {dup.production_status === 'outdated' && (
                            <>
                              <button
                                onClick={() => generateScript(dup.id, 'update', [])}
                                className="text-blue-600 hover:text-blue-900"
                                title="Générer script SQL"
                              >
                                📜 Générer
                              </button>
                              <button
                                onClick={() => alert('Fonctionnalité historique à implémenter')}
                                className="text-purple-600 hover:text-purple-900"
                                title="Voir historique"
                              >
                                📊 Historique
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de synchronisation */}
        <ProductionSyncModal
          isOpen={showSyncModal}
          onClose={closeSyncModal}
          duplication={selectedDuplication}
          onSync={(syncType, selectedCategories) => generateScript(selectedDuplication!.id, syncType, selectedCategories?.map(String))}
        />

        {/* Modal script généré - À implémenter */}
        {showScriptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96">
              <h3 className="text-lg font-medium mb-4">📜 Script SQL Production</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                {generatedScript}
              </pre>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedScript)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  📋 Copier
                </button>
                <button
                  onClick={() => setShowScriptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}