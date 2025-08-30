import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminAuthGuard } from './guards/super-admin-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  // Authentification
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.page').then(m => m.SuperAdminLoginPage)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  // Pages protégées
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.SuperAdminDashboardPage),
    canActivate: [SuperAdminAuthGuard]
  },
  {
    path: 'restaurants',
    loadComponent: () => import('./restaurants/restaurants.page').then(m => m.SuperAdminRestaurantsPage),
    canActivate: [SuperAdminAuthGuard]
  },
  {
    path: 'restaurant-settings',
    loadComponent: () => import('./restaurant-settings/restaurant-settings.page').then(m => m.SuperAdminRestaurantSettingsPage),
    canActivate: [SuperAdminAuthGuard]
  },
  {
    path: 'restaurant-settings/delivery-config',
    loadComponent: () => import('./delivery-config/delivery-config.page').then(m => m.DeliveryConfigPage),
    canActivate: [SuperAdminAuthGuard]
  },
  {
    path: 'payment-config',
    loadComponent: () => import('./payment-config/payment-config.page').then(m => m.PaymentConfigPage),
    canActivate: [SuperAdminAuthGuard]
  },
  // TODO: Ajouter les autres modules en Phase 2-4
  // {
  //   path: 'users',
  //   loadChildren: () => import('./users/users-routing.module').then(m => m.UsersRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'orders', 
  //   loadChildren: () => import('./orders/orders-routing.module').then(m => m.OrdersRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'delivery',
  //   loadChildren: () => import('./delivery/delivery-routing.module').then(m => m.DeliveryRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'live-tracking',
  //   loadComponent: () => import('./live-tracking/live-tracking.page').then(m => m.LiveTrackingPage),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'analytics',
  //   loadChildren: () => import('./analytics/analytics-routing.module').then(m => m.AnalyticsRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'subscription',
  //   loadChildren: () => import('./subscription/subscription-routing.module').then(m => m.SubscriptionRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'settings',
  //   loadChildren: () => import('./settings/settings-routing.module').then(m => m.SettingsRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'support',
  //   loadChildren: () => import('./support/support-routing.module').then(m => m.SupportRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // },
  // {
  //   path: 'audit',
  //   loadChildren: () => import('./audit/audit-routing.module').then(m => m.AuditRoutingModule),
  //   canActivate: [SuperAdminAuthGuard]
  // }
  
  // Redirection pour les routes non implémentées
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule { }