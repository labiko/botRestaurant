import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthFranceGuard } from './auth-france/guards/auth-france.guard';
import { RestaurantFranceGuard } from './auth-france/guards/restaurant-france.guard';
import { DeliveryFranceGuard } from './auth-france/guards/delivery-france.guard';
import { DeliverySharedGuard } from './auth-france/guards/delivery-shared.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth-france/login-france',
    pathMatch: 'full'
  },
  {
    path: 'auth-france',
    loadChildren: () => import('./auth-france/auth-france.module').then(m => m.AuthFranceModule)
  },
  {
    path: 'dashboard-france',
    loadChildren: () => import('./dashboard-france/dashboard-france.module').then(m => m.DashboardFrancePageModule),
    canActivate: [RestaurantFranceGuard]
  },
  {
    path: 'orders-france',
    loadChildren: () => import('./orders-france/orders-france.module').then(m => m.OrdersFrancePageModule),
    canActivate: [RestaurantFranceGuard]
  },
  {
    path: 'delivery-france',
    loadChildren: () => import('./delivery-france/delivery-france-module').then(m => m.DeliveryFranceModule),
    canActivate: [DeliverySharedGuard]
  },
  {
    path: 'drivers-france',
    loadChildren: () => import('./drivers-france/drivers-france.module').then( m => m.DriversFrancePageModule),
    canActivate: [RestaurantFranceGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestaurantFranceRoutingModule { }