'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  // Vérifier la session depuis les cookies et localStorage
  const checkSession = () => {
    try {
      // Vérifier d'abord localStorage pour l'état utilisateur
      const userData = localStorage.getItem('auth_user');
      const expiresAt = localStorage.getItem('auth_expires_at');

      if (!userData || !expiresAt) {
        setIsLoading(false);
        return;
      }

      // Vérifier si le token a expiré
      const now = Math.floor(Date.now() / 1000);
      const expires = parseInt(expiresAt);

      if (now >= expires) {
        // Token expiré - déconnecter automatiquement
        logout();
        return;
      }

      // Session valide - restaurer l'utilisateur
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Erreur vérification session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      // Stocker les données de session
      localStorage.setItem('auth_expires_at', data.expiresAt.toString());
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      // Stocker le token dans un cookie pour le middleware
      document.cookie = `auth_token=${data.token}; path=/; max-age=${2 * 60 * 60}; samesite=lax`;


      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('auth_user');

    // Supprimer le cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}