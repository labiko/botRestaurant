import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PaymentsPageRoutingModule } from './payments-routing.module';
import { PaymentsPage } from './payments.page';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentsPageRoutingModule,
    OtpInputComponent
  ],
  declarations: [PaymentsPage]
})
export class PaymentsPageModule {}