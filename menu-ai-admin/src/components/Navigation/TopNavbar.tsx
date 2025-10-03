'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useAuth } from '@/lib/auth-context';
import { Restaurant } from '@/lib/types';

export default function TopNavbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const { environment, setEnvironment } = useEnvironment();
  const {
    selectedRestaurant,
    setSelectedRestaurant,
    restaurants,
    setRestaurants,
    isLoading,
    setIsLoading
  } = useRestaurant();

  // Charger les restaurants depuis l'API
  useEffect(() => {
    async function loadRestaurants() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/restaurants');
        const data = await response.json();

        if (data.success) {
          setRestaurants(data.restaurants);

          // Si aucun restaurant sélectionné, prendre le premier
          if (!selectedRestaurant && data.restaurants.length > 0) {
            setSelectedRestaurant(data.restaurants[0]);
          }
        }
      } catch (error) {
        console.error('Erreur chargement restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et Branding */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold flex items-center">
                🤖 <span className="ml-2">Menu AI Admin</span>
              </h1>
            </div>
          </div>

          {/* Sélecteurs Environnement et Restaurant */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur Environnement */}
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as 'DEV' | 'PROD')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  environment === 'PROD'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <option value="DEV">🔵 DEV</option>
                <option value="PROD">🔴 PROD</option>
              </select>
            </div>

            {/* Sélecteur Restaurant */}
            <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              <span className="text-sm font-medium">Restaurant:</span>
              {isLoading ? (
                <span className="font-semibold">Chargement...</span>
              ) : (
                <span className="font-semibold">{selectedRestaurant?.name || "Aucun"}</span>
              )}
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && !isLoading && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      restaurant.id === selectedRestaurant?.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    🍕 {restaurant.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profil Utilisateur */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm hidden md:block">{user?.email}</span>
            </button>

            {/* Menu utilisateur */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 text-sm text-gray-600 border-b">
                  Connecté en tant que:
                  <div className="font-medium text-gray-900">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    router.push('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}