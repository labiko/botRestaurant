'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

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
  saveScript: (sql: string, productName: string) => void;
}

export default forwardRef<WorkflowSqlHistoryRef, { productId: number | null }>(function WorkflowSqlHistory({ productId }, ref) {
  const [scripts, setScripts] = useState<SqlScript[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<SqlScript | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmProd, setConfirmProd] = useState(false);

  // Exposer la méthode saveScript au parent
  useImperativeHandle(ref, () => ({
    saveScript
  }));

  // Charger l'historique depuis localStorage (simulation)
  useEffect(() => {
    if (!productId) return;

    const storedScripts = localStorage.getItem(`workflow_scripts_${productId}`);
    if (storedScripts) {
      setScripts(JSON.parse(storedScripts));
    }
  }, [productId]);

  // Sauvegarder un nouveau script
  const saveScript = (sql: string, productName: string) => {
    if (!productId) return;

    const newScript: SqlScript = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      product_name: productName,
      product_id: productId,
      sql_script: sql,
      executed_dev: false,
      executed_prod: false,
      modifications_summary: analyzeSQL(sql)
    };

    const updatedScripts = [newScript, ...scripts];
    setScripts(updatedScripts);
    localStorage.setItem(`workflow_scripts_${productId}`, JSON.stringify(updatedScripts));
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

    setExecuting(`${scriptId}-${environment}`);

    // Simulation d'exécution (remplacer par API réelle)
    setTimeout(() => {
      const updatedScripts = scripts.map(s => {
        if (s.id === scriptId) {
          if (environment === 'DEV') {
            return { ...s, executed_dev: true, dev_executed_at: new Date().toISOString() };
          } else {
            return { ...s, executed_prod: true, prod_executed_at: new Date().toISOString() };
          }
        }
        return s;
      });

      setScripts(updatedScripts);
      localStorage.setItem(`workflow_scripts_${productId}`, JSON.stringify(updatedScripts));
      setExecuting(null);
      setShowModal(false);
      setConfirmProd(false);
    }, 2000);
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
          </h2>
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

        {showHistory && (
          <div className="space-y-4">
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
                            <button
                              onClick={() => executeScript(script.id, 'DEV')}
                              disabled={executing === `${script.id}-DEV`}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                              {executing === `${script.id}-DEV` ? '⏳' : 'Exécuter'}
                            </button>
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
                            <button
                              onClick={() => {
                                setSelectedScript(script);
                                setShowModal(true);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Exécuter
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(script.sql_script);
                                alert('SQL copié !');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Copier SQL"
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
    </>
  );
});

// Export de la fonction de sauvegarde pour l'utiliser depuis workflow-edit
export { type SqlScript };