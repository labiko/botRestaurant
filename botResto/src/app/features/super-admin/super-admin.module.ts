import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SuperAdminRoutingModule } from './super-admin-routing.module';

// Services
import { SuperAdminAuthService } from './services/super-admin-auth.service';
import { SuperAdminDashboardService } from './services/super-admin-dashboard.service';
import { SuperAdminRestaurantService } from './services/super-admin-restaurant.service';
import { WhatsAppAdminService } from './services/whatsapp-admin.service';

// Guards
import { SuperAdminAuthGuard } from './guards/super-admin-auth.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuperAdminRoutingModule
  ],
  providers: [
    // Services
    SuperAdminAuthService,
    SuperAdminDashboardService,
    SuperAdminRestaurantService,
    WhatsAppAdminService,
    
    // Guards
    SuperAdminAuthGuard
  ]
})
export class SuperAdminModule { }