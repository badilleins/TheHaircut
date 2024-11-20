import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductsCategoriesPageRoutingModule } from './products-categories-routing.module';

import { ProductsCategoriesPage } from './products-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductsCategoriesPageRoutingModule
  ],
  declarations: [ProductsCategoriesPage]
})
export class ProductsCategoriesPageModule {}
