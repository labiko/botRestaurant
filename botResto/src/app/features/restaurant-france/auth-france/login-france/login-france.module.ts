import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LoginFrancePageRoutingModule } from './login-france-routing.module';
import { LoginFrancePage } from './login-france.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginFrancePageRoutingModule
  ],
  declarations: [LoginFrancePage]
})
export class LoginFrancePageModule { }