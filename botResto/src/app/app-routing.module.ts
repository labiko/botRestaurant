import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'auth/login',
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'restaurant/dashboard',
    loadChildren: () => import('./features/restaurant/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: '',
    redirectTo: 'restaurant-france/auth-france/login-france',
    pathMatch: 'full'
  },
  {
    path: 'delivery/dashboard',
    loadChildren: () => import('./features/delivery/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'delivery/orders',
    loadChildren: () => import('./features/delivery/orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'restaurant/settings',
    loadChildren: () => import('./features/restaurant/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'restaurant',
    loadChildren: () => import('./features/restaurant/tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'super-admin',
    loadChildren: () => import('./features/super-admin/super-admin.module').then( m => m.SuperAdminModule)
  },
  {
    path: 'restaurant-france',
    loadChildren: () => import('./features/restaurant-france/restaurant-france.module').then( m => m.RestaurantFranceModule)
  },
  {
    path: 'payment',
    children: [
      {
        path: 'success',
        loadChildren: () => import('./features/payment/payment-callback/payment-callback.module').then( m => m.PaymentCallbackPageModule)
      },
      {
        path: 'cancel',
        loadChildren: () => import('./features/payment/payment-callback/payment-callback.module').then( m => m.PaymentCallbackPageModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'restaurant-france/auth-france/login-france'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
