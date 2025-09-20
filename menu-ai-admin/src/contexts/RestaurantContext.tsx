'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant } from '@/lib/types';

interface RestaurantContextType {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  restaurants: Restaurant[];
  setRestaurants: (restaurants: Restaurant[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [selectedRestaurant, setSelectedRestaurantState] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger restaurant depuis localStorage au démarrage
  useEffect(() => {
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      try {
        const restaurant = JSON.parse(savedRestaurant);
        setSelectedRestaurantState(restaurant);
      } catch (error) {
        console.error('Erreur parsing restaurant localStorage:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const setSelectedRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurantState(restaurant);
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
  };

  return (
    <RestaurantContext.Provider
      value={{
        selectedRestaurant,
        setSelectedRestaurant,
        restaurants,
        setRestaurants,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}