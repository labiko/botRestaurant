import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryFranceGuard } from '../auth-france/guards/delivery-france.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/restaurant-france/delivery-france/dashboard-delivery',
    pathMatch: 'full'
  },
  {
    path: 'dashboard-delivery',
    loadChildren: () => import('./dashboard-delivery/dashboard-delivery.module').then(m => m.DashboardDeliveryPageModule),
    canActivate: [DeliveryFranceGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryFranceRoutingModule { }
