import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrdersFrancePageRoutingModule } from './orders-france-routing.module';
import { OrdersFrancePage } from './orders-france.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersFrancePageRoutingModule
  ],
  declarations: [OrdersFrancePage]
})
export class OrdersFrancePageModule { }