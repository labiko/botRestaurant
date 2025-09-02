import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriversFrancePage } from './drivers-france.page';

const routes: Routes = [
  {
    path: '',
    component: DriversFrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriversFrancePageRoutingModule {}
