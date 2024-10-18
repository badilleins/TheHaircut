import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-barber',
  templateUrl: './add-update-barber.component.html',
  styleUrls: ['./add-update-barber.component.scss'],
})
export class AddUpdateBarberComponent  implements OnInit {

  @Input() user:User

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);

  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(4)]),
    phone: new FormControl(0,[Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    email: new FormControl('',[Validators.required, Validators.email]),
    isBarber: new FormControl(true),
    hourStartAt: new FormControl(7),
    hourEndAt: new FormControl(22),
    uidBranch: new FormControl(''),
    isAdmin: new FormControl(false),
    isBlocked: new FormControl(false),
    image: new FormControl(''),
  })

  userAdmin = {} as User;

  constructor() { }

  ngOnInit() {
    this.userAdmin = this.utilsSrv.getFromLocalStorage('user');
    if (this.user) this.form.setValue(this.user);
  }

  async takeImage()
  {
    const dataUrl = ( await this.utilsSrv.takePicture('Imagen del barbero')).dataUrl
    this.form.controls.image.setValue(dataUrl)
  }

  submit()
  {
    if (this.form.valid) {

      if(this.user) this.updateUser();
      else this.createUser()

    }
  }

  // ======== Crear User =======
  async createUser() {
    if (this.form.invalid) {
      this.utilsSrv.showToast({
        message: 'El formulario es inválido',
        color: 'danger',
        position: 'middle',
        duration: 3000,
        icon: 'alert-circle-outline'
      });
      return;
    }
    const loading = await this.utilsSrv.loading()
    await loading.present()
    this.firebaseSvc.signUp(this.form.value as User).then( async res => {
      const name = this.form.value.name as string
      this.firebaseSvc.updateProfile(name)
      // === Subir la imagen y obtener la url ===
      let dataUrl = this.form.value.image;
      let imagePath = `${res.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);
    }).catch(err => {
      this.utilsSrv.showToast({
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

    private async updateUser() {
      let path = `users/${this.user.uid}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
      try {
        // === Subir la nueva imagen si ha sido modificada ===
        if (this.form.value.image !== this.user.image) {
          let dataUrl = this.form.value.image;
          let imagePath = `${this.user.uid}/${Date.now()}`;
          let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
          this.form.controls.image.setValue(imageUrl);
        }
  
        // === Actualizar el documento ===
        await this.firebaseSvc.updateDocument(path, this.form.value);
  
        this.utilsSrv.dismissModal({ success: true });
  
        this.utilsSrv.showToast({
          message: 'Sucursal actualizada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.log(error);
  
        this.utilsSrv.showToast({
          message: error.message,
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
