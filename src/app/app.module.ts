import localeEs from '@angular/common/locales/es';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat'

import { environment } from 'src/environments/environment';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { registerLocaleData } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { NgChartsConfiguration } from 'ng2-charts';
registerLocaleData(localeEs, 'es')
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory})
  ],
  providers: [{ provide: LOCALE_ID, useClass: IonicRouteStrategy, useValue: 'es' }, provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
