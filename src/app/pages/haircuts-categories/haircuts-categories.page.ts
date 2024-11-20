import { Component, inject, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { orderBy, where } from 'firebase/firestore';
import { Category } from 'src/app/models/category.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateHaircutCategoryComponent } from 'src/app/shared/components/add-update-haircut-category/add-update-haircut-category.component';

@Component({
  selector: 'app-haircuts-categories',
  templateUrl: './haircuts-categories.page.html',
  styleUrls: ['./haircuts-categories.page.scss'],
})
export class HaircutsCategoriesPage {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  categories: Category[] = []
  filteredCategories: Category[]=[]
  selectedCategory: String;
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
    let path = `haircutsCategories`;
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
      component: AddUpdateHaircutCategoryComponent,
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
    let path = `haircutsCategories/${category.id}`;

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

  selected(){
    
  }

  filterCategories() {
  //   const searchTerm = this.searchTerm.toLowerCase();

  //   if (searchTerm.trim() === '') {
  //     // Si no hay nada en el searchTerm, mostrar todas las sucursales
  //     this.filteredCategories = this.categories;
  //   } else {
  //     // Filtrar las sucursales
  //     this.filteredCategories = this.categories.filter(category => {
  //       return category.name.toLowerCase().includes(searchTerm);
  //     });
  //   }
  const searchTerm = this.searchTerm.toLowerCase().trim(); // Término de búsqueda
  const selectedCategory = this.selectedCategory; // Categoría seleccionada

  // Si no hay término de búsqueda ni categoría seleccionada, mostrar todas las categorías
  if (searchTerm === '' && !selectedCategory) {
    this.filteredCategories = this.categories;
  } else if (searchTerm === '') {
    // Filtrar solo por categoría si no hay término de búsqueda
    this.filteredCategories = this.categories.filter(category => 
      category.type === selectedCategory
    );
  } else if (!selectedCategory) {
    // Filtrar solo por nombre si no hay categoría seleccionada
    this.filteredCategories = this.categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm)
    );
  } else {
    // Filtrar por nombre y categoría
    this.filteredCategories = this.categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm) && 
      category.type === selectedCategory
    );
  }

  

  constructor() {}

}
