import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BarbersPage } from './barbers.page';

const routes: Routes = [
  {
    path: '',
    component: BarbersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarbersPageRoutingModule {}
