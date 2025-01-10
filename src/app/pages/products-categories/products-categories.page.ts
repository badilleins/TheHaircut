import { Component, inject, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductCategoryComponent } from 'src/app/shared/components/add-update-product-category/add-update-product-category.component';

@Component({
  selector: 'app-products-categories',
  templateUrl: './products-categories.page.html',
  styleUrls: ['./products-categories.page.scss'],
})
export class ProductsCategoriesPage {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  categories: Category[] = []
  filteredCategories: Category[]=[]
  searchTerm: string = '';
  loading:boolean = false

  ionViewWillEnter() {
    this.getCategories()
  }

  doRefresh(event: any)
  {
    setTimeout(() => {
      this.getCategories();
      event.target.complete();
    }, 1000);
  }

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async getCategories() {
    let path = `productsCategories`;
    this.loading = true;

    let sub = this.firebaseSrv.getCollectionData(path).subscribe({
      next: (res: any) => {
        this.categories = res
        this.filteredCategories = this.categories
        this.loading = false;
      }
    })
  }

  async addUpdateCategory(category?: Category)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateProductCategoryComponent,
      cssClass: 'add-update-modal',
      componentProps: { category }
    })
  }

  confirmDeleteCategory(category: Category) {
    this.utilsSrv.presentAlert({
      header: 'Eliminar Categoria',
      message: '¿Estás seguro de eliminar esta categoria?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteCategory(category), 
        },
      ],
    });
  }

  async deleteCategory(category: Category) {
    let path = `productsCategories/${category.id}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      await this.firebaseSrv.deleteDocument(path);
      this.utilsSrv.showToast({
        message: 'Categoria eliminada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline',
      });
    } catch (error) {
      this.utilsSrv.showToast({
        message:"Ha ocurrido un error",
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }

  filterCategories() {
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      // Si no hay nada en el searchTerm, mostrar todas las sucursales
      this.filteredCategories = this.categories;
    } else {
      // Filtrar las sucursales
      this.filteredCategories = this.categories.filter(category => {
        return category.name.toLowerCase().includes(searchTerm);
      });
    }
  }

  constructor() {}

}
