import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersFrancePage } from './orders-france.page';

const routes: Routes = [
  {
    path: '',
    component: OrdersFrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersFrancePageRoutingModule { }