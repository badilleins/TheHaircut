import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HaircutsCategoriesPageRoutingModule } from './haircuts-categories-routing.module';

import { HaircutsCategoriesPage } from './haircuts-categories.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HaircutsCategoriesPageRoutingModule,
    SharedModule
  ],
  declarations: [HaircutsCategoriesPage]
})
export class HaircutsCategoriesPageModule {}
