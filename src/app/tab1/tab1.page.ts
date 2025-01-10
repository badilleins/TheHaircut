import { Component, inject, OnInit } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { UtilsService } from '../services/utils.service';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { AddUpdateAppointmentClientComponent } from '../shared/components/add-update-appointment-client/add-update-appointment-client.component';
import { orderBy, where } from 'firebase/firestore';
import { Notification } from '../models/notification.model';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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


  getAppointments() {
    let path = `appointments`;
    this.loading = true;

    let query = [
      where('client.uid', '==', this.user().uid),
      orderBy('date', 'desc')
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
      }
    })
  }

  async addUpdateAppointment()
  {

    let success = await this.utilsSrv.presentModal({
      component: AddUpdateAppointmentClientComponent,
      cssClass: 'add-update-modal'
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
    let path = `appointments/${appointment.id}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      await this.firebaseSrv.deleteDocument(path);
      await this.createNotificationDeleteAppointment(appointment)
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

  async createNotificationDeleteAppointment(appointment: Appointment) {
      let path = `users/${appointment.barber.uid}/notifications`
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
      const formattedDate = format(appointment.date, "EEEE, d 'de' MMMM 'del' yyyy", { locale: es });
      const notification: Notification ={
        message: `El cliente ${appointment.client.name} ${appointment.client.lastName} ha eliminado la cita programada para la fecha: ${formattedDate}`,
        date: new Date(),
        type: 0
      }
      this.firebaseSrv.addDocument(path, notification).then(async res => {
        const docId = res.id;
        await this.firebaseSrv.updateDocument(`${path}/${docId}`, { id: docId });
        this.utilsSrv.dismissModal({ success: true });
      }).catch(error => {
        console.log(error);
  
        this.utilsSrv.showToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
  
      }).finally(() => {
        loading.dismiss();
      })
  }

  constructor() {}

}
