import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductsCategoriesPageRoutingModule } from './products-categories-routing.module';

import { ProductsCategoriesPage } from './products-categories.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductsCategoriesPageRoutingModule,
    SharedModule
  ],
  declarations: [ProductsCategoriesPage]
})
export class ProductsCategoriesPageModule {}
