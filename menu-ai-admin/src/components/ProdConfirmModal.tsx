// 🚨 MODALE CONFIRMATION PRODUCTION
// ===================================

'use client';

import { useState } from 'react';

interface ProdConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scriptPreview: string;
  loading?: boolean;
}

export default function ProdConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  scriptPreview,
  loading = false
}: ProdConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const requiredText = 'CONFIRMER PROD';

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText === requiredText) {
      onConfirm();
    }
  };

  const isConfirmEnabled = confirmText === requiredText && !loading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h2 className="text-2xl font-bold">EXÉCUTION EN PRODUCTION</h2>
                <p className="text-red-100 mt-1">⚠️ Action irréversible sur la base de données LIVE</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-red-100 hover:text-white text-2xl font-bold disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-800 mb-2">ATTENTION - ENVIRONNEMENT PRODUCTION</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Cette action va modifier la base de données de PRODUCTION</li>
                  <li>• Les changements affecteront immédiatement les utilisateurs</li>
                  <li>• Cette action est IRRÉVERSIBLE sans script de rollback</li>
                  <li>• Assurez-vous que le script a été testé en DEV</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Script Preview */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">📄 Script à exécuter :</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-32 overflow-y-auto">
              <pre>{scriptPreview}</pre>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              🔐 Pour confirmer, tapez exactement : <code className="bg-gray-200 px-2 py-1 rounded">{requiredText}</code>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Tapez "${requiredText}" pour confirmer`}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
              autoComplete="off"
            />
            {confirmText && confirmText !== requiredText && (
              <p className="text-red-600 text-sm mt-1">⚠️ Texte de confirmation incorrect</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              isConfirmEnabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exécution...
              </>
            ) : (
              <>
                🚀 EXÉCUTER EN PROD
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}