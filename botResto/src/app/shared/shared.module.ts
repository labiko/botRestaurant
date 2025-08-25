import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BotRestoLogoComponent } from './components/bot-resto-logo/bot-resto-logo.component';

@NgModule({
  declarations: [
    BotRestoLogoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    BotRestoLogoComponent
  ]
})
export class SharedModule { }