'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import TopNavbar from "@/components/Navigation/TopNavbar";
import Sidebar from "@/components/Navigation/Sidebar";
import Breadcrumbs from "@/components/Navigation/Breadcrumbs";
import { RestaurantProvider } from "@/contexts/RestaurantContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {

    // Si on n'est pas connecté et pas sur login, rediriger vers login
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
      return;
    }
  }, [user, isLoading, pathname, router]);

  // Afficher loading pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Page login : afficher sans layout
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Pages protégées : afficher avec layout complet si connecté
  if (user) {
    return (
      <RestaurantProvider>
        {/* Navigation moderne ajoutée */}
        <TopNavbar />

        <div className="flex min-h-screen">
          {/* Sidebar moderne - visible sur toutes les tailles */}
          <Sidebar />

          {/* Contenu principal avec breadcrumbs */}
          <main className="flex-1 flex flex-col">
            <Breadcrumbs />

            {/* Zone de contenu existant - AUCUNE MODIFICATION */}
            <div className="flex-1 p-3 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </RestaurantProvider>
    );
  }

  // Utilisateur non connecté sur page protégée : ne rien afficher (redirection en cours)
  return null;
}