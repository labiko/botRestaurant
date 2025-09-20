'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();

  const breadcrumbs = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Accueil', path: '/', icon: '🏠' }
    ];

    // Map des routes vers leurs labels
    const routeLabels: { [key: string]: { label: string; icon: string } } = {
      'duplicate': { label: 'Duplication', icon: '🔄' },
      'history': { label: 'Historique', icon: '📚' },
      'categories': { label: 'Sélection Catégories', icon: '📁' },
      'success': { label: 'Succès', icon: '✅' },
      'editor': { label: 'Éditeur Moderne', icon: '✨' },
      'create': { label: 'Créer avec IA', icon: '🤖' },
      'delete': { label: 'Suppression', icon: '🗑️' },
      'analysis': { label: 'Analyse', icon: '🔍' }
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeLabels[segment];

      if (routeInfo) {
        breadcrumbItems.push({
          label: routeInfo.label,
          path: currentPath,
          icon: routeInfo.icon
        });
      } else {
        // Fallback pour les segments non mappés
        breadcrumbItems.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          icon: '📄'
        });
      }
    });

    return breadcrumbItems;
  }, [pathname]);

  if (pathname === '/') {
    return null; // Pas de breadcrumbs sur la page d'accueil
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-3 md:px-6 py-3">
      <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm overflow-x-auto">
        {breadcrumbs.map((item, index) => (
          <div key={item.path} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}

            <button
              onClick={() => router.push(item.path)}
              className={`flex items-center space-x-1 px-1 md:px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                index === breadcrumbs.length - 1
                  ? 'text-blue-600 bg-blue-50 font-medium cursor-default'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
              disabled={index === breadcrumbs.length - 1}
            >
              {item.icon && <span className="text-xs">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}