import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductsCategoriesPage } from './products-categories.page';

const routes: Routes = [
  {
    path: '',
    component: ProductsCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsCategoriesPageRoutingModule {}
