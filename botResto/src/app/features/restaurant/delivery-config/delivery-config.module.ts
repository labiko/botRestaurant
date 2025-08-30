import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeliveryConfigPageRoutingModule } from './delivery-config-routing.module';
import { DeliveryConfigPage } from './delivery-config.page';

@NgModule({
  imports: [
    DeliveryConfigPageRoutingModule
  ]
})
export class DeliveryConfigPageModule {}