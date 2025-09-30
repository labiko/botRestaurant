import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentCallbackPage } from './payment-callback.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentCallbackPage
  }
];

@NgModule({
  imports: [
    PaymentCallbackPage,
    RouterModule.forChild(routes)
  ]
})
export class PaymentCallbackPageModule {}
