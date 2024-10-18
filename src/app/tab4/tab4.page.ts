import { Component, inject, OnInit } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page {

  constructor() { }
  utilsSrv = inject(UtilsService)
  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

}
