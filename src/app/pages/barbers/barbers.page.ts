import { AddUpdateBarberComponent } from './../../shared/components/add-update-barber/add-update-barber.component';
import { Component, inject, OnInit } from '@angular/core';
import { orderBy, where } from 'firebase/firestore';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-barbers',
  templateUrl: './barbers.page.html',
  styleUrls: ['./barbers.page.scss'],
})
export class BarbersPage {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  users: User[] = []
  filteredUsers: User[]=[]
  searchTerm: string = '';
  loading:boolean = false

  ionViewWillEnter() {
    this.getBarbers()
  }

  doRefresh(event: any)
  {
    setTimeout(() => {
      this.getBarbers();
      event.target.complete();
    }, 1000);
  }

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async getBarbers() {
    let path = `users`;
    this.loading = true;

    let query = [
      where('isBarber', '==', true),
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

  async addUpdateBarbers(user?: User)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateBarberComponent,
      cssClass: 'add-update-modal',
      componentProps: { user }
    })
  }

  confirmDeleteBarber(user: User) {
    this.utilsSrv.presentAlert({
      header: 'Eliminar Barbero',
      message: '¿Estás seguro de eliminar a este barbero?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteBarber(user),
        },
      ],
    });
  }

  async deleteBarber(user: User) {
    let path = `users/${user.uid}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      user.isBarber = false;
      let pathImage = await this.firebaseSrv.getFilePath(user.image)
      user.image= "https://firebasestorage.googleapis.com/v0/b/citas-barber-28dfc.appspot.com/o/user_2078.webp?alt=media&token=896ae797-9229-44f0-8b39-27e5da7cac7f"
      await this.firebaseSrv.updateDocument(path, user);
      await this.firebaseSrv.deleteFile(pathImage)
      this.utilsSrv.showToast({
        message: 'Barbero eliminado exitosamente',
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
