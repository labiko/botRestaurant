import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardDeliveryPage } from './dashboard-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardDeliveryPageRoutingModule {}
