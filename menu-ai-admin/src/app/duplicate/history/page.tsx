'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DuplicationDetailModal from '@/components/DuplicationDetailModal';
import { TimezoneService } from '@/lib/timezone-service';

interface DuplicationHistory {
  id: number;
  source_restaurant: { name: string } | null;
  target_restaurant: { name: string } | null;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  summary: {
    categoriesDuplicated: number;
    productsDuplicated: number;
    optionsDuplicated: number;
    workflowsConfigured: number;
  } | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  error_message: string | null;
}

export default function DuplicationHistoryPage() {
  const router = useRouter();
  const [duplications, setDuplications] = useState<DuplicationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

  // États pour le modal de détail
  const [selectedDuplicationId, setSelectedDuplicationId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/duplication-reports');
      const data = await response.json();

      if (data.success) {
        setDuplications(data.duplications);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Réussie
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Échec
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ En cours
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            📝 Démarrée
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return TimezoneService.formatDate(dateString);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    return `${seconds}s`;
  };

  const openDetailModal = (duplicationId: number) => {
    setSelectedDuplicationId(duplicationId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDuplicationId(null);
  };

  const filteredDuplications = duplications.filter(dup => {
    if (filter === 'all') return true;
    return dup.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
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
            onClick={loadHistory}
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
                📚 Historique des Duplications
              </h1>
              <p className="text-gray-600">
                Consultez l'historique complet de toutes les duplications de restaurants
              </p>
            </div>
            <button
              onClick={() => router.push('/duplicate')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              🔄 Nouvelle Duplication
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filtrer par statut :</span>

            {(['all', 'completed', 'failed'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' && '🔍 Toutes'}
                {filterOption === 'completed' && '✅ Réussies'}
                {filterOption === 'failed' && '❌ Échecs'}
                {filterOption === 'all' && ` (${duplications.length})`}
                {filterOption === 'completed' && ` (${duplications.filter(d => d.status === 'completed').length})`}
                {filterOption === 'failed' && ` (${duplications.filter(d => d.status === 'failed').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des duplications */}
        {filteredDuplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune duplication trouvée</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Aucune duplication n\'a encore été effectuée.'
                : `Aucune duplication avec le statut "${filter}" trouvée.`
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
                      ID / Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duplication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Résultats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDuplications.map((dup) => (
                    <tr key={dup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            #DUP-{String(dup.id).padStart(3, '0')}
                          </div>
                          <div className="mt-1">
                            {getStatusBadge(dup.status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">{dup.source_restaurant?.name || 'Restaurant source'}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium text-blue-600">{dup.target_restaurant?.name || 'Restaurant cible'}</span>
                          </div>
                          {dup.error_message && (
                            <div className="text-xs text-red-600 mt-1">
                              {dup.error_message}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {dup.summary ? (
                          <div className="text-sm text-gray-900">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <span>{dup.summary.categoriesDuplicated} catégories</span>
                              <span>{dup.summary.productsDuplicated} produits</span>
                              <span>{dup.summary.optionsDuplicated} options</span>
                              <span>{dup.summary.workflowsConfigured} workflows</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Pas de résultats</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Début: {formatDate(dup.started_at)}</div>
                          {dup.completed_at && (
                            <div>Fin: {formatDate(dup.completed_at)}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            Durée: {formatDuration(dup.duration_seconds)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Bouton Voir détail - disponible pour toutes les duplications */}
                          <button
                            onClick={() => openDetailModal(dup.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            👁️ Voir détail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            🏠 Retour Accueil
          </button>

          <div className="text-sm text-gray-500">
            {filteredDuplications.length} duplication{filteredDuplications.length > 1 ? 's' : ''} affichée{filteredDuplications.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de détail */}
      <DuplicationDetailModal
        duplicationId={selectedDuplicationId}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
}