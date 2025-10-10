'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function SidebarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      id: 'edition-moderne',
      label: 'Édition Moderne',
      icon: '✨',
      path: '/?mode=modal',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Éditeur de menu moderne'
    },
    {
      id: 'dupliquer',
      label: 'Dupliquer Restaurant',
      icon: '🔄',
      path: '/duplicate',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Duplication de restaurants'
    },
    {
      id: 'historique',
      label: 'Historique Duplications',
      icon: '📚',
      path: '/duplicate/history',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Historique des duplications'
    },
    {
      id: 'production-sync',
      label: 'Synchronisation Production',
      icon: '🔄',
      path: '/production-sync',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Gestion déploiements production'
    },
    {
      id: 'workflow-universal',
      label: 'Workflow Universel V2',
      icon: '🚀',
      path: '/workflow-universal',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Générateur universel 100% compatible bot'
    },
    {
      id: 'ocr-onboarding',
      label: 'OCR Smart Onboarding',
      icon: '🤖',
      path: '/ocr-onboarding/upload',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Création restaurant via OCR - 5 étapes automatisées'
    },
    {
      id: 'suppression',
      label: 'Suppression Restaurant',
      icon: '🗑️',
      path: '/?section=suppression',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Suppression sécurisée'
    },
    {
      id: 'back-office-resto',
      label: 'Back Office Resto',
      icon: '🏪',
      path: '/back-office-restaurant',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Activer/Désactiver restaurants'
    },
    {
      id: 'audit-bot-flyer',
      label: 'Audit Bot vs Flyer',
      icon: '🔍',
      path: '/audit-bot-flyer',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Vérification intelligente catégorie par catégorie'
    },
    {
      id: 'subscriptions',
      label: 'Gestion Abonnements',
      icon: '💳',
      path: '/subscriptions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Gérer et prolonger les abonnements restaurants'
    },
    {
      id: 'stripe-config',
      label: 'Configuration Stripe',
      icon: '⚙️',
      path: '/stripe-config',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Paramétrer les clés et plans Stripe'
    },
    ...(process.env.NEXT_PUBLIC_ENVIRONMENT === 'DEV' ? [{
      id: 'green-api-health',
      label: 'Green API Health',
      icon: '📊',
      path: '/green-api-health',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Monitoring Green API (DEV uniquement)'
    }] : [])
  ];

  const isActive = (path: string) => {
    if (path === '/?mode=modal') {
      return pathname === '/' && searchParams.get('mode') === 'modal';
    }
    if (path.includes('?section=')) {
      const sectionParam = path.split('?section=')[1];
      return pathname === '/' && searchParams.get('section') === sectionParam;
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className={`bg-white shadow-xl min-h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex-shrink-0 relative ${isMobile ? 'z-40' : ''}`}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  active
                    ? `${item.bgColor} ${item.color} shadow-sm border border-current border-opacity-20`
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : item.description}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>

                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.label}
                    </p>
                    <p className="text-xs opacity-75 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                )}

                {!isCollapsed && active && (
                  <div className="ml-2 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 text-center">
            Menu AI Admin v2.0
          </div>
        </div>
      )}
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={
      <aside className="bg-white border-r border-gray-200 w-64 flex-shrink-0">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="text-sm text-gray-500">Chargement...</div>
        </div>
      </aside>
    }>
      <SidebarContent />
    </Suspense>
  );
}