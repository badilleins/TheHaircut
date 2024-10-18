import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-client',
  templateUrl: './add-update-client.component.html',
  styleUrls: ['./add-update-client.component.scss'],
})
export class AddUpdateClientComponent  implements OnInit {

  @Input() user:User

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);

  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(4)]),
    phone: new FormControl(0,[Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    email: new FormControl('',[Validators.required, Validators.email]),
    isBarber: new FormControl(false),
    isAdmin: new FormControl(false),
    hourStartAt: new FormControl(0),
    hourEndAt: new FormControl(0),
    uidBranch: new FormControl(''),
    isBlocked: new FormControl(false),
    image: new FormControl(''),
  })

  userAdmin = {} as User;

  constructor() { }

  ngOnInit() {
    this.userAdmin = this.utilsSrv.getFromLocalStorage('user');
    if (this.user) this.form.setValue(this.user);
  }

  submit()
  {
    if (this.form.valid) {
      if(this.user) this.updateUser();
    }
  }

    private async updateUser() {
      let path = `users/${this.user.uid}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
      try {
        // === Actualizar el documento ===
        await this.firebaseSvc.updateDocument(path, this.form.value);
  
        this.utilsSrv.dismissModal({ success: true });
  
        this.utilsSrv.showToast({
          message: 'Cliente actualizado exitosamente',
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

    confirmAddBarber() {
      if(this.form.controls.isBarber.value){
        this.form.controls.isBarber.setValue(false)
        this.form.controls.hourStartAt.setValue(0);
      this.form.controls.hourEndAt.setValue(0);
      }else{
        this.utilsSrv.presentAlert({
          header: 'Agregar Barbero',
          message: '¿Estás seguro de convertir este cliente en barbero?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Agregar',
              handler: () => this.addBarber(), 
            },
          ],
        });
      }
    }

    addBarber(){
      this.form.controls.isBarber.setValue(true);
      this.form.controls.hourStartAt.setValue(7);
      this.form.controls.hourEndAt.setValue(22);
    }
}
