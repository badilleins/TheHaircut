import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HaircutsCategoriesPage } from './haircuts-categories.page';

const routes: Routes = [
  {
    path: '',
    component: HaircutsCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HaircutsCategoriesPageRoutingModule {}
