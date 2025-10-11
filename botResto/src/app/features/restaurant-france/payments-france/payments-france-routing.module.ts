import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentsFrancePage } from './payments-france.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentsFrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentsFrancePageRoutingModule {}
