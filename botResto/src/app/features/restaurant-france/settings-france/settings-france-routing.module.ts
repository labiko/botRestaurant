import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsFrancePage } from './settings-france.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsFrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsFrancePageRoutingModule {}