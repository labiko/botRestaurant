import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardFrancePage } from './dashboard-france.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardFrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardFrancePageRoutingModule { }