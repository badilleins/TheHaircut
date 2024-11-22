import { Category } from './../../../models/category.model';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Haircut } from 'src/app/models/haircut.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-haircut',
  templateUrl: './add-update-haircut.component.html',
  styleUrls: ['./add-update-haircut.component.scss'],
})
export class AddUpdateHaircutComponent  implements OnInit {

  @Input() haircut:Haircut

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);

  categories: Category[] = []

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl('',[Validators.required]),
    image: new FormControl('',[Validators.required]),
  })

  user = {} as User;

  constructor() { }

  ngOnInit() {
    this.user = this.utilsSrv.getFromLocalStorage('user');
    this.getCategories();
    if (this.haircut) this.form.setValue(this.haircut);
  }

  async takeImage()
  {
    const dataUrl = ( await this.utilsSrv.takePicture('Imagen del corte de cabello')).dataUrl
    this.form.controls.image.setValue(dataUrl)
  }

  submit()
  {
    if (this.form.valid) {

      if(this.haircut) this.updateHaircut();
      else this.createHaircut()

    }
  }

  // ======== Crear Branch =======
  async createHaircut() {
    let path = `haircuts`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    // === Subir la imagen y obtener la url ===
    let dataUrl = this.form.value.image;
    let imagePath = `${this.user.uid}/${Date.now()}`;
    let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
    this.form.controls.image.setValue(imageUrl);

    delete this.form.value.id

    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

      this.utilsSrv.dismissModal({ success: true });

      this.utilsSrv.showToast({
        message: 'Corte de cabello creado exitosamente',
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

    private async updateHaircut() {
      let path = `haircuts/${this.haircut.id}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      try {
        // === Subir la nueva imagen si ha sido modificada ===
        if (this.form.value.image !== this.haircut.image) {
          let dataUrl = this.form.value.image;
          let imagePath = `${this.user.uid}/${Date.now()}`;
          let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
          this.form.controls.image.setValue(imageUrl);
        }
  
        // === Actualizar el documento ===
        await this.firebaseSvc.updateDocument(path, this.form.value);
  
        this.utilsSrv.dismissModal({ success: true });
  
        this.utilsSrv.showToast({
          message: 'Corte de cabello actualizado exitosamente',
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

    selectOnChange(event){
      this.form.controls.category.setValue(event.detail.value)
      console.log(this.form.controls)
    }

    async getCategories() {
      let path = `haircutsCategories`;
  
      let sub = this.firebaseSvc.getCollectionData(path).subscribe({
        next: (res: any) => {
          this.categories = res
        }
      })
    }

}
