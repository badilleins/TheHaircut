import { where } from 'firebase/firestore';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { User } from './../models/user.model';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {

  constructor() { }

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)
  loading:boolean = false;
  users: User[] = []
  selectedSegment:string = 'citas'


  ngOnInit() {
    this.getBarbers();
  }

  async getBarbers() {
      let path = `users`;
      this.loading = true;

      let query = [
        where("isBarber", "==", true)
      ]

      let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
        next: (res: any) => {
          this.users= res
          this.loading = false;
          sub.unsubscribe();
          console.log(this.users)
        }
      })
    }
}
