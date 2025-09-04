import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeliveryTrackingPageRoutingModule } from './delivery-tracking-routing.module';
import { DeliveryTrackingPage } from './delivery-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryTrackingPageRoutingModule
  ],
  declarations: [DeliveryTrackingPage]
})
export class DeliveryTrackingPageModule {}