import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriversFrancePageRoutingModule } from './drivers-france-routing.module';

import { DriversFrancePage } from './drivers-france.page';
import { AddDriverModalComponent } from './add-driver-modal/add-driver-modal.component';
import { WhatsAppNotificationFranceService } from '../../../core/services/whatsapp-notification-france.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DriversFrancePageRoutingModule
  ],
  declarations: [
    DriversFrancePage,
    AddDriverModalComponent
  ],
  providers: [
    WhatsAppNotificationFranceService
  ]
})
export class DriversFrancePageModule {}
