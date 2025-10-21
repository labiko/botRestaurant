import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DashboardFrancePageRoutingModule } from './dashboard-france-routing.module';
import { DashboardFrancePage } from './dashboard-france.page';
import { InviteClientModalComponent } from './invite-client-modal/invite-client-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DashboardFrancePageRoutingModule
  ],
  declarations: [
    DashboardFrancePage,
    InviteClientModalComponent
  ]
})
export class DashboardFrancePageModule { }