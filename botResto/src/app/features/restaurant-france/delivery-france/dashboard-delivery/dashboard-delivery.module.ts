import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardDeliveryPageRoutingModule } from './dashboard-delivery-routing.module';

import { DashboardDeliveryPage } from './dashboard-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardDeliveryPageRoutingModule
  ],
  declarations: [DashboardDeliveryPage]
})
export class DashboardDeliveryPageModule {}
