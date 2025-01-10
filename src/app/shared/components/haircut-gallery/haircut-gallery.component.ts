import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { orderBy } from 'firebase/firestore';
import { Haircut } from 'src/app/models/haircut.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateHaircutComponent } from '../add-update-haircut/add-update-haircut.component';
import { AnimationController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-haircut-gallery',
  templateUrl: './haircut-gallery.component.html',
  styleUrls: ['./haircut-gallery.component.scss'],
})
export class HaircutGalleryComponent implements OnInit {

  ngOnInit(): void {
      this.getHaircuts()
  }

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)
  animationCtrl = inject(AnimationController);

  @ViewChild('trashIcon', { read: ElementRef, static: false }) trashIcons!: ElementRef;

  haircuts: Haircut[] = []
  categories: String[] = []
  filteredHaircuts: Haircut[]=[]
  searchTerm: string = '';
  selectedCategory:string = '';
  loading:boolean = false

  ionViewWillEnter() {
    this.getHaircuts()
  }

  doRefresh(event: any)
  {
    setTimeout(() => {
      this.getHaircuts();
      event.target.complete();
    }, 1000);
  }

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  async getHaircuts() {
    let path = `haircuts`;
    this.loading = true;

    let query = [
      orderBy('name', 'asc'),
    ]

    let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
      next: (res: any) => {
        this.haircuts = res
        this.filteredHaircuts = res
        this.loading = false;
        this.getCategories();
      }
    })
    
  }

  async addUpdateHaircut(haircut?: Haircut)
  {
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateHaircutComponent,
      cssClass: 'add-update-modal',
      componentProps: { haircut }
    })
  }

  confirmDeleteHaircut(haircut: Haircut) {
    this.utilsSrv.presentAlert({
      header: 'Eliminar corte de cabello',
      message: '¿Estás seguro de eliminar este corte de cabello?',
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
                this.deleteHaircut(haircut); // Eliminar el producto después de la animación
              });
          }
        },
      ],
    });
  }

  async deleteHaircut(haircut: Haircut) {
    let path = `haircuts/${haircut.id}`;

    const loading = await this.utilsSrv.loading();
    await loading.present();

    try {
      await this.firebaseSrv.deleteDocument(path);
      let pathImage = await this.firebaseSrv.getFilePath(haircut.image)
      await this.firebaseSrv.deleteFile(pathImage)
      this.utilsSrv.showToast({
        message: 'Corte de cabello eliminado exitosamente',
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

  select(event){
    this.selectedCategory= event.detail.value
    this.filterHaircuts();
  }

  filterHaircuts() {
    const searchTerm = this.searchTerm.toLowerCase().trim(); // Término de búsqueda

    // Si no hay término de búsqueda ni categoría seleccionada, mostrar todas las categorías
    if (searchTerm === '' && !this.selectedCategory) {
      this.filteredHaircuts = this.haircuts;
    } else if (searchTerm === '') {
      // Filtrar solo por categoría si no hay término de búsqueda
      this.filteredHaircuts = this.haircuts.filter(item => 
        item.category === this.selectedCategory
      );
    } else if (!this.selectedCategory) {
      // Filtrar solo por nombre si no hay categoría seleccionada
      this.filteredHaircuts = this.haircuts.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
      );
    } else {
      // Filtrar por nombre y categoría
      this.filteredHaircuts = this.haircuts.filter(item => 
        item.name.toLowerCase().includes(searchTerm) && 
        item.category === this.selectedCategory
      );
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

  async getCategories() {
    this.haircuts.forEach(item => {
      if (!this.categories.includes(item.category)) {
        this.categories.push(item.category);
      }
    });
  }

  constructor() {}

}
