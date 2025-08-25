import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OtpValidationModalComponent } from '../components/otp-validation-modal/otp-validation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [OtpValidationModalComponent],
  exports: [OtpValidationModalComponent]
})
export class DeliverySharedModule { }