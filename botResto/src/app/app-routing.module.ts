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
    redirectTo: 'home',
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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
