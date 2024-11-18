import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StorageService } from './../services/storage.service';
import { Component, inject } from '@angular/core';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
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
  firebaseSrv = inject(FirebaseService)
  StorageService = inject(StorageService)

  image = ""
  isEditing:boolean=false;
  editedUser:User;
  selectedFile: File | null=null;
  imageUrl: string = '';

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

  async editProfile() {
    if (this.isEditing) {
      try {
          if(this.selectedFile){

            let userId = this.editedUser.uid;
            const path = `users/${userId}/profile.jpg`
            const imageUrl = await this.StorageService.uploadFile(path,this.selectedFile);

            if(this.editedUser.image){
              const previousImageRef = this.StorageService.getFileReference(this.editedUser.image)
              this.StorageService.deleteFile(previousImageRef)
              console.log('Imagen anterior eliminada')
            }

            this.editedUser.image= imageUrl;
            console.log('Imagen subida correctamente', imageUrl);
          }
          let path = `users/${this.editedUser.uid}`
          await this.firebaseSrv.updateDocument(path, this.editedUser);

        this.utilsSrv.saveInLocalStorage('user', this.editedUser);
        this.loadUserImage()
        console.log('Usuario actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
      }
    }

    this.isEditing = !this.isEditing;
  }


  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.editedUser.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  constructor() {
    const user = this.user()
    this.editedUser = { ...user, uid: user.uid || this.firebaseSrv.getAuth().currentUser?.uid };

  }

  ngOnInit(){
    this.loadUserImage();
  }
  async loadUserImage(){
    try{
      const userId = this.user().uid;
      const userDocPath = `users/${userId}`;
      const userData = await this.firebaseSrv.getDocument(userDocPath);
      if(userData && userData['image']){
          this.image = userData['image'];
      }
    }catch(error){
      console.error('Error al cargar los datos del usuario:' , error)
    }
  }

  async capturePhoto(){
    try{
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Devuelve la imagen como DataURL
        source: CameraSource.Camera, // Fuente: Cámara
      });
      this.editedUser.image = photo.dataUrl; // Muestra la foto capturada
      this.selectedFile = this.dataURLtoFile(photo.dataUrl, 'captured-photo.jpg'); // Convierte DataURL a File para subir
    }catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
