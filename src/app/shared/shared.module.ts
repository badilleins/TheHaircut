import localeEs from '@angular/common/locales/es';
import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './components/header/header.component';
import { AddUpdateAppointmentComponent } from './components/add-update-appointment/add-update-appointment.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from './components/logo/logo.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AddUpdateBranchComponent } from './components/add-update-branch/add-update-branch.component';
import { AddUpdateBarberComponent } from './components/add-update-barber/add-update-barber.component';
import { AddUpdateClientComponent } from './components/add-update-client/add-update-client.component';
import { HaircutGalleryComponent } from './components/haircut-gallery/haircut-gallery.component';
import { ProductsComponent } from './components/products/products.component';
import { AddUpdateHaircutComponent } from './components/add-update-haircut/add-update-haircut.component';
import { AddUpdateProductComponent } from './components/add-update-product/add-update-product.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { BaseChartDirective } from 'ng2-charts';
import { AddUpdateHaircutCategoryComponent } from './components/add-update-haircut-category/add-update-haircut-category.component';
import { AddUpdateProductCategoryComponent } from './components/add-update-product-category/add-update-product-category.component';
import { DonoughtChartComponent } from './components/donought-chart/donought-chart.component';
import { MapComponent } from './components/map/map.component';
import { AddUpdateAppointmentClientComponent } from './components/add-update-appointment-client/add-update-appointment-client.component';
import { CalendarClientComponent } from './components/calendar-client/calendar-client.component';

registerLocaleData(localeEs)


@NgModule({
  declarations: [HeaderComponent,
    AddUpdateAppointmentComponent,
    CustomInputComponent,
    LogoComponent,
    CalendarComponent,
    AddUpdateBranchComponent,
    AddUpdateBarberComponent,
    AddUpdateClientComponent,
    HaircutGalleryComponent,
    ProductsComponent,
    AddUpdateHaircutComponent,
    AddUpdateProductComponent,
    BarChartComponent,
    MapComponent,
    AddUpdateHaircutCategoryComponent,
    AddUpdateProductCategoryComponent,
    DonoughtChartComponent,
    AddUpdateAppointmentClientComponent,
    CalendarClientComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    BaseChartDirective

  ],
  exports: [
    HeaderComponent,
    AddUpdateAppointmentComponent,
    CustomInputComponent,
    LogoComponent,
    CalendarComponent,
    HaircutGalleryComponent,
    ProductsComponent,
    BarChartComponent,
    AddUpdateProductCategoryComponent,
    DonoughtChartComponent,
    MapComponent
  ]
})
export class SharedModule { }
