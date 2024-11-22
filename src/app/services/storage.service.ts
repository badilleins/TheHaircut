import { Injectable } from '@angular/core';
import {getStorage,ref,uploadBytes,getDownloadURL,deleteObject} from '@angular/fire/storage'


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = getStorage();

  constructor() { }

  async uploadFile(path:string, file:File):Promise<string>{
    const fileRef = ref(this.storage,path);
    await uploadBytes(fileRef,file);
    return getDownloadURL(fileRef)
  }

  async deleteFile(fileRef:any):Promise<void>{
    try{
      await deleteObject(fileRef);
      console.log('Archivo eliminado correctamente')
    }catch(error){
      console.error('Error al eliminar el archivo:',error)
    }
  }

  getFileReference(url:string){
    return ref(this.storage,url)
  }
}
