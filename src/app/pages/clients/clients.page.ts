import { Component, inject, OnInit } from '@angular/core';
import { orderBy, where } from 'firebase/firestore';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateClientComponent } from 'src/app/shared/components/add-update-client/add-update-client.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  users: User[] = []
  filteredUsers: User[]=[]
  searchTerm: string = '';
  loading:boolean = false


  ionViewWillEnter() {
    this.getClients()
  }

  doRefresh(event: any)
  {
    setTimeout(() => {
      this.getClients();
      event.target.complete();
    }, 1000);
  }

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async getClients() {
    let path = `users`;
    this.loading = true;

    let query = [
      where('isBarber', '==', false),
      where('isBlocked', '==', false),
      orderBy('__name__', 'asc')
    ]

    let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
      next: (res: any) => {
        this.users = res
        this.users.forEach((user: any) => {
          delete user.id;
        });
        this.filteredUsers = this.users
        this.loading = false;
        console.log(this.filteredUsers)
      }
    })
  }

  async addUpdateClient(user?: User)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateClientComponent,
      cssClass: 'add-update-modal',
      componentProps: { user }
    })
  }

  confirmDeleteClient(user: User) {
    this.utilsSrv.presentAlert({
      header: 'Eliminar Cliente',
      message: '¿Estás seguro de eliminar a este cliente?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteClient(user),
        },
      ],
    });
  }

  async deleteClient(user: User) {
    let path = `users/${user.uid}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      let pathImage = await this.firebaseSrv.getFilePath(user.image)
      await this.firebaseSrv.deleteDocument(path);
      await this.firebaseSrv.deleteFile(pathImage)
      this.utilsSrv.showToast({
        message: 'Cliente eliminado exitosamente',
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

  filterUsers() {
    const searchTerm = this.searchTerm.toLowerCase();

    if (searchTerm.trim() === '') {
      // Si no hay nada en el searchTerm, mostrar todas las sucursales
      this.filteredUsers = this.users;
    } else {
      // Filtrar las sucursales
      this.filteredUsers = this.users.filter(branch => {
        return branch.name.toLowerCase().includes(searchTerm);
      });
    }
  }

  constructor() {}

}
