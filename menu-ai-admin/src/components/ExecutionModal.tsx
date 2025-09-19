// 🚀 MODAL D'EXÉCUTION DES SCRIPTS SQL
// =====================================

'use client';

import { useState } from 'react';

interface Script {
  id: number;
  script_sql: string;
  command_source?: string;
  ai_explanation?: string;
  dev_status: string;
  prod_status: string;
  category_name?: string;
}

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | null;
  onExecute: (scriptId: number, environment: string) => Promise<void>;
}

export default function ExecutionModal({
  isOpen,
  onClose,
  script,
  onExecute
}: ExecutionModalProps) {
  const [executing, setExecuting] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [confirmProd, setConfirmProd] = useState(false);

  if (!isOpen || !script) return null;

  const handleExecute = async (environment: string) => {
    if (environment === 'PROD' && !confirmProd) {
      alert('⚠️ Veuillez cocher la case de confirmation pour exécuter en PRODUCTION');
      return;
    }

    setExecuting(true);
    try {
      await onExecute(script.id, environment);
      if (environment !== 'BOTH') {
        onClose();
      }
    } catch (error) {
      console.error('Erreur exécution:', error);
    } finally {
      setExecuting(false);
      setConfirmProd(false);
    }
  };

  const isDevExecuted = script.dev_status === 'executed';
  const isProdExecuted = script.prod_status === 'executed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                🚀 Exécuter le script SQL
              </h2>
              <p className="text-gray-600 mt-1">
                {script.command_source || 'Script SQL'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={executing}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* Script Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">📄 Script SQL :</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{script.script_sql}</pre>
            </div>
          </div>

          {/* AI Explanation */}
          {script.ai_explanation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">💡 Explication :</h3>
              <p className="text-gray-600">{script.ai_explanation}</p>
            </div>
          )}

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">📊 Statut actuel :</h3>
            <div className="flex gap-4">
              <div className={`px-4 py-2 rounded-lg ${
                isDevExecuted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                🧪 DEV : {isDevExecuted ? '✅ Exécuté' : '⏳ En attente'}
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                isProdExecuted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                🔴 PROD : {isProdExecuted ? '✅ Exécuté' : '➖ Non appliqué'}
              </div>
            </div>
          </div>

          {/* Environment Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">🎯 Choisir l'environnement d'exécution :</h3>

            <div className="space-y-3">
              {/* DEV Button */}
              <button
                onClick={() => handleExecute('DEV')}
                disabled={executing || isDevExecuted}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  isDevExecuted
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🧪</span>
                  <span className="font-semibold">Exécuter en DEV</span>
                </span>
                {isDevExecuted && <span className="text-sm">⚠️ Déjà exécuté</span>}
              </button>

              {/* PROD Button */}
              <button
                onClick={() => handleExecute('PROD')}
                disabled={executing || isProdExecuted}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  isProdExecuted
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🔴</span>
                  <span className="font-semibold">Exécuter en PRODUCTION</span>
                </span>
                {isProdExecuted && <span className="text-sm">⚠️ Déjà exécuté</span>}
              </button>

              {/* BOTH Button */}
              <button
                onClick={() => handleExecute('BOTH')}
                disabled={executing || (isDevExecuted && isProdExecuted)}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  (isDevExecuted && isProdExecuted)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-red-500 text-white hover:from-blue-600 hover:to-red-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  <span className="font-semibold">Exécuter DEV puis PROD</span>
                </span>
                {(isDevExecuted && isProdExecuted) && <span className="text-sm">⚠️ Déjà exécuté partout</span>}
              </button>
            </div>

            {/* Production Confirmation */}
            {selectedEnv === 'PROD' || selectedEnv === 'BOTH' ? (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmProd}
                    onChange={(e) => setConfirmProd(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-red-800 font-medium">
                    Je confirme vouloir exécuter ce script en PRODUCTION
                  </span>
                </label>
              </div>
            ) : null}
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Attention :</strong> L'exécution en PRODUCTION est irréversible sans script de rollback.
              Testez toujours en DEV avant d'exécuter en PROD.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={executing}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}