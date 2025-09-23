'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useAuth } from '@/lib/auth-context';
import { Restaurant } from '@/lib/types';

export default function TopNavbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
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

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <span className="text-white/80 text-sm">
                  👤 {user.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="bg-red-500/80 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
                >
                  🚪 Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}