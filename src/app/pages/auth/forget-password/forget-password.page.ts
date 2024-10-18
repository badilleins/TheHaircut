import { FirebaseService } from 'src/app/services/firebase.service';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage {

  form = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
  })

  firebase = inject(FirebaseService)
  utils = inject(UtilsService)

  async submit(){
    const loading = await this.utils.loading()
    await loading.present()
    this.firebase.resetPassword(this.form.value.email).then(res => {
      this.utils.showToast({
        message: 'Correo de recuperacion enviado con exito',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'person-circle-outline'
      })
    }).catch(err => {
      this.utils.showToast({
        message:err.message,
        color:'danger',
        position:'middle',
        duration:10000,
        icon:'alert-circle-outline'
      })
    }).finally(() => {
      loading.dismiss()
    })
  }
}
