import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriversFrancePageRoutingModule } from './drivers-france-routing.module';

import { DriversFrancePage } from './drivers-france.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriversFrancePageRoutingModule
  ],
  declarations: [DriversFrancePage]
})
export class DriversFrancePageModule {}
