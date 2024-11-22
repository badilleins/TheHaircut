import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent  implements OnInit {

  @Input() icon!:string
  @Input() type!:string
  @Input() label!:string
  @Input() autocomplete!:string
  @Input() control!:FormControl
  @Input() required!:boolean

  isPassword!:boolean
  @Input() isTimePicker: boolean = false
  hide:boolean = true

  showDateTime = false;

  selectedTime: string | null = null;
  constructor() { }

  ngOnInit() {
    if(this.type=='password') this.isPassword=true
  }

  showOrHidePassword()
  {
    this.hide = !this.hide
    if(this.hide) this.type = 'password'
    else this.type = 'text'
  }

  openTimePicker() {
    this.showDateTime = true;
  }

  // Cierra el selector de hora sin seleccionar
  closeTimePicker() {
    this.showDateTime = false;
  }

  // Cuando se selecciona una hora
  onTimeSelected(event: any) {
    console.log("Evento recibido:", event);
    const timeString = event.detail.value;
    if (timeString) {
      console.log("Hora seleccionada (ISO): ", timeString);
      const date = new Date(timeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      // Usamos el formato HH:mm
      this.selectedTime = this.formatTime(hours, minutes);
      console.log("Hora seleccionada:", this.selectedTime);
      // Actualizamos el FormControl con el formato adecuado
      this.control.setValue(this.selectedTime, { emitEvent: true });
    } else {
      console.error("No se seleccionó ninguna hora.");
    }
  }

  // Formato de hora normal (HH:mm)
  formatTime(hours: number, minutes: number): string {
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  }

  // Acepta la hora seleccionada y cierra el selector
  acceptTime() {
    if (this.selectedTime != null) {
      console.log("Hora aceptada:", this.selectedTime);
      // Usamos el formato adecuado y lo pasamos al FormControl
      this.control.setValue(this.selectedTime, { emitEvent: true });
      this.showDateTime = false;
    } else {
      console.error("No se ha seleccionado ninguna hora");
    }
  }
}
