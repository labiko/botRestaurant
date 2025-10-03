'use client';

import { useState } from 'react';

interface DeleteConfirmationModalProps {
  restaurant: {
    id: number;
    name: string;
  };
  onConfirm: (confirmationName: string) => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({ restaurant, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  const [confirmationName, setConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (confirmationName !== restaurant.name) {
      return;
    }
    setIsDeleting(true);
    await onConfirm(confirmationName);
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* En-tête */}
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ SUPPRESSION EN PRODUCTION</h2>
            <p className="text-red-700">
              Vous êtes sur le point de supprimer <strong>DÉFINITIVEMENT</strong> toutes les données de :
            </p>
            <p className="font-bold text-red-900 text-lg mt-2">{restaurant.name}</p>
            <div className="mt-3 bg-red-200 border border-red-400 rounded p-3 text-sm text-red-900">
              <strong>🔴 ENVIRONNEMENT : PRODUCTION</strong>
              <p className="mt-1">Cette action supprimera les données réelles utilisées par vos clients !</p>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">📋 Données qui seront supprimées :</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✓ Toutes les catégories</li>
              <li>✓ Tous les produits</li>
              <li>✓ Toutes les commandes</li>
              <li>✓ Tous les workflows</li>
              <li>✓ Toutes les options et configurations</li>
              <li>✓ Tous les numéros WhatsApp</li>
              <li>✓ Tous les livreurs</li>
            </ul>
          </div>

          {/* Confirmation */}
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pour confirmer, tapez le nom exact du restaurant :
            </label>
            <input
              type="text"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder={restaurant.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isDeleting}
            />

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>✅ Nom attendu: <code className="bg-gray-100 px-2 py-1 rounded">{restaurant.name}</code></p>
              <p>✅ Nom saisi: <code className="bg-gray-100 px-2 py-1 rounded">{confirmationName}</code></p>
              <p className={confirmationName === restaurant.name ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {confirmationName === restaurant.name ? '✅ Correspondance validée' : '❌ Les noms ne correspondent pas'}
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              ← Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting || confirmationName !== restaurant.name}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isDeleting ? 'Suppression en cours...' : '🗑️ SUPPRIMER EN PRODUCTION'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
