import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'firebase/auth';
import { Branch } from 'src/app/models/branch.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-branch',
  templateUrl: './add-update-branch.component.html',
  styleUrls: ['./add-update-branch.component.scss'],
})
export class AddUpdateBranchComponent  implements OnInit {

  @Input() branch:Branch

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);


  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    address: new FormControl('',[Validators.required]),
    image : new FormControl('',Validators.required),
    hourStart: new FormControl(0,[Validators.required]),
    hourEnd : new FormControl(0,Validators.required)
  },
  {validators:this.validateEndTime
  }

)

  user = {} as User;

  constructor() { }

  ngOnInit() {
    this.user = this.utilsSrv.getFromLocalStorage('user');
    if (this.branch) this.form.setValue(this.branch);
  }

  async takeImage()
  {
    const dataUrl = ( await this.utilsSrv.takePicture('Imagen del producto')).dataUrl
    this.form.controls.image.setValue(dataUrl)
  }

  submit()
  {
    if (this.form.valid) {

      if(this.branch) this.updateBranch();
      else this.createBranch()

    }
  }

  // ======== Crear Branch =======
  async createBranch() {
    let path = `branchs`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    // === Subir la imagen y obtener la url ===
    let dataUrl = this.form.value.image;
    let imagePath = `${this.user.uid}/${Date.now()}`;
    let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
    this.form.controls.image.setValue(imageUrl);

    delete this.form.value.id

    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {
      const docId = res.id; // ID generado por Firebase
      await this.firebaseSvc.updateDocument(`${path}/${docId}`, { id: docId });
      this.utilsSrv.dismissModal({ success: true });

      this.utilsSrv.showToast({
        message: 'Sucursal creada exitosamente',
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

    private async updateBranch() {
      let path = `branchs/${this.branch.id}`;

      const loading = await this.utilsSrv.loading();
      await loading.present();

      try {
        // === Subir la nueva imagen si ha sido modificada ===
        if (this.form.value.image !== this.branch.image) {
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


 validateEndTime(formGroup:FormGroup){

  const start = formGroup.get('hourStart')?.value.toString();
  const end = formGroup.get('hourEnd')?.value.toString();

  const [hours,minutes] = start.split(":").map(Number)
  const[hours2,minutes2] = end.split(":").map(Number)

  const timeStart = new Date();
  timeStart.setHours(hours,minutes,0,0)

  const timeEnd =new Date()
  timeEnd.setHours(hours2,minutes2,0,0)



  if(start && end && timeStart >=timeEnd){
    console.log("Entro al 1")
    formGroup.get('hourEnd')?.setErrors({endTimeInvalid:true});

  }else{
    formGroup.get('hourEnd')?.setErrors(null)
  }
  return null;
}
}
