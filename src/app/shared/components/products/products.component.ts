import { Component, ElementRef, inject, OnInit, QueryList, ViewChild } from '@angular/core';
import { orderBy } from 'firebase/firestore';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from '../add-update-product/add-update-product.component';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent  implements OnInit {

  ngOnInit(): void {
    this.getProducts()
}

utilsSrv = inject(UtilsService)
firebaseSrv = inject(FirebaseService)
animationCtrl = inject(AnimationController);

@ViewChild('trashIcon', { read: ElementRef, static: false }) trashIcons!: ElementRef;

products: Product[] = []
filteredProducts: Product[]=[]
searchTerm: string = '';
loading:boolean = false

ionViewWillEnter() {
  this.getProducts()
}

doRefresh(event: any)
{
  setTimeout(() => {
    this.getProducts();
    event.target.complete();
  }, 1000);
}

user(): User {
  return this.utilsSrv.getFromLocalStorage('user');
}

async getProducts() {
  let path = `products`;
  this.loading = true;

  let query = [
    orderBy('name', 'asc'),
  ]

  let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
    next: (res: any) => {
      this.products = res
      this.filteredProducts = res
      this.loading = false;
    }
  })
}

async addUpdateProduct(product?: Product)
{
  let success = await this.utilsSrv.presentModal({
    component: AddUpdateProductComponent,
    cssClass: 'add-update-modal',
    componentProps: { product }
  })
}

confirmDeleteProduct(product: Product) {
  this.utilsSrv.presentAlert({
    header: 'Eliminar producto',
    message: '¿Estás seguro de eliminar este producto?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Eliminar',
        handler: () => {
          const iconElement = this.trashIcons.nativeElement;
          this.playDeleteIconAnimation(iconElement, () => {
                this.deleteProduct(product); // Eliminar el producto después de la animación
              });
        },
      }
    ],
  });
}

async deleteProduct(product: Product) {
  let path = `products/${product.id}`;

  const loading = await this.utilsSrv.loading();
  await loading.present();

  try {
    await this.firebaseSrv.deleteDocument(path);
    let pathImage = await this.firebaseSrv.getFilePath(product.image)
    await this.firebaseSrv.deleteFile(pathImage)
    this.utilsSrv.showToast({
      message: 'Producto eliminado exitosamente',
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

filterProducts() {
  const searchTerm = this.searchTerm.toLowerCase();

  if (searchTerm.trim() === '') {
    // Si no hay nada en el searchTerm, mostrar todas las sucursales
    this.filteredProducts = this.products;
  } else {
    // Filtrar las sucursales
    this.filteredProducts = this.products.filter(product => {
      return product.name.toLowerCase().includes(searchTerm);
    });
  }
}

playDeleteIconAnimation(iconElement: any, onComplete: () => void) {
  const animation = this.animationCtrl.create()
      .addElement(iconElement)
      .duration(500) // Duración de la animación
      .easing('ease-in-out') // Suavidad de la animación
      .keyframes([
        { offset: 0, transform: 'scale(2)', opacity: '1' }, // Estado inicial
        { offset: 0.5, transform: 'scale(3)', opacity: '0.5' }, // Crece ligeramente y disminuye opacidad
        { offset: 1, transform: 'scale(0)', opacity: '0' } // Se encoge y desaparece
      ]);

    animation.play().then(() => {
      onComplete(); // Eliminar el producto de la lista después de la animación
    });
}

constructor() {}

}
