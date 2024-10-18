import { Component, inject } from '@angular/core';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';
import { BranchesPage } from '../pages/branches/branches.page';
import { BarbersPage } from '../pages/barbers/barbers.page';
import { ClientsPage } from '../pages/clients/clients.page';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  utilsSrv = inject(UtilsService)
  image = "https://firebasestorage.googleapis.com/v0/b/citas-barber-28dfc.appspot.com/o/user_2078.webp?alt=media&token=896ae797-9229-44f0-8b39-27e5da7cac7f"
  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async openBranchs(){
    let success = await this.utilsSrv.presentModal({
      component: BranchesPage,
      cssClass: 'add-update-modal',
    })
  }

  async openBarbers(){
    let success = await this.utilsSrv.presentModal({
      component: BarbersPage,
      cssClass: 'add-update-modal',
    })
  }

  async openClients(){
    let success = await this.utilsSrv.presentModal({
      component: ClientsPage,
      cssClass: 'add-update-modal',
    })
  }

  constructor() {}

}
