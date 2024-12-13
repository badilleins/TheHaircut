import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { orderBy, where } from 'firebase/firestore';
import { Appointment } from 'src/app/models/appointment.model';
import { Branch } from 'src/app/models/branch.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { addMinutes } from 'date-fns';
import { Notification } from 'src/app/models/notification.model';

@Component({
  selector: 'app-add-update-appointment-client',
  templateUrl: './add-update-appointment-client.component.html',
  styleUrls: ['./add-update-appointment-client.component.scss'],
})
export class AddUpdateAppointmentClientComponent  implements OnInit {

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService)
  branchs: Branch[]=[]
  barbers: User[]=[]
  uidBranch: string;
  barber: User;
  @Input() appointmentEdit: Appointment

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(4)]),
    client: new FormControl(null,[Validators.required]),
    barber: new FormControl(null,[Validators.required]),
    date: new FormControl(null, Validators.required),
    endDate: new FormControl(null),
    status: new FormControl(0),
    securityCode: new FormControl(0, Validators.required),
  })

  constructor() { }

  user = {} as User

  ngOnInit() {
    if(this.appointmentEdit){
      this.form.patchValue({
        id: this.appointmentEdit.id,
        name: this.appointmentEdit.name,
        lastName: this.appointmentEdit.lastName,
        client: this.appointmentEdit.client,
        barber: this.appointmentEdit.barber,
        date: this.appointmentEdit.date,
        endDate: this.appointmentEdit.endDate,
        status: this.appointmentEdit.status,
        securityCode: this.appointmentEdit.securityCode
      })
    }else{
      this.user = this.utilsSrv.getFromLocalStorage('user');
      this.form.controls.name.setValue(this.user.name)
      this.form.controls.lastName.setValue(this.user.lastName)
      this.form.controls.client.setValue(this.user)
      this.getBranchs();
    }  
  }

  submit()
  {
    if(this.appointmentEdit){
      this.updateAppointment()
    }else{
      if (this.form.valid) {
        this.createAppointment()
      }
    }
  }

  // ======== Crear Producto =======
  async createAppointment() {
    let path = `appointments`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    
    this.form.controls.barber.setValue(this.barber)
    this.form.controls.endDate.setValue(addMinutes(this.form.controls.date.value, 59))
    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {
      const docId = res.id; // ID generado por Firebase
      await this.firebaseSvc.updateDocument(`${path}/${docId}`, { id: docId });
      this.utilsSrv.dismissModal({ success: true });
      await this.createNotificationCreateAppointment(this.barber)
      this.utilsSrv.showToast({
        message: 'Cita agendada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      })

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

  confirmFinishAppointment() {
    this.utilsSrv.presentAlert({
      header: 'Terminar cita',
      message: '¿Estás seguro de terminar esta cita?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
                this.updateAppointment()
          }
        },
      ],
    });
  }


  async updateAppointment() {
    let path = `appointments/${this.appointmentEdit.id}`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    
    this.form.controls.status.setValue(1)
    this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {
    await this.createNotificationFinishAppointment();  
      this.utilsSrv.dismissModal({ success: true });

      this.utilsSrv.showToast({
        message: 'Cita terminada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      })

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

    selectOnChange(event){
      this.uidBranch = event.detail.value
      this.getBarbers();
    }

    selectOnChangeBarbers(event){
      this.form.controls.barber.setValue(event.detail.value)
      this.barber= event.detail.value
    }

    async getBranchs() {
      let path = `branchs`;
      this.firebaseSvc.getCollectionData(path).subscribe({
        next: (res: any) => {
          this.branchs = res
        }
      })
    }

    async getBarbers() {
      let path = `users`;
      let query = [
        where('isBarber', '==', true),
        where('uidBranch', '==', this.uidBranch),
        orderBy('__name__', 'asc')
      ]
      this.firebaseSvc.getCollectionData(path, query).subscribe({
        next: (res: any) => {
          this.barbers = res
        }
      })
    }

    dateSelected(selectedDate: Date): void {
      this.form.controls.date.setValue(selectedDate)
    }

    confirmDeleteAppointment() {
      this.utilsSrv.presentAlert({
        header: 'Eliminar cita',
        message: '¿Estás seguro de eliminar esta cita?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Eliminar',
            handler: () => {
                  this.deleteAppointment()
            }
          },
        ],
      });
    }
  
    async deleteAppointment() {
      let path = `appointments/${this.appointmentEdit.id}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      try {
        await this.firebaseSvc.deleteDocument(path);
        await this.createNotificationDeleteAppointment();
        this.utilsSrv.showToast({
          message: 'Cita eliminada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
        this.utilsSrv.dismissModal({ success: true });
      } catch (error) {
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

  async createNotificationDeleteAppointment() {
    let path = `users/${this.appointmentEdit.client.uid}/notifications`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    const notification: Notification ={
      message: `El barbero ${this.appointmentEdit.barber.name} ${this.appointmentEdit.barber.lastName} ha eliminado la cita programada para la fecha: ${this.appointmentEdit.date}`,
      date: new Date(),
      type: 0
    }
    this.firebaseSvc.addDocument(path, notification).then(async res => {
      const docId = res.id;
      await this.firebaseSvc.updateDocument(`${path}/${docId}`, { id: docId });
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

async createNotificationCreateAppointment(barber: User) {
  let path = `users/${barber.uid}/notifications`

  const loading = await this.utilsSrv.loading();
  await loading.present();

  const notification: Notification ={
    message: `El cliente ${this.user.name} ${this.user.lastName} ha agendado una cita para la fecha: ${this.form.controls.date.value}`,
    date: new Date(),
    type: 3
  }
  this.firebaseSvc.addDocument(path, notification).then(async res => {
    const docId = res.id;
    await this.firebaseSvc.updateDocument(`${path}/${docId}`, { id: docId });
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

async createNotificationFinishAppointment() {
  let path = `users/${this.appointmentEdit.client.uid}/notifications`

  const loading = await this.utilsSrv.loading();
  await loading.present();

  const notification: Notification ={
    message: `El barbero ${this.appointmentEdit.barber.name} ${this.appointmentEdit.barber.lastName} ha finalizado la cita programada para la fecha: ${this.appointmentEdit.date}`,
    date: new Date(),
    type: 1
  }
  this.firebaseSvc.addDocument(path, notification).then(async res => {
    const docId = res.id;
    await this.firebaseSvc.updateDocument(`${path}/${docId}`, { id: docId });
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
}
