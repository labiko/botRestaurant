import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryFranceGuard } from '../auth-france/guards/delivery-france.guard';
import { DeliveryTokenGuard } from '../auth-france/guards/delivery-token.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/restaurant-france/delivery-france/my-orders',
    pathMatch: 'full'
  },
  {
    path: 'my-orders',
    loadChildren: () => import('./my-orders/my-orders.module').then(m => m.MyOrdersPageModule),
    canActivate: [DeliveryFranceGuard]
  },
  {
    path: 'available-orders',
    loadChildren: () => import('./available-orders/available-orders.module').then(m => m.AvailableOrdersPageModule),
    canActivate: [DeliveryTokenGuard] // Utilise le nouveau guard qui gère les tokens
  },
  {
    path: 'history',
    loadChildren: () => import('./history/history.module').then(m => m.HistoryPageModule),
    canActivate: [DeliveryFranceGuard]
  },
  {
    path: 'tracking',
    loadChildren: () => import('./delivery-tracking/delivery-tracking.module').then(m => m.DeliveryTrackingPageModule)
    // Pas de guard pour permettre l'accès aux restaurants
  },
  {
    path: 'accept',
    // Au lieu d'une redirection simple, utiliser le même composant avec le guard token
    loadChildren: () => import('./available-orders/available-orders.module').then(m => m.AvailableOrdersPageModule),
    canActivate: [DeliveryTokenGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryFranceRoutingModule { }
