import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarbersPageRoutingModule } from './barbers-routing.module';

import { BarbersPage } from './barbers.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarbersPageRoutingModule,
    SharedModule
  ],
  declarations: [BarbersPage]
})
export class BarbersPageModule {}
