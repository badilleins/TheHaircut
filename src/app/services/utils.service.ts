import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  loadingController = inject(LoadingController)
  toastController = inject(ToastController)
  router = inject(Router)
  modalController = inject(ModalController)
  alertController = inject(AlertController)

  async presentModal(opt:ModalOptions)
  {
    const modal = await this.modalController.create(opt)
    await modal.present()

    const { data } = await modal.onWillDismiss()
    if (data) return data;
  }

  dismissModal(data?:any)
  {
    return this.modalController.dismiss(data)
  }

  loading(){
    return this.loadingController.create({
      message: 'Loading'
    })
  }

  async showToast(op?:ToastOptions){
    const toast = await this.toastController.create(op)
    toast.present()
  }

  routerLink(url:string)
  {
    return this.router.navigateByUrl(url)
  }

  async presentAlert(opts?: AlertOptions) {
    const alert = await this.alertController.create(opts);
    await alert.present();
  }

  saveInLocalStorage(key:string, value:any)
  {
    return localStorage.setItem(key, JSON.stringify(value))
  }

  getFromLocalStorage(key:string)
  {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }

  async takePicture(promptLabelHeader:string)
  {
    return await Camera.getPhoto({
      resultType:CameraResultType.DataUrl,
      quality:90,
      allowEditing:true,
      source:CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto:'Selecciona una imagen',
      promptLabelPicture:'Toma una foto'
    })
  }
}
