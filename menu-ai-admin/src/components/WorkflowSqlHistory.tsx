'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import SqlChangeAnalyzer, { type AnalysisResult } from './SqlChangeAnalyzer';
import { useFetch } from '@/hooks/useFetch';

interface SqlScript {
  id: string;
  created_at: string;
  product_name: string;
  product_id: number;
  sql_script: string;
  executed_dev: boolean;
  executed_prod: boolean;
  dev_executed_at?: string;
  prod_executed_at?: string;
  modifications_summary: {
    updates: number;
    inserts: number;
    deletes: number;
    total_options: number;
  };
}

export interface WorkflowSqlHistoryRef {
  saveScript: (sql: string, productName: string) => Promise<void>;
}

interface WorkflowSqlHistoryProps {
  productId?: number | null;
  filterBySource?: string;
  onScriptsRefresh?: () => void;
}

export default forwardRef<WorkflowSqlHistoryRef, WorkflowSqlHistoryProps>(function WorkflowSqlHistory({ productId, filterBySource, onScriptsRefresh }, ref) {
  const { fetch: fetchWithEnv } = useFetch();
  const [scripts, setScripts] = useState<SqlScript[]>([]);
  const [showHistory, setShowHistory] = useState(true); // Afficher par défaut
  const [executing, setExecuting] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<SqlScript | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmProd, setConfirmProd] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisScript, setCurrentAnalysisScript] = useState<SqlScript | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareScript, setCompareScript] = useState<SqlScript | null>(null);
  const [newScriptAdded, setNewScriptAdded] = useState(false);

  // Référence pour l'analyseur
  const analyzerRef = useRef<any>(null);

  // API: Charger les scripts depuis la base de données
  const loadScriptsFromAPI = async () => {
    if (!productId) return;

    try {
      console.log('📡 [API] Chargement scripts pour productId:', productId);
      const response = await fetchWithEnv(`/api/workflow-scripts/${productId}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ [API] Scripts chargés:', data.scripts.length);
        setScripts(data.scripts);
      } else {
        console.error('❌ [API] Erreur chargement:', data.error);
        setScripts([]);
      }
    } catch (error) {
      console.error('❌ [API] Erreur réseau:', error);
      setScripts([]);
    }
  };

  // API: Charger les scripts par source (pour audit-bot-flyer)
  const loadScriptsBySource = async () => {
    if (!filterBySource) return;

    try {
      console.log('📡 [API] Chargement scripts pour source:', filterBySource);
      const response = await fetchWithEnv(`/api/scripts-history?source=${encodeURIComponent(filterBySource)}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ [API] Scripts chargés par source:', data.scripts.length);
        // Adapter le format des scripts si nécessaire
        const formattedScripts = data.scripts.map((script: any) => ({
          id: script.id,
          created_at: script.created_at,
          product_name: script.command_source || 'Script SQL',
          product_id: script.product_id || 0,
          sql_script: script.script_sql,
          executed_dev: script.dev_status === 'executed' || script.executed_dev || false,
          executed_prod: script.prod_status === 'executed' || script.executed_prod || false,
          dev_executed_at: script.dev_executed_at,
          prod_executed_at: script.prod_executed_at,
          modifications_summary: script.modifications_summary || {
            updates: 0,
            inserts: 0,
            deletes: 0,
            total_options: 0
          }
        }));
        setScripts(formattedScripts);
      } else {
        console.error('❌ [API] Erreur chargement par source:', data.error);
        setScripts([]);
      }
    } catch (error) {
      console.error('❌ [API] Erreur réseau:', error);
      setScripts([]);
    }
  };

  // Debug: Fonction pour recharger manuellement
  const reloadHistory = () => {
    if (filterBySource) {
      loadScriptsBySource();
    } else if (productId) {
      loadScriptsFromAPI();
    }
  };

  // Test: Simuler l'ajout d'un script pour tester la synchronisation
  const testAddScript = () => {
    const testSQL = `-- Test script généré le ${new Date().toLocaleString()}\nSELECT 'test' AS test;`;
    saveScript(testSQL, 'TEST SCRIPT');
  };

  // Exposer la méthode saveScript au parent
  useImperativeHandle(ref, () => ({
    saveScript
  }));

  // Charger l'historique depuis l'API
  useEffect(() => {
    // Chargement initial selon le mode
    if (filterBySource) {
      console.log('📡 [WORKFLOW-SQL-HISTORY] Chargement par source:', filterBySource);
      loadScriptsBySource();
    } else if (productId) {
      console.log('📡 [WORKFLOW-SQL-HISTORY] Chargement par productId:', productId);
      loadScriptsFromAPI();
    }

    // Écouter les événements de mise à jour des scripts (toujours actif)
    const handleScriptUpdate = (event: CustomEvent) => {
      console.log('🎯 [WORKFLOW-SQL-HISTORY] Événement reçu:', {
        eventProductId: event.detail.productId,
        currentProductId: productId,
        source: event.detail.source,
        scriptId: event.detail.scriptId,
        filterBySource: filterBySource
      });

      // Gérer selon le mode
      if (filterBySource && event.detail.source === filterBySource) {
        console.log('✅ [WORKFLOW-SQL-HISTORY] Événement valide par source, rechargement...');
        setTimeout(() => {
          loadScriptsBySource().then(() => {
            setShowHistory(true);
            setNewScriptAdded(true);
            setTimeout(() => setNewScriptAdded(false), 3000);
            if (onScriptsRefresh) onScriptsRefresh();
          });
        }, 200);
      } else if (!filterBySource && event.detail.productId === productId) {
        console.log('✅ [WORKFLOW-SQL-HISTORY] Événement valide par productId, rechargement...');
        setTimeout(() => {
          loadScriptsFromAPI().then(() => {
            setShowHistory(true);
            setNewScriptAdded(true);
            setTimeout(() => setNewScriptAdded(false), 3000);
          });
        }, 200);
      } else {
        console.log('ℹ️ [WORKFLOW-SQL-HISTORY] Événement ignoré');
      }
    };

    window.addEventListener('workflow-script-updated', handleScriptUpdate as EventListener);

    return () => {
      window.removeEventListener('workflow-script-updated', handleScriptUpdate as EventListener);
    };
  }, [productId, filterBySource, onScriptsRefresh]);


  // Sauvegarder un nouveau script via API
  const saveScript = async (sql: string, productName: string) => {
    console.log('🔄 [WORKFLOW-SQL-HISTORY] saveScript appelé:', {
      productId,
      productName,
      sqlLength: sql.length,
      sqlPreview: sql.substring(0, 100) + '...'
    });

    if (!productId) {
      console.error('❌ [WORKFLOW-SQL-HISTORY] productId manquant - ARRÊT');
      alert('❌ Erreur: productId manquant pour la sauvegarde');
      return;
    }

    if (!sql || sql.trim().length === 0) {
      console.error('❌ [WORKFLOW-SQL-HISTORY] SQL vide - ARRÊT');
      alert('❌ Erreur: Script SQL vide');
      return;
    }

    console.log('✅ [WORKFLOW-SQL-HISTORY] Validation OK, début appel API...');

    try {
      // Préparer les données pour l'API
      const scriptData = {
        productId,
        productName: productName.trim(),
        sqlScript: sql.trim(),
        modificationsSummary: analyzeSQL(sql)
      };

      console.log('📡 [API] Envoi script vers API:', {
        productId: scriptData.productId,
        productName: scriptData.productName,
        sqlLength: scriptData.sqlScript.length,
        modifications: scriptData.modificationsSummary
      });

      // Appel API pour sauvegarder
      console.log('🌐 [API] Démarrage fetch vers /api/workflow-scripts...');

      const response = await fetchWithEnv('/api/workflow-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scriptData)
      });

      console.log('📨 [API] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API] Réponse non-OK:', errorText);
        alert(`❌ Erreur API ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('📄 [API] Données parsed:', data);

      if (data.success) {
        console.log('✅ [API] Script sauvegardé avec succès:', data.script);

        // Recharger la liste depuis l'API
        await loadScriptsFromAPI();

        // Mise à jour interface
        setShowHistory(true);
        setNewScriptAdded(true);
        setTimeout(() => setNewScriptAdded(false), 3000);

        // ÉMETTRE L'ÉVÉNEMENT pour notifier toutes les autres instances
        const event = new CustomEvent('workflow-script-updated', {
          detail: {
            productId,
            scriptId: data.script.id,
            source: 'saveScript',
            timestamp: new Date().toISOString()
          }
        });

        window.dispatchEvent(event);
        console.log('📡 [WORKFLOW-SQL-HISTORY] Événement émis après sauvegarde API');

      } else {
        console.error('❌ [API] Erreur sauvegarde script:', data.error);
        alert('Erreur lors de la sauvegarde du script: ' + data.error);
      }

    } catch (error) {
      console.error('❌ [API] Erreur réseau sauvegarde:', error);
      alert('Erreur réseau lors de la sauvegarde du script');
    }
  };

  // Analyser le SQL pour extraire les stats
  const analyzeSQL = (sql: string): SqlScript['modifications_summary'] => {
    const updates = (sql.match(/UPDATE france_product_options/gi) || []).length;
    const inserts = (sql.match(/INSERT INTO france_product_options/gi) || []).length;
    const deletes = (sql.match(/DELETE FROM france_product_options/gi) || []).length;
    const totalMatch = sql.match(/total_options_actives/gi);

    return {
      updates,
      inserts,
      deletes,
      total_options: updates + inserts
    };
  };

  // Exécuter le script
  const executeScript = async (scriptId: string, environment: 'DEV' | 'PROD') => {
    if (environment === 'PROD' && !confirmProd) {
      alert('⚠️ Veuillez cocher la case de confirmation pour exécuter en PRODUCTION');
      return;
    }

    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    setExecuting(`${scriptId}-${environment}`);

    try {
      console.log(`🔄 Exécution SQL ${environment}:`, script.sql_script);

      // Appel API réel pour exécuter le script
      const response = await fetchWithEnv('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: script.sql_script,
          environment
        })
      });

      const result = await response.json();

      if (result.success) {
        // Mise à jour du statut d'exécution via API
        const statusResponse = await fetchWithEnv(`/api/workflow-scripts/${scriptId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            environment,
            executed: true
          })
        });

        const statusData = await statusResponse.json();

        if (statusData.success) {
          console.log('✅ [API] Statut mis à jour:', statusData.script);
          // Recharger la liste depuis l'API
          await loadScriptsFromAPI();
        } else {
          console.error('❌ [API] Erreur mise à jour statut:', statusData.error);
        }

        alert(`✅ Script exécuté avec succès en ${environment}`);
      } else {
        console.error('Erreur exécution SQL:', result.error);
        alert(`❌ Erreur lors de l'exécution: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur API execute-sql:', error);
      alert(`❌ Erreur de communication: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setExecuting(null);
      setShowModal(false);
      setConfirmProd(false);
    }
  };

  // Analyser les changements avant exécution
  const analyzeBeforeExecution = async (script: SqlScript) => {
    console.log('🔍 [WORKFLOW-SQL-HISTORY] analyzeBeforeExecution appelé:', {
      scriptId: script.id,
      productId,
      sqlLength: script.sql_script.length,
      analyzerRef: !!analyzerRef.current
    });

    if (!productId) {
      console.error('❌ [WORKFLOW-SQL-HISTORY] productId manquant pour analyse');
      return;
    }

    try {
      setCurrentAnalysisScript(script);
      setShowAnalysis(true);

      // L'analyse sera déclenchée par le composant SqlChangeAnalyzer
      if (analyzerRef.current) {
        console.log('🚀 [WORKFLOW-SQL-HISTORY] Démarrage analyse avec analyzerRef...');
        const result = await analyzerRef.current.analyzeChanges(script.sql_script, productId);
        console.log('✅ [WORKFLOW-SQL-HISTORY] Analyse terminée:', result);
        setAnalysisResult(result);
      } else {
        console.error('❌ [WORKFLOW-SQL-HISTORY] analyzerRef.current est null');
        alert('❌ Erreur: Analyseur non disponible');
      }
    } catch (error) {
      console.error('❌ [WORKFLOW-SQL-HISTORY] Erreur analyse:', error);
      alert('❌ Erreur lors de l\'analyse des changements: ' + error.message);
    }
  };

  // Exécuter après analyse
  const executeAfterAnalysis = (environment: 'DEV' | 'PROD') => {
    if (!currentAnalysisScript) return;

    setShowAnalysis(false);
    setAnalysisResult(null);
    setCurrentAnalysisScript(null);

    if (environment === 'PROD') {
      setSelectedScript(currentAnalysisScript);
      setShowModal(true);
    } else {
      executeScript(currentAnalysisScript.id, environment);
    }
  };

  // Ouvrir la modal de comparaison
  const openCompareModal = (script: SqlScript) => {
    setCompareScript(script);
    setShowCompareModal(true);
  };

  // Copier et fermer la modal de comparaison
  const copyAndCloseCompare = () => {
    if (compareScript) {
      navigator.clipboard.writeText(compareScript.sql_script);
      alert('📋 SQL copié dans le presse-papiers !');
      setShowCompareModal(false);
      setCompareScript(null);
    }
  };

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
      {/* Section Historique */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
            📊 Historique des Scripts SQL Workflow
            <span className={`px-2 py-1 rounded-full text-sm font-medium transition-all ${
              newScriptAdded
                ? 'bg-green-200 text-green-800 animate-pulse'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {scripts.length} script{scripts.length !== 1 ? 's' : ''}
              {newScriptAdded && ' 🆕'}
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={reloadHistory}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
              title="Recharger depuis localStorage"
            >
              🔄 Debug
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showHistory
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {showHistory ? '🙈 Masquer' : '👀 Afficher'}
            </button>
          </div>
        </div>

        {newScriptAdded && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800 font-medium">Nouveau script ajouté à l'historique !</span>
              <span className="text-green-600 text-sm">Le tableau ci-dessous a été mis à jour.</span>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="space-y-4">
            {console.log('📊 [WORKFLOW-SQL-HISTORY] Rendu historique:', { scriptsLength: scripts.length, productId, showHistory })}
            {scripts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-xl text-gray-600">💻 Aucun script généré</p>
                <p className="text-sm mt-2 text-gray-500">Les scripts générés apparaîtront ici automatiquement</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">📅 Date</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">📦 Produit</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">📊 Modifications</th>
                      <th className="text-center p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">🧪 DEV</th>
                      <th className="text-center p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">🚀 PROD</th>
                      <th className="text-center p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">⚙️ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scripts.map((script, index) => (
                      <tr key={script.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-3">
                          <div className="text-xs text-gray-700 font-medium">
                            {formatDate(script.created_at)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-800">{script.product_name}</div>
                          <div className="text-xs text-gray-500">ID: {script.product_id}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 text-xs">
                            {script.modifications_summary.updates > 0 && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                ↻ {script.modifications_summary.updates} MAJ
                              </span>
                            )}
                            {script.modifications_summary.inserts > 0 && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                + {script.modifications_summary.inserts} AJOUTS
                              </span>
                            )}
                            {script.modifications_summary.deletes > 0 && (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                - {script.modifications_summary.deletes} SUPP
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {script.executed_dev ? (
                            <div>
                              <span className="text-green-600">✅</span>
                              {script.dev_executed_at && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(script.dev_executed_at)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => analyzeBeforeExecution(script)}
                                disabled={executing === `${script.id}-DEV`}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-xs"
                              >
                                🔍 Analyser & Exécuter
                              </button>
                              <button
                                onClick={() => executeScript(script.id, 'DEV')}
                                disabled={executing === `${script.id}-DEV`}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-xs"
                              >
                                {executing === `${script.id}-DEV` ? '⏳' : '⚡ Direct'}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {script.executed_prod ? (
                            <div>
                              <span className="text-green-600">✅</span>
                              {script.prod_executed_at && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(script.prod_executed_at)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => analyzeBeforeExecution(script)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              >
                                🔍 Analyser & Exécuter
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedScript(script);
                                  setShowModal(true);
                                }}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                              >
                                ⚡ Direct
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => openCompareModal(script)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Analyser et Copier SQL"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => {
                                const blob = new Blob([script.sql_script], { type: 'text/sql' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `workflow_${script.product_id}_${script.id}.sql`;
                                a.click();
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Télécharger SQL"
                            >
                              💾
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation PROD */}
      {showModal && selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              ⚠️ Exécution en PRODUCTION
            </h3>
            <p className="text-gray-700 mb-4">
              Vous êtes sur le point d'exécuter ce script en production pour :
              <br />
              <strong>{selectedScript.product_name}</strong>
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={confirmProd}
                  onChange={(e) => setConfirmProd(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  Je confirme vouloir exécuter ce script en PRODUCTION
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => executeScript(selectedScript.id, 'PROD')}
                disabled={!confirmProd || executing === `${selectedScript.id}-PROD`}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {executing === `${selectedScript.id}-PROD` ? '⏳ Exécution...' : '🚀 Confirmer'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmProd(false);
                  setSelectedScript(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'analyse des changements */}
      {showAnalysis && currentAnalysisScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  🔍 Analyse des Changements SQL
                </h3>
                <button
                  onClick={() => {
                    setShowAnalysis(false);
                    setAnalysisResult(null);
                    setCurrentAnalysisScript(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Script à analyser :</h4>
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <strong>{currentAnalysisScript.product_name}</strong> -
                  Créé le {formatDate(currentAnalysisScript.created_at)}
                </div>
              </div>

              {/* Bouton pour déclencher l'analyse manuellement */}
              <div className="mb-6">
                <button
                  onClick={() => analyzeBeforeExecution(currentAnalysisScript)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  disabled={!analyzerRef.current}
                >
                  🔬 Lancer l'Analyse des Changements
                </button>
              </div>

              {/* Affichage des résultats d'analyse */}
              {analysisResult && (
                <div className="space-y-6">
                  {/* Résumé des risques */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Analyse des Risques</h4>
                    <div className="space-y-2">
                      {analysisResult.risks.map((risk, index) => (
                        <div key={index} className={`p-3 rounded-lg text-sm ${
                          risk.level === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' :
                          risk.level === 'MEDIUM' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          <span className="font-medium">
                            {risk.level === 'HIGH' ? '🚨' : risk.level === 'MEDIUM' ? '⚠️' : '✅'}
                          </span>
                          {' '}{risk.message}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Changements du produit */}
                  {Object.keys(analysisResult.productChanges).length > 1 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">📝 Changements Produit</h4>
                      <div className="space-y-2 text-sm">
                        {analysisResult.productChanges.name && (
                          <div>
                            <span className="font-medium">Nom:</span>{' '}
                            <span className="line-through text-gray-500">{analysisResult.productChanges.name.old}</span>
                            {' → '}
                            <span className="font-medium text-blue-600">{analysisResult.productChanges.name.new}</span>
                          </div>
                        )}
                        {analysisResult.productChanges.priceOnSite && (
                          <div>
                            <span className="font-medium">Prix sur site:</span>{' '}
                            <span className="line-through text-gray-500">{analysisResult.productChanges.priceOnSite.old}€</span>
                            {' → '}
                            <span className="font-medium text-blue-600">{analysisResult.productChanges.priceOnSite.new}€</span>
                          </div>
                        )}
                        {analysisResult.productChanges.priceDelivery && (
                          <div>
                            <span className="font-medium">Prix livraison:</span>{' '}
                            <span className="line-through text-gray-500">{analysisResult.productChanges.priceDelivery.old}€</span>
                            {' → '}
                            <span className="font-medium text-blue-600">{analysisResult.productChanges.priceDelivery.new}€</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Résumé des options */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">🎯 Résumé Options</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{analysisResult.optionChanges.summary.totalUpdates}</div>
                        <div className="text-gray-600">Mises à jour</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{analysisResult.optionChanges.summary.totalInserts}</div>
                        <div className="text-gray-600">Ajouts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{analysisResult.optionChanges.summary.totalDeletes}</div>
                        <div className="text-gray-600">Suppressions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{analysisResult.optionChanges.summary.groupsAffected}</div>
                        <div className="text-gray-600">Groupes affectés</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Debug: État de l'analyseur */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <strong>Debug:</strong> analyzerRef: {analyzerRef.current ? '✅ Disponible' : '❌ Null'},
                analysisResult: {analysisResult ? '✅ Présent' : '❌ Absent'}
                {analysisResult && (
                  <div className="mt-2">
                    Risks: {analysisResult.risks?.length || 0},
                    Product changes: {Object.keys(analysisResult.productChanges || {}).length}
                  </div>
                )}
              </div>

              {analysisResult && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">🎯 Actions Recommandées</h4>

                  <div className="flex gap-3">
                    <button
                      onClick={() => executeAfterAnalysis('DEV')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      🧪 Exécuter en DEV
                    </button>
                    <button
                      onClick={() => executeAfterAnalysis('PROD')}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
                    >
                      🚀 Exécuter en PROD
                    </button>
                    <button
                      onClick={() => {
                        setShowAnalysis(false);
                        setAnalysisResult(null);
                        setCurrentAnalysisScript(null);
                      }}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Annuler
                    </button>
                  </div>

                  {analysisResult.risks.some(r => r.level === 'HIGH') && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">
                        ⚠️ <strong>Attention :</strong> Des risques élevés ont été détectés.
                        Vérifiez attentivement les changements avant l'exécution en production.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de comparaison et analyse SQL */}
      {showCompareModal && compareScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  🔍 Analyse et Comparaison SQL
                </h3>
                <button
                  onClick={() => {
                    setShowCompareModal(false);
                    setCompareScript(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Informations du script */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">Produit</h4>
                    <p className="text-gray-900 font-medium">{compareScript.product_name}</p>
                    <p className="text-gray-500 text-xs">ID: {compareScript.product_id}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">Date de création</h4>
                    <p className="text-gray-900">{formatDate(compareScript.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">Modifications</h4>
                    <div className="flex gap-2 text-xs">
                      {compareScript.modifications_summary.updates > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          ↻ {compareScript.modifications_summary.updates} MAJ
                        </span>
                      )}
                      {compareScript.modifications_summary.inserts > 0 && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          + {compareScript.modifications_summary.inserts} AJOUTS
                        </span>
                      )}
                      {compareScript.modifications_summary.deletes > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          - {compareScript.modifications_summary.deletes} SUPP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statuts d'exécution */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-2 ${
                  compareScript.executed_dev
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                    🧪 Environnement DEV
                    {compareScript.executed_dev && <span className="text-green-600">✅</span>}
                  </h4>
                  {compareScript.executed_dev ? (
                    <p className="text-green-700 text-sm">
                      Exécuté le {compareScript.dev_executed_at && formatDate(compareScript.dev_executed_at)}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm">Non exécuté</p>
                  )}
                </div>
                <div className={`p-4 rounded-lg border-2 ${
                  compareScript.executed_prod
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                    🚀 Environnement PROD
                    {compareScript.executed_prod && <span className="text-green-600">✅</span>}
                  </h4>
                  {compareScript.executed_prod ? (
                    <p className="text-green-700 text-sm">
                      Exécuté le {compareScript.prod_executed_at && formatDate(compareScript.prod_executed_at)}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm">Non exécuté</p>
                  )}
                </div>
              </div>

              {/* Déclenchement de l'analyse */}
              <div className="mb-6">
                <div className="mt-4">
                  <button
                    onClick={() => analyzeBeforeExecution(compareScript)}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
                  >
                    🔬 Analyser les Changements de ce Script
                  </button>
                </div>
              </div>

              {/* Code SQL avec syntaxe */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">📄 Script SQL Complet</h4>
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {compareScript.sql_script}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t pt-6">
                <button
                  onClick={copyAndCloseCompare}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  📋 Copier SQL et Fermer
                </button>
                <button
                  onClick={() => analyzeBeforeExecution(compareScript)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                >
                  🔍 Analyser & Exécuter
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([compareScript.sql_script], { type: 'text/sql' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `workflow_${compareScript.product_id}_${compareScript.id}.sql`;
                    a.click();
                  }}
                  className="px-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
                >
                  💾 Télécharger
                </button>
                <button
                  onClick={() => {
                    setShowCompareModal(false);
                    setCompareScript(null);
                  }}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SqlChangeAnalyzer toujours monté mais invisible pour maintenir la ref */}
      <div style={{ display: 'none' }}>
        <SqlChangeAnalyzer
          ref={analyzerRef}
          onAnalysisComplete={(result) => setAnalysisResult(result)}
        />
      </div>
    </>
  );
});

// Export de la fonction de sauvegarde pour l'utiliser depuis workflow-edit
export { type SqlScript };