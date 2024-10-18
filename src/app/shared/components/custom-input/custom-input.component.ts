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

  selectedTime: number | null = null;
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
    const timeString = event.detail.value; // Hora seleccionada en formato ISO
    const date = new Date(timeString);

    const hours = date.getHours();   // Obtiene las horas
    const minutes = date.getMinutes(); // Obtiene los minutos

    // Convertimos la hora en formato decimal
    this.selectedTime = hours + minutes / 60;
    console.log(this.selectedTime)
    // Actualizamos el control de formulario con el valor seleccionado
    this.control.setValue(this.selectedTime);
  }

  // Acepta la hora seleccionada y cierra el selector
  acceptTime() {
    console.log(this.selectedTime)
    this.control.setValue(this.selectedTime);
    this.showDateTime = false;
    // Asegúrate de que el valor formateado se establezca en el control de formulario
  }

  formatTimeDecimal(time: number) {
    if (time === null) return '00:00'; // Asegúrate de manejar null
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60); // Redondear los minutos
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`; // Formato HH:MM
  }
}
