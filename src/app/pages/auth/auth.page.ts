import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  
  form = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required]),
  })

  firebase = inject(FirebaseService)
  utils = inject(UtilsService)

  async submit()
  {
    const loading = await this.utils.loading()
    await loading.present()
    this.firebase.signIn(this.form.value as User).then(res => {
      this.getUserInfo(res.user.uid);
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

  async getUserInfo(uid: string) {
    if (this.form.valid) {

      const loading = await this.utils.loading();
      await loading.present();

      let path = `users/${uid}`;

      this.firebase.getDocument(path).then((user: any) => {

        this.utils.saveInLocalStorage('user', user);
        this.utils.routerLink('main/tabs');
        this.form.reset();

        this.utils.showToast({
          message: `Te damos la bienvenida ${user.name}`,
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        })


      }).catch(error => { 
        console.log(error);

        this.utils.showToast({
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
  constructor() { }

  ngOnInit() {
  }

}
