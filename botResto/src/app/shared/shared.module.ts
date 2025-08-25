import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CurrencySelectorComponent } from './components/currency-selector/currency-selector.component';

@NgModule({
  declarations: [
    CurrencySelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    CurrencySelectorComponent
  ]
})
export class SharedModule { }