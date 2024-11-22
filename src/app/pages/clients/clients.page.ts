import { StorageService } from './../../services/storage.service';
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
  storageSrv = inject(StorageService)

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
    let path = `users/${user.uid}`;  // Ruta del documento del usuario

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      if (user.image && user.image.toString() !=="https://firebasestorage.googleapis.com/v0/b/citas-barber-28dfc.appspot.com/o/user_2078.webp?alt=media&token=896ae797-9229-44f0-8b39-27e5da7cac7f") {
        let pathImage = await this.firebaseSrv.getFilePath(user.image);  // Obtener la ruta de la imagen
        await this.firebaseSrv.deleteFile(pathImage)
      }

      // Ahora, eliminamos el documento de Firestore
      await this.firebaseSrv.deleteDocument(path);  // Eliminar el documento del usuario

      // Mostrar mensaje de éxito
      this.utilsSrv.showToast({
        message: 'Cliente eliminado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline',
      });

      // Opcional: Actualizar la lista de clientes después de la eliminación
      this.getClients();

    } catch (error) {
      // Si ocurre un error, mostramos el mensaje de error
      this.utilsSrv.showToast({
        message: "Ha ocurrido un error al eliminar al cliente",
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      console.error("Error al eliminar cliente:", error);  // Log del error para depuración
    } finally {
      // Asegurarse de cerrar el loading, independientemente de si hubo éxito o error
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
