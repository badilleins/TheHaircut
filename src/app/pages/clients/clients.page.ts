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

  }

  confirmDeleteClient(user: User) {

  }

  async deleteClient(user: User) {

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
