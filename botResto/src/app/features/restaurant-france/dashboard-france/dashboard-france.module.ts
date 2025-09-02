import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DashboardFrancePageRoutingModule } from './dashboard-france-routing.module';
import { DashboardFrancePage } from './dashboard-france.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardFrancePageRoutingModule
  ],
  declarations: [DashboardFrancePage]
})
export class DashboardFrancePageModule { }