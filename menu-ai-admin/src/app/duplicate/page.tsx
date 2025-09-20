'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  created_at: string;
  stats: {
    categories: number;
    products: number;
    workflows: number;
    options: number;
  };
}

interface TargetRestaurant {
  name: string;
  slug: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  city: string;
}

export default function DuplicateRestaurantPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedSource, setSelectedSource] = useState<Restaurant | null>(null);
  const [targetRestaurant, setTargetRestaurant] = useState<TargetRestaurant>({
    name: '',
    slug: '',
    address: '',
    phone: '',
    whatsapp_number: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/restaurants');
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.restaurants);
      } else {
        setError(data.error || 'Erreur lors du chargement des restaurants');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setTargetRestaurant(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));
  };

  const handlePhoneChange = (phone: string) => {
    setTargetRestaurant(prev => ({
      ...prev,
      phone,
      whatsapp_number: phone // Même numéro par défaut
    }));
  };

  const isFormValid = () => {
    return selectedSource &&
           targetRestaurant.name.trim() &&
           targetRestaurant.address.trim() &&
           targetRestaurant.phone.trim();
  };

  const handleContinue = () => {
    if (isFormValid()) {
      // Stocker les données dans sessionStorage pour la page suivante
      sessionStorage.setItem('duplication-source', JSON.stringify(selectedSource));
      sessionStorage.setItem('duplication-target', JSON.stringify(targetRestaurant));

      // Rediriger vers la sélection des catégories
      router.push('/duplicate/categories');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des restaurants...</p>
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
            onClick={loadRestaurants}
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
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔄 Dupliquer Restaurant
              </h1>
              <p className="text-gray-600">
                Créez un nouveau restaurant en dupliquant la configuration d'un restaurant existant
              </p>
            </div>
            <button
              onClick={() => router.push('/duplicate/history')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              📚 Voir l'Historique
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Sélection Restaurant Source */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📍 Restaurant Source
            </h2>

            {restaurants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun restaurant disponible pour duplication
              </div>
            ) : (
              <div className="space-y-3">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSource?.id === restaurant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSource(restaurant)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          🍕 {restaurant.name}
                          {selectedSource?.id === restaurant.id && (
                            <span className="ml-2 text-blue-600">✓</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {restaurant.stats.categories} catégories • {restaurant.stats.products} produits • {restaurant.stats.workflows} workflows
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Dernière mise à jour: {new Date(restaurant.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.stats.options} options
                        </div>
                        <div className="text-xs text-gray-500">
                          configurées
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Nouveau Restaurant */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📍 Nouveau Restaurant
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du restaurant *
                </label>
                <input
                  type="text"
                  value={targetRestaurant.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Le Nouveau O'CV Moissy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (généré automatiquement)
                </label>
                <input
                  type="text"
                  value={targetRestaurant.slug}
                  onChange={(e) => setTargetRestaurant(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="le-nouveau-o-cv-moissy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  value={targetRestaurant.address}
                  onChange={(e) => setTargetRestaurant(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="37 Pl. du 14 Juillet, Moissy-Cramayel"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={targetRestaurant.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01.64.88.06.05"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={targetRestaurant.whatsapp_number}
                    onChange={(e) => setTargetRestaurant(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Même que téléphone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville (optionnel)
                </label>
                <input
                  type="text"
                  value={targetRestaurant.city}
                  onChange={(e) => setTargetRestaurant(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Moissy-Cramayel"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ⬅️ Retour
            </button>

            <button
              onClick={handleContinue}
              disabled={!isFormValid()}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuer ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}