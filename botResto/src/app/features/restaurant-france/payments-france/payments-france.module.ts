import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentsFrancePageRoutingModule } from './payments-france-routing.module';

import { PaymentsFrancePage } from './payments-france.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentsFrancePageRoutingModule
  ],
  declarations: [PaymentsFrancePage]
})
export class PaymentsFrancePageModule {}
