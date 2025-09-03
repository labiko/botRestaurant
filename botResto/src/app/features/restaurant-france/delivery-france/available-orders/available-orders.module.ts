import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AvailableOrdersPageRoutingModule } from './available-orders-routing.module';

import { AvailableOrdersPage } from './available-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AvailableOrdersPageRoutingModule
  ],
  declarations: [AvailableOrdersPage]
})
export class AvailableOrdersPageModule {}
