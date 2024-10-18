import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements AfterViewInit{

  animationCtrl = inject(AnimationController)
  constructor() { }

  playAnimation() {
    const animation = this.animationCtrl.create()
    .addElement(document.querySelector('.shield-icon')) // Seleccionar el elemento del DOM
    .duration(3000) // Duración de la animación
    .iterations(Infinity) // Repetir indefinidamente
    .keyframes([
      { offset: 0, transform: 'translateY(0)', easing: 'ease-in-out' }, // Posición inicial
      { offset: 0.5, transform: 'translateY(-3px)', easing: 'ease-in-out' }, // Se eleva
      { offset: 1, transform: 'translateY(0)', easing: 'ease-in-out' } // Regresa a la posición original
    ]);
  animation.play(); // Iniciar la animación
  }

  ngAfterViewInit(){
    this.playAnimation();
  }

}
