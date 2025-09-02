import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginFrancePage } from './login-france.page';

const routes: Routes = [
  {
    path: '',
    component: LoginFrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginFrancePageRoutingModule { }