'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useAuth } from '@/lib/auth-context';
import { Restaurant } from '@/lib/types';
import { useFetch } from '@/hooks/useFetch';

export default function TopNavbar() {
  const { fetch: fetchWithEnv } = useFetch();
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
        const response = await fetchWithEnv('/api/restaurants');
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

        {/* Mobile: Header compact (< 640px) - Hauteur fixe 56px */}
        <div className="sm:hidden h-14 flex items-center justify-between">
          {/* Logo icône seule */}
          <div className="flex-shrink-0">
            <h1 className="text-white text-2xl font-bold">🤖</h1>
          </div>

          {/* Menu hamburger */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Menu déroulant mobile */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-0 bg-white shadow-xl border-t border-gray-200 z-50">
              {/* Environnement */}
              <div className="px-4 py-3 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">Environnement</label>
                <select
                  value={environment}
                  onChange={(e) => {
                    const newEnv = e.target.value as 'DEV' | 'PROD';
                    setEnvironment(newEnv);
                    window.location.reload();
                  }}
                  className={`w-full px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm ${
                    environment === 'PROD'
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <option value="DEV">🔵 DEV</option>
                  <option value="PROD">🔴 PROD</option>
                </select>
              </div>

              {/* Restaurant */}
              <div className="px-4 py-3 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">Restaurant</label>
                {isLoading ? (
                  <div className="text-sm text-gray-500">Chargement...</div>
                ) : (
                  <div className="space-y-1">
                    {restaurants.map((restaurant) => (
                      <button
                        key={restaurant.id}
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          restaurant.id === selectedRestaurant?.id
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        🍕 {restaurant.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User */}
              <div className="px-4 py-3">
                <div className="text-xs text-gray-600 mb-2">Connecté :</div>
                <div className="text-sm font-medium text-gray-900 mb-3">{user?.email}</div>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                    router.push('/login');
                  }}
                  className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Header normal (>= 640px) */}
        <div className="hidden sm:flex items-center justify-between h-16">
          {/* Logo et Branding */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold flex items-center">
                🤖 <span className="ml-2">Menu AI Admin</span>
              </h1>
            </div>
          </div>

          {/* Sélecteurs Environnement et Restaurant */}
          <div className="flex items-center gap-4">
            {/* Sélecteur Environnement */}
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => {
                  const newEnv = e.target.value as 'DEV' | 'PROD';
                  setEnvironment(newEnv);
                  window.location.reload();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-base ${
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
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              <span className="text-sm font-medium">Restaurant:</span>
              {isLoading ? (
                <span className="font-semibold text-base">Chargement...</span>
              ) : (
                <span className="font-semibold text-base">{selectedRestaurant?.name || "Aucun"}</span>
              )}
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu Restaurant */}
            {isUserMenuOpen && !isLoading && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setIsUserMenuOpen(false);
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
          </div>

          {/* Profil Utilisateur */}
          <div className="relative">
            <button
              onClick={() => {
                // Toggle menu user séparément
                const newState = !isUserMenuOpen;
                setIsUserMenuOpen(false);
                setTimeout(() => setIsUserMenuOpen(newState), 0);
              }}
              className="bg-white/10 text-white px-2 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm">{user?.email}</span>
            </button>

            {/* Menu utilisateur desktop - Ajouté séparément */}
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