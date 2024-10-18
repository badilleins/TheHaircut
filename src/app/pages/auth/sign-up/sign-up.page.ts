import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {

  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(3)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(3)]),
    phone: new FormControl(0,[Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    email: new FormControl('',[Validators.required, Validators.email]),
    isBarber: new FormControl(false),
    isAdmin: new FormControl(false),
    isBlocked: new FormControl(false),
    hourStartAt: new FormControl(0),
    hourEndAt: new FormControl(0),
    uidBranch: new FormControl(""),
    image: new FormControl("https://firebasestorage.googleapis.com/v0/b/citas-barber-28dfc.appspot.com/o/user_2078.webp?alt=media&token=896ae797-9229-44f0-8b39-27e5da7cac7f"),
    password: new FormControl('',[Validators.required]),
  })
  
  firebase = inject(FirebaseService) 
  utils = inject(UtilsService) 
  constructor() { }

  async submit()
  {
    if (this.form.invalid) {
      this.utils.showToast({
        message: 'El formulario es inválido',
        color: 'danger',
        position: 'middle',
        duration: 3000,
        icon: 'alert-circle-outline'
      });
      return;
    }
    const loading = await this.utils.loading()
    await loading.present()
    this.firebase.signUp(this.form.value as User).then( async res => {
      const name = this.form.value.name as string
      this.firebase.updateProfile(name)
      let uid = res.user.uid
      this.form.controls.uid.setValue(uid)
      this.setUserInfo(uid)
      this.utils.routerLink('main/tabs')
    }).catch(err => {
      this.utils.showToast({
        message:err.message,
        color:'danger',
        position:'middle',
        duration:3000,
        icon:'alert-circle-outline'
      })
    }).finally(() => {
      loading.dismiss()
    })
  }

  async setUserInfo(uid:string)
  {
    let path = `users/${uid}`
    delete this.form.value.password

    this.firebase.setDocument(path,this.form.value).then( async res => {
      this.utils.saveInLocalStorage('user',this.form.value)
      this.utils.routerLink('main')
    }).catch(err => {
      this.utils.showToast({
        message:err.message,
        color:'danger',
        position:'middle',
        duration:3000,
        icon:'alert-circle-outline'
      })
    })    
  }
}
