import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'firebase/auth';
import { Category } from 'src/app/models/category.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-product-category',
  templateUrl: './add-update-product-category.component.html',
  styleUrls: ['./add-update-product-category.component.scss'],
})
export class AddUpdateProductCategoryComponent  implements OnInit {

  @Input() category:Category

  utilsSrv = inject(UtilsService)
  firebaseSvc = inject(FirebaseService);

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('',[Validators.required, Validators.minLength(4)])
  })

  user = {} as User;

  constructor() { }

  ngOnInit() {
    this.user = this.utilsSrv.getFromLocalStorage('user');
    if (this.category) this.form.setValue(this.category);
  }

  submit()
  {
    if (this.form.valid) {

      if(this.category) this.updateCategory();
      else this.createCategory()

    }
  }

  // ======== Crear Branch =======
  async createCategory() {
    let path = `productsCategories`

    const loading = await this.utilsSrv.loading();
    await loading.present();

    delete this.form.value.id

    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

      this.utilsSrv.dismissModal({ success: true });

      this.utilsSrv.showToast({
        message: 'Categoria creada exitosamente',
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

    private async updateCategory() {
      let path = `productsCategories/${this.category.id}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      try {
        // === Actualizar el documento ===
        await this.firebaseSvc.updateDocument(path, this.form.value);
  
        this.utilsSrv.dismissModal({ success: true });
  
        this.utilsSrv.showToast({
          message: 'Categoria actualizada exitosamente',
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
