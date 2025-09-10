import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SettingsFrancePageRoutingModule } from './settings-france-routing.module';
import { SettingsFrancePage } from './settings-france.page';

// Components
import { RestaurantConfigComponent } from './components/restaurant-config/restaurant-config.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';
import { ModularConfigModalComponent } from './components/product-management/modular-config-modal.component';
import { UniversalProductModalComponent } from './components/product-management/universal-product-modal.component';
import { CategoryManagementModalComponent } from './components/product-management/category-management-modal.component';
import { WorkflowConfigComponent } from './components/workflow-config/workflow-config.component';
import { ServiceModesComponent } from './components/service-modes/service-modes.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SettingsFrancePageRoutingModule
  ],
  declarations: [
    SettingsFrancePage,
    RestaurantConfigComponent,
    ProductManagementComponent,
    ModularConfigModalComponent,
    UniversalProductModalComponent,
    CategoryManagementModalComponent,
    WorkflowConfigComponent,
    ServiceModesComponent
  ]
})
export class SettingsFrancePageModule {}