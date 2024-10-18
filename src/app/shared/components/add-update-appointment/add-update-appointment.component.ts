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

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(4)]),
    date: new FormControl(null, Validators.required),
    endDate: new FormControl(null),
    status: new FormControl(null),
    securityCode: new FormControl(null, Validators.required),
    price: new FormControl(7,[Validators.required, Validators.min(0)]),
  })

  user = {} as User;

  constructor() { }

  ngOnInit() {
    this.user = this.utilsSrv.getFromLocalStorage('user');
    if (this.appointment) this.form.setValue(this.appointment)
  }

  submit()
  {
    if (this.form.valid) {

      if(this.appointment.id) this.updateAppointment();
      else this.createAppointment()

    }
  }

  // ======== Crear Producto =======
  async createAppointment() {
    let path = `users/${this.user.uid}/appointments`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    delete this.form.value.id

    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

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
      let path = `users/${this.user.uid}/appointments/${this.appointment.id}`;
  
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

}
