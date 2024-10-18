import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab5PageRoutingModule } from './tab5-routing.module';

import { Tab5Page } from './tab5.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab5PageRoutingModule,
    SharedModule
  ],
  declarations: [Tab5Page]
})
export class Tab5PageModule {}
