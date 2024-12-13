import { Component, Input, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-appointment',
  templateUrl: './add-update-appointment.component.html',
  styleUrls: ['./add-update-appointment.component.scss'],
})
export class AddUpdateAppointmentComponent  implements OnInit {
  
  @Input() appointment:Appointment
  @Input() appointmentEdit:Appointment

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);

  

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(4)]),
    barber: new FormControl(),
    date: new FormControl(null, Validators.required),
    endDate: new FormControl(null),
    status: new FormControl(null),
    securityCode: new FormControl(null, Validators.required),
  })

  constructor() { }

  user = {} as User

  ngOnInit() {
    this.user = this.utilsSrv.getFromLocalStorage('user');
    if (this.appointmentEdit){
      console.log(this.appointmentEdit)
      this.form.patchValue({
        id: this.appointmentEdit.id,
        name: this.appointmentEdit.name || null,
        lastName: this.appointmentEdit.lastName || null,
        barber: this.appointmentEdit.barber,
        date: this.appointmentEdit.date,
        endDate: this.appointmentEdit.endDate,
        status: this.appointmentEdit.status,
        securityCode: this.appointmentEdit.securityCode
      })
    }
    if (this.appointment){
      this.form.patchValue({
        id: this.appointment.id,
        name: this.appointment.name || null,
        lastName: this.appointment.lastName || null,
        barber: this.appointment.barber,
        date: this.appointment.date,
        endDate: this.appointment.endDate,
        status: this.appointment.status,
        securityCode: this.appointment.securityCode
      })
    }
  }

  submit()
  {
    if (this.form.valid) {

      if(this.appointmentEdit) this.updateAppointment();
      else this.createAppointment()

    }
  }

  // ======== Crear Producto =======
  async createAppointment() {
    let path = `appointments`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    
    this.form.controls.barber.setValue(this.user)

    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {
      const docId = res.id; // ID generado por Firebase
      await this.firebaseSvc.updateDocument(`${path}/${docId}`, { id: docId });
      this.utilsSrv.dismissModal({ success: true });

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

    private async updateAppointment() {
      let path = `appointments/${this.appointmentEdit.id}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      try {
        // === Actualizar el documento ===
        await this.firebaseSvc.updateDocument(path, this.form.value);
  
        this.utilsSrv.dismissModal({ success: true });
  
        this.utilsSrv.showToast({
          message: 'Cita actualizada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.log(error);
  
        this.utilsSrv.showToast({
          message: 'Error al actualizar',
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      } finally {
        loading.dismiss();
      }
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

    confirmFinishAppointment() {
      this.utilsSrv.presentAlert({
        header: 'Terminar',
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
                  this.finishAppointment()
            }
          },
        ],
      });
    }

    async finishAppointment() {
      let path = `appointments/${this.appointmentEdit.id}`
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      
      this.form.controls.status.setValue(1)
      this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {
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

}
