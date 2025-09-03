import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AvailableOrdersPage } from './available-orders.page';

const routes: Routes = [
  {
    path: '',
    component: AvailableOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AvailableOrdersPageRoutingModule {}
