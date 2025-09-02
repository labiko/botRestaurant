import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login-france',
    pathMatch: 'full'
  },
  {
    path: 'login-france',
    loadChildren: () => import('./login-france/login-france.module').then(m => m.LoginFrancePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthFranceRoutingModule { }