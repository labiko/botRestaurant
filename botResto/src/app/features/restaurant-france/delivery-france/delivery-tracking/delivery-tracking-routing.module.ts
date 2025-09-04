import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryTrackingPage } from './delivery-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryTrackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryTrackingPageRoutingModule {}