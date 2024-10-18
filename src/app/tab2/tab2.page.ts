import { Component, inject } from '@angular/core';
import { Haircut } from '../models/haircut.model';
import { UtilsService } from '../services/utils.service';
import { AddUpdateHaircutComponent } from '../shared/components/add-update-haircut/add-update-haircut.component';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { AddUpdateProductComponent } from '../shared/components/add-update-product/add-update-product.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  selectedSegment: string = 'haircuts';
  utilsSrv = inject(UtilsService)

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async addHaircut(haircut?: Haircut)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateHaircutComponent,
      cssClass: 'add-update-modal',
      componentProps: { haircut }
    })
  }

  async addProduct(product?: Product)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    })
  }

  add(){
    if(this.selectedSegment == 'haircuts'){
      this.addHaircut()
    }else{
      this.addProduct()
    }
  }

}
