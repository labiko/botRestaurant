'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TopNavbarProps {
  selectedRestaurant?: string;
}

export default function TopNavbar({ selectedRestaurant = "Le Nouveau O'CV Moissy" }: TopNavbarProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const restaurants = [
    "Pizza Yolo 77",
    "Le Nouveau O'CV Moissy",
    "Autres restaurants..."
  ];

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
            >
              <span className="text-sm font-medium">Restaurant:</span>
              <span className="font-semibold">{selectedRestaurant}</span>
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
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                {restaurants.map((restaurant, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // Ici on pourrait ajouter la logique de changement de restaurant
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      restaurant === selectedRestaurant ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    🍕 {restaurant}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profil Utilisateur */}
          <div className="flex items-center">
            <button className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}