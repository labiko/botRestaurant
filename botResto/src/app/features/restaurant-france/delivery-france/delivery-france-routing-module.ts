import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryFranceGuard } from '../auth-france/guards/delivery-france.guard';

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
    canActivate: [DeliveryFranceGuard]
  },
  {
    path: 'history',
    loadChildren: () => import('./history/history.module').then(m => m.HistoryPageModule),
    canActivate: [DeliveryFranceGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryFranceRoutingModule { }
