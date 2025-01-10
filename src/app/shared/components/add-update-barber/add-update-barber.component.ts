import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Branch } from 'src/app/models/branch.model';
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

  branchs: Branch[]=[]

  form = new FormGroup({
    uid: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    lastName: new FormControl('',[Validators.required, Validators.minLength(4)]),
    phone: new FormControl(0,[Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    email: new FormControl('',[Validators.required, Validators.email]),
    isBarber: new FormControl(true),
    hourStartAt: new FormControl(0, Validators.required),
    hourEndAt: new FormControl(0,Validators.required),
    uidBranch: new FormControl(null,Validators.required),
    isAdmin: new FormControl(false),
    isBlocked: new FormControl(false),
    image: new FormControl(''),
  },
  {validators:this.validateEndTime
  }
);

  userAdmin = {} as User;

  constructor() { }

  ngOnInit() {
    this.userAdmin = this.utilsSrv.getFromLocalStorage('user');
    this.getBranchs()
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
      const startTime = this.convertTimeToDecimal(this.form.value.hourStartAt.toString());
      const endTime = this.convertTimeToDecimal(this.form.value.hourEndAt.toString());

      // Actualizar los valores transformados en el formulario
      this.form.controls.hourStartAt.setValue(startTime);
      this.form.controls.hourEndAt.setValue(endTime);
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
          message: 'Barbero actualizado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
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

    validateEndTime(formGroup:FormGroup){

      const start = formGroup.get('hourStartAt')?.value.toString();
      const end = formGroup.get('hourEndAt')?.value.toString();

      const [hours,minutes] = start.split(":").map(Number)
      const[hours2,minutes2] = end.split(":").map(Number)

      const timeStart = new Date();
      timeStart.setHours(hours,minutes,0,0)

      const timeEnd =new Date()
      timeEnd.setHours(hours2,minutes2,0,0)



      if(start && end && timeStart >=timeEnd){
        console.log("Entro al 1")
        formGroup.get('hourEndAt')?.setErrors({endTimeInvalid:true});

      }else{
        formGroup.get('hourEndAt')?.setErrors(null)
      }
      return null;
    }

    selectOnChange(event){
      this.form.controls.uidBranch.setValue(event.detail.value)
    }

    async getBranchs() {
      let path = `branchs`;
      this.firebaseSvc.getCollectionData(path).subscribe({
        next: (res: any) => {
          this.branchs = res
        }
      })
    }

    convertTimeToDecimal(time: string): number {
      const [hours, minutes] = time.split(':').map(Number);
      return hours + minutes / 60;
    }

}
