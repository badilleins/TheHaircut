import { Component, inject, OnInit } from '@angular/core';
import { Branch } from 'src/app/models/branch.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { orderBy } from 'firebase/firestore';
import { AddUpdateBranchComponent } from 'src/app/shared/components/add-update-branch/add-update-branch.component';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.page.html',
  styleUrls: ['./branches.page.scss'],
})
export class BranchesPage {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  branchs: Branch[] = []
  filteredBranchs: Branch[]=[]
  searchTerm: string = '';
  loading:boolean = false

  ionViewWillEnter() {
    this.getBranchs()
  }

  doRefresh(event: any)
  {
    setTimeout(() => {
      this.getBranchs();
      event.target.complete();
    }, 1000);
  }

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async getBranchs() {
    let path = `users/${this.user().uid}/branchs`;
    this.loading = true;

    let query = [
      orderBy('name', 'asc'),
    ]

    let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
      next: (res: any) => {
        this.branchs = res
        this.filteredBranchs = res
        this.loading = false;
      }
    })
  }

  async addUpdateBranch(branch?: Branch)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateBranchComponent,
      cssClass: 'add-update-modal',
      componentProps: { branch }
    })
  }

  confirmDeleteBranch(branch: Branch) {
    this.utilsSrv.presentAlert({
      header: 'Eliminar Sucursal',
      message: '¿Estás seguro de eliminar esta sucursal?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteBranch(branch), 
        },
      ],
    });
  }

  async deleteBranch(branch: Branch) {
    let path = `users/${this.user().uid}/branchs/${branch.id}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      await this.firebaseSrv.deleteDocument(path);
      let pathImage = await this.firebaseSrv.getFilePath(branch.image)
      await this.firebaseSrv.deleteFile(pathImage)
      this.utilsSrv.showToast({
        message: 'Sucursal eliminada exitosamente',
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

  filterBranchs() {
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      // Si no hay nada en el searchTerm, mostrar todas las sucursales
      this.filteredBranchs = this.branchs;
    } else {
      // Filtrar las sucursales
      this.filteredBranchs = this.branchs.filter(branch => {
        return branch.name.toLowerCase().includes(searchTerm);
      });
    }
  }

  constructor() {}

}
