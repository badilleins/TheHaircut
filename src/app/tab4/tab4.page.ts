import { Component, inject, OnInit } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { User } from '../models/user.model';
import { FirebaseService } from '../services/firebase.service';
import { onSnapshot, orderBy } from 'firebase/firestore';
import { Notification } from '../models/notification.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit{

  constructor() { }
  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)
  loading:boolean = false
  notifications: Notification[] =[]
  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  ngOnInit(): void {
      this.getNotifications()
      this.firebaseSrv.listenToNotificationsChanges();
  }

  getNotifications() {
      let path = `users/${this.user().uid}/notifications`;
      this.loading = true;
  
      let query = [
        orderBy('date', 'desc')
      ]
  
      this.firebaseSrv.getCollectionData(path,query).subscribe({
        next: (res: any) => {
          this.notifications = res
          this.loading = false;
        }
      })
    }


  confirmDeleteNotification(notification: Notification) {
      this.utilsSrv.presentAlert({
        header: 'Eliminar Notificación',
        message: '¿Estás seguro de eliminar esta notificación?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Eliminar',
            handler: () => this.deleteNotification(notification), 
          },
        ],
      });
    }
  
    async deleteNotification(notification: Notification) {
      let path = `users/${this.user().uid}/notifications/${notification.id}`;
  
      const loading = await this.utilsSrv.loading();
      await loading.present();
  
      try {
        await this.firebaseSrv.deleteDocument(path);
        this.utilsSrv.showToast({
          message: 'Notificación eliminada exitosamente',
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

}
