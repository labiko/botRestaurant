'use client';

import { useState, useEffect } from 'react';

interface Restaurant {
  id: number;
  name: string;
  address: string;
}

interface DeletionPreview {
  categories: number;
  products: number;
  supplements: number;
  categoryNames: string[];
  productNames: string[];
}

interface RestaurantDeletionProps {
  onDeletionComplete?: () => void;
}

export default function RestaurantDeletion({ onDeletionComplete }: RestaurantDeletionProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [preview, setPreview] = useState<DeletionPreview | null>(null);
  const [confirmationName, setConfirmationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'preview' | 'confirm'>('select');
  const [result, setResult] = useState<any>(null);

  // Charger la liste des restaurants
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants);
      }
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
    }
  };

  const generatePreview = async (restaurant: Restaurant) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/delete-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id })
      });

      const data = await response.json();
      if (data.success) {
        setPreview(data.preview);
        setStep('preview');
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur aperçu:', error);
      alert('Erreur lors de la génération de l\'aperçu');
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!selectedRestaurant || confirmationName !== selectedRestaurant.name) {
      alert('Le nom saisi ne correspond pas au restaurant sélectionné');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/delete-restaurant', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: selectedRestaurant.id })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        setStep('select');
        setSelectedRestaurant(null);
        setPreview(null);
        setConfirmationName('');
        loadRestaurants(); // Recharger la liste
        onDeletionComplete?.();
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('select');
    setSelectedRestaurant(null);
    setPreview(null);
    setConfirmationName('');
    setResult(null);
  };

  // Étape 1: Sélection du restaurant
  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">🗑️ Suppression Restaurant</h2>
          <p className="text-red-600">
            ⚠️ Cette action supprimera DÉFINITIVEMENT toutes les données du restaurant (catégories, produits, etc.)
          </p>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800">✅ Suppression réussie !</h3>
            <div className="text-sm text-green-600 mt-2">
              <p>Restaurant supprimé: <strong>{result.deletedRestaurant.name}</strong></p>
              <p>Catégories supprimées: {result.statistics.categoriesDeleted}</p>
              <p>Produits supprimés: {result.statistics.productsDeleted}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un restaurant à supprimer
          </label>
          <select
            value={selectedRestaurant?.id || ''}
            onChange={(e) => {
              const restaurant = restaurants.find(r => r.id === parseInt(e.target.value));
              setSelectedRestaurant(restaurant || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Choisir un restaurant --</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name} (ID: {restaurant.id})
              </option>
            ))}
          </select>
        </div>

        {selectedRestaurant && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800">Restaurant sélectionné:</h3>
            <p className="text-sm text-gray-600">
              <strong>{selectedRestaurant.name}</strong><br/>
              {selectedRestaurant.address}
            </p>
            <button
              onClick={() => generatePreview(selectedRestaurant)}
              disabled={isLoading}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : '🔍 Voir aperçu suppression'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Étape 2: Aperçu des données
  if (step === 'preview' && preview && selectedRestaurant) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">📊 Aperçu de suppression</h2>
          <p className="text-red-600">Données qui seront supprimées pour:</p>
          <p className="font-bold text-red-800">{selectedRestaurant.name}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-3">📋 Statistiques</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{preview.categories}</div>
              <div className="text-sm text-blue-800">Catégories</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{preview.products}</div>
              <div className="text-sm text-green-800">Produits</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600">{preview.supplements}</div>
              <div className="text-sm text-purple-800">Suppléments</div>
            </div>
          </div>
        </div>

        {preview.categoryNames.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">📂 Catégories à supprimer:</h3>
            <div className="flex flex-wrap gap-2">
              {preview.categoryNames.map((name, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetFlow}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            ← Retour
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            🗑️ Procéder à la suppression
          </button>
        </div>
      </div>
    );
  }

  // Étape 3: Confirmation finale
  if (step === 'confirm' && selectedRestaurant) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Confirmation finale</h2>
          <p className="text-red-700">
            Vous êtes sur le point de supprimer <strong>DÉFINITIVEMENT</strong> toutes les données de :
          </p>
          <p className="font-bold text-red-900 text-lg mt-2">{selectedRestaurant.name}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pour confirmer, tapez le nom exact du restaurant :
          </label>
          <input
            type="text"
            value={confirmationName}
            onChange={(e) => setConfirmationName(e.target.value)}
            placeholder={selectedRestaurant.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="mt-4 text-sm text-gray-600">
            <p>✅ Nom attendu: <code className="bg-gray-100 px-1 rounded">{selectedRestaurant.name}</code></p>
            <p>✅ Nom saisi: <code className="bg-gray-100 px-1 rounded">{confirmationName}</code></p>
            <p className={confirmationName === selectedRestaurant.name ? 'text-green-600' : 'text-red-600'}>
              {confirmationName === selectedRestaurant.name ? '✅ Correspondance validée' : '❌ Les noms ne correspondent pas'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('preview')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            ← Retour
          </button>
          <button
            onClick={executeDelete}
            disabled={isLoading || confirmationName !== selectedRestaurant.name}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Suppression en cours...' : '🗑️ SUPPRIMER DÉFINITIVEMENT'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}