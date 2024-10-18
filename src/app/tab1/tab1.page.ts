import { Component, inject, OnInit } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { UtilsService } from '../services/utils.service';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { orderBy } from 'firebase/firestore';
import { AddUpdateAppointmentComponent } from '../shared/components/add-update-appointment/add-update-appointment.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEs)

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  ngOnInit(): void {
    this.firebaseSrv.listenToUserChanges();
  }
  
  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  appointments: Appointment[] = []
  loading:boolean = false
  
  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getAppointments()
  }

  doRefresh(event: any)
  {
    setTimeout(() => {
      this.getAppointments();
      event.target.complete();
    }, 1000);
  }

  getProfits() {
    return this.appointments.reduce((index, appointment) => index + appointment.price, 0);
  }

  getAppointments() {
    let path = `users/${this.user().uid}/appointments`;
    this.loading = true;

    let query = [
      orderBy('date', 'desc'),
    ]

    let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
      next: (res: any) => {
        this.appointments = res.map((appointment: any) => {
          return {
            ...appointment,
            date: appointment.date.toDate(),
            endDate: appointment.endDate.toDate() 
          };
        });
        this.loading = false;
        sub.unsubscribe();
      }
    })
  }

  async addUpdateAppointment()
  {
    let appointment:Appointment = {
      id: null,
      name: this.user().name,
      lastName: this.user().lastName,
      date: null,
      endDate: null,
      status: 0,
      securityCode: null,
      price: 7

    }
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateAppointmentComponent,
      cssClass: 'add-update-modal',
      componentProps: { appointment }
    })
    if (success) this.getAppointments();
  }

  confirmDeleteAppointment(appointment: Appointment) {
    this.utilsSrv.presentAlert({
      header: 'Eliminar Cita',
      message: '¿Estás seguro de eliminar esta cita?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteAppointment(appointment), 
        },
      ],
    });
  }

  async deleteAppointment(appointment: Appointment) {
    let path = `users/${this.user().uid}/appointments/${appointment.id}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      await this.firebaseSrv.deleteDocument(path);
      let pathImage = await this.firebaseSrv.getFilePath(appointment.name)
      await this.firebaseSrv.deleteFile(pathImage)
      this.utilsSrv.showToast({
        message: 'Cita eliminada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline',
      });

      this.getAppointments(); 
    } catch (error) {
      console.log(error);

      this.utilsSrv.showToast({
        message:"Ha ocurrido un error",
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }

  constructor() {}

}
